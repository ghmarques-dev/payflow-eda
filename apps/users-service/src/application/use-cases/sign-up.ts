import { Injectable } from '@nestjs/common';

import { UserAlreadyExistsError } from '@/application/errors';
import type { EventPublisher } from '@/application/ports';
import type { HashGenerator, UsersRepository } from '@/domain/repositories';
import type { User } from '@/domain/entities';
import { UserRegisteredEvent } from '@/domain/events';

export type ISignUpUseCaseInput = {
  name: string;
  email: string;
  password: string;
};

export type ISignUpUseCaseOutput = User;

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly hashGenerator: HashGenerator,
    private readonly usersRepository: UsersRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(input: ISignUpUseCaseInput): Promise<ISignUpUseCaseOutput> {
    const userAlreadyExists = await this.usersRepository.find_by_email({
      email: input.email,
    });

    if (userAlreadyExists) {
      throw new UserAlreadyExistsError();
    }

    const hashedPassword = await this.hashGenerator.hash(input.password);

    const user = await this.usersRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

    await this.eventPublisher.publish(
      new UserRegisteredEvent({
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        occurred_at: new Date(),
      }),
    );

    return user;
  }
}
