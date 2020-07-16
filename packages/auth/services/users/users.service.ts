import { CacheCleaner } from '@app/core/mixins/cache.cleaner.mixin';
import { MongooseMixin, MongooseServiceSchema } from '@app/core/mixins/mongoose.mixin';
import { BaseService, ServiceMetadata } from '@app/types';
import { AuthorizeMixin } from 'mixins/authorize.mixin';
import { ConfigMixin } from 'mixins/config.mixin';
import { Token, User } from 'models';
import { Context, Errors } from 'moleculer';
import { Action, Service } from 'moleculer-decorators';
import {
  ERR_USER_ALREADY_DISABLED,
  ERR_USER_ALREADY_ENABLED,
  ROLE_ADMIN,
  SERVICE_USERS
} from 'utils/constants';

const { MoleculerClientError } = Errors;

interface UserService extends BaseService, MongooseServiceSchema<User> {}

@Service({
  name: SERVICE_USERS,
  version: 1,
  mixins: [
    MongooseMixin(User),
    CacheCleaner(['cache.clean.users']),
    ConfigMixin(['site.**', 'users.**']),
    AuthorizeMixin({
      list: [ROLE_ADMIN],
      get: [ROLE_ADMIN],
      create: [ROLE_ADMIN],
      delete: [ROLE_ADMIN]
    })
  ],
  settings: {
    rest: true,
    idField: '_id'
  },
  hooks: {
    before: {
      create: ['setVerified']
    }
  }
})
class UserService extends BaseService implements UserService {
  async setVerified(ctx: Context<User, ServiceMetadata>) {
    ctx.params.verified = true;
  }

  /**
   * Get current user entity.
   *
   * @actions
   *
   * @returns {Object} User entity
   */
  @Action({
    cache: {
      keys: ['#userId']
    },
    rest: 'GET /me'
  })
  async me(ctx: Context<any, ServiceMetadata>) {
    if (!ctx.meta.userId) {
      return null;
    }

    const user = await this.getById(ctx.meta.userId);
    if (!user) {
      return null;
    }

    // Check verified
    if (!user.verified) {
      return null;
    }

    // Check status
    if (user.status !== 1) {
      return null;
    }

    return this.transformDocuments(ctx, {}, user);
  }

  @Action({
    params: {
      entity: 'object'
    }
  })
  async insertUser(ctx: Context<{ entity: User }>) {
    const user = await this.adapter.insert(ctx.params.entity);
    return this.transformDocuments(ctx, {}, user);
  }

  @Action({
    cache: {
      keys: ['id']
    },
    params: {
      id: 'string'
    }
  })
  async findById(ctx: Context<{ id: string }>) {
    const { id } = ctx.params;
    const user: User = await this.getById(id);
    return this.transformDocuments(ctx, {}, user);
  }

  /**
   * Verify an account
   */
  @Action({
    params: {
      token: { type: 'string' }
    },
    rest: 'POST /auth/verify'
  })
  async verify(ctx: Context<Token>) {
    const user = await this.adapter.findOne({
      verificationToken: ctx.params.token
    });
    if (!user) {
      throw new MoleculerClientError('Invalid verification token!', 400, 'INVALID_TOKEN');
    }

    const updatedUser = await this.adapter.updateById(user._id, {
      $set: {
        verified: true,
        verificationToken: null
      }
    });

    // Send welcome email
    // this.sendMail(ctx, updatedUser, 'welcome');

    return {
      token: await this.getToken(updatedUser)
    };
  }
  /**
   * Disable an account
   */
  @Action({
    params: {
      id: { type: 'string' }
    },
    needEntity: true
  })
  async disable(ctx: Context) {
    const user = (ctx as any).locals.entity;
    if (user.status === 0) {
      throw new MoleculerClientError(
        'Account has already been disabled!',
        400,
        ERR_USER_ALREADY_DISABLED
      );
    }

    const res = await this.adapter.updateById(user._id, { $set: { status: 0 } });

    return { status: res.status };
  }

  /**
   * Enable an account
   */
  @Action({
    params: {
      id: { type: 'string' }
    },
    needEntity: true
  })
  async enable(ctx: Context) {
    const user = (ctx as any).locals.entity;
    if (user.status === 1) {
      throw new MoleculerClientError(
        'Account has already been enabled!',
        400,
        ERR_USER_ALREADY_ENABLED
      );
    }
    const res = await this.adapter.updateById(user._id, {
      $set: {
        status: 1
      }
    });
    return {
      status: res.status
    };
  }

  /**
   * Get user by email
   *
   * @param {String} email
   */
  @Action({
    cache: {
      keys: ['email']
    },
    params: {
      email: 'string'
    }
  })
  async getUserByEmail(ctx: Context<{ email: string }>) {
    const { email } = ctx.params;
    return await this.adapter.findOne({ email });
  }

  /**
   * Get user by username
   *
   * @param {String} username
   */
  @Action({
    cache: {
      keys: ['username']
    },
    params: {
      username: 'string'
    }
  })
  async getUserByUsername(ctx: Context<{ username: string }>) {
    const { username } = ctx.params;
    return await this.adapter.findOne({ username });
  }

  /**
   * Get user by username
   *
   * @param {String} username
   */
  @Action({
    cache: {
      keys: ['query']
    },
    params: {
      query: 'object'
    }
  })
  findOneUser(ctx: Context<{ query: any }>) {
    return this.adapter.findOne(ctx.params.query);
  }
  // ACTIONS (E)
  async started() {
    const count = await this.adapter.findOne({
      email: 'admin@ltv.vn'
    });
    if (!count) {
      const AdminInfo = {
        status: 1,
        passwordless: false,
        verified: true,
        email: 'admin@ltv.vn',
        firstName: 'admin',
        lastName: 'mr',
        role: 'admin',
        avatar: 'https://gravatar.com/avatar/16b58c10a2451f52af3bc45a36ab7b8d?s=64&d=robohash',
        password: '$2b$10$BoCaLdlx28JSneND4.6iceKPwUkDVtAprxYmp5oOGzES1x0Xw2qYe'
      };
      this.adapter.insert(AdminInfo);
      this.logger.info('Account Admin was inserted!');
    }
  }
}

export = UserService;
