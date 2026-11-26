import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NAV_ITEMS } from './nav-items';
import { AuthService } from '../../core/auth/auth.service';
import { BusinessStore } from '../../core/business/business.store';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly businessStore = inject(BusinessStore);

  protected readonly businessName = computed(() => this.businessStore.business()?.name);
  protected readonly userEmail = computed(() => this.auth.user()?.email);
  protected readonly navItems = NAV_ITEMS;

  // Converte o Observable do CDK em signal para usar direto no template
  protected readonly isMobile = toSignal(
    inject(BreakpointObserver)
      .observe(Breakpoints.Handset)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected readonly sidenavMode = computed(() => (this.isMobile() ? 'over' : 'side'));

  async signOut() {
    await this.auth.signOut();
    await this.router.navigateByUrl('/login');
  }
}
