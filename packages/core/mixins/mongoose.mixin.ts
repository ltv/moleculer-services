const DbService = require('moleculer-db');
import { ClassType } from '@app/types';
import { buildSchema, DocumentType } from '@typegoose/typegoose';
import isFunction from 'lodash.isfunction';
import {
  ActionParams,
  ActionParamSchema,
  Context,
  ServiceSchema,
} from 'moleculer';
import MongooseAdapter from 'moleculer-db-adapter-mongoose';
import { ObjectId } from 'mongodb';
import { Connection, Schema, SchemaType, SchemaTypes } from 'mongoose';

const TESTING = process.env.NODE_ENV === 'test';

interface MongoIdSerializer {
  stringToObjectID: (id: any) => ObjectId;
  objectIDToString: (id?: any) => string;
}

class MongooseAdapterExtended<T> extends MongooseAdapter<DocumentType<T>>
  implements MongoIdSerializer {
  stringToObjectID(id: any) {
    if (typeof id === 'string' && ObjectId.isValid(id)) return new ObjectId(id);
    return id;
  }
  objectIDToString(id?: any) {
    if (id && id.toString) return id.toString();
    return id;
  }
  conn?: Connection;
}

export interface MongooseServiceSchema<T> {
  adapter: MongooseAdapterExtended<T>;
}

interface MongooseServiceSchemaOptions<T>
  extends ServiceSchema,
    MongooseServiceSchema<T> {}

function extractFieldSchema(field: SchemaType): ActionParamSchema {
  switch (field.constructor) {
    case SchemaTypes.Number:
    case SchemaTypes.Boolean:
    case SchemaTypes.String:
    case SchemaTypes.Date: {
      const type = (field as any).instance?.toLowerCase();
      return { type };
    }
    case SchemaTypes.ObjectId:
      return { type: 'string' };
    case SchemaTypes.Array: {
      return {
        type: 'array',
        items: extractFieldSchema((field as any).caster),
      };
    }
    case SchemaTypes.Embedded: {
      const schema = extractInputParamSchema((field as any).schema);
      return { type: 'object', strict: true, props: schema };
    }
    default:
      return { type: 'any' };
  }
}

export function extractInputParamSchema(schema: Schema) {
  return Object.keys(schema.paths).reduce<ActionParams>((params, path) => {
    if (path === '__v') return params;

    const fieldSchema = schema.paths[path];

    if ((fieldSchema as any).options.hide) return params;
    if ((fieldSchema as any).options.readonly) return params;

    const fieldParams = extractFieldSchema(fieldSchema);
    if (!(fieldSchema as any).isRequired) {
      fieldParams.optional = true;
    }

    params[path] = fieldParams;
    return params;
  }, {});
}

export function MongooseMixin<T extends {}>(model: ClassType<T>) {
  const { MONGO_USER: user, MONGO_PASS: pass, MONGO_DB: dbName } = process.env;
  const adapter = TESTING
    ? new DbService.MemoryAdapter()
    : new MongooseAdapterExtended(
        process.env.MONGO_URI || 'mongodb://localhost/moleculer-auth',
        {
          autoIndex: !TESTING,
          user,
          pass,
          useCreateIndex: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          dbName,
        }
      );
  const mongooseSchema = buildSchema(model);
  const inputParams = extractInputParamSchema(mongooseSchema);

  const schema: MongooseServiceSchemaOptions<T> = {
    name: '',
    mixins: [DbService],
    adapter,
    schema: mongooseSchema,
    modelName: model.name,

    settings: {
      fields: Object.keys(mongooseSchema.paths),
    },

    methods: {
      entityChanged(type: string, json: any, ctx: Context) {
        return this.clearCache().then(() => {
          const eventName = `${this.name}.entity.${type}`;
          return this.broker.broadcast(eventName, {
            meta: ctx.meta,
            entity: json,
          });
        });
      },

      encodeID(id) {
        return id != null ? id.toString() : null;
      },

      decodeID(id) {
        if (typeof id === 'string' && this.adapter.stringToObjectID) {
          return this.adapter.stringToObjectID(id);
        }

        return id;
      },
    },

    actions: {
      create: {
        params: inputParams,
        handler: function (ctx: Context<any, any>) {
          return this._create(ctx, ctx.params);
        },
      },
      update: {
        params: {
          id: { type: 'string' },
          ...inputParams,
        },
        handler: function (ctx: Context<any, any>) {
          return this._update(ctx, ctx.params);
        },
      },
    },

    async afterConnected() {
      if (process.env.TEST_E2E) {
        // Clean collection
        this.logger.info(`Clear '${model.name}' collection before tests...`);
        await this.adapter.clear();
      }

      // Seeding if the DB is empty
      const count = await this.adapter.count();
      if (count === 0 && isFunction(this.seedDB)) {
        this.logger.info(`Seed '${model.name}' collection...`);
        await this.seedDB();
      }
    },
  };

  return schema;
}
