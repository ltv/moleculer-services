import { createBroker } from '../../../tests';
import TokenService from '../token.service';
import { ObjectId } from 'mongodb';

jest.mock('utils/jwt', () => ({
  signJWTToken: jest.fn(() => 'fake-token')
}));

describe('Token Service', () => {
  it('should be valid', () => {
    expect(TokenService).toBeTruthy();
  });

  describe('Methods', () => {
    const broker = createBroker();
    const service = broker.createService(TokenService);

    beforeAll(() => broker.start());
    afterAll(() => broker.stop());

    it('renewToken', () => {
      expect(service.renewToken).toBeInstanceOf(Function);
    });

    describe(`Test 'renewToken' method`, () => {
      const tokenId = new ObjectId();
      const userId = new ObjectId();
      const token = {
        _id: tokenId.toString(),
        userId,
        token: 'fake-token',
        when: Date.now()
      };
      it('renewed token', async () => {
        service.adapter.updateById = jest.fn(() => token);

        const res = await service.renewToken(token);
        expect(res).toEqual(token);
        expect(service.adapter.updateById).toHaveBeenCalledTimes(1);
        expect(service.adapter.updateById).toHaveBeenCalledWith(token._id, {
          $set: { token: token.token }
        });
      });
    });
  });
});
