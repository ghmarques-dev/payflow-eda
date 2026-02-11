import { NestJwtAdapter } from './nest-jwt-adapter';
import { JwtService } from '@nestjs/jwt';

let jwtService: JwtService;
let sut: NestJwtAdapter;

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    signAsync: jest.fn(async () => 'token'),
    verifyAsync: jest.fn(async () => ({ key: 'value' })),
  })),
}));

describe('NestJwtAdapter', () => {
  beforeEach(() => {
    jwtService = new JwtService();
    sut = new NestJwtAdapter(jwtService);
  });

  describe('encrypt()', () => {
    test('should be able to call signAsync with correct values', async () => {
      const signAsyncSpy = jest.spyOn(jwtService, 'signAsync');
      await sut.encrypt({ id: 'any-id' });
      expect(signAsyncSpy).toHaveBeenCalledWith({ id: 'any-id' });
    });

    test('should be able to return a token on signAsync success', async () => {
      const accessToken = await sut.encrypt({ id: 'any-id' });
      expect(accessToken).toBe('token');
    });

    test('should be able to throw if signAsync throws', async () => {
      jest.spyOn(jwtService, 'signAsync').mockImplementationOnce(async () => {
        throw new Error();
      });
      await expect(() => sut.encrypt({ id: 'any-id' })).rejects.toThrow();
    });
  });

  describe('decrypt()', () => {
    test('should be able to call verifyAsync with correct values', async () => {
      const verifyAsyncSpy = jest.spyOn(jwtService, 'verifyAsync');
      await sut.decrypt('token');
      expect(verifyAsyncSpy).toHaveBeenCalledWith('token');
    });

    test('should be able to return a value on verifyAsync success', async () => {
      const value = await sut.decrypt('token');
      expect(value).toEqual({ key: 'value' });
    });

    test('should be able to throw if verifyAsync throws', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(async () => {
        throw new Error();
      });
      await expect(() => sut.decrypt('token')).rejects.toThrow();
    });
  });
});
