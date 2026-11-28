import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './redirect';

describe('safeRedirectPath', () => {
  it.each(['/meus-agendamentos', '/b/barbearia-demo/agendar?servico=1&data=2026-11-30'])(
    'mantém o caminho interno %s',
    (path) => {
      expect(safeRedirectPath(path)).toBe(path);
    },
  );

  it.each([null, '', '//evil.com', 'https://evil.com', 'javascript:alert(1)', 'meus-agendamentos'])(
    'troca "%s" pela página inicial',
    (path) => {
      expect(safeRedirectPath(path)).toBe('/');
    },
  );
});
