export abstract class Encrypter {
  abstract encrypt(data: Record<string, unknown>): Promise<string>;
}
