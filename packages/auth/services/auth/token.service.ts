import { MongooseMixin, MongooseServiceSchema } from '@ltv/core/mixins/mongoose.mixin';
import { BaseService, Context } from '@ltv/types';
import { ConfigMixin } from 'mixins/config.mixin';
import { Token } from 'models';
import { Action, Service } from 'moleculer-decorators';
import { SERVICE_TOKEN } from 'utils/constants';
import { signJWTToken } from 'utils/jwt';
import { sha512 } from 'utils/password';
import { AuthError } from 'errors';

interface AuthTokenService extends BaseService, MongooseServiceSchema<Token> {}

@Service({
  name: SERVICE_TOKEN,
  mixins: [MongooseMixin(Token), ConfigMixin(['mail.**', 'user.**'])],
  version: 1,
  settings: {
    rest: true,
    idField: '_id'
  },
  hooks: {
    before: {
      create: ['hashToken'],
      delete: ['hashToken']
    }
  }
})
class AuthTokenService extends BaseService implements AuthTokenService {
  /** HOOKS (S) */
  hashToken(ctx: Context<Token>) {
    const { token } = ctx.params;
    ctx.params.token = sha512(token);
    this.logger.debug('[hashToken] > token: ', token, ', to: ', ctx.params.token);
  }
  /** HOOKS (E) **/

  /** Actions (S) */
  @Action({
    name: 'findToken',
    params: {
      userId: 'string',
      token: 'string'
    }
  })
  actFindToken(ctx: Context<Token>) {
    const { userId, token } = ctx.params;
    return this.adapter.findOne({ userId, token });
  }

  @Action({
    name: 'renew',
    rest: 'POST /renew'
  })
  async actRenew(ctx: Context) {
    const { userId, token } = ctx.meta;
    const tok = await this.adapter.findOne({ userId, token });
    if (tok) {
      // renew token when the old token is valid and existed
      return this.renewToken(tok);
    }

    // when the old token is not existed in db, it means, someone already renewed
    return ctx
      .call(`v1.${SERVICE_TOKEN}.removeMany`, { userId })
      .then(() => AuthError.accountHasBeenHacked().reject());
  }

  @Action({ name: 'delete' })
  actDeleteToken(ctx: Context<Token>) {
    const { userId } = ctx.meta;
    const { token } = ctx.params;
    return this.adapter.model.deleteOne({ userId, token }).then((doc) => doc.deletedCount > 0);
  }
  /** Actions (E) */

  // Methods (S)
  async renewToken(token: Token) {
    const tokenId = token._id.toString();
    const userId = token.userId.toString();
    const newToken = signJWTToken({ id: userId }, this.configs['user.jwt.expiresIn']);
    const updated = await this.adapter.updateById(tokenId, { $set: { token: newToken } });
    return updated;
  }
  // Methods (E)
}

export = AuthTokenService;
