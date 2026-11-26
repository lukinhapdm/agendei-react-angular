import { FormControl } from '@angular/forms';
import { multipleOf } from './multiple-of.validator';

describe('multipleOf', () => {
  const validate = (value: unknown) => multipleOf(5)(new FormControl(value));

  it('accepts multiples of the step', () => {
    expect(validate(30)).toBeNull();
  });

  it('rejects values that are not multiples', () => {
    expect(validate(7)).toEqual({ multipleOf: { step: 5, actual: 7 } });
  });

  it('ignores empty values so required can handle them', () => {
    expect(validate(null)).toBeNull();
    expect(validate('')).toBeNull();
  });
});
