import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { Decrypter, Encrypter } from '@/domain/repositories';

@Injectable()
export class NestJwtAdapter implements Encrypter, Decrypter {
  constructor(private readonly jwt: JwtService) {}

  encrypt(data: Record<string, unknown>): Promise<string> {
    return this.jwt.signAsync(data);
  }

  decrypt(ciphertext: string): Promise<Record<string, unknown>> {
    return this.jwt.verifyAsync(ciphertext);
  }
}
