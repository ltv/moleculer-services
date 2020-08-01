import { CacheCleaner } from '@ltv/moleculer-core/mixins/cache.cleaner.mixin';
import { MongooseMixin, MongooseServiceSchema } from '@ltv/moleculer-core/mixins/mongoose.mixin';
import { AuthSpecialRole, BaseService, ServiceMetadata } from '@ltv/types';
import { AuthError } from 'errors';
import { ConfigMixin } from 'mixins/config.mixin';
import { Token, User } from 'models';
import { Context } from 'moleculer';
import { Action, Service } from 'moleculer-decorators';
import { SERVICE_USERS } from 'utils/constants';

interface UserService extends BaseService, MongooseServiceSchema<User> {}

const { ADMIN_USER, ADMIN_PASSWORD, ADMIN_EMAIL } = process.env;

@Service({
  name: SERVICE_USERS,
  version: 1,
  mixins: [
    MongooseMixin(User),
    CacheCleaner(['cache.clean.users']),
    ConfigMixin(['mail.**', 'user.**'])
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
      keys: ['#userId'],
      ttl: 60 * 30 // 30 mins
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
    }
  })
  async verify(ctx: Context<Token>) {
    const user = await this.adapter.findOne({
      verificationToken: ctx.params.token
    });
    if (!user) {
      return AuthError.invalidToken().reject();
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
      return AuthError.userIsNotActive().reject();
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
    const res = await this.adapter.updateById(user._id, { $set: { status: 1 } });
    return { status: res.status };
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
  getUserByEmail(ctx: Context<{ email: string }>) {
    const { email } = ctx.params;
    return this.adapter.findOne({ email });
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
  getUserByUsername(ctx: Context<{ username: string }>) {
    const { username } = ctx.params;
    return this.adapter.findOne({ username });
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
    const email = ADMIN_EMAIL || 'admin@ltv.dev';
    const username = ADMIN_USER || 'admin';
    const firstName = username;
    const password = ADMIN_PASSWORD || 'admin123';
    const count = await this.adapter.findOne({ email });
    if (!count) {
      const AdminInfo = {
        status: 1,
        passwordless: false,
        verified: true,
        email,
        username,
        firstName,
        lastName: '',
        role: AuthSpecialRole.SYSTEM,
        avatar: 'https://gravatar.com/avatar/16b58c10a2451f52af3bc45a36ab7b8d?s=64&d=robohash',
        password
      };
      this.adapter.insert(AdminInfo);
      this.logger.info(`Account ${username} was inserted!`);
    }
  }
}

export = UserService;
