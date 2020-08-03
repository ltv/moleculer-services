import { BaseService } from '@ltv/moleculer-core';
import { MongooseMixin } from 'mixins/mongoose.mixin';
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
