import type { ValidatorFn } from '@angular/forms';

// Validator customizado: retorna null quando válido ou um objeto descrevendo o erro
export function multipleOf(step: number): ValidatorFn {
  return (control) => {
    const value = control.value;
    if (value === null || value === '' || Number(value) % step === 0) return null;
    return { multipleOf: { step, actual: value } };
  };
}
