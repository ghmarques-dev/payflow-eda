import { HashGeneratorSpy } from '@/application/repositories/cryptography';
import { InMemoryUsersRepository } from '@/application/repositories/database';
import { InMemoryEventPublisher } from '@/infra/messaging';
import { CREATED_USER_EVENT_TYPE } from '@payflow/contracts';

import { UsersRepository } from '@/domain/repositories';

import { SignUpUseCase } from './sign-up';
import { UserAlreadyExistsError } from '../errors';
import type { User } from '@/domain/entities';

let usersRepository: UsersRepository;
let hashGenerator: HashGeneratorSpy;
let eventPublisher: InMemoryEventPublisher;
let sut: SignUpUseCase;

describe('sign up use case', () => {
  beforeEach(async () => {
    hashGenerator = new HashGeneratorSpy();
    usersRepository = new InMemoryUsersRepository();
    eventPublisher = new InMemoryEventPublisher();

    sut = new SignUpUseCase(hashGenerator, usersRepository, eventPublisher);
  });

  it('should be able to sign up', async () => {
    const response = await sut.execute({
      name: 'John Doe',
      email: 'mail@example.com',
      password: 'JohnDoe#123',
    });

    expect(response).toEqual(
      expect.objectContaining({
        user_id: expect.any(String),
        name: 'John Doe',
        email: 'mail@example.com',
        password: expect.any(String),
        created_at: expect.any(Date),
      }),
    );
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

  it('should publish UserRegistered event after successful sign up', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'mail@example.com',
      password: 'JohnDoe#123',
    });

    expect(eventPublisher.publishedEvents).toHaveLength(1);
    const event = eventPublisher.publishedEvents[0];
    expect(event.event_type).toBe(CREATED_USER_EVENT_TYPE);
    expect(event.origin).toBe('users-service');
    expect(event.trace_id).toBeDefined();
    expect(event.payload).toMatchObject({
      email: 'mail@example.com',
      name: 'John Doe',
    });
    expect(event.payload).toHaveProperty('user_id');
    expect(event.payload).toHaveProperty('occurred_at');
  });

  it('should not publish event when user already exists', async () => {
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

    expect(eventPublisher.publishedEvents).toHaveLength(0);
  });
});
