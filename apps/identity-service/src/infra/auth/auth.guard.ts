import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from '@/infra/env';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { IS_PUBLIC_KEY } from '@/presentation/decorators';
import { HttpUnauthorizedError } from '@/presentation/helpers';
import { UserIsNotLoggedInError } from '@/application/errors';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly env: EnvService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        HttpUnauthorizedError(new UserIsNotLoggedInError()),
      );
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.env.get('JWT_SECRET'),
      });

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException(
        HttpUnauthorizedError(new UserIsNotLoggedInError()),
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
