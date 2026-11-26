import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { noOverlap, startBeforeEnd } from './schedule.validators';

const range = (start: string, end: string) =>
  new FormGroup({ start: new FormControl(start), end: new FormControl(end) });

describe('startBeforeEnd', () => {
  it('accepts a valid range', () => {
    expect(startBeforeEnd(range('09:00', '12:00'))).toBeNull();
  });

  it('rejects an end before or equal to the start', () => {
    expect(startBeforeEnd(range('12:00', '09:00'))).toEqual({ startAfterEnd: true });
    expect(startBeforeEnd(range('09:00', '09:00'))).toEqual({ startAfterEnd: true });
  });
});

describe('noOverlap', () => {
  it('accepts back-to-back ranges', () => {
    expect(noOverlap(new FormArray([range('13:00', '18:00'), range('09:00', '13:00')]))).toBeNull();
  });

  it('rejects overlapping ranges', () => {
    expect(noOverlap(new FormArray([range('09:00', '12:00'), range('11:00', '14:00')]))).toEqual({
      overlap: true,
    });
  });
});
