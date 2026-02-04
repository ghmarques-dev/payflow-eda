import type { User } from "../../entities";

export abstract class UsersRepository {
  abstract create(
    input: UsersRepository.Create.Input
  ): Promise<UsersRepository.Create.Output>;

  abstract find_by_id(
    input: UsersRepository.FindById.Input
  ): Promise<UsersRepository.FindById.Output>;

  abstract find_by_email(
    input: UsersRepository.FindByEmail.Input
  ): Promise<UsersRepository.FindByEmail.Output>;


  abstract find_by_refresh_token(
    input: UsersRepository.FindByRefreshToken.Input
  ): Promise<UsersRepository.FindByRefreshToken.Output>;

  abstract update(
    input: UsersRepository.Update.Input
  ): Promise<UsersRepository.Update.Output>;

  abstract delete(
    input: UsersRepository.Delete.Input
  ): Promise<UsersRepository.Delete.Output>;
}

export namespace UsersRepository {
  export namespace Create {
    export type Input = {
      user_id?: string;
      name: string;
      email: string;
      password: string;
      refresh_token?: string;
    };

    export type Output = User;
  }

  export namespace FindById {
    export type Input = {
      userId: string;
    };

    export type Output = User | null;
  }

  export namespace FindByEmail {
    export type Input = {
      email: string;
    };

    export type Output = User | null;
  }

  export namespace FindByRefreshToken {
    export type Input = {
      refresh_token: string;
    };

    export type Output = User | null;
  }

  export namespace Update {
    export type Input = {
      user_id: string;
      name?: string;
      email?: string;
      password?: string;
      refresh_token?: string;
    };

    export type Output = User | null;
  }

  export namespace Delete {
    export type Input = {
      user_id: string;
    };

    export type Output = void;
  }
}