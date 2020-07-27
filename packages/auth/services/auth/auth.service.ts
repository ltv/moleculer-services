import createHashIds from '@ltv/core/utils/hashids';
import { BaseService, Context } from '@ltv/types';
import crypto from 'crypto';
import { AuthError } from 'errors';
import { ConfigMixin } from 'mixins/config.mixin';
import { Token, User } from 'models';
import { Action, Method, Service } from 'moleculer-decorators';
import { RegisterUserRule } from 'services/users/validators/index.validator';
import { SERVICE_AUTH, SERVICE_TOKEN, SERVICE_USERS } from 'utils/constants';
import { signJWTToken, verifyJWT } from 'utils/jwt';
import { comparePassword, genSalt, hashPass, sha512 } from 'utils/password';
import { AuthLoginRule } from './validators/index.validator';

const name = SERVICE_AUTH;
const hashIds = createHashIds(name, 10);

interface AuthLoginParams {
  username: string;
  password: string;
  token: string;
}

interface JWTToken {
  id: string;
  expired: boolean;
}

type DecodedJWT = JWTToken;

// export default AuthServiceSchema;
@Service({
  name: SERVICE_AUTH,
  version: 1,
  settings: {},
  hooks: {
    after: {
      login: ['saveToken'],
      register: ['notifyRegistered']
    }
  },
  mixins: [ConfigMixin(['mail.**', 'user.**'])]
})
class AuthService extends BaseService {
  @Action({
    params: { key: 'string' },
    cache: { keys: ['key'], ttl: 60 * 60 * 24 * 30 } // cache 30 days
  })
  hash(ctx: Context<{ key: string }>) {
    return hashIds.encodeHex(ctx.params.key);
  }
  // ACTIONS (S)
  /**
   * Handle local login
   */
  @Action({
    params: AuthLoginRule
  })
  async login(ctx: Context<AuthLoginParams>) {
    const query = ((username) => {
      if (!this.configs['user.username.enabled']) {
        return { email: username };
      }
      return { $or: [{ email: username }, { username }] };
    })(ctx.params.username);

    // Get user
    const user: User = await ctx.call(`v1.${SERVICE_USERS}.findOneUser`, { query });
    if (!user) {
      return AuthError.authenticationFailed().reject();
    }

    // Check verified
    if (!user.verified) {
      return AuthError.userIsNotVerified().reject();
    }

    // Check status
    if (user.status !== 1) {
      return AuthError.userIsNotActive().reject();
    }

    // Check passwordless login
    if (user.passwordless == true && ctx.params.password) {
      return AuthError.passwordLessOnly().reject();
    }

    // Authenticate
    if (ctx.params.password) {
      // Login with password
      if (!comparePassword(ctx.params.password, user.password)) {
        return AuthError.authenticationFailed().reject();
      }
    } else if (this.configs['user.passwordless.enabled']) {
      if (!this.configs['mail.enabled']) {
        return AuthError.passwordLessNotAvailable().reject();
      }

      // Send magic link
      await this.sendMagicLink(ctx, user);

      return {
        passwordless: true,
        email: user.email
      };
    } else {
      return AuthError.passwordLessNotAllowed().reject();
    }

    // Check Two-factor authentication
    if (user.tfa && user.tfa.enabled) {
      if (!ctx.params.token) {
        return AuthError.missing2FACode().reject();
      }

      if (!(await this.verify2FA(user.tfa.secret, ctx.params.token))) {
        return AuthError.invalid2FACode().reject();
      }
    }

    const userId = user._id.toString();
    const token = signJWTToken({ id: userId }, this.configs['user.jwt.expiresIn']);
    return { token, userId };
  }

  /**
   * Register a new user account
   *
   */
  @Action({
    params: RegisterUserRule
  })
  async register(ctx: Context<User>) {
    if (!this.configs['user.signup.enabled']) {
      return AuthError.signUpNotAvailable().reject();
    }

    const params = Object.assign({}, ctx.params);
    const entity: Partial<User> = {};

    const { email, username } = params;

    // Verify email
    const found = await ctx.call(`v1.${SERVICE_USERS}.getUserByEmail`, { email });
    if (found) {
      return AuthError.emailAlreadyExists().reject();
    }

    // Verify username
    if (this.configs['user.username.enabled']) {
      if (!username) {
        return AuthError.usernameCantEmpty().reject();
      }

      const found = await ctx.call(`v1.${SERVICE_USERS}.getUserByUsername`, { username });

      if (found) {
        return AuthError.usernameAlreadyExists().reject();
      }

      entity.username = username;
    }

    // Set basic data
    entity.email = email;
    entity.firstName = params.firstName;
    entity.lastName = params.lastName;
    entity.role = this.configs['user.defaultRole'];
    entity.avatar = params.avatar;
    // entity.socialLinks = {};
    // entity.createdAt = Date.now();
    entity.verified = true;
    entity.status = 1;

    if (!entity.avatar) {
      // Default avatar as Gravatar
      const md5 = crypto.createHash('md5').update(entity.email).digest('hex');
      entity.avatar = `https://gravatar.com/avatar/${md5}?s=64&d=robohash`;
    }

    // Generate passwordless token or hash password
    if (params.password) {
      entity.passwordless = false;
      const pwdSalt: string = genSalt();
      entity.password = hashPass(params.password, pwdSalt);
    } else if (this.configs['user.passwordless.enabled']) {
      entity.passwordless = true;
      entity.password = this.signJWTToken();
    } else {
      return AuthError.passwordCantEmpty().reject();
    }

    // Generate verification token
    if (this.configs['user.verification.enabled']) {
      entity.verified = false;
      entity.verificationToken = this.signJWTToken();
    }

    // Create new user
    const user = await ctx.call(`v1.${SERVICE_USERS}.insertUser`, { entity });

    if (!entity.verified) {
      ctx.emit(`${SERVICE_USERS}.createdUserMail`, { user, token: entity.verificationToken });
    }

    return user;
  }

  @Action({
    name: 'logout'
  })
  actLogout(ctx: Context) {
    this.logger.debug(`User ${ctx.meta.userId} logging out...`);
    return ctx.call(`v1.${SERVICE_TOKEN}.delete`, { token: ctx.meta.token });
  }

  @Action({
    cache: {
      keys: ['token'],
      ttl: 60 * 30 // 30 mins
    },
    params: {
      token: 'string'
    }
  })
  async resolveToken(ctx: Context<Token>) {
    const { id } = await this.verifyJWTToken(ctx.params.token);

    const user: User = await ctx.call(`v1.${SERVICE_USERS}.findById`, { id });
    if (!user) {
      return AuthError.userIsNotRegistered().reject();
    }

    if (!user.verified) {
      return AuthError.userIsNotVerified({ code: 401 }).reject();
    }

    if (user.status !== 1) {
      return AuthError.userIsNotActive({ code: 401 }).reject();
    }

    return user;
  }
  // ACTIONS (E)

  // METHODS (S)
  @Method
  saveToken(ctx: Context, response: { token: string; userId: string }) {
    const { token, userId } = response;
    return ctx.broker
      .call(`v1.${SERVICE_TOKEN}.create`, { userId, token, when: Date.now() })
      .then(() => ({ token }));
  }

  @Method
  async verifyJWTToken(token: string): Promise<DecodedJWT> {
    const decoded: any = await verifyJWT(token);
    if (!decoded.id) {
      return AuthError.invalidToken().reject();
    }
    const userId = decoded.id;
    const hashedToken = sha512(token);
    const foundToken = await this.broker.call<Token, any>(`v1.${SERVICE_TOKEN}.findToken`, {
      userId,
      token: hashedToken
    });

    if (!foundToken || !decoded.exp) {
      return AuthError.tokenHasExpired().reject();
    }

    const exp = (decoded.exp as number) * 1000;
    const expired = exp - Date.now() < 0;

    if (expired) {
      return AuthError.tokenHasExpired().reject();
    }

    return { id: decoded.id, expired: false };
  }
  /**
   * Generate a token
   *
   * @param {Number} len Token length
   */
  @Method
  signJWTToken(len = 25) {
    return crypto.randomBytes(len).toString('hex');
  }

  @Method
  notifyRegistered(ctx: Context, user: User) {
    return ctx
      .emit(`${SERVICE_AUTH}.registered`, user)
      .then(() => this.emailRegisteredUser(user))
      .then(() =>
        this.logger.info(
          `Emit new user registered with username: ${user.username} and email: ${user.email}`
        )
      )
      .then(() => user);
  }

  @Method
  emailRegisteredUser(user: User) {
    // TODO: Email if enable email service
    return Promise.resolve(user);
  }
  // METHODS (E)
}

export = AuthService;
