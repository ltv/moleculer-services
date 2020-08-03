import { BaseService, MongooseAdapterExtended } from '@ltv/moleculer-core';
import { ServiceBroker, ServiceSchema, ServiceSettingSchema } from 'moleculer';

export type ClassType<T> = new (...args: any) => T;

export interface MongooseSettingSchema extends ServiceSettingSchema {
  idField: string;
}

export class MongooseService<T, S = MongooseSettingSchema> extends BaseService<S> {
  protected adapter!: MongooseAdapterExtended<T>;

  constructor(broker: ServiceBroker, schema?: ServiceSchema<S>) {
    super(broker, schema);
  }
}
