import Hashids from 'hashids/cjs';

export function createHashIds(module: string, length?: number) {
  return new Hashids(`${module}${process.env.HASH_SECRET}`, length || 10);
}
