import { Context, ServiceMetadata } from '@app/types';
import { InvalidRequestBodyError, NotFoundError } from '@app/core/errors';
import set from 'lodash.set';
import { ServiceSchema } from 'moleculer';

export type OwnerMixinCheckApplyFunc = (ctx: Context) => Promise<boolean>;

const alwayApply = () => Promise.resolve(true);

export interface OwnerServiceSchema<T> {
  setCreatorToEntity: (ctx: Context, path: string, ...fields: string[]) => void;

  findOwnedEntityById: (ctx: Context, id: string) => Promise<T>;
}

export function OwnerMixin(shouldApply: OwnerMixinCheckApplyFunc = alwayApply) {
  const schema: ServiceSchema = {
    name: '',

    methods: {
      setCreatorToEntity(ctx: Context, path: string, ...fields: string[]) {
        if (!ctx.meta.userId) return;

        fields.forEach((field) => {
          set(
            ctx.params as any,
            [path, field].filter(Boolean).join('.'),
            ctx.meta.userId
          );
        });
      },

      async findOwnedEntityById(ctx: Context, id: string) {
        if (!ctx.meta.userId) return null;
        const [obj]: any[] = await this._find(ctx, {
          query: { _id: id, createBy: ctx.meta.userId }
        });
        return obj;
      }
    },

    hooks: {
      before: {
        list: async function (ctx) {
          if (!ctx.meta.userId) return;
          if (!(await shouldApply(ctx))) return;

          let query = ctx.params.query || {};
          if (typeof query === 'string') {
            try {
              query = JSON.parse(query);
            } catch (err) {
              return Promise.reject(
                new InvalidRequestBodyError(
                  'Query is not a valid JSON string',
                  err
                )
              );
            }
          }
          query.createBy = ctx.meta.userId;
          ctx.params.query = query;
        },
        create: async function (ctx) {
          if (!ctx.meta.userId) return;
          if (!(await shouldApply(ctx))) return;
          this.setCreatorToEntity(ctx, null, 'createBy', 'updateBy');
        },
        get: async function (ctx) {
          if (!ctx.meta.userId) return;
          if (!(await shouldApply(ctx))) return;
          const exists = await this.findOwnedEntityById(ctx, ctx.params.id);
          if (!exists) {
            return Promise.reject(
              new NotFoundError(null, { id: ctx.params.id })
            );
          }
        },
        update: async function (ctx) {
          if (!ctx.meta.userId) return;
          if (!(await shouldApply(ctx))) return;
          const exists = await this.findOwnedEntityById(ctx, ctx.params.id);
          if (!exists) {
            return Promise.reject(
              new NotFoundError(null, { id: ctx.params.id })
            );
          }

          this.setCreatorToEntity(ctx, null, 'updateBy');
        },
        delete: async function (ctx) {
          if (!ctx.meta.userId) return;
          if (!(await shouldApply(ctx))) return;
          const exists = await this.findOwnedEntityById(ctx, ctx.params.id);
          if (!exists) {
            return Promise.reject(
              new NotFoundError(null, { id: ctx.params.id })
            );
          }
        }
      }
    }
  };

  return schema;
}
