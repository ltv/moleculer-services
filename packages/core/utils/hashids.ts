import Hashids from 'hashids/cjs';

export default function (module: string, length?: number) {
  return new Hashids(`${module}${process.env.HASH_SECRET}`, length || 10);
}
