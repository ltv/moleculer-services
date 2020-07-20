import { ServiceSchema, ServiceSettingSchema } from 'moleculer';

export interface MemoizeMixinOptions {
  ttl?: number;
}

export function MemoizeMixin(
  options?: MemoizeMixinOptions
): ServiceSchema<ServiceSettingSchema> {
  return {
    name: '',
    methods: {
      async memoize(name, params, fn) {
        if (!this.broker.cacher) return fn();

        const key = this.broker.cacher.defaultKeygen(
          `${this.name}:memoize-${name}`,
          params,
          {}
        );

        let res = await this.broker.cacher.get(key);
        if (res) return res;

        res = await fn();
        this.broker.cacher.set(key, res, options.ttl);

        return res;
      },
    },
  };
}
