import moleculer, {
  GenericObject,
  Service,
  ServiceBroker,
  ServiceSchema,
  ServiceSettingSchema,
} from 'moleculer';

export interface ServiceMetadata {
  clientIp?: string;
  tenantId?: string;
  userId?: string;
  roles: string[];
  token: string;
}

export class Context<T = unknown> extends moleculer.Context<
  T,
  ServiceMetadata
> {
  public locals: GenericObject = {};
}

export enum AuthSpecialRole {
  SYSTEM = '$system',
  EVERYONE = '$everyone',
  AUTHENTICATED = '$authenticated',
  OWNER = '$owner',
}

export interface MemoizeOptions {
  ttl?: number;
}

export class BaseService<S = ServiceSettingSchema> extends Service<S> {
  constructor(broker: ServiceBroker, schema?: ServiceSchema<S>) {
    super(broker, schema);
  }

  protected async memoize<T>(
    name: string,
    params: any,
    callback: () => Promise<T>,
    options?: MemoizeOptions
  ): Promise<T> {
    if (!this.broker.cacher) return callback();

    const key = this.broker.cacher.defaultKeygen(
      `${name}:memoize-${name}`,
      params,
      {},
      []
    );

    let res = await this.broker.cacher.get(key);
    if (res) return <T>res;

    res = await callback();
    this.broker.cacher.set(key, res, options?.ttl);

    return <T>res;
  }
}

export class GraphQLService extends BaseService {
  constructor(broker: ServiceBroker, schema?: ServiceSchema) {
    super(broker, schema);
  }
}

export class DbService<T> extends BaseService {
  adapter!: T;
}
