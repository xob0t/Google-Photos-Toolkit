import type { MediaItem, Filter } from '../src/types';

let counter = 0;

/**
 * Create a MediaItem with sensible defaults. Override any field.
 */
export function makeItem(overrides: Partial<MediaItem> = {}): MediaItem {
  counter++;
  return {
    mediaKey: `key-${counter}`,
    timestamp: Date.now(),
    creationTimestamp: Date.now(),
    dedupKey: `dedup-${counter}`,
    ...overrides,
  };
}

/**
 * Create a Filter with only the specified fields set.
 */
export function makeFilter(overrides: Partial<Filter> = {}): Filter {
  return { ...overrides };
}
