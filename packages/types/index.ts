import moleculer, {
  ActionSchema as MoleculerActionSchema,
  GenericObject,
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

export type CustomPermissionFunc = (ctx: Context) => Promise<boolean>;
export type ActionPermission = string | CustomPermissionFunc;

export class ActionSchema implements MoleculerActionSchema {
  permissions?: ActionPermission[];
  needEntity?: boolean;
}

export enum AuthSpecialRole {
  SYSTEM = '$system',
  EVERYONE = '$everyone',
  AUTHENTICATED = '$authenticated',
  OWNER = '$owner',
}
