import { getOriginEnv } from '../utils';

describe('Test gateway > utils', () => {
  describe('Test utils > getOriginEnv', () => {
    it(`Should return false if not mentioned 'CORS_ORIGINS' or set it equals 'false'`, () => {
      delete process.env.CORS_ORIGINS;
      const origin = getOriginEnv();
      expect(origin).toEqual(false);
    });

    it(`Should return false if set it equals 'false'`, () => {
      process.env.CORS_ORIGINS = 'false';
      const origin = getOriginEnv();
      expect(origin).toEqual(false);
    });
  });
});
