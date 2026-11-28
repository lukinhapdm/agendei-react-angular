import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addDaysToDate,
  formatInZone,
  startOfWeekDate,
  todayInZone,
  trimSeconds,
  zonedLocalToUtcIso,
} from './date';

describe('zonedLocalToUtcIso', () => {
  it.each([
    ['America/Sao_Paulo', '2026-12-24T11:00:00.000Z'],
    ['America/Manaus', '2026-12-24T12:00:00.000Z'],
    ['America/Noronha', '2026-12-24T10:00:00.000Z'],
  ])('converte 08:00 em %s para %s', (zone, expected) => {
    expect(zonedLocalToUtcIso('2026-12-24T08:00', zone)).toBe(expected);
  });
});

describe('formatInZone', () => {
  it('mostra o horário do negócio, não o do navegador', () => {
    expect(formatInZone('2026-11-30T12:30:00+00:00', 'America/Sao_Paulo', 'HH:mm')).toBe('09:30');
    expect(formatInZone('2026-11-30T12:30:00+00:00', 'America/Manaus', 'HH:mm')).toBe('08:30');
  });

  it('formata em português', () => {
    expect(formatInZone('2026-11-30T12:30:00Z', 'America/Sao_Paulo', 'EEEE, dd/MM')).toBe(
      'segunda-feira, 30/11',
    );
  });
});

describe('todayInZone', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('usa o dia do fuso do negócio perto da meia-noite UTC', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-29T01:00:00Z'));

    expect(todayInZone('America/Sao_Paulo')).toBe('2026-11-28');
    expect(todayInZone('Asia/Tokyo')).toBe('2026-11-29');
  });
});

describe('datas de calendário', () => {
  it('soma dias atravessando mês e ano', () => {
    expect(addDaysToDate('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDaysToDate('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('começa a semana na segunda-feira', () => {
    expect(startOfWeekDate('2026-11-29')).toBe('2026-11-23');
    expect(startOfWeekDate('2026-11-30')).toBe('2026-11-30');
  });

  it('remove os segundos do time do Postgres', () => {
    expect(trimSeconds('09:00:00')).toBe('09:00');
  });
});
