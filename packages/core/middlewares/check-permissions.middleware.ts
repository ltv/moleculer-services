import {
  ActionPermission,
  ActionSchema,
  AuthSpecialRole,
  Context,
  CustomPermissionFunc,
} from '@ltv/types';
import { AppError } from '../errors';
import isFunction from 'lodash.isfunction';
import isString from 'lodash.isstring';
import { ActionHandler, Middleware } from 'moleculer';

export interface PermissionParams {
  roles: string[];
  permissions: ActionPermission[];
  permNames: string[];
}

export interface AclServiceOptions {
  name: string;
  version?: number;
}

export interface SpecialRoleOptions {
  [owner: string]: AuthSpecialRole;
}

export interface CheckPermissionsMiddlewareOptions {
  acl?: AclServiceOptions;
  roles?: SpecialRoleOptions;
}

const defaultRolesOpts: SpecialRoleOptions = {
  owner: AuthSpecialRole.OWNER,
  everyone: AuthSpecialRole.EVERYONE,
  authenticated: AuthSpecialRole.AUTHENTICATED,
  system: AuthSpecialRole.SYSTEM,
};

const defaultAclOpts: AclServiceOptions = {
  name: '@auth-acl',
  version: 1,
};

export function CheckPermissionsMiddleware(
  options: CheckPermissionsMiddlewareOptions
): Middleware {
  options = Object.assign(
    { acl: defaultAclOpts, roles: defaultRolesOpts },
    options || {}
  );
  const { version } = options.acl;
  const aclServiceName = `${version ? version + '.' : ''}${options.acl.name}`;
  return {
    localAction(next: ActionHandler, action: ActionSchema) {
      const { permissions } = action;
      const shouldCheckPermissions = permissions && permissions.length;
      if (shouldCheckPermissions) {
        const permNames: string[] = [];
        const permFuncs: CustomPermissionFunc[] = [];

        permissions.forEach((perm) => {
          if (isFunction(perm)) {
            // custom permissions function
            return permFuncs.push(perm);
          }

          if (isString(perm)) {
            if (perm === options.roles.owner) {
              return permFuncs.push((ctx: Context) => {
                if (isFunction(ctx.service.checkOwner)) {
                  return ctx.service.checkOwner.call(this, ctx);
                }
                return Promise.resolve(false);
              });
            }

            // Add role or permission name
            permNames.push(perm);
          }
        });

        return async function CheckPermissionsMiddleware(ctx: Context) {
          const { roles } = ctx.meta;
          if (roles && roles.length) {
            let res: boolean = false;

            if (permNames.length > 0) {
              res = await ctx.call<boolean, PermissionParams>(
                `${aclServiceName}.hasAccess`,
                {
                  roles,
                  permissions,
                  permNames,
                }
              );
            }

            if (!res) {
              if (permFuncs.length > 0) {
                const results = await Promise.all(
                  permFuncs.map<Promise<boolean>>(async (fn) =>
                    fn.call(this, ctx)
                  )
                );
                // one of custom permissions return `true` -> allowed
                res = results.some((r) => r);
              }

              if (!res) {
                // return AuthError.noPermission().reject();
                return AppError.createError({
                  type: 'NO_PERMISSION',
                  message: 'You have no permissions to perform this action.',
                  code: 403,
                }).reject();
              }
            }
          }

          return next(ctx);
        }.bind(this);
      }
      return next;
    },
  };
}
