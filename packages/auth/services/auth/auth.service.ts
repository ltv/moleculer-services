import { ConfigMixin } from '@app/core/mixins/config.mixin';
import createHashIds from '@app/core/utils/hashids';
import { BaseService } from '@app/types';
import crypto from 'crypto';
import { Token, User } from 'models';
import { Context, Errors } from 'moleculer';
import { Action, Method, Service } from 'moleculer-decorators';
import { RegisterUserRule } from 'services/users/validators/index.validator';
import { SERVICE_AUTH, SERVICE_USERS, SERVICE_CONFIGS } from 'utils/constants';
import { generateToken, verifyJWT } from '../../helpers/jwt';
import { comparePassword, genSalt, hashPass } from '../../helpers/password';
import { AuthLoginRule } from './validators/index.validator';

const { MoleculerClientError } = Errors;
const name = SERVICE_AUTH;
const hashIds = createHashIds(name, 10);

// export default AuthServiceSchema;
@Service({
  name: SERVICE_AUTH,
  version: 1,
  settings: {},
  mixins: [
    ConfigMixin(['site.**', 'users.**'], { serviceName: SERVICE_CONFIGS })
  ]
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
  async login(ctx: Context<any>) {
    let query;
    if (this.configs['users.username.enabled']) {
      query = {
        $or: [{ email: ctx.params.email }, { username: ctx.params.email }]
      };
    } else {
      query = { email: ctx.params.email };
    }

    // Get user
    // const user = await this.adapter.findOne(query);
    const user: User = await ctx
      .call(`v1.${SERVICE_USERS}.find`, { query })
      .then((users: User[]) => users[0]);
    if (!user)
      throw new MoleculerClientError(
        'User not found!',
        400,
        'ERR_USER_NOT_FOUND'
      );

    // Check verified
    if (!user.verified) {
      throw new MoleculerClientError(
        'Please activate your account!',
        400,
        'ERR_ACCOUNT_NOT_VERIFIED'
      );
    }

    // Check status
    if (user.status !== 1) {
      throw new MoleculerClientError(
        'Account is disabled!',
        400,
        'ERR_ACCOUNT_DISABLED'
      );
    }

    // Check passwordless login
    if (user.passwordless == true && ctx.params.password)
      throw new MoleculerClientError(
        'This is a passwordless account! Please login without password.',
        400,
        'ERR_PASSWORDLESS_WITH_PASSWORD'
      );

    // Authenticate
    if (ctx.params.password) {
      // Login with password
      if (!comparePassword(ctx.params.password, user.password))
        throw new MoleculerClientError(
          'Wrong password!',
          400,
          'ERR_WRONG_PASSWORD'
        );
    } else if (this.configs['users.passwordless.enabled']) {
      if (!this.configs['mail.enabled'])
        throw new MoleculerClientError(
          'Passwordless login is not available because mail transporter is not configured.',
          400,
          'ERR_PASSWORDLESS_UNAVAILABLE'
        );

      // Send magic link
      await this.sendMagicLink(ctx, user);

      return {
        passwordless: true,
        email: user.email
      };
    } else {
      throw new MoleculerClientError(
        'Passwordless login is not allowed.',
        400,
        'ERR_PASSWORDLESS_DISABLED'
      );
    }

    // Check Two-factor authentication
    if (user.tfa && user.tfa.enabled) {
      if (!ctx.params.token)
        throw new MoleculerClientError(
          'Two-factor authentication is enabled. Please give the 2FA code.',
          400,
          'ERR_MISSING_2FA_CODE'
        );

      if (!(await this.verify2FA(user.tfa.secret, ctx.params.token)))
        throw new MoleculerClientError(
          'Invalid 2FA token!',
          400,
          'TWOFACTOR_INVALID_TOKEN'
        );
    }

    const token = generateToken(
      { id: user._id.toString() },
      this.configs['users.jwt.expiresIn']
    );

    return { token };
  }

  /**
   * Register a new user account
   *
   */
  @Action({
    params: RegisterUserRule
  })
  async register(ctx: Context<User>) {
    if (!this.configs['users.signup.enabled']) {
      throw new MoleculerClientError(
        'Sign up is not available.',
        400,
        'ERR_SIGNUP_DISABLED'
      );
    }

    const params = Object.assign({}, ctx.params);
    const entity: Partial<User> = {};

    // Verify email
    const found = await ctx.call(`v1.${SERVICE_USERS}.getUserByEmail`, {
      email: params.email
    });
    if (found) {
      throw new MoleculerClientError(
        'Email has already been registered.',
        400,
        'ERR_EMAIL_EXISTS'
      );
    }

    // Verify username
    if (this.configs['users.username.enabled']) {
      if (!ctx.params.username) {
        throw new MoleculerClientError(
          "Username can't be empty.",
          400,
          'ERR_USERNAME_EMPTY'
        );
      }

      const found = await ctx.call(`v1.${SERVICE_USERS}.getUserByUsername`, {
        username: params.username
      });
      if (found) {
        throw new MoleculerClientError(
          'Username has already been registered.',
          400,
          'ERR_USERNAME_EXISTS'
        );
      }

      entity.username = params.username;
    }

    // Set basic data
    entity.email = params.email;
    entity.firstName = params.firstName;
    entity.lastName = params.lastName;
    entity.role = this.configs['users.defaultRole'];
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
    } else if (this.configs['users.passwordless.enabled']) {
      entity.passwordless = true;
      entity.password = this.generateToken();
    } else {
      throw new MoleculerClientError(
        "Password can't be empty.",
        400,
        'ERR_PASSWORD_EMPTY'
      );
    }

    // Generate verification token
    if (this.configs['users.verification.enabled']) {
      entity.verified = false;
      entity.verificationToken = this.generateToken();
    }

    // Create new user
    const user = await ctx.call(`v1.${SERVICE_USERS}.insertUser`, { entity });

    // Send email TODO
    // if (user.verified) {
    //   // Send welcome email
    //   this.sendMail(ctx, user, 'welcome');
    //   user.token = await this.getToken(user);
    // } else {
    //   // Send verification email
    //   this.sendMail(ctx, user, 'activate', { token: entity.verificationToken });
    // }
    if (!entity.verified) {
      ctx.emit(`${SERVICE_USERS}.createdUserMail`, {
        user,
        token: entity.verificationToken
      });
    }

    return user;
  }

  @Action({
    cache: {
      keys: ['token'],
      ttl: 60 * 60 // 1 hour
    },
    params: {
      token: 'string'
    }
  })
  async resolveToken(ctx: Context<Token>) {
    const decoded: any = verifyJWT(ctx.params.token);
    if (!decoded.id)
      throw new MoleculerClientError('Invalid token', 401, 'INVALID_TOKEN');

    const user: User = await ctx.call(`v1.${SERVICE_USERS}.findById`, {
      id: decoded.id
    });
    if (!user)
      throw new MoleculerClientError(
        'User is not registered',
        401,
        'USER_NOT_FOUND'
      );

    if (!user.verified)
      throw new MoleculerClientError(
        'Please activate your account!',
        401,
        'ERR_ACCOUNT_NOT_VERIFIED'
      );

    if (user.status !== 1)
      throw new MoleculerClientError('User is disabled', 401, 'USER_DISABLED');

    return user;
  }
  // ACTIONS (E)

  // METHODS (S)
  /**
   * Generate a token
   *
   * @param {Number} len Token length
   */
  @Method
  generateToken(len = 25) {
    return crypto.randomBytes(len).toString('hex');
  }
  // METHODS (E)
}

export = AuthService;
