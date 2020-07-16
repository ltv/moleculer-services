import { MongooseMixin } from '@app/core/mixins/mongoose.mixin';
import { BaseService } from '@app/types';
import { Permission } from 'models/acl';
import { Service } from 'moleculer-decorators';
import { SERVICE_PERMISSIONS } from 'utils/constants';

@Service({
  name: SERVICE_PERMISSIONS,
  version: 1,
  mixins: [MongooseMixin(Permission)],
  settings: {}
})
class PermissionService extends BaseService {}

export = PermissionService;
