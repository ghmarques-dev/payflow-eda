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
  RefreshTokenNotFoundError,
  UserNotFoundError,
} from '@/application/errors';
import { RefreshTokenUseCase } from './refresh-token';

let encrypter: Encrypter;
let usersRepository: UsersRepository;
let sut: RefreshTokenUseCase;

describe('refresh token use case', () => {
  beforeEach(async () => {
    encrypter = new EncrypterSpy();
    usersRepository = new InMemoryUsersRepository();

    await usersRepository.create({
      user_id: 'user-id',
      name: 'John Doe',
      email: 'mail@example.com',
      password: 'hashed-password',
      refresh_token: 'refresh-token',
    });

    sut = new RefreshTokenUseCase(
      usersRepository,
      encrypter,
    );
  });

  it('should be able to refresh a token', async () => {
    jest
      .spyOn(encrypter, 'encrypt')
      .mockImplementationOnce(async () => 'access-token')

    const response = await sut.execute({
      refresh_token: 'refresh-token',
    });

    expect(response.accessToken).toBe('access-token');
    expect(response.expiresIn).toBe(30 * 60 * 1000);
  });

  it('should be able to call findByRefreshToken with correct values', async () => {
    const usersRepositorySpy = jest.spyOn(usersRepository, 'find_by_refresh_token');

    await sut.execute({
      refresh_token: 'refresh-token',
    });

    expect(usersRepositorySpy).toHaveBeenCalledWith({
      refresh_token: 'refresh-token',
    });
  });

  it('should be able to throw if findByRefreshToken returns null', async () => {
    jest.spyOn(usersRepository, 'find_by_refresh_token').mockResolvedValueOnce(null);

    await expect(() =>
      sut.execute({ refresh_token: 'refresh-token' }),
    ).rejects.toThrow(RefreshTokenNotFoundError);
  });

  it('should be able to call encrypter with correct plaintext', async () => {
    const encrypterSpy = jest.spyOn(encrypter, 'encrypt');

    await sut.execute({
      refresh_token: 'refresh-token',
    });

    expect(encrypterSpy).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'mail@example.com',
    });
  });
});
