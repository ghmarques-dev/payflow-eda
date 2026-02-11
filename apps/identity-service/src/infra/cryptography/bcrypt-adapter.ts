import bcrypt from 'bcrypt';

import { HashComparer, HashGenerator } from '@/domain/repositories';

export class BcryptAdapter implements HashGenerator, HashComparer {
  constructor(private readonly salt: number = 12) {}

  hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.salt);
  }

  compare(plaintext: string, digest: string): Promise<boolean> {
    return bcrypt.compare(plaintext, digest);
  }
}
