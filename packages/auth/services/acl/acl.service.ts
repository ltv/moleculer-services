import { MemoizeMixin } from '@app/core/mixins';
import { BaseService, Context } from '@app/types';
import compact from 'lodash.compact';
import flattenDeep from 'lodash.flattendeep';
import uniq from 'lodash.uniq';
import { Permission, Role } from 'models/acl';
import { Action, Method, Service } from 'moleculer-decorators';
import { ObjectId } from 'mongodb';
import { SERVICE_ACL, SERVICE_PERMISSIONS, SERVICE_ROLES } from 'utils/constants';
const { match } = require('moleculer').Utils;

@Service({
  name: SERVICE_ACL,
  version: 1,
  mixins: [MemoizeMixin()],
  settings: {},
  dependencies: [
    { name: SERVICE_PERMISSIONS, version: 1 },
    { name: SERVICE_ROLES, version: 1 }
  ]
})
class AclService extends BaseService {
  // Actions (S)
  @Action({
    name: 'can',
    cache: { keys: ['#roles', 'permissions'] },
    params: {
      roles: { type: 'array', items: 'string' },
      permission: { type: 'string' }
    }
  })
  actCan(ctx: Context<{ roles: string[]; permission: string }>) {
    return this.can(ctx.params.roles, ctx.params.permission);
  }

  @Action({
    name: 'hasAccess',
    cache: { keys: ['#roles', 'permissions'] },
    params: {
      roles: { type: 'array', items: 'string' },
      permissions: { type: 'array', items: 'string', min: 1 }
    }
  })
  actHasAccess(ctx: Context<{ roles: string[]; permissions: string[] }>) {
    return this.hasAccess(ctx.params.roles, ctx.params.permissions);
  }
  // Actions (E)

  // Methods (S)
  /**
   * Get all permissions by user roles.
   *
   * @param {string[]} roleNames
   */
  getPermissions(roleNames: string[]) {
    return this.memoize('permissions', roleNames, async () => {
      const roles = await this.broker.call<Role[], any>(`v1.${SERVICE_ROLES}.find`, {
        query: { code: { $in: roleNames } }
      });
      const permissions = await Promise.all(
        roles.map(async (role) => {
          let res = role.permissions ? Array.from(role.permissions) : [];

          if (Array.isArray(role.inherits) && role.inherits.length > 0) {
            res = res.concat(await this.getPermissions(role.inherits));
          }

          return res;
        })
      );

      return uniq(flattenDeep(permissions));
    });
  }
  /**
   * Checks if the user has the given permission.
   *
   * @param {string[]} rolesNames
   * @param {string} permission
   */
  async can(rolesNames: string[], permission: string): Promise<boolean> {
    const perms = await this.getPermissions(rolesNames);
    return perms.some((p: string) => match(p, permission));
  }

  /**
   * Checks if the user has the given permission(s). At least one permission must be
   * accountable in order to return true.
   *
   * @param {string[]} roleNames
   * @param {string[]} permissions
   * @returns {boolean}
   */
  async canAtLeast(roleNames: string[], permissions: string[]) {
    const permList = await this.getPermissions(roleNames);
    return permissions.some((perm) => permList.find((p: string) => match(perm, p)));
  }

  /**
   * Check if user has the given role. A user must have at least one role in order to return true.
   *
   * @param {string[]} roleNames
   * @param {string} role
   * @returns {boolean}
   */
  async hasRole(roleNames: string[], role: string): Promise<boolean> {
    let res = roleNames.indexOf(role) !== -1;
    if (!res) {
      // Check inherits
      const entities = await this.broker.call<Role[], any>(`v1.${SERVICE_ROLES}.find`, {
        query: { code: { $in: roleNames } }
      });
      if (entities.length > 0) {
        const inherits = uniq(
          compact(flattenDeep(entities.map((entity) => entity.inherits || [])))
        );
        if (inherits.length > 0) res = await this.hasRole(inherits, role);
      }
    }
    return res;
  }

  /**
   * Checks if the user has the given permission(s) or role(s). At least one
   * permission or role must be accountable in order to return true.
   *
   * @param {string[]} roleNames
   * @param {string[]} permissionsAndRoles
   * @returns {boolean}
   */
  async hasAccess(roleNames: string[], permissionsAndRoles: string[]): Promise<boolean> {
    const res = await Promise.all(
      permissionsAndRoles.map(async (p) => {
        if (p.indexOf('.') !== -1) return await this.can(roleNames, p);
        else return await this.hasRole(roleNames, p);
      })
    );
    return res.some((p) => !!p);
  }

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
  // Methods (E)

  public async started() {
    await this.seedDB().then(() => this.logger.info('Seeded roles & permissions'));
  }
}

export = AclService;
