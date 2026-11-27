import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'agendei-theme';
const ORDER: ThemeMode[] = ['system', 'light', 'dark'];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly mode = signal<ThemeMode>(this.readSaved());

  constructor() {
    // O tema do Material usa light-dark(); basta trocar o color-scheme do <html>
    effect(() => {
      const mode = this.mode();
      this.document.documentElement.style.colorScheme = mode === 'system' ? 'light dark' : mode;
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // Navegação privada pode bloquear o storage; o tema só não fica salvo
      }
    });
  }

  cycle() {
    this.mode.update((m) => ORDER[(ORDER.indexOf(m) + 1) % ORDER.length]);
  }

  private readSaved(): ThemeMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      return saved && ORDER.includes(saved) ? saved : 'system';
    } catch {
      return 'system';
    }
  }
}
