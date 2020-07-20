import { ActionHandler, Middleware } from 'moleculer';
import { ActionSchema, Context } from '@app/types';
import { DatabaseError } from '../errors';

export function FindEntityMiddleware(): Middleware {
  return {
    localAction(next: ActionHandler, action: ActionSchema) {
      if (action.needEntity) {
        return async function FindEntityMiddleware(
          ctx: Context<{ id: string | number }>
        ) {
          const svc = ctx.service;
          const entity = await svc.getById(ctx.params.id, true);
          if (!entity) {
            return DatabaseError.notFoundEntity().reject();
          }

          ctx.locals.entity = entity;

          // Call the handler
          return next(ctx);
        }.bind(this);
      }

      return next;
    },
  };
}
