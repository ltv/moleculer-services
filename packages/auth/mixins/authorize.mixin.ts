import { ForbiddenError } from '@app/core/errors';
import { Context } from '@app/types';
import { ServiceSchema } from 'moleculer';

type AuthorizedRole = string;

export interface AuthorizeMixinOptions {
  [action: string]: AuthorizedRole[];
}

export interface AuthorizeServiceSchema {
  hasRole: (ctx: Context, roles: AuthorizedRole[]) => boolean;
}

export function AuthorizeMixin(options: AuthorizeMixinOptions) {
  const schema: ServiceSchema = {
    name: '',

    methods: {
      hasRole(ctx: Context, roles: AuthorizedRole[]) {
        if (!ctx.meta.userId) return true;
        const userRoles = ctx.meta.roles;
        return roles.some((role) => userRoles.includes(role));
      }
    },

    hooks: {
      before: {
        ...Object.keys(options).reduce<Record<string, any>>((all, action) => {
          all[action] = async function (ctx: Context) {
            if (!this.hasRole(ctx, options[action])) {
              return Promise.reject(
                new ForbiddenError('You are not allowed to perform this action', { action })
              );
            }
          };
          return all;
        }, {})
      }
    }
  };

  return schema;
}
