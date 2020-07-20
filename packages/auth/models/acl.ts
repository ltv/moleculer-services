import { prop } from '@typegoose/typegoose';
import { BaseWithCreatorAndTimestamp } from './base';

export class Permission extends BaseWithCreatorAndTimestamp {
  @prop({ required: true, unique: true })
  code: string;
  @prop()
  description: string;
}

export class Role extends BaseWithCreatorAndTimestamp {
  @prop({ required: true })
  code: string;
  @prop({ required: true })
  name: string;
  @prop()
  permissions: string[];
  @prop()
  inherits?: string[]; // inherited from roles
}
