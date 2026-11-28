import { describe, expect, it } from 'vitest';
import { SLUG_PATTERN, slugify } from './slug';

describe('slugify', () => {
  it.each([
    ['Barbearia do Zé!', 'barbearia-do-ze'],
    ['  Salão   Ângela & Cia  ', 'salao-angela-cia'],
    ['Studio 54', 'studio-54'],
  ])('"%s" vira "%s"', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it('gera slugs aceitos pelo check do banco', () => {
    expect(SLUG_PATTERN.test(slugify('--Ótica Visão--'))).toBe(true);
  });
});

describe('SLUG_PATTERN', () => {
  it.each(['Maiuscula', 'com espaco', 'traco-no-fim-', '-inicio', 'duplo--traco', ''])(
    'rejeita "%s"',
    (slug) => {
      expect(SLUG_PATTERN.test(slug)).toBe(false);
    },
  );
});
