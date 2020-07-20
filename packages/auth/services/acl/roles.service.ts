import { MongooseMixin, MongooseServiceSchema } from '@app/core/mixins/mongoose.mixin';
import { BaseService, Context } from '@app/types';
import { Role } from 'models/acl';
import { Action, Service } from 'moleculer-decorators';
import { SERVICE_ROLES } from 'utils/constants';

interface RoleService extends MongooseServiceSchema<Role> {}

@Service({
  name: SERVICE_ROLES,
  version: 1,
  mixins: [MongooseMixin(Role)],
  settings: {}
})
class RoleService extends BaseService implements RoleService {
  // Actions (S)
  @Action({
    name: 'updateById',
    params: {
      id: 'string',
      query: 'object'
    }
  })
  actUpdateById(ctx: Context<{ id: string; query: any }>) {
    const { id, query } = ctx.params;
    return this.adapter.updateById(id, query);
  }

  @Action({
    name: 'assignPermission',
    needEntity: true,
    params: {
      id: 'string',
      permission: 'string'
    }
  })
  async actAssignPermission(ctx: Context<{ id: string; permission: string }>) {
    const role = await this.assignPermission(ctx.locals.entity, ctx.params.permission);
    const json = await this.transformDocuments(ctx, {}, role);
    this.entityChanged('updated', json, ctx);
    return json;
  }
  // Actions (E)

  // Methods (S)
  /**
   * Assigns the given permission to the role.
   * @param {Role} role
   * @param {string} permission
   */
  assignPermission(role: Role, permission: string) {
    if (role.permissions.indexOf(permission) === -1) {
      return this.adapter.updateById(role._id, {
        $addToSet: {
          permissions: permission
        },
        $set: {
          updatedAt: Date.now()
        }
      });
    }
    return role;
  }
  /**
   * Revokes the given permission from the role.
   *
   * @param {Role} role
   * @param {string} permission
   */
  revokePermission(role: Role, permission: string) {
    if (role.permissions.indexOf(permission) !== -1) {
      return this.adapter.updateById(role._id, {
        $pull: {
          permissions: permission
        },
        $set: {
          updatedAt: Date.now()
        }
      });
    }
    return role;
  }
  /**
   * Syncs the given permissions with the role. This will revoke any permissions not supplied.
   *
   * @param {Role} role
   * @param {string[]} permissions
   */
  syncPermissions(role: Role, permissions: string[]) {
    return this.adapter.updateById(role._id, { $set: { permissions, updatedAt: Date.now() } });
  }
  // Methods (E)
}

export = RoleService;
