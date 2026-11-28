import { describe, expect, it } from 'vitest';
import { formatDuration, formatPrice } from './format';

describe('formatPrice', () => {
  it.each([
    [4500, 'R$ 45,00'],
    [1999, 'R$ 19,99'],
    [0, 'R$ 0,00'],
    [123456, 'R$ 1.234,56'],
  ])('%i centavos vira %s', (cents, expected) => {
    // Intl usa espaço não separável entre "R$" e o valor
    expect(formatPrice(cents).replace(/\s/g, ' ')).toBe(expected);
  });
});

describe('formatDuration', () => {
  it.each([
    [20, '20 min'],
    [60, '1h'],
    [90, '1h 30min'],
    [480, '8h'],
  ])('%i minutos vira %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });
});
