import type { Filter } from '../../types';

// ── helpers ────────────────────────────────────────────────────────────

function parseSize(value?: string): number {
  return parseInt(value ?? '0', 10);
}

function formatDate(value?: string): string | null {
  return value ? new Date(value).toLocaleString('en-GB') : null;
}

function pluralAlbums(keys: string | string[], noun: string): string {
  return Array.isArray(keys)
    ? `in the ${keys.length} ${noun} albums`
    : `in the ${noun} album`;
}

// ── rule type ──────────────────────────────────────────────────────────

interface DescriptionRule {
  /** Return true when this rule should contribute text. */
  test: (f: Filter) => boolean;
  /** Return the fragment(s) to append. */
  describe: (f: Filter) => string | string[];
}

// ── rules ──────────────────────────────────────────────────────────────

const rules: DescriptionRule[] = [
  // ownership
  { test: (f) => f.owned === 'true',   describe: () => 'owned' },
  { test: (f) => f.owned === 'false',  describe: () => 'not owned' },

  // space
  { test: (f) => f.space === 'consuming',      describe: () => 'space consuming' },
  { test: (f) => f.space === 'non-consuming',   describe: () => 'non-space consuming' },

  // upload status
  { test: (f) => f.uploadStatus === 'full',     describe: () => 'fully uploaded' },
  { test: (f) => f.uploadStatus === 'partial',  describe: () => 'partially uploaded' },

  // shared
  { test: (f) => f.excludeShared === 'true', describe: () => 'non-shared' },

  // favorites
  { test: (f) => f.favorite === 'true', describe: () => 'favorite' },
  {
    test: (f) => f.excludeFavorites === 'true' || f.favorite === 'false',
    describe: () => 'non-favorite',
  },

  // quality
  { test: (f) => f.quality === 'original',       describe: () => 'original quality' },
  { test: (f) => f.quality === 'storage-saver',  describe: () => 'storage-saver quality' },

  // archive
  { test: (f) => f.archived === 'true',  describe: () => 'archived' },
  { test: (f) => f.archived === 'false', describe: () => 'non-archived' },

  // media type (always produces a token)
  {
    test: () => true,
    describe: (f) => {
      const typeMap: Record<string, string> = {
        video: 'videos',
        live: 'live photos',
        image: 'images',
      };
      return typeMap[f.type ?? ''] ?? 'media';
    },
  },

  // search query
  {
    test: (f) => !!f.searchQuery,
    describe: (f) => `in search results of query "${f.searchQuery}"`,
  },

  // filename regex
  {
    test: (f) => !!f.fileNameRegex,
    describe: (f) => {
      const verb = f.fileNameMatchType === 'exclude' ? 'not matching' : 'matching';
      return `with filename ${verb} regex "${f.fileNameRegex}"`;
    },
  },

  // description regex
  {
    test: (f) => !!f.descriptionRegex,
    describe: (f) => {
      const verb = f.descriptionMatchType === 'exclude' ? 'not matching' : 'matching';
      return `with description ${verb} regex "${f.descriptionRegex}"`;
    },
  },

  // similarity
  {
    test: (f) => !!f.similarityThreshold,
    describe: (f) => `with similarity more than "${f.similarityThreshold}"`,
  },

  // size range
  {
    test: (f) => parseSize(f.lowerBoundarySize) > 0 || parseSize(f.higherBoundarySize) > 0,
    describe: (f) => {
      const lo = parseSize(f.lowerBoundarySize);
      const hi = parseSize(f.higherBoundarySize);
      const parts: string[] = [];
      if (lo > 0) parts.push(`larger than ${lo} bytes`);
      if (lo > 0 && hi > 0) parts.push('and');
      if (hi > 0) parts.push(`smaller than ${hi} bytes`);
      return parts;
    },
  },

  // albums include
  {
    test: (f) => !!f.albumsInclude,
    describe: (f) => pluralAlbums(f.albumsInclude ?? [], 'target'),
  },

  // albums exclude
  {
    test: (f) => !!f.albumsExclude,
    describe: (f) => ['excluding items', pluralAlbums(f.albumsExclude ?? [], 'selected')],
  },

  // date range
  {
    test: (f) => Boolean(f.lowerBoundaryDate ?? f.higherBoundaryDate),
    describe: (f) => {
      const lo = formatDate(f.lowerBoundaryDate);
      const hi = formatDate(f.higherBoundaryDate);
      const parts: string[] = [];

      if (f.dateType === 'taken') parts.push('taken');
      else if (f.dateType === 'uploaded') parts.push('uploaded');

      if (lo && hi) {
        parts.push(
          f.intervalType === 'exclude'
            ? `before ${lo} and after ${hi}`
            : `from ${lo} to ${hi}`
        );
      } else if (lo) {
        parts.push(f.intervalType === 'exclude' ? `before ${lo}` : `after ${lo}`);
      } else if (hi) {
        parts.push(f.intervalType === 'exclude' ? `after ${hi}` : `before ${hi}`);
      }

      return parts;
    },
  },

  // sort
  { test: (f) => !!f.sortBySize, describe: () => 'sorted by size' },
];

// ── validation ─────────────────────────────────────────────────────────

function validate(filter: Filter): string | null {
  if (
    filter.lowerBoundaryDate &&
    filter.higherBoundaryDate &&
    filter.lowerBoundaryDate >= filter.higherBoundaryDate
  ) {
    return 'Error: Invalid Date Interval';
  }

  const lo = parseSize(filter.lowerBoundarySize);
  const hi = parseSize(filter.higherBoundarySize);
  if (lo > 0 && hi > 0 && lo >= hi) {
    return 'Error: Invalid Size Filter';
  }

  return null;
}

// ── main ───────────────────────────────────────────────────────────────

export function generateFilterDescription(filter: Filter): string {
  const error = validate(filter);
  if (error) return error;

  const parts: string[] = ['Filter: All'];

  for (const rule of rules) {
    if (rule.test(filter)) {
      const fragment = rule.describe(filter);
      if (Array.isArray(fragment)) {
        parts.push(...fragment);
      } else {
        parts.push(fragment);
      }
    }
  }

  const result = parts.join(' ');
  return result === 'Filter: All media' ? 'Filter: None' : result;
}
