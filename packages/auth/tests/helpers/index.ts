import ConfigService from '../../services/configs/configs.service';
import { BrokerOptions, ServiceBroker } from 'moleculer';

export function createBroker(options?: BrokerOptions, loadConfig: boolean = true): ServiceBroker {
  const broker = new ServiceBroker({
    logger: false,
    middlewares: [],
    ...(options || {})
  });

  if (loadConfig) {
    broker.createService(ConfigService);
  }

  return broker;
}
