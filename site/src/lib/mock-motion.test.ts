import { afterEach, describe, expect, it, vi } from 'vitest';
import { motionAllowed, mulberry32 } from './mock-motion';

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(navigator, 'webdriver', { value: false, configurable: true });
});

describe('mulberry32', () => {
  it('gives the same sequence for the same seed', () => {
    const a = mulberry32(0x9e3779b9);
    const b = mulberry32(0x9e3779b9);
    const first = [a(), a(), a()];
    expect(first).toEqual([b(), b(), b()]);
    // And a real sequence, not one number repeated.
    expect(new Set(first).size).toBe(3);
  });

  it('gives a different sequence for a different seed', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it('stays inside [0, 1)', () => {
    const rnd = mulberry32(7);
    for (let i = 0; i < 200; i++) {
      const v = rnd();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('motionAllowed', () => {
  it('is true for a reader who asked for nothing in particular', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
    expect(motionAllowed()).toBe(true);
  });

  it('is false when the reader asked for less motion', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
    expect(motionAllowed()).toBe(false);
  });

  it('is false under automation, so a captured frame is the seeded one', () => {
    Object.defineProperty(navigator, 'webdriver', { value: true, configurable: true });
    expect(motionAllowed()).toBe(false);
  });
});
