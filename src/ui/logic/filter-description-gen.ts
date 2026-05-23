import type { Filter } from '../../types';

function parseSize(value?: string): number {
  return parseInt(value ?? '0', 10);
}

function parseNumber(value?: string): number {
  return parseFloat(value ?? '');
}

function formatDate(value?: string): string | null {
  return value ? new Date(value).toLocaleString('en-GB') : null;
}

function pluralAlbums(keys: string | string[], noun: string): string {
  return Array.isArray(keys)
    ? `in the ${keys.length} ${noun} albums`
    : `in the ${noun} album`;
}

interface DescriptionRule {
  test: (f: Filter) => boolean;
  describe: (f: Filter) => string | string[];
}

const rules: DescriptionRule[] = [
  { test: (f) => f.owned === 'true',   describe: () => 'owned' },
  { test: (f) => f.owned === 'false',  describe: () => 'not owned' },

  { test: (f) => f.space === 'consuming',      describe: () => 'space consuming' },
  { test: (f) => f.space === 'non-consuming',   describe: () => 'non-space consuming' },

  { test: (f) => f.uploadStatus === 'full',     describe: () => 'fully uploaded' },
  { test: (f) => f.uploadStatus === 'partial',  describe: () => 'partially uploaded' },

  { test: (f) => f.excludeShared === 'true', describe: () => 'non-shared' },

  { test: (f) => f.favorite === 'true', describe: () => 'favorite' },
  {
    test: (f) => f.excludeFavorites === 'true' || f.favorite === 'false',
    describe: () => 'non-favorite',
  },

  { test: (f) => f.quality === 'original',       describe: () => 'original quality' },
  { test: (f) => f.quality === 'storage-saver',  describe: () => 'storage-saver quality' },

  { test: (f) => f.hasLocation === 'true',  describe: () => 'with location' },
  { test: (f) => f.hasLocation === 'false', describe: () => 'without location' },

  {
    test: (f) => Boolean(f.boundSouth && f.boundWest && f.boundNorth && f.boundEast),
    describe: (f) => `within area S${f.boundSouth} W${f.boundWest} N${f.boundNorth} E${f.boundEast}`,
  },

  { test: (f) => f.archived === 'true',  describe: () => 'archived' },
  { test: (f) => f.archived === 'false', describe: () => 'non-archived' },

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

  {
    test: (f) => !!f.searchQuery,
    describe: (f) => `in search results of query "${f.searchQuery}"`,
  },

  {
    test: (f) => !!f.fileNameRegex,
    describe: (f) => {
      const verb = f.fileNameMatchType === 'exclude' ? 'not matching' : 'matching';
      return `with filename ${verb} regex "${f.fileNameRegex}"`;
    },
  },

  {
    test: (f) => !!f.descriptionRegex,
    describe: (f) => {
      const verb = f.descriptionMatchType === 'exclude' ? 'not matching' : 'matching';
      return `with description ${verb} regex "${f.descriptionRegex}"`;
    },
  },

  {
    test: (f) => !!f.similarityThreshold,
    describe: (f) => `with similarity more than "${f.similarityThreshold}"`,
  },

  {
    test: (f) => parseSize(f.minWidth) > 0 || parseSize(f.maxWidth) > 0 || parseSize(f.minHeight) > 0 || parseSize(f.maxHeight) > 0,
    describe: (f) => {
      const parts: string[] = [];
      const minW = parseSize(f.minWidth);
      const maxW = parseSize(f.maxWidth);
      const minH = parseSize(f.minHeight);
      const maxH = parseSize(f.maxHeight);
      if (minW > 0) parts.push(`width >= ${minW}px`);
      if (maxW > 0) parts.push(`width <= ${maxW}px`);
      if (minH > 0) parts.push(`height >= ${minH}px`);
      if (maxH > 0) parts.push(`height <= ${maxH}px`);
      return `with resolution ${parts.join(', ')}`;
    },
  },

  {
    test: (f) => !isNaN(parseNumber(f.minDuration)) || !isNaN(parseNumber(f.maxDuration)),
    describe: (f) => {
      const minDuration = parseNumber(f.minDuration);
      const maxDuration = parseNumber(f.maxDuration);
      const parts: string[] = [];
      if (!isNaN(minDuration)) parts.push(`duration >= ${minDuration}s`);
      if (!isNaN(maxDuration)) parts.push(`duration <= ${maxDuration}s`);
      return `with ${parts.join(', ')}`;
    },
  },

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

  {
    test: (f) => !!f.albumsInclude,
    describe: (f) => pluralAlbums(f.albumsInclude ?? [], 'target'),
  },

  {
    test: (f) => !!f.albumsExclude,
    describe: (f) => ['excluding items', pluralAlbums(f.albumsExclude ?? [], 'selected')],
  },

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

  { test: (f) => !!f.sortBySize, describe: () => 'sorted by size' },
];

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

  const bS = parseFloat(filter.boundSouth ?? '');
  const bN = parseFloat(filter.boundNorth ?? '');
  const hasSomeBounds = [bS, parseFloat(filter.boundWest ?? ''), bN, parseFloat(filter.boundEast ?? '')].some((v) => !isNaN(v));
  const hasAllBounds = [bS, parseFloat(filter.boundWest ?? ''), bN, parseFloat(filter.boundEast ?? '')].every((v) => !isNaN(v));
  if (hasSomeBounds && !hasAllBounds) {
    return 'Error: Bounding Box requires all four coordinates';
  }
  if (hasAllBounds && bS >= bN) {
    return 'Error: South latitude must be less than North latitude';
  }

  const minW = parseSize(filter.minWidth);
  const maxW = parseSize(filter.maxWidth);
  if (minW > 0 && maxW > 0 && minW >= maxW) {
    return 'Error: Invalid Resolution Filter (Width)';
  }

  const minH = parseSize(filter.minHeight);
  const maxH = parseSize(filter.maxHeight);
  if (minH > 0 && maxH > 0 && minH >= maxH) {
    return 'Error: Invalid Resolution Filter (Height)';
  }

  const minDuration = parseNumber(filter.minDuration);
  const maxDuration = parseNumber(filter.maxDuration);
  if (!isNaN(minDuration) && minDuration < 0) {
    return 'Error: Invalid Duration Filter (Min)';
  }
  if (!isNaN(maxDuration) && maxDuration < 0) {
    return 'Error: Invalid Duration Filter (Max)';
  }
  if (!isNaN(minDuration) && !isNaN(maxDuration) && minDuration >= maxDuration) {
    return 'Error: Invalid Duration Filter';
  }

  return null;
}

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
