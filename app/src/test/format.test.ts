import { describe, expect, it } from 'vitest';
import { format } from '../cases';

describe('format', () => {
  it('uses the reader’s decimal and thousands marks', () => {
    expect(format(2.4, 1, 'en')).toBe('2.4');
    expect(format(2.4, 1, 'pt')).toBe('2,4');
    expect(format(12000, 0, 'en')).toBe('12,000');
    expect(format(12000, 0, 'pt')).toBe('12.000');
  });

  it('keeps the decimals it is asked for, so counters land on the final text', () => {
    expect(format(5, 1, 'en')).toBe('5.0');
    expect(format(0.3333, 0, 'en')).toBe('0');
  });
});
