import {
  Encrypter,
  UsersRepository
} from '@/domain/repositories';

import { InMemoryUsersRepository } from '@/application/repositories/database';
import { 
  HashComparerSpy, 
  EncrypterSpy 
} from '@/application/repositories/cryptography';

import { SignInUseCase } from './sign-in';
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '@/application/errors';

let hashComparer: HashComparerSpy;
let encrypter: Encrypter;
let usersRepository: UsersRepository;
let sut: SignInUseCase;

describe('sign in use case', () => {
  beforeEach(async () => {
    hashComparer = new HashComparerSpy();
    encrypter = new EncrypterSpy();
    usersRepository = new InMemoryUsersRepository();

    await usersRepository.create({
      user_id: 'user-id',
      name: 'John Doe',
      email: 'mail@example.com',
      password: 'hashed-password',
    });

    sut = new SignInUseCase(
      hashComparer,
      usersRepository,
      encrypter,
    );
  });

  it('should be able to sign a user', async () => {
    jest
      .spyOn(encrypter, 'encrypt')
      .mockImplementationOnce(async () => 'access-token')
      .mockImplementationOnce(async () => 'refresh-token');

    const response = await sut.execute({
      email: 'mail@example.com',
      password: 'JohnDoe#123',
    });

    expect(response.accessToken).toBe('access-token');
    expect(response.refreshToken).toBe('refresh-token');
    expect(response.expiresIn).toBe(30 * 60 * 1000);
  });

  it('should be able to call findByEmail with correct values', async () => {
    const usersRepositorySpy = jest.spyOn(usersRepository, 'find_by_email');

    await sut.execute({
      email: 'mail@example.com',
      password: 'JohnDoe#123',
    });

    expect(usersRepositorySpy).toHaveBeenCalledWith({
      email: 'mail@example.com',
    });
  });

  it('should be able to throw if findByEmail returns null', async () => {
    jest.spyOn(usersRepository, 'find_by_email').mockResolvedValueOnce(null);

    await expect(() =>
      sut.execute({ email: 'any-email', password: 'password' }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it('should be able to call hash comparer with correct values', async () => {
    const hashComparerSpy = jest.spyOn(hashComparer, 'compare');

    await sut.execute({
      email: 'mail@example.com',
      password: 'plaintext-password',
    });

    expect(hashComparerSpy).toHaveBeenCalledWith(
      'plaintext-password',
      'hashed-password',
    );
  });

  it('should be able to throw if hash comparer returns false', async () => {
    jest.spyOn(hashComparer, 'compare').mockResolvedValueOnce(false);

    await expect(() =>
      sut.execute({
        email: 'mail@example.com',
        password: 'JohnDoe#123',
      }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('should be able to call encrypter two times', async () => {
    const encrypterSpy = jest.spyOn(encrypter, 'encrypt');

    await sut.execute({
      email: 'mail@example.com',
      password: 'JohnDoe#123',
    });

    expect(encrypterSpy).toHaveBeenCalledTimes(2);
  });

  it('should be able to call encrypter with correct plaintext', async () => {
    const encrypterSpy = jest.spyOn(encrypter, 'encrypt');

    await sut.execute({
      email: 'mail@example.com',
      password: 'JohnDoe#123',
    });

    expect(encrypterSpy).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'mail@example.com',
    });
  });

  it('should be able to throw if encrypter throws', async () => {
    jest.spyOn(encrypter, 'encrypt').mockImplementationOnce(async () => {
      throw new Error();
    });

    await expect(() =>
      sut.execute({
        email: 'mail@example.com',
        password: 'JohnDoe#123',
      }),
    ).rejects.toThrow();
  });

  it('should be able to call users repository update with correct values', async () => {
    const usersRepositorySpy = jest.spyOn(usersRepository, 'update');
    jest.spyOn(encrypter, 'encrypt')
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    await sut.execute({
      email: 'mail@example.com',
      password: 'JohnDoe#123',
    });

    expect(usersRepositorySpy).toHaveBeenCalledWith({
      user_id: 'user-id',
      refresh_token: 'refresh-token',
    });
  });
});
