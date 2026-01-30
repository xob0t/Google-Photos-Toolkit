import { describe, it, expect } from 'vitest';
import splitArrayIntoChunks from '../src/utils/splitArrayIntoChunks';

describe('splitArrayIntoChunks', () => {
  it('splits an array into chunks of the given size', () => {
    const result = splitArrayIntoChunks([1, 2, 3, 4, 5], 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns a single chunk when size >= array length', () => {
    const result = splitArrayIntoChunks([1, 2, 3], 5);
    expect(result).toEqual([[1, 2, 3]]);
  });

  it('returns empty array for empty input', () => {
    expect(splitArrayIntoChunks([], 3)).toEqual([]);
  });

  it('uses default chunk size of 500', () => {
    const arr = Array.from({ length: 501 }, (_, i) => i);
    const result = splitArrayIntoChunks(arr);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(500);
    expect(result[1]).toHaveLength(1);
  });

  it('clamps chunk size to minimum of 1', () => {
    const result = splitArrayIntoChunks([1, 2, 3], 0);
    expect(result).toEqual([[1], [2], [3]]);
  });

  it('clamps negative chunk size to 1', () => {
    const result = splitArrayIntoChunks([1, 2, 3], -5);
    expect(result).toEqual([[1], [2], [3]]);
  });

  it('floors fractional chunk size', () => {
    const result = splitArrayIntoChunks([1, 2, 3, 4, 5], 2.9);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('handles chunk size of 1', () => {
    const result = splitArrayIntoChunks(['a', 'b', 'c'], 1);
    expect(result).toEqual([['a'], ['b'], ['c']]);
  });

  it('preserves object references in chunks', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const result = splitArrayIntoChunks([obj1, obj2], 1);
    expect(result[0][0]).toBe(obj1);
    expect(result[1][0]).toBe(obj2);
  });
});
