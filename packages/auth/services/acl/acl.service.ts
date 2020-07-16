import { BaseService } from '@app/types';
import { Permission, Role } from 'models/acl';
import { Method, Service } from 'moleculer-decorators';
import { ObjectId } from 'mongodb';
import { SERVICE_ACL, SERVICE_PERMISSIONS, SERVICE_ROLES } from 'utils/constants';

@Service({
  name: SERVICE_ACL,
  version: 1,
  mixins: [],
  settings: {},
  dependencies: [
    { name: SERVICE_PERMISSIONS, version: 1 },
    { name: SERVICE_ROLES, version: 1 }
  ]
})
class AclService extends BaseService {
  @Method
  public async seedDB() {
    const permCount: number = await this.broker.call(`v1.${SERVICE_PERMISSIONS}.count`);
    if (permCount > 0) {
      return;
    }
    const roleCount: number = await this.broker.call(`v1.${SERVICE_ROLES}.count`);
    if (roleCount > 0) {
      return;
    }
    const fullPermission: Permission = {
      _id: new ObjectId(),
      code: '**',
      description: 'Full Permissions'
    };
    const permissions: Permission[] = [
      { _id: new ObjectId(), code: 'user.read', description: 'Read User Info' }
    ];
    const roles: Role[] = [
      {
        _id: new ObjectId(),
        code: 'SYSADMIN',
        name: 'System Admin',
        permissions: [fullPermission.code]
      },
      {
        _id: new ObjectId(),
        code: 'USER',
        name: 'User',
        permissions: permissions.map((p) => p.code)
      }
    ];
    return Promise.all([
      this.broker.call(`v1.${SERVICE_PERMISSIONS}.insert`, {
        entities: [fullPermission, ...permissions]
      }),
      this.broker.call(`v1.${SERVICE_ROLES}.insert`, { entities: roles })
    ]);
  }

  public async started() {
    await this.seedDB().then(() => this.logger.info('Seeded roles & permissions'));
  }
}

export = AclService;
