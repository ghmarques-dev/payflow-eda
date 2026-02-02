import {
  HashGeneratorSpy,
} from '@/application/repositories/cryptography';
import { InMemoryUsersRepository } from '@/application/repositories/database';

import { UsersRepository } from '@/domain/repositories';

import { SignUpUseCase } from './sign-up';
import { UserAlreadyExistsError } from '../errors';
import type { User } from '@/domain/entities';

let usersRepository: UsersRepository;
let hashGenerator: HashGeneratorSpy;
let sut: SignUpUseCase;

describe('sign up use case', () => {
  beforeEach(async () => {
    hashGenerator = new HashGeneratorSpy();
    usersRepository = new InMemoryUsersRepository();

    sut = new SignUpUseCase(hashGenerator, usersRepository);
  });

  it('should be able to sign up', async () => {
    const response = await sut.execute({
      name: 'John Doe',
      email: 'mail@example.com',
      password: 'JohnDoe#123',
    });

    expect(response).toEqual(expect.objectContaining({
      user_id: expect.any(String),
      name: 'John Doe',
      email: 'mail@example.com',
      password: expect.any(String),
      created_at: expect.any(Date),
    }));
  });

  it('should be able to call findByEmail with correct values', async () => {
    const usersRepositorySpy = jest.spyOn(usersRepository, 'find_by_email');

    await sut.execute({
      name: 'John Doe',
      email: 'mail@example.com',
      password: 'JohnDoe#123',
    });

    expect(usersRepositorySpy).toHaveBeenCalledWith({
      email: 'mail@example.com',
    });
  });

  it('should be able to throw if user already exists', async () => {
    const user: User = {
      user_id: 'user-id',
      name: 'John Doe',
      email: 'mail@example.com',
      password: 'hashed-password',
      created_at: new Date(),
      updated_at: new Date(),
    };

    jest.spyOn(usersRepository, 'find_by_email').mockResolvedValueOnce(user);

    await expect(() =>
      sut.execute({ 
        name: 'John Doe',
        email: 'mail@example.com',
        password: 'JohnDoe#123',
      }),
    ).rejects.toThrow(UserAlreadyExistsError);
  });

  it('should be able to call hashGenerator with correct values', async () => {
    const hashGeneratorSpy = jest.spyOn(hashGenerator, 'hash');

    await sut.execute({
      name: 'John Doe',
      email: 'mail@example.com',
      password: 'JohnDoe#123',
    });

    expect(hashGeneratorSpy).toHaveBeenCalledWith('JohnDoe#123');
  });

  it('should be able to call usersRepository.create with correct values', async () => {
    const usersRepositorySpy = jest.spyOn(usersRepository, 'create');

    await sut.execute({
      name: 'John Doe',
      email: 'mail@example.com',
      password: 'JohnDoe#123',
    });

    expect(usersRepositorySpy).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'mail@example.com',
      password: expect.any(String),
    });
  });
});
