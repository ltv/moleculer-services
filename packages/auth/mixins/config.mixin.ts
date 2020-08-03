import { ConfigMixin as CoreConfigMixin } from '@ltv/moleculer-core';
import { SERVICE_CONFIGS } from 'utils/constants';

export const ConfigMixin = (keys: string[], options?: any) =>
  CoreConfigMixin(keys, { ...options, serviceName: SERVICE_CONFIGS });
