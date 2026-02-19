export abstract class SkuGenerator {
  abstract generate(
    input: SkuGenerator.Generate.Input,
  ): Promise<SkuGenerator.Generate.Output>;
}

export namespace SkuGenerator {
  export namespace Generate {
    export type Input = {
      store_id: string;
      name: string;
    };

    export type Output = string;
  }
}
