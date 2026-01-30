import { describe, it, expect } from 'vitest';
import {
  fileNameFilter,
  descriptionFilter,
  sizeFilter,
  qualityFilter,
  spaceFilter,
  filterByDate,
  filterByMediaType,
  filterFavorite,
  filterOwned,
  filterByUploadStatus,
  filterArchived,
  hammingDistance,
  calculateHashSize,
} from '../src/filters';
import { makeItem, makeFilter } from './fixtures';

// ─── fileNameFilter ──────────────────────────────────────────────────

describe('fileNameFilter', () => {
  const items = [
    makeItem({ fileName: 'IMG_001.jpg' }),
    makeItem({ fileName: 'IMG_002.png' }),
    makeItem({ fileName: 'screenshot.png' }),
    makeItem({ fileName: undefined }),
  ];

  it('includes items matching regex', () => {
    const result = fileNameFilter(items, makeFilter({ fileNameRegex: '^IMG', fileNameMatchType: 'include' }));
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.fileName?.startsWith('IMG'))).toBe(true);
  });

  it('excludes items matching regex', () => {
    const result = fileNameFilter(items, makeFilter({ fileNameRegex: '\\.png$', fileNameMatchType: 'exclude' }));
    // IMG_001.jpg passes (no .png), and undefined fileName (treated as '') also passes
    expect(result).toHaveLength(2);
    expect(result[0].fileName).toBe('IMG_001.jpg');
    expect(result[1].fileName).toBeUndefined();
  });

  it('returns all items when no match type is set', () => {
    const result = fileNameFilter(items, makeFilter({ fileNameRegex: 'IMG' }));
    expect(result).toHaveLength(4);
  });

  it('treats undefined fileName as empty string', () => {
    const result = fileNameFilter(items, makeFilter({ fileNameRegex: '^$', fileNameMatchType: 'include' }));
    // undefined fileName becomes '' which matches ^$
    expect(result).toHaveLength(1);
    expect(result[0].fileName).toBeUndefined();
  });
});

// ─── descriptionFilter ──────────────────────────────────────────────

describe('descriptionFilter', () => {
  const items = [
    makeItem({ descriptionFull: 'Sunset at the beach' }),
    makeItem({ descriptionFull: 'Mountain view' }),
    makeItem({ descriptionFull: undefined }),
  ];

  it('includes items matching regex', () => {
    const result = descriptionFilter(items, makeFilter({ descriptionRegex: 'beach', descriptionMatchType: 'include' }));
    expect(result).toHaveLength(1);
    expect(result[0].descriptionFull).toBe('Sunset at the beach');
  });

  it('excludes items matching regex', () => {
    const result = descriptionFilter(items, makeFilter({ descriptionRegex: 'Mountain', descriptionMatchType: 'exclude' }));
    expect(result).toHaveLength(2);
  });
});

// ─── sizeFilter ─────────────────────────────────────────────────────

describe('sizeFilter', () => {
  const items = [
    makeItem({ size: 100 }),
    makeItem({ size: 500 }),
    makeItem({ size: 1000 }),
    makeItem({ size: 5000 }),
    makeItem({ size: undefined }),
  ];

  it('filters items smaller than upper boundary', () => {
    const result = sizeFilter(items, makeFilter({ higherBoundarySize: '1000' }));
    expect(result).toHaveLength(3); // 100, 500, and undefined (0 < 1000)
  });

  it('filters items larger than lower boundary', () => {
    const result = sizeFilter(items, makeFilter({ lowerBoundarySize: '500' }));
    expect(result).toHaveLength(2); // 1000, 5000
  });

  it('applies both boundaries', () => {
    const result = sizeFilter(items, makeFilter({ lowerBoundarySize: '200', higherBoundarySize: '2000' }));
    expect(result).toHaveLength(2); // 500, 1000
  });

  it('returns all items when boundaries are 0', () => {
    const result = sizeFilter(items, makeFilter({ lowerBoundarySize: '0', higherBoundarySize: '0' }));
    expect(result).toHaveLength(5);
  });

  it('treats undefined size as 0', () => {
    const result = sizeFilter(items, makeFilter({ lowerBoundarySize: '1' }));
    // undefined (0) is NOT > 1, so excluded
    expect(result.find((i) => i.size === undefined)).toBeUndefined();
  });
});

// ─── qualityFilter ──────────────────────────────────────────────────

describe('qualityFilter', () => {
  const items = [
    makeItem({ isOriginalQuality: true }),
    makeItem({ isOriginalQuality: false }),
    makeItem({ isOriginalQuality: null }),
  ];

  it('filters original quality', () => {
    const result = qualityFilter(items, makeFilter({ quality: 'original' }));
    expect(result).toHaveLength(1);
    expect(result[0].isOriginalQuality).toBe(true);
  });

  it('filters storage-saver quality', () => {
    const result = qualityFilter(items, makeFilter({ quality: 'storage-saver' }));
    expect(result).toHaveLength(2); // false and null are both !truthy
  });

  it('returns all when quality not set', () => {
    const result = qualityFilter(items, makeFilter({}));
    expect(result).toHaveLength(3);
  });
});

// ─── spaceFilter ────────────────────────────────────────────────────

describe('spaceFilter', () => {
  const items = [
    makeItem({ takesUpSpace: true }),
    makeItem({ takesUpSpace: false }),
    makeItem({ takesUpSpace: null }),
  ];

  it('filters consuming items', () => {
    const result = spaceFilter(items, makeFilter({ space: 'consuming' }));
    expect(result).toHaveLength(1);
    expect(result[0].takesUpSpace).toBe(true);
  });

  it('filters non-consuming items', () => {
    const result = spaceFilter(items, makeFilter({ space: 'non-consuming' }));
    expect(result).toHaveLength(2);
  });
});

// ─── filterByDate ───────────────────────────────────────────────────

describe('filterByDate', () => {
  const jan1 = new Date('2024-01-01').getTime();
  const feb1 = new Date('2024-02-01').getTime();
  const mar1 = new Date('2024-03-01').getTime();
  const apr1 = new Date('2024-04-01').getTime();

  const items = [
    makeItem({ timestamp: jan1, creationTimestamp: jan1 }),
    makeItem({ timestamp: feb1, creationTimestamp: feb1 }),
    makeItem({ timestamp: mar1, creationTimestamp: mar1 }),
    makeItem({ timestamp: apr1, creationTimestamp: apr1 }),
  ];

  it('includes items within taken date range', () => {
    const result = filterByDate(items, makeFilter({
      lowerBoundaryDate: '2024-01-15',
      higherBoundaryDate: '2024-03-15',
      intervalType: 'include',
      dateType: 'taken',
    }));
    expect(result).toHaveLength(2); // feb1, mar1
  });

  it('excludes items within taken date range', () => {
    const result = filterByDate(items, makeFilter({
      lowerBoundaryDate: '2024-01-15',
      higherBoundaryDate: '2024-03-15',
      intervalType: 'exclude',
      dateType: 'taken',
    }));
    expect(result).toHaveLength(2); // jan1, apr1
  });

  it('includes items within uploaded date range', () => {
    const result = filterByDate(items, makeFilter({
      lowerBoundaryDate: '2024-02-01',
      higherBoundaryDate: '2024-03-01',
      intervalType: 'include',
      dateType: 'uploaded',
    }));
    expect(result).toHaveLength(2); // feb1, mar1
  });

  it('excludes items within uploaded date range', () => {
    const result = filterByDate(items, makeFilter({
      lowerBoundaryDate: '2024-02-01',
      higherBoundaryDate: '2024-03-01',
      intervalType: 'exclude',
      dateType: 'uploaded',
    }));
    expect(result).toHaveLength(2); // jan1, apr1
  });

  it('handles only lower boundary (include)', () => {
    const result = filterByDate(items, makeFilter({
      lowerBoundaryDate: '2024-03-01',
      intervalType: 'include',
      dateType: 'taken',
    }));
    expect(result).toHaveLength(2); // mar1, apr1
  });

  it('handles only upper boundary (include)', () => {
    const result = filterByDate(items, makeFilter({
      higherBoundaryDate: '2024-02-01',
      intervalType: 'include',
      dateType: 'taken',
    }));
    expect(result).toHaveLength(2); // jan1, feb1
  });

  it('returns all items when no interval type is set', () => {
    const result = filterByDate(items, makeFilter({
      lowerBoundaryDate: '2024-01-01',
      higherBoundaryDate: '2024-04-01',
    }));
    expect(result).toHaveLength(4);
  });
});

// ─── filterByMediaType ──────────────────────────────────────────────

describe('filterByMediaType', () => {
  const items = [
    makeItem({ duration: 30 }),      // video
    makeItem({ duration: 0 }),        // image (falsy duration)
    makeItem({ duration: undefined }), // image
    makeItem({ isLivePhoto: true, duration: 5 }),  // live photo
    makeItem({ isLivePhoto: false }), // image
  ];

  it('filters videos (has duration)', () => {
    const result = filterByMediaType(items, makeFilter({ type: 'video' }));
    expect(result).toHaveLength(2); // duration 30 and live photo with duration 5
  });

  it('filters images (no duration)', () => {
    const result = filterByMediaType(items, makeFilter({ type: 'image' }));
    expect(result).toHaveLength(3); // duration 0, undefined, and isLivePhoto:false
  });

  it('filters live photos', () => {
    const result = filterByMediaType(items, makeFilter({ type: 'live' }));
    expect(result).toHaveLength(1);
    expect(result[0].isLivePhoto).toBe(true);
  });
});

// ─── filterFavorite ─────────────────────────────────────────────────

describe('filterFavorite', () => {
  const items = [
    makeItem({ isFavorite: true }),
    makeItem({ isFavorite: false }),
    makeItem({ isFavorite: undefined }),
  ];

  it('filters favorites only', () => {
    const result = filterFavorite(items, makeFilter({ favorite: 'true' }));
    // isFavorite !== false → true and undefined pass
    expect(result).toHaveLength(2);
  });

  it('filters non-favorites', () => {
    const result = filterFavorite(items, makeFilter({ favorite: 'false' }));
    // isFavorite !== true → false and undefined pass
    expect(result).toHaveLength(2);
  });

  it('excludes favorites via excludeFavorites flag', () => {
    const result = filterFavorite(items, makeFilter({ excludeFavorites: 'true' }));
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.isFavorite !== true)).toBe(true);
  });
});

// ─── filterOwned ────────────────────────────────────────────────────

describe('filterOwned', () => {
  const items = [
    makeItem({ isOwned: true }),
    makeItem({ isOwned: false }),
    makeItem({ isOwned: undefined }),
  ];

  it('filters owned items', () => {
    const result = filterOwned(items, makeFilter({ owned: 'true' }));
    // isOwned !== false → true and undefined
    expect(result).toHaveLength(2);
  });

  it('filters not-owned items', () => {
    const result = filterOwned(items, makeFilter({ owned: 'false' }));
    // isOwned !== true → false and undefined
    expect(result).toHaveLength(2);
  });
});

// ─── filterByUploadStatus ───────────────────────────────────────────

describe('filterByUploadStatus', () => {
  const items = [
    makeItem({ isPartialUpload: true }),
    makeItem({ isPartialUpload: false }),
    makeItem({ isPartialUpload: undefined }),
  ];

  it('filters fully uploaded', () => {
    const result = filterByUploadStatus(items, makeFilter({ uploadStatus: 'full' }));
    expect(result).toHaveLength(1);
    expect(result[0].isPartialUpload).toBe(false);
  });

  it('filters partially uploaded', () => {
    const result = filterByUploadStatus(items, makeFilter({ uploadStatus: 'partial' }));
    expect(result).toHaveLength(1);
    expect(result[0].isPartialUpload).toBe(true);
  });
});

// ─── filterArchived ─────────────────────────────────────────────────

describe('filterArchived', () => {
  const items = [
    makeItem({ isArchived: true }),
    makeItem({ isArchived: false }),
    makeItem({ isArchived: undefined }),
  ];

  it('filters archived items', () => {
    const result = filterArchived(items, makeFilter({ archived: 'true' }));
    // isArchived !== false → true and undefined
    expect(result).toHaveLength(2);
  });

  it('filters non-archived items', () => {
    const result = filterArchived(items, makeFilter({ archived: 'false' }));
    // isArchived !== true → false and undefined
    expect(result).toHaveLength(2);
  });
});

// ─── hammingDistance ─────────────────────────────────────────────────

describe('hammingDistance', () => {
  it('returns 0 for identical hashes', () => {
    expect(hammingDistance(0b1010n, 0b1010n)).toBe(0);
  });

  it('counts differing bits', () => {
    // 1010 vs 1111 → bits 0 and 2 differ → distance 2
    expect(hammingDistance(0b1010n, 0b1111n)).toBe(2);
  });

  it('returns Infinity when either hash is null', () => {
    expect(hammingDistance(null, 0n)).toBe(Infinity);
    expect(hammingDistance(0n, null)).toBe(Infinity);
    expect(hammingDistance(null, null)).toBe(Infinity);
  });

  it('handles large hashes (64-bit)', () => {
    const a = (1n << 63n);
    const b = 0n;
    expect(hammingDistance(a, b)).toBe(1);
  });

  it('returns 0 for two zero hashes', () => {
    expect(hammingDistance(0n, 0n)).toBe(0);
  });

  it('returns full distance for all-different bits', () => {
    // 8-bit: 0xFF vs 0x00 → 8 bits differ
    expect(hammingDistance(0xFFn, 0n)).toBe(8);
  });
});

// ─── calculateHashSize ──────────────────────────────────────────────

describe('calculateHashSize', () => {
  it('returns minimum 8 for small images', () => {
    expect(calculateHashSize(16)).toBe(8);
    expect(calculateHashSize(1)).toBe(8);
  });

  it('scales with image height', () => {
    // sqrt(256) = 16, 16/4 = 4 → max(8, 4) = 8
    expect(calculateHashSize(256)).toBe(8);
    // sqrt(1024) = 32, 32/4 = 8 → max(8, 8) = 8
    expect(calculateHashSize(1024)).toBe(8);
    // sqrt(4096) = 64, 64/4 = 16 → max(8, 16) = 16
    expect(calculateHashSize(4096)).toBe(16);
  });

  it('caps at 32', () => {
    // sqrt(65536) = 256, 256/4 = 64 → min(32, 64) = 32
    expect(calculateHashSize(65536)).toBe(32);
  });

  it('returns 8 for typical thumbnail heights', () => {
    expect(calculateHashSize(100)).toBe(8);
    expect(calculateHashSize(200)).toBe(8);
  });
});
