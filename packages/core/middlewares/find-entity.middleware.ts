import {
  ActionHandler,
  ActionSchema,
  Context,
  GenericObject,
  Middleware,
} from 'moleculer';
import { DatabaseError } from '../errors/db.error';

export function FindEntityMiddleware(): Middleware {
  return {
    localAction(next: ActionHandler, action: ActionSchema) {
      if (action.needEntity) {
        return async function FindEntityMiddleware(
          ctx: Context<{ id: string | number }> & { locals: GenericObject }
        ) {
          const svc = ctx.service;
          const entity = await svc?.getById(ctx.params.id, true);
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
  } as any;
}
