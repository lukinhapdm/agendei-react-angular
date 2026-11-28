import { describe, expect, it } from 'vitest';
import { nextDays, weekdayOf } from './date';

describe('weekdayOf', () => {
  it('segue a convenção do banco (0 = domingo)', () => {
    expect(weekdayOf('2026-11-29')).toBe(0);
    expect(weekdayOf('2026-11-30')).toBe(1);
    expect(weekdayOf('2026-12-05')).toBe(6);
  });
});

describe('nextDays', () => {
  it('gera dias consecutivos a partir da data inicial', () => {
    expect(nextDays('2026-11-30', 3)).toEqual(['2026-11-30', '2026-12-01', '2026-12-02']);
  });
});
