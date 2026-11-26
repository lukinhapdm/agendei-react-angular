import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { BusinessStore } from './business.store';

// Painel só abre depois que o dono criou o negócio
export const hasBusinessGuard: CanActivateFn = async () => {
  const store = inject(BusinessStore);
  const router = inject(Router);
  return (await store.ensureLoaded()) ? true : router.createUrlTree(['/onboarding']);
};

// Onboarding só faz sentido para quem ainda não tem negócio
export const noBusinessGuard: CanActivateFn = async () => {
  const store = inject(BusinessStore);
  const router = inject(Router);
  return (await store.ensureLoaded()) ? router.createUrlTree(['/dashboard']) : true;
};
