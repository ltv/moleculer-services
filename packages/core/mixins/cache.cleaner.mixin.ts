import { ServiceEvents, ServiceSchema, ServiceSettingSchema } from 'moleculer';

export interface ServiceWithCacher {
  delCache: (keys: string[] | string) => void;
  cleanCache: (keys: string[] | string, force?: boolean) => void;
}

export function CacheCleaner(
  eventNames: string[]
): ServiceSchema<ServiceSettingSchema> {
  const events: ServiceEvents = {};

  eventNames.forEach((name) => {
    events[name] = function () {
      if (this.broker.cacher) {
        this.logger.debug(`Clear local '${this.name}' cache`);
        this.broker.cacher.clean(`v1.${this.name}.*`);
      }
    };
  });

  const schema: ServiceSchema<ServiceSettingSchema> = {
    name: '',
    methods: {
      cleanCache(keys: string[] | string, force?: boolean) {
        keys = keys instanceof Array ? keys : [keys];
        keys.forEach((k) => {
          if (this.broker.cacher) {
            this.logger.debug(`Clear local '${k}' cache`);
            this.broker.cacher.clean(`${k}.*`);
          }
        });
      },
      delCache(keys: string[] | string) {
        if (!this.broker.cacher) {
          return;
        }
        keys = keys instanceof Array ? keys : [keys];
        keys.forEach((k) => {
          this.logger.debug(`Clear local '${k}' cache`);
          this.broker.cacher.del(`${this.name}.${k}`);
        });
      },
    },
    events,
  };

  return schema;
}
