import { modelOptions, prop, Severity } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { BaseWithTimestamp } from './base';

@modelOptions({
  schemaOptions: { collection: 'configs' },
  options: { allowMixed: Severity.ALLOW }
})
export class Config extends BaseWithTimestamp {
  @prop({ unique: true })
  key: string;

  @prop({ type: Schema.Types.Mixed })
  value?: any;

  @prop()
  isDefault?: number;
}
