import { describe, it, expect } from 'vitest';
import { generateFilterDescription } from '../src/ui/logic/filter-description-gen';
import { makeFilter } from './fixtures';

describe('generateFilterDescription', () => {
  it('returns "Filter: None" when no filters are set', () => {
    expect(generateFilterDescription(makeFilter({}))).toBe('Filter: None');
  });

  it('includes media type', () => {
    const desc = generateFilterDescription(makeFilter({ type: 'video' }));
    expect(desc).toContain('videos');
  });

  it('includes "images" for image type', () => {
    const desc = generateFilterDescription(makeFilter({ type: 'image' }));
    expect(desc).toContain('images');
  });

  it('includes "live photos" for live type', () => {
    const desc = generateFilterDescription(makeFilter({ type: 'live' }));
    expect(desc).toContain('live photos');
  });

  it('defaults to "media" when no type is set but other filters are', () => {
    const desc = generateFilterDescription(makeFilter({ owned: 'true' }));
    expect(desc).toContain('media');
  });

  // ownership
  it('includes "owned"', () => {
    const desc = generateFilterDescription(makeFilter({ owned: 'true' }));
    expect(desc).toContain('owned');
  });

  it('includes "not owned"', () => {
    const desc = generateFilterDescription(makeFilter({ owned: 'false' }));
    expect(desc).toContain('not owned');
  });

  // space
  it('includes "space consuming"', () => {
    const desc = generateFilterDescription(makeFilter({ space: 'consuming' }));
    expect(desc).toContain('space consuming');
  });

  it('includes "non-space consuming"', () => {
    const desc = generateFilterDescription(makeFilter({ space: 'non-consuming' }));
    expect(desc).toContain('non-space consuming');
  });

  // quality
  it('includes "original quality"', () => {
    const desc = generateFilterDescription(makeFilter({ quality: 'original' }));
    expect(desc).toContain('original quality');
  });

  it('includes "storage-saver quality"', () => {
    const desc = generateFilterDescription(makeFilter({ quality: 'storage-saver' }));
    expect(desc).toContain('storage-saver quality');
  });

  // favorites
  it('includes "favorite"', () => {
    const desc = generateFilterDescription(makeFilter({ favorite: 'true' }));
    expect(desc).toContain('favorite');
  });

  it('includes "non-favorite" for excludeFavorites', () => {
    const desc = generateFilterDescription(makeFilter({ excludeFavorites: 'true' }));
    expect(desc).toContain('non-favorite');
  });

  // archive
  it('includes "archived"', () => {
    const desc = generateFilterDescription(makeFilter({ archived: 'true' }));
    expect(desc).toContain('archived');
  });

  it('includes "non-archived"', () => {
    const desc = generateFilterDescription(makeFilter({ archived: 'false' }));
    expect(desc).toContain('non-archived');
  });

  // upload status
  it('includes "fully uploaded"', () => {
    const desc = generateFilterDescription(makeFilter({ uploadStatus: 'full' }));
    expect(desc).toContain('fully uploaded');
  });

  it('includes "partially uploaded"', () => {
    const desc = generateFilterDescription(makeFilter({ uploadStatus: 'partial' }));
    expect(desc).toContain('partially uploaded');
  });

  // shared
  it('includes "non-shared"', () => {
    const desc = generateFilterDescription(makeFilter({ excludeShared: 'true' }));
    expect(desc).toContain('non-shared');
  });

  // search query
  it('includes search query', () => {
    const desc = generateFilterDescription(makeFilter({ searchQuery: 'cats' }));
    expect(desc).toContain('search results of query "cats"');
  });

  // filename regex
  it('includes filename regex include', () => {
    const desc = generateFilterDescription(makeFilter({ fileNameRegex: '\\.jpg$', fileNameMatchType: 'include' }));
    expect(desc).toContain('matching regex "\\.jpg$"');
  });

  it('includes filename regex exclude', () => {
    const desc = generateFilterDescription(makeFilter({ fileNameRegex: '\\.raw$', fileNameMatchType: 'exclude' }));
    expect(desc).toContain('not matching');
  });

  // description regex
  it('includes description regex', () => {
    const desc = generateFilterDescription(makeFilter({ descriptionRegex: 'sunset', descriptionMatchType: 'include' }));
    expect(desc).toContain('description');
    expect(desc).toContain('sunset');
  });

  // similarity
  it('includes similarity threshold', () => {
    const desc = generateFilterDescription(makeFilter({ similarityThreshold: '0.85' }));
    expect(desc).toContain('similarity');
    expect(desc).toContain('0.85');
  });

  // size range
  it('includes size range', () => {
    const desc = generateFilterDescription(makeFilter({ lowerBoundarySize: '1000', higherBoundarySize: '5000' }));
    expect(desc).toContain('larger than 1000 bytes');
    expect(desc).toContain('smaller than 5000 bytes');
  });

  it('includes only lower size', () => {
    const desc = generateFilterDescription(makeFilter({ lowerBoundarySize: '1000' }));
    expect(desc).toContain('larger than 1000 bytes');
    expect(desc).not.toContain('smaller');
  });

  // albums
  it('includes target album (single)', () => {
    const desc = generateFilterDescription(makeFilter({ albumsInclude: 'album1' }));
    expect(desc).toContain('target album');
  });

  it('includes target albums (multiple)', () => {
    const desc = generateFilterDescription(makeFilter({ albumsInclude: ['a', 'b', 'c'] }));
    expect(desc).toContain('3 target albums');
  });

  it('includes exclude albums', () => {
    const desc = generateFilterDescription(makeFilter({ albumsExclude: ['a', 'b'] }));
    expect(desc).toContain('excluding items');
    expect(desc).toContain('2 selected albums');
  });

  // sort
  it('includes sort by size', () => {
    const desc = generateFilterDescription(makeFilter({ sortBySize: 'true' }));
    expect(desc).toContain('sorted by size');
  });

  // date range
  it('includes date range (include, taken)', () => {
    const desc = generateFilterDescription(makeFilter({
      lowerBoundaryDate: '2024-01-01',
      higherBoundaryDate: '2024-12-31',
      intervalType: 'include',
      dateType: 'taken',
    }));
    expect(desc).toContain('taken');
    expect(desc).toContain('from');
    expect(desc).toContain('to');
  });

  it('includes date range (exclude)', () => {
    const desc = generateFilterDescription(makeFilter({
      lowerBoundaryDate: '2024-01-01',
      higherBoundaryDate: '2024-12-31',
      intervalType: 'exclude',
      dateType: 'uploaded',
    }));
    expect(desc).toContain('uploaded');
    expect(desc).toContain('before');
    expect(desc).toContain('after');
  });

  // validation errors
  it('returns error for invalid date interval', () => {
    const desc = generateFilterDescription(makeFilter({
      lowerBoundaryDate: '2024-12-31',
      higherBoundaryDate: '2024-01-01',
    }));
    expect(desc).toBe('Error: Invalid Date Interval');
  });

  it('returns error for invalid size filter', () => {
    const desc = generateFilterDescription(makeFilter({
      lowerBoundarySize: '5000',
      higherBoundarySize: '1000',
    }));
    expect(desc).toBe('Error: Invalid Size Filter');
  });

  // combined filters
  it('combines multiple filters', () => {
    const desc = generateFilterDescription(makeFilter({
      owned: 'true',
      quality: 'original',
      type: 'image',
      archived: 'false',
    }));
    expect(desc).toContain('owned');
    expect(desc).toContain('original quality');
    expect(desc).toContain('images');
    expect(desc).toContain('non-archived');
    expect(desc).toMatch(/^Filter: All /);
  });
});
