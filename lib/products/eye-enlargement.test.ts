import { describe, it, expect } from 'vitest';
import { eyeEnlargementBand } from './eye-enlargement';

describe('eyeEnlargementBand', () => {
  it('bands natural below 14.0mm', () => {
    expect(eyeEnlargementBand('13.9mm')).toBe('natural');
    expect(eyeEnlargementBand('13.0mm')).toBe('natural');
  });

  it('bands subtle from 14.0mm to 14.2mm', () => {
    expect(eyeEnlargementBand('14.0mm')).toBe('subtle');
    expect(eyeEnlargementBand('14.2mm')).toBe('subtle');
  });

  it('bands noticeable from 14.3mm to 14.5mm', () => {
    expect(eyeEnlargementBand('14.3mm')).toBe('noticeable');
    expect(eyeEnlargementBand('14.5mm')).toBe('noticeable');
  });

  it('bands dramatic above 14.5mm', () => {
    expect(eyeEnlargementBand('14.6mm')).toBe('dramatic');
    expect(eyeEnlargementBand('15.0mm')).toBe('dramatic');
  });

  it('throws on an unparseable diameter rather than silently mis-banding', () => {
    expect(() => eyeEnlargementBand('n/a')).toThrow();
  });
});
