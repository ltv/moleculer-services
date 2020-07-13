import bcrypt from 'bcrypt';
import crypto from 'crypto';

const { SALT_ROUNDS, HASH_SECRET, GLOBAL_PEPPER_KEY } = process.env;

export function genSalt(saltRounds?: number) {
  const sR = saltRounds || +SALT_ROUNDS || 10;
  return bcrypt.genSaltSync(sR);
}

export function sha512(password: string) {
  return crypto
    .createHmac('sha512', HASH_SECRET)
    .update(password + GLOBAL_PEPPER_KEY)
    .digest('hex');
}

export function hashPass(password: string, passwordSalt: string) {
  const hashed512 = sha512(password);
  return bcrypt.hashSync(hashed512, passwordSalt);
}

export function comparePassword(password: string, hashed: string) {
  return bcrypt.compareSync(sha512(password), hashed);
}
