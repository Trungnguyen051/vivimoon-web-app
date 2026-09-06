import { describe, it, expect } from 'vitest';
import { eyeEnlargementBand } from './eye-enlargement';

describe('eyeEnlargementBand', () => {
  it('bands natural when there is no graphic diameter (e.g. a clear lens)', () => {
    expect(eyeEnlargementBand(undefined)).toBe('natural');
  });

  it('bands natural below 13.0mm', () => {
    expect(eyeEnlargementBand('12.9mm')).toBe('natural');
    expect(eyeEnlargementBand('12.0mm')).toBe('natural');
  });

  it('bands subtle from 13.0mm to 13.3mm', () => {
    expect(eyeEnlargementBand('13.0mm')).toBe('subtle');
    expect(eyeEnlargementBand('13.3mm')).toBe('subtle');
  });

  it('bands noticeable from 13.4mm to 13.7mm', () => {
    expect(eyeEnlargementBand('13.4mm')).toBe('noticeable');
    expect(eyeEnlargementBand('13.7mm')).toBe('noticeable');
  });

  it('bands dramatic above 13.7mm', () => {
    expect(eyeEnlargementBand('13.8mm')).toBe('dramatic');
    expect(eyeEnlargementBand('14.0mm')).toBe('dramatic');
  });

  it('throws on an unparseable graphic diameter rather than silently mis-banding', () => {
    expect(() => eyeEnlargementBand('n/a')).toThrow();
  });
});
