import {
  Decrypter,
  Encrypter,
  HashComparer,
  HashGenerator,
} from '@/domain/repositories';
import { randomUUID } from 'node:crypto';

export class EncrypterSpy implements Encrypter {
  plaintext: Record<string, unknown>;
  readonly ciphertext = randomUUID();

  async encrypt(data: Record<string, unknown>): Promise<string> {
    this.plaintext = data;
    return this.ciphertext;
  }
}

export class DecrypterSpy implements Decrypter {
  ciphertext: string;
  readonly plaintext: Record<string, unknown> = {
    sub: randomUUID(),
  };

  async decrypt(ciphertext: string): Promise<Record<string, unknown>> {
    this.ciphertext = ciphertext;
    return this.plaintext;
  }
}

export class HashComparerSpy implements HashComparer {
  plaintext: string;
  digest: string;
  isValid = true;

  async compare(plaintext: string, digest: string): Promise<boolean> {
    this.plaintext = plaintext;
    this.digest = digest;
    return this.isValid;
  }
}

export class HashGeneratorSpy implements HashGenerator {
  plaintext: string;
  readonly digest = randomUUID();

  async hash(plaintext: string): Promise<string> {
    this.plaintext = plaintext;
    return this.digest;
  }
}
