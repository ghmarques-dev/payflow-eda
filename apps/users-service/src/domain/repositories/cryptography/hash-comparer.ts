export abstract class HashComparer {
  abstract compare(plaintext: string, digest: string): Promise<boolean>;
}
