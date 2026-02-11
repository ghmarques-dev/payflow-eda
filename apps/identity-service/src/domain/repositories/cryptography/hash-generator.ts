export abstract class HashGenerator {
  abstract hash(plaintext: string): Promise<string>;
}
