import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { SkuGenerator } from '@/domain/services/sku-generator';

const MAX_WORDS = 3;
const WORD_ABBREV_LENGTH = 3;
const UNIQUE_SUFFIX_LENGTH = 4;

/**
 * Generates a SKU: {ABREV-NOME}-{unique suffix}.
 * Ex.: "Camiseta Azul Básica" → CAM-AZU-BAS-X7K2
 */
@Injectable()
export class SkuGeneratorService implements SkuGenerator {
  async generate(
    input: SkuGenerator.Generate.Input,
  ): Promise<SkuGenerator.Generate.Output> {
    const parts = this.abbreviateName(input.name);
    const unique = randomUUID()
      .replace(/-/g, '')
      .slice(0, UNIQUE_SUFFIX_LENGTH)
      .toUpperCase();
    const namePart = parts.join('-');
    return namePart.length > 0 ? `${namePart}-${unique}` : unique;
  }

  private abbreviateName(name: string): string[] {
    const normalized = name
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return normalized
      .slice(0, MAX_WORDS)
      .map((word) =>
        word.length <= WORD_ABBREV_LENGTH
          ? word
          : word.slice(0, WORD_ABBREV_LENGTH),
      );
  }
}
