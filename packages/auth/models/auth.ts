import { index, modelOptions, plugin, prop, Severity } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import { BaseModel, BaseWithCreatorAndTimestamp } from './base';
import { hashPassword } from './plugins/hashPassword';

const mongooseHidden = require('mongoose-hidden')();

export class TwoFactorAuth {
  @prop()
  enabled?: boolean;
  @prop()
  secret: string;
}

export class SocialLink {
  @prop()
  provider?: string;
  @prop()
  socialId?: string;
  @prop()
  username?: string;
}

@index({ email: 1 }, { unique: true })
@index({ firstName: 'text', lastName: 'text', email: 'text' })
@plugin(mongooseHidden, { hidden: { _id: false } })
@plugin(hashPassword)
@modelOptions({ schemaOptions: { collection: 'users' } })
export class User extends BaseWithCreatorAndTimestamp {
  @prop({ maxlength: 50 })
  username?: string;
  @prop({ required: true, maxlength: 100 })
  email: string;
  @prop({ required: true, default: 1, readonly: true })
  status: number; // !== 1 -> Disabled, 1 -> active

  @prop({ maxlength: 50 })
  firstName?: string;
  @prop({ maxlength: 50 })
  lastName?: string;
  @prop({ readonly: true })
  avatar?: string;

  @prop({ minlength: 8, maxlength: 60 })
  password?: string;
  @prop({ hide: true })
  passwordSalt?: string;
  @prop({ minlengt: 2, maxlength: 5, hide: true })
  passwordHashAlgorithm?: string;

  @prop({ default: false, readonly: true })
  passwordless?: boolean;
  @prop({ hide: true })
  passwordlessTokenExpires?: number;

  @prop({
    type: String,
    required: true,
    readonly: true
  })
  role: string;

  @prop({ type: ObjectId })
  addressId?: ObjectId | string;

  @prop({ type: SocialLink, _id: false })
  socialLinks?: SocialLink[];

  @prop({ default: false, readonly: true })
  verified?: boolean;
  @prop({ hide: true })
  verificationToken?: string;

  // 'tfa.enabled': { type: 'boolean', default: false }, // Two Factor Authentication
  @prop({ type: TwoFactorAuth, _id: false, readonly: true })
  tfa?: TwoFactorAuth;

  @prop({ hide: true })
  resetTokenExpires?: number;

  @prop({ hide: true })
  lastLoginAt?: number;
}

@modelOptions({
  options: { allowMixed: Severity.ALLOW }
})
export class Token extends BaseModel {
  @prop({ required: true })
  userId: ObjectId | string;

  @prop({ required: true })
  token: string;

  @prop({ default: Date.now })
  when: number;
}
