import { modelOptions, prop, Ref } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import { User } from './auth';

export const FakeMongoId = '000000000000000000000000';

export class BaseModel {
  _id: ObjectId | string;

  @prop({ hide: true, readonly: true })
  tenantId?: string;
}

@modelOptions({
  schemaOptions: { timestamps: { currentTime: () => Date.now() } } as any
})
export class TimestampModel {
  @prop({ default: Date.now, readonly: true })
  createdAt?: number;
  @prop({ default: Date.now, readonly: true })
  updatedAt?: number;
}

export class CreatorAndTimestamp extends TimestampModel {
  @prop({ type: ObjectId, readonly: true })
  createBy?: ObjectId | string;
  @prop({ ref: 'User', readonly: true })
  creator?: Ref<User>;
  @prop({ type: ObjectId, readonly: true })
  updateBy?: ObjectId | string;
  @prop({ ref: 'User', readonly: true })
  updator?: Ref<User>;
}

@modelOptions({
  schemaOptions: { timestamps: { currentTime: () => Date.now() } } as any
})
export class BaseWithTimestamp extends BaseModel {
  @prop({ default: Date.now, readonly: true })
  createdAt?: number;
  @prop({ default: Date.now, readonly: true })
  updatedAt?: number;
}

export class BaseWithCreatorAndTimestamp extends BaseWithTimestamp {
  @prop({ type: ObjectId, readonly: true })
  createBy?: ObjectId | string;
  @prop({ ref: 'User', readonly: true })
  creator?: Ref<User>;
  @prop({ type: ObjectId, readonly: true })
  updateBy?: ObjectId | string;
  @prop({ ref: 'User', readonly: true })
  updator?: Ref<User>;
}
