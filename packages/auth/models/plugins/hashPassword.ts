import { User } from 'models';
import { genSalt, hashPass } from '../../helpers/password';
import { DocumentType } from '@typegoose/typegoose';
import { Schema } from 'mongoose';

export function hashPassword(schema: Schema): void {
  const hash = async function (this: DocumentType<User>): Promise<void> {
    if (this.passwordless) return;
    if (this.password && !/^\$2[ab]\$/.test(this.password)) {
      const pwdSalt = genSalt();
      this.password = hashPass(this.password, pwdSalt);
    }
  };

  schema.pre('save', hash);
  schema.pre('update', hash);
  schema.pre('updateOne', { document: true, query: false } as any, hash);
}
