import { ServiceEvents, ServiceSchema, ServiceSettingSchema } from 'moleculer';
import defaultsDeep from 'lodash.defaultsdeep';
import isFunction from 'lodash.isfunction';
import set from 'lodash.set';
import isObject from 'lodash.isobject';

export function ConfigMixin(
  keys: string[],
  options?: any
): ServiceSchema<ServiceSettingSchema> {
  const events: ServiceEvents = {};
  const serviceName: string = 'configs';

  const opts = defaultsDeep(options, {
    propName: 'configs',
    objPropName: 'configObj',
    configChanged: 'configChanged',
    serviceName: serviceName,
    serviceVersion: 1,
  });

  const eventHandler = function (payload: any) {
    this[opts.propName][payload.key] = payload.value;
    set(this[opts.objPropName], payload.key, payload.value);
    this.logger.debug('Configuration updated:', this[opts.propName]);

    if (isFunction(this[opts.configChanged])) {
      this[opts.configChanged].call(this, payload.key, payload.value, payload);
    }
  };

  keys.forEach(
    (key) => (events[`${opts.serviceName}.${key}.changed`] = eventHandler)
  );

  const schema: ServiceSchema<ServiceSettingSchema> = {
    name: '',
    dependencies: [{ name: opts.serviceName, version: opts.serviceVersion }],

    events,

    async started() {
      if (!isObject(this[opts.propName])) this[opts.propName] = {};
      if (!isObject(this[opts.objPropName])) this[opts.objPropName] = {};

      if (keys.length > 0) {
        const items: any[] = await this.broker.call(
          `v1.${opts.serviceName}.get`,
          {
            key: keys,
          }
        );
        if (items) {
          items.forEach((item) => {
            this[opts.propName][item.key] = item.value;
            set(this[opts.objPropName], item.key, item.value);
          });
        }
      }

      this.logger.debug('Configuration loaded:', this[opts.propName]);
    },
  };

  return schema;
}
