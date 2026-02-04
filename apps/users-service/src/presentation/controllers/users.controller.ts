import { z } from 'zod';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';

import { ZodValidationPipe } from '@/infra/pipes';
import { HttpCreatedResponse, HttpSuccessResponse } from '@/presentation/helpers';
import {
  ControllerErrorHandlerDecorator,
  Public,
} from '@/presentation/decorators';
import {
  SignUpUseCase,
  SignInUseCase,
  RefreshTokenUseCase,
} from '@/application/use-cases';

const signInSchema = z.object({
  email: z.string(),
  password: z.string(),
});

type SignInUserSchema = z.infer<typeof signInSchema>;

const signUpSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
});

type SignUpUserSchema = z.infer<typeof signUpSchema>;

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

type RefreshTokenUserSchema = z.infer<typeof refreshTokenSchema>;

@Controller('users')
export class UsersController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Post('sign-up')
  @Public()
  @UsePipes(new ZodValidationPipe(signUpSchema))
  @ControllerErrorHandlerDecorator()
  async signUp(@Body() body: SignUpUserSchema) {
    const response = await this.signUpUseCase.execute({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    return HttpCreatedResponse(response);
  }

  @Post('sign-in')
  @Public()
  @UsePipes(new ZodValidationPipe(signInSchema))
  @ControllerErrorHandlerDecorator()
  async signIn(@Body() body: SignInUserSchema) {
    const response = await this.signInUseCase.execute({
      email: body.email,
      password: body.password,
    });

    return HttpSuccessResponse(response);
  }

  @Post('refresh-token')
  @Public()
  @UsePipes(new ZodValidationPipe(refreshTokenSchema))
  @ControllerErrorHandlerDecorator()
  async refreshToken(@Body() body: RefreshTokenUserSchema) {
    const response = await this.refreshTokenUseCase.execute({
      refresh_token: body.refreshToken,
    });

    return HttpSuccessResponse(response);
  }
}
