import { describe, it, expect } from 'vitest';
import { timeToHHMMSS, isPatternValid, assertType, assertInstance, defer } from '../src/utils/helpers';

describe('timeToHHMMSS', () => {
  it('formats zero milliseconds', () => {
    expect(timeToHHMMSS(0)).toBe('00:00:00');
  });

  it('formats seconds only', () => {
    expect(timeToHHMMSS(5000)).toBe('00:00:05');
  });

  it('formats minutes and seconds', () => {
    expect(timeToHHMMSS(90_000)).toBe('00:01:30');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(timeToHHMMSS(3_661_000)).toBe('01:01:01');
  });

  it('wraps at 24 hours', () => {
    // 24h = 86_400_000ms — should wrap to 00:00:00
    expect(timeToHHMMSS(86_400_000)).toBe('00:00:00');
  });

  it('truncates fractional seconds', () => {
    expect(timeToHHMMSS(1999)).toBe('00:00:01');
  });

  it('handles large durations within 24h', () => {
    // 23:59:59
    expect(timeToHHMMSS(86_399_000)).toBe('23:59:59');
  });
});

describe('isPatternValid', () => {
  it('returns true for a valid regex', () => {
    expect(isPatternValid('.*\\.jpg$')).toBe(true);
  });

  it('returns true for an empty string (matches everything)', () => {
    expect(isPatternValid('')).toBe(true);
  });

  it('returns true for a simple word', () => {
    expect(isPatternValid('hello')).toBe(true);
  });

  it('returns an Error for an invalid regex', () => {
    const result = isPatternValid('[invalid');
    expect(result).toBeInstanceOf(Error);
  });

  it('returns an Error for unbalanced parentheses', () => {
    const result = isPatternValid('(unclosed');
    expect(result).toBeInstanceOf(Error);
  });
});

describe('assertType', () => {
  it('does not throw for matching type', () => {
    expect(() => assertType('hello', 'string')).not.toThrow();
    expect(() => assertType(42, 'number')).not.toThrow();
    expect(() => assertType(true, 'boolean')).not.toThrow();
    expect(() => assertType(undefined, 'undefined')).not.toThrow();
  });

  it('throws TypeError for mismatching type', () => {
    expect(() => assertType('hello', 'number')).toThrow(TypeError);
    expect(() => assertType(42, 'string')).toThrow(TypeError);
  });

  it('includes expected and actual types in message', () => {
    expect(() => assertType('hello', 'number')).toThrow('Expected type number but got string');
  });
});

describe('assertInstance', () => {
  it('does not throw for correct instance', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => assertInstance(new Date(), Date as any)).not.toThrow();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => assertInstance(new Error(), Error as any)).not.toThrow();
  });

  it('throws TypeError for wrong instance', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => assertInstance('hello', Date as any)).toThrow(TypeError);
  });

  it('includes class names in message', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => assertInstance('hello', Date as any)).toThrow('Expected instance of Date but got String');
  });
});

describe('defer', () => {
  it('resolves with the return value of the function', async () => {
    const result = await defer(() => 42);
    expect(result).toBe(42);
  });

  it('resolves with void for no-return functions', async () => {
    const result = await defer(() => {});
    expect(result).toBeUndefined();
  });
});
