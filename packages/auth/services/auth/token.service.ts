import { MongooseMixin } from '@app/core/mixins/mongoose.mixin';
import { BaseService, Context } from '@app/types';
import { sha512 } from 'helpers/password';
import { Token } from 'models';
import { Service, Action } from 'moleculer-decorators';
import { SERVICE_TOKEN } from 'utils/constants';

@Service({
  name: SERVICE_TOKEN,
  mixins: [MongooseMixin(Token)],
  version: 1,
  settings: {
    rest: true,
    idField: '_id'
  },
  hooks: {
    before: {
      create: ['hashToken']
    }
  }
})
class AuthToken extends BaseService {
  /** HOOKS (S) */
  hashToken(ctx: Context<Token>) {
    const { token } = ctx.params;
    ctx.params.token = sha512(token);
  }
  /** HOOKS (E) **/

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
}

export = AuthToken;
