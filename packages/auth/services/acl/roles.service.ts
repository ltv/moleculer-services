import { MongooseMixin } from '@app/core/mixins/mongoose.mixin';
import { BaseService } from '@app/types';
import { Role } from 'models/acl';
import { Service } from 'moleculer-decorators';
import { SERVICE_ROLES } from 'utils/constants';

@Service({
  name: SERVICE_ROLES,
  version: 1,
  mixins: [MongooseMixin(Role)],
  settings: {}
})
class RoleService extends BaseService {}

export = RoleService;
