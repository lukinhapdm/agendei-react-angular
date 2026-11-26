import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

type Range = { start: string; end: string };

// Validator de grupo: compara dois campos do mesmo intervalo
export const startBeforeEnd: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const { start, end } = group.value as Range;
  return start && end && start >= end ? { startAfterEnd: true } : null;
};

// Validator de array: impede intervalos sobrepostos no mesmo dia
export const noOverlap: ValidatorFn = (array: AbstractControl): ValidationErrors | null => {
  const ranges = [...(array.value as Range[])].sort((a, b) => a.start.localeCompare(b.start));
  const overlaps = ranges.some((r, i) => i > 0 && r.start < ranges[i - 1].end);
  return overlaps ? { overlap: true } : null;
};
