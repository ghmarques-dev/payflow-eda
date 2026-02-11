import bcrypt from 'bcrypt';

import { BcryptAdapter } from './bcrypt-adapter';

let salt: number;
let sut: BcryptAdapter;

jest.mock('bcrypt', () => ({
  async hash(): Promise<string> {
    return 'hash';
  },

  async compare(): Promise<boolean> {
    return true;
  },
}));

describe('bcrypt adapter', () => {
  beforeEach(() => {
    salt = 12;
    sut = new BcryptAdapter(salt);
  });

  describe('hash()', () => {
    it('should be able to return a valid hash', async () => {
      const hash = await sut.hash('plaintext');
      expect(hash).toBe('hash');
    });

    it('should be able to call hash with correct values', async () => {
      const hash_spy = jest.spyOn(bcrypt, 'hash');

      await sut.hash('plaintext');

      expect(hash_spy).toHaveBeenCalledWith('plaintext', salt);
    });

    it('should be able to throw if hash throws', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => {
        throw new Error();
      });

      await expect(() => sut.hash('plaintext')).rejects.toThrow();
    });
  });

  describe('compare()', () => {
    it('should be able to return true when compare succeeds', async () => {
      const is_valid = await sut.compare('plaintext', 'digest');

      expect(is_valid).toBeTruthy();
    });

    it('should be able to return false when compare fails', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => false);

      const is_valid = await sut.compare('plaintext', 'digest');

      expect(is_valid).toBeFalsy();
    });

    it('should be able to call compare with correct values', async () => {
      const compare_spy = jest.spyOn(bcrypt, 'compare');

      await sut.compare('plaintext', 'digest');

      expect(compare_spy).toHaveBeenCalledWith('plaintext', 'digest');
    });

    it('should be able to throw if compare throws', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => {
        throw new Error();
      });

      await expect(() => sut.compare('plaintext', 'digest')).rejects.toThrow();
    });
  });
});
