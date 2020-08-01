import { CacheCleaner } from '@ltv/moleculer-core/mixins/cache.cleaner.mixin';
import { MongooseMixin } from '@ltv/moleculer-core/mixins/mongoose.mixin';
import { AuthSpecialRole, BaseService, Context } from '@ltv/types';
import flattenDeep from 'lodash.flattendeep';
import isEqual from 'lodash.isequal';
import uniqBy from 'lodash.uniqby';
import { Config } from 'models';
import { Errors } from 'moleculer';
import { Action, Method, Service } from 'moleculer-decorators';
import { SERVICE_CONFIGS } from 'utils/constants';

const { ValidationError } = Errors;

const { match } = require('moleculer').Utils;

@Service({
  name: SERVICE_CONFIGS,
  version: 1,
  mixins: [MongooseMixin(Config) as any, CacheCleaner(['cache.clean.configs'])],
  settings: {
    rest: false,
    defaultConfig: {
      'mail.enabled': false,
      'mail.from': 'no-reply@ltv.vn',

      'user.signup.enabled': process.env.USER_SIGNUP_ENABLED || true,
      'user.username.enabled': process.env.USER_USERNAME_ENABLED || false,
      'user.passwordless.enabled': process.env.USER_PASSWORDLESS_ENABLED || false,
      'user.verification.enabled': process.env.USER_VERIFICATION_ENABLED || false,
      'user.defaultRole': AuthSpecialRole.EVERYONE,
      'user.jwt.expiresIn': process.env.USER_JWT_EXPIRESIN || '30m',
      'user.two-factor.enabled': process.env.USER_TWO_FACTOR_ENABLED || false
    }
  }
})
class ConfigsService extends BaseService {
  // ACTIONS (S)
  /**
   * Get configurations by key or keys
   *
   * @actions
   * @param {String|Array<String>} key
   * @returns {Object|Array<String>}
   */

  @Action({
    name: 'get',
    cache: {
      keys: ['key']
    }
  })
  async actGet(ctx: Context<any>) {
    if (ctx.params.key == null)
      throw new ValidationError("Param 'key' must be defined.", 'ERR_KEY_NOT_DEFINED');

    return await this.transformDocuments(ctx, {}, await this.get(ctx.params.key));
  }

  /**
   * Set configuration values by keys
   *
   * @actions
   * @param {String} key
   * @param {any} key
   * @returns {Object|Array<Object>}
   */
  @Action({
    name: 'set'
  })
  async actSet(ctx: Context<any>) {
    if (Array.isArray(ctx.params)) {
      return Promise.all(
        ctx.params.map(async (p: Config) => {
          const { changed, item } = await this.set(p.key, p.value);
          const res = await this.transformDocuments(ctx, {}, item);
          if (changed) this.broker.broadcast(`${this.name}.${item.key}.changed`, res);

          return res;
        })
      );
    } else {
      const { changed, item } = await this.set(ctx.params.key, ctx.params.value);
      const res = await this.transformDocuments(ctx, {}, item);
      if (changed) this.broker.broadcast(`${this.name}.${item.key}.changed`, res);

      return res;
    }
  }

  @Action({ cache: true })
  all() {
    return this.adapter.find({});
  }
  // ACTIONS (E)

  // METHODS (S)
  /**
   * Get configurations by key.
   *
   * @methods
   * @param {String|Array<String>} key Config key
   * @returns {Object|Array<Object>}
   */
  @Method
  async get(key: string | string[]) {
    if (Array.isArray(key)) {
      const res = await Promise.all(key.map((k) => this.getByMask(k)));
      return uniqBy(flattenDeep(res), (item) => item.key);
    } else {
      if (key.indexOf('*') == -1 && key.indexOf('?') == -1)
        return await this.adapter.findOne({ key });

      return await this.getByMask(key);
    }
  }

  /**
   * Get configurations by key mask.
   *
   * @methods
   * @param {String} mask Key mask
   * @returns {Array<Object>}
   */
  @Method
  async getByMask(mask: string) {
    const allItems: any[] = await this.broker.call(`${this.fullName}.all`);

    /* istanbul ignore next */
    if (!allItems) return [];

    return allItems.filter((item) => match(item.key, mask));
  }

  /**
   * Check whether a configuration key exists.
   *
   * @methods
   * @param {String} key
   * @returns {Boolean}
   */
  @Method
  async has(key: string) {
    const res = await this.adapter.findOne({ key });
    return res != null;
  }

  /**
   * Set a configuration value.
   *
   * @methods
   * @param {String} key Key
   * @param {any} value Value
   * @param {Boolean} isDefault
   *
   * @returns {Object}
   */
  @Method
  async set(key: string, value: any, isDefault = false) {
    const item = await this.adapter.findOne({ key });
    if (item != null) {
      if (!isEqual(item.value, value)) {
        // Modify
        return {
          item: await this.adapter.updateById(item._id, {
            $set: { value, isDefault, updatedAt: Date.now() }
          }),
          changed: true
        };
      }

      // No changes
      return {
        item,
        changed: false
      };
    }

    // Create new
    return {
      item: await this.adapter.insert({
        key,
        value,
        isDefault,
        createdAt: Date.now()
      }),
      changed: true,
      new: true
    };
  }

  /**
   * Run configuration migration. Add missing keys.
   *
   * @methods
   * @private
   */
  @Method
  migrateConfig() {
    return Promise.all(
      Object.keys(this.settings.defaultConfig).map(async (key) => {
        const value = this.settings.defaultConfig[key];
        const item = await this.get(key);
        if (!item) {
          this.logger.info(`Save new config: "${key}" =`, value);
          return this.set(key, value, true);
        } else if (item.isDefault && !isEqual(item.value, value)) {
          this.logger.info(`Update default config: "${key}" =`, value);
          return this.set(key, value, true);
        }
      })
    );
  }
  // METHODS (E)

  // HOOKS (S)
  public started() {
    this.migrateConfig().then(() => this.logger.info('Updated default configs'));
  }
  // HOOKS (E)
}

export = ConfigsService;
