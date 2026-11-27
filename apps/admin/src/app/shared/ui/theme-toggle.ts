import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../core/theme/theme.service';

const META = {
  system: { icon: 'brightness_auto', label: 'Tema: automático' },
  light: { icon: 'light_mode', label: 'Tema: claro' },
  dark: { icon: 'dark_mode', label: 'Tema: escuro' },
} as const;

@Component({
  selector: 'app-theme-toggle',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button
      mat-icon-button
      type="button"
      (click)="theme.cycle()"
      [matTooltip]="meta().label"
      [attr.aria-label]="meta().label + '. Clique para alternar'"
    >
      <mat-icon>{{ meta().icon }}</mat-icon>
    </button>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
  protected readonly meta = computed(() => META[this.theme.mode()]);
}
