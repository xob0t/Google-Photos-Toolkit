import { describe, it, expect } from 'vitest';
import parser from '../src/api/parser';
import type {
  LibraryTimelinePage,
  LibraryGenericPage,
  LockedFolderPage,
  LinksPage,
  AlbumsPage,
  AlbumItemsPage,
  PartnerSharedItemsPage,
  TrashPage,
  ItemInfo,
  ItemInfoExt,
  BulkMediaInfo,
  DownloadTokenCheck,
  StorageQuota,
  RemoteMatch,
  MediaItem,
} from '../src/types';

// ── Fixtures ──────────────────────────────────────────────────────────

import lcxiM from './fixtures/parser/lcxiM.json';
import EzkLib from './fixtures/parser/EzkLib.json';
import nMFwOc from './fixtures/parser/nMFwOc.json';
import F2A0H from './fixtures/parser/F2A0H.json';
import Z5xsfc from './fixtures/parser/Z5xsfc.json';
import snAcKc from './fixtures/parser/snAcKc.json';
import e9T5je from './fixtures/parser/e9T5je.json';
import zy0IHe from './fixtures/parser/zy0IHe.json';
import VrseUb from './fixtures/parser/VrseUb.json';
import fDcn4b from './fixtures/parser/fDcn4b.json';
import EWgK9e from './fixtures/parser/EWgK9e.json';
import dnv2s from './fixtures/parser/dnv2s.json';
import dnv2sPending from './fixtures/parser/dnv2s_pending.json';
import EzwWhf from './fixtures/parser/EzwWhf.json';
import swbisb from './fixtures/parser/swbisb.json';

// ── Helpers ───────────────────────────────────────────────────────────

/** Assert common MediaItem-like fields are present and well-typed */
function expectMediaItemShape(item: MediaItem) {
  expect(item.mediaKey).toBeTypeOf('string');
  expect(item.mediaKey.length).toBeGreaterThan(0);
  expect(item.dedupKey).toBeTypeOf('string');
  expect(item.timestamp).toBeTypeOf('number');
}

// ── parser() dispatch ─────────────────────────────────────────────────

describe('parser dispatch', () => {
  it('returns null for unknown rpcid', () => {
    expect(parser([1, 2, 3], 'unknownRpcId')).toBeNull();
  });

  it('returns null for empty data', () => {
    expect(parser([], 'lcxiM')).toBeNull();
    expect(parser(null, 'lcxiM')).toBeNull();
    expect(parser(undefined, 'lcxiM')).toBeNull();
  });
});

// ── lcxiM — Library Timeline Page ─────────────────────────────────────

describe('lcxiM — libraryTimelinePage', () => {
  const result = parser(lcxiM, 'lcxiM') as LibraryTimelinePage;

  it('parses page structure', () => {
    expect(result).toBeDefined();
    expect(result.items).toBeInstanceOf(Array);
    expect(result.items!.length).toBe(500);
    expect(result.nextPageId).toBeTypeOf('string');
    expect(result.lastItemTimestamp).toBeTypeOf('number');
  });

  it('parses all items with required fields', () => {
    for (const item of result.items!) {
      expectMediaItemShape(item);
      expect(item.creationTimestamp).toBeTypeOf('number');
      expect(typeof item.isLivePhoto).toBe('boolean');
    }
  });

  it('parses thumbnail and resolution', () => {
    const item = result.items![0];
    expect(item.thumb).toBeTypeOf('string');
    expect(item.resWidth).toBeTypeOf('number');
    expect(item.resHeight).toBeTypeOf('number');
    expect(item.resWidth).toBeGreaterThan(0);
    expect(item.resHeight).toBeGreaterThan(0);
  });

  it('parses ownership field', () => {
    const item = result.items![0];
    expect(typeof item.isOwned).toBe('boolean');
  });

  it('parses geo location when present', () => {
    const withGeo = result.items!.find(
      (i) => i.geoLocation?.coordinates && i.geoLocation.coordinates.length > 0
    );
    expect(withGeo).toBeDefined();
    expect(withGeo!.geoLocation!.coordinates).toBeInstanceOf(Array);
    expect(withGeo!.geoLocation!.coordinates!.length).toBe(2);
    expect(withGeo!.geoLocation!.coordinates![0]).toBeTypeOf('number');
    expect(withGeo!.geoLocation!.coordinates![1]).toBeTypeOf('number');
    expect(withGeo!.geoLocation!.name).toBeTypeOf('string');
  });

  it('parses items without geo location', () => {
    const withoutGeo = result.items!.find(
      (i) => !i.geoLocation?.coordinates || i.geoLocation.coordinates.length === 0
    );
    expect(withoutGeo).toBeDefined();
  });

  it('parses video duration when present', () => {
    const video = result.items!.find((i) => i.duration != null);
    expect(video).toBeDefined();
    expect(video!.duration).toBeTypeOf('number');
    expect(video!.duration!).toBeGreaterThan(0);
  });

  it('parses description when present', () => {
    const withDesc = result.items!.find((i) => i.descriptionShort != null);
    expect(withDesc).toBeDefined();
    expect(withDesc!.descriptionShort).toBeTypeOf('string');
    expect(withDesc!.descriptionShort!.length).toBeGreaterThan(0);
  });

  it('has correct timestamp ordering (descending)', () => {
    const timestamps = result.items!.map((i) => i.timestamp);
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i - 1]);
    }
  });

  it('all mediaKeys are unique', () => {
    const keys = result.items!.map((i) => i.mediaKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

// ── EzkLib — Library Generic Page ─────────────────────────────────────

describe('EzkLib — libraryGenericPage', () => {
  const result = parser(EzkLib, 'EzkLib') as LibraryGenericPage;

  it('parses page structure', () => {
    expect(result).toBeDefined();
    expect(result.items).toBeInstanceOf(Array);
    expect(result.items!.length).toBe(100);
    expect(result.nextPageId).toBeTypeOf('string');
  });

  it('parses all items with required fields', () => {
    for (const item of result.items!) {
      expectMediaItemShape(item);
    }
  });

  it('all mediaKeys are unique', () => {
    const keys = result.items!.map((i) => i.mediaKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

// ── nMFwOc — Locked Folder Page ───────────────────────────────────────

describe('nMFwOc — lockedFolderPage', () => {
  const result = parser(nMFwOc, 'nMFwOc') as LockedFolderPage;

  it('parses page structure', () => {
    expect(result).toBeDefined();
    expect(result.items).toBeInstanceOf(Array);
    expect(result.items!.length).toBe(17);
  });

  it('parses all items with required fields', () => {
    for (const item of result.items!) {
      expect(item.mediaKey).toBeTypeOf('string');
      expect(item.mediaKey.length).toBeGreaterThan(0);
      expect(item.dedupKey).toBeTypeOf('string');
      expect(item.timestamp).toBeTypeOf('number');
      expect(item.creationTimestamp).toBeTypeOf('number');
    }
  });

  it('handles nextPageId (null for last page)', () => {
    // nMFwOc fixture has nextPageId: null
    expect(result.nextPageId).toBeNull();
  });
});

// ── F2A0H — Shared Links Page ─────────────────────────────────────────

describe('F2A0H — linksPage', () => {
  const result = parser(F2A0H, 'F2A0H') as LinksPage;

  it('parses page structure', () => {
    expect(result).toBeDefined();
    expect(result.items).toBeInstanceOf(Array);
    expect(result.items!.length).toBe(25);
    expect(result.nextPageId).toBeTypeOf('string');
  });

  it('parses all links with required fields', () => {
    for (const link of result.items!) {
      expect(link.mediaKey).toBeTypeOf('string');
      // linkId can be null for some link types
      expect(link.linkId === null || typeof link.linkId === 'string').toBe(true);
    }
  });

  it('most links have a linkId', () => {
    const withLinkId = result.items!.filter((l) => l.linkId != null);
    expect(withLinkId.length).toBeGreaterThan(0);
  });

  it('parses itemCount on links', () => {
    const withCount = result.items!.find((l) => l.itemCount != null);
    expect(withCount).toBeDefined();
    expect(withCount!.itemCount).toBeTypeOf('number');
  });
});

// ── Z5xsfc — Albums Page ──────────────────────────────────────────────

describe('Z5xsfc — albumsPage', () => {
  const result = parser(Z5xsfc, 'Z5xsfc') as AlbumsPage;

  it('parses page structure', () => {
    expect(result).toBeDefined();
    expect(result.items).toBeInstanceOf(Array);
    expect(result.items!.length).toBe(57);
    expect(result.nextPageId).toBeTypeOf('string');
  });

  it('parses all albums with required fields', () => {
    for (const album of result.items!) {
      expect(album.mediaKey).toBeTypeOf('string');
      expect(album.mediaKey.length).toBeGreaterThan(0);
    }
  });

  it('parses album metadata', () => {
    const withTitle = result.items!.find((a) => a.title != null);
    expect(withTitle).toBeDefined();
    expect(withTitle!.title).toBeTypeOf('string');
  });

  it('parses itemCount on albums', () => {
    const withCount = result.items!.find((a) => a.itemCount != null);
    expect(withCount).toBeDefined();
    expect(withCount!.itemCount).toBeTypeOf('number');
    expect(withCount!.itemCount!).toBeGreaterThanOrEqual(0);
  });

  it('parses isShared boolean', () => {
    for (const album of result.items!) {
      expect(typeof album.isShared).toBe('boolean');
    }
  });

  it('parses timestamps on albums', () => {
    const withTimestamp = result.items!.find((a) => a.creationTimestamp != null);
    expect(withTimestamp).toBeDefined();
    expect(withTimestamp!.creationTimestamp).toBeTypeOf('number');
  });
});

// ── snAcKc — Album Items Page ─────────────────────────────────────────

describe('snAcKc — albumItemsPage', () => {
  const result = parser(snAcKc, 'snAcKc') as AlbumItemsPage;

  it('parses page structure', () => {
    expect(result).toBeDefined();
    expect(result.items).toBeInstanceOf(Array);
    expect(result.items!.length).toBe(3);
  });

  it('parses all items with required fields', () => {
    for (const item of result.items!) {
      expectMediaItemShape(item);
    }
  });

  it('parses album metadata', () => {
    expect(result.mediaKey).toBeTypeOf('string');
    expect(result.title).toBeTypeOf('string');
  });

  it('parses album owner', () => {
    expect(result.owner).toBeDefined();
    expect(result.owner!.actorId).toBeTypeOf('string');
  });

  it('parses album timestamps', () => {
    // startTimestamp/endTimestamp may be arrays [timestamp, offset] from the raw data
    expect(result.startTimestamp).toBeDefined();
    expect(result.endTimestamp).toBeDefined();
    // creationTimestamp may be null for some albums
    expect(result.newestOperationTimestamp).toBeTypeOf('number');
  });

  it('parses album itemCount', () => {
    expect(result.itemCount).toBeTypeOf('number');
    expect(result.itemCount).toBe(3);
  });
});

// ── e9T5je — Partner Shared Items Page ────────────────────────────────

describe('e9T5je — partnerSharedItemsPage', () => {
  const result = parser(e9T5je, 'e9T5je') as PartnerSharedItemsPage;

  it('parses page structure', () => {
    expect(result).toBeDefined();
    expect(result.items).toBeInstanceOf(Array);
    expect(result.items!.length).toBe(164);
    expect(result.nextPageId).toBeTypeOf('string');
  });

  it('parses all items with required fields', () => {
    for (const item of result.items!) {
      expect(item.mediaKey).toBeTypeOf('string');
      expect(item.dedupKey).toBeTypeOf('string');
      expect(item.timestamp).toBeTypeOf('number');
      expect(item.creationTimestamp).toBeTypeOf('number');
      expect(typeof item.isLivePhoto).toBe('boolean');
    }
  });

  it('parses partner members', () => {
    expect(result.members).toBeInstanceOf(Array);
    expect(result.members!.length).toBeGreaterThan(0);
    expect(result.members![0].actorId).toBeTypeOf('string');
  });

  it('parses partner actor ID', () => {
    expect(result.partnerActorId).toBeTypeOf('string');
  });

  it('parses saved status on items', () => {
    const withSaved = result.items!.find((i) => i.saved != null);
    expect(withSaved).toBeDefined();
    expect(typeof withSaved!.saved).toBe('boolean');
  });
});

// ── zy0IHe — Trash Page ──────────────────────────────────────────────

describe('zy0IHe — trashPage', () => {
  const result = parser(zy0IHe, 'zy0IHe') as TrashPage;

  it('parses page structure', () => {
    expect(result).toBeDefined();
    expect(result.items).toBeInstanceOf(Array);
    expect(result.items!.length).toBe(17);
  });

  it('parses all items with required fields', () => {
    for (const item of result.items!) {
      expectMediaItemShape(item);
      expect(item.creationTimestamp).toBeTypeOf('number');
    }
  });

  it('parses thumbnail and resolution', () => {
    const item = result.items![0];
    expect(item.thumb).toBeTypeOf('string');
    expect(item.resWidth).toBeTypeOf('number');
    expect(item.resHeight).toBeTypeOf('number');
  });

  it('no nextPageId on last page', () => {
    expect(result.nextPageId).toBeUndefined();
  });

  it('all mediaKeys are unique', () => {
    const keys = result.items!.map((i) => i.mediaKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

// ── VrseUb — Item Info (Basic) ────────────────────────────────────────

describe('VrseUb — itemInfoParse', () => {
  const result = parser(VrseUb, 'VrseUb') as ItemInfo;

  it('parses basic item info', () => {
    expect(result).toBeDefined();
    expect(result.mediaKey).toBeTypeOf('string');
    expect(result.mediaKey!.length).toBeGreaterThan(0);
    expect(result.dedupKey).toBeTypeOf('string');
  });

  it('parses resolution', () => {
    expect(result.resWidth).toBeTypeOf('number');
    expect(result.resHeight).toBeTypeOf('number');
    expect(result.resWidth!).toBeGreaterThan(0);
    expect(result.resHeight!).toBeGreaterThan(0);
  });

  it('parses timestamps', () => {
    expect(result.timestamp).toBeTypeOf('number');
    expect(result.creationTimestamp).toBeTypeOf('number');
  });

  it('parses upload status', () => {
    expect(typeof result.isPartialUpload).toBe('boolean');
  });

  it('parses quality/space fields', () => {
    // These may be null (not undefined) if the field exists but has no value
    expect(result.takesUpSpace === null || typeof result.takesUpSpace === 'boolean').toBe(true);
    expect(result.isOriginalQuality === null || typeof result.isOriginalQuality === 'boolean').toBe(true);
  });

  it('parses live photo status', () => {
    expect(typeof result.isLivePhoto).toBe('boolean');
  });

  it('parses favorite status', () => {
    expect(typeof result.isFavorite).toBe('boolean');
  });
});

// ── fDcn4b — Item Info Extended ───────────────────────────────────────

describe('fDcn4b — itemInfoExtParse', () => {
  const result = parser(fDcn4b, 'fDcn4b') as ItemInfoExt;

  it('parses extended item info', () => {
    expect(result).toBeDefined();
    expect(result.mediaKey).toBeTypeOf('string');
    expect(result.mediaKey!.length).toBeGreaterThan(0);
    expect(result.dedupKey).toBeTypeOf('string');
  });

  it('parses filename', () => {
    expect(result.fileName).toBeTypeOf('string');
    expect(result.fileName!.length).toBeGreaterThan(0);
  });

  it('parses resolution', () => {
    expect(result.resWidth).toBeTypeOf('number');
    expect(result.resHeight).toBeTypeOf('number');
  });

  it('parses size', () => {
    expect(result.size).toBeTypeOf('number');
    expect(result.size!).toBeGreaterThan(0);
  });

  it('parses timestamps', () => {
    expect(result.timestamp).toBeTypeOf('number');
    expect(result.timezoneOffset).toBeTypeOf('number');
  });

  it('parses source info', () => {
    expect(result.source).toBeInstanceOf(Array);
    expect(result.source.length).toBe(2);
  });

  it('parses geo location', () => {
    expect(result.geoLocation).toBeDefined();
    expect(result.geoLocation!.coordinates).toBeInstanceOf(Array);
    expect(result.geoLocation!.coordinates!.length).toBe(2);
    expect(result.geoLocation!.coordinates![0]).toBeTypeOf('number');
    expect(result.geoLocation!.coordinates![1]).toBeTypeOf('number');
  });

  it('parses geo location name', () => {
    expect(result.geoLocation!.name).toBeTypeOf('string');
    expect(result.geoLocation!.name!.length).toBeGreaterThan(0);
  });

  it('parses owner', () => {
    expect(result.owner).toBeDefined();
    expect(result.owner!.actorId).toBeTypeOf('string');
  });

  it('parses quality/space fields', () => {
    expect(result.takesUpSpace === null || typeof result.takesUpSpace === 'boolean').toBe(true);
    expect(result.isOriginalQuality === null || typeof result.isOriginalQuality === 'boolean').toBe(true);
  });

  it('parses savedToYourPhotos', () => {
    expect(typeof result.savedToYourPhotos).toBe('boolean');
  });

  it('parses albums array', () => {
    expect(result.albums).toBeInstanceOf(Array);
  });
});

// ── EWgK9e — Bulk Media Info ──────────────────────────────────────────

describe('EWgK9e — bulkMediaInfo', () => {
  const result = parser(EWgK9e, 'EWgK9e') as BulkMediaInfo[];

  it('parses array of items', () => {
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(16);
  });

  it('parses all items with required fields', () => {
    for (const item of result) {
      expect(item.mediaKey).toBeTypeOf('string');
      expect(item.mediaKey.length).toBeGreaterThan(0);
    }
  });

  it('parses filenames', () => {
    const withName = result.find((i) => i.fileName != null);
    expect(withName).toBeDefined();
    expect(withName!.fileName).toBeTypeOf('string');
    expect(withName!.fileName!.length).toBeGreaterThan(0);
  });

  it('parses file sizes', () => {
    const withSize = result.find((i) => i.size != null);
    expect(withSize).toBeDefined();
    expect(withSize!.size).toBeTypeOf('number');
    expect(withSize!.size!).toBeGreaterThan(0);
  });

  it('parses timestamps', () => {
    const withTs = result.find((i) => i.timestamp != null);
    expect(withTs).toBeDefined();
    expect(withTs!.timestamp).toBeTypeOf('number');
    expect(withTs!.creationTimestamp).toBeTypeOf('number');
  });

  it('parses quality/space fields', () => {
    const withQuality = result.find((i) => i.isOriginalQuality != null);
    expect(withQuality).toBeDefined();
    expect(withQuality!.isOriginalQuality === null || typeof withQuality!.isOriginalQuality === 'boolean').toBe(true);
    expect(withQuality!.takesUpSpace === null || typeof withQuality!.takesUpSpace === 'boolean').toBe(true);
  });

  it('all mediaKeys are unique', () => {
    const keys = result.map((i) => i.mediaKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

// ── dnv2s — Download Token Check ──────────────────────────────────────

describe('dnv2s — downloadTokenCheckParse', () => {
  it('parses completed download token', () => {
    const result = parser(dnv2s, 'dnv2s') as DownloadTokenCheck;
    expect(result).toBeDefined();
    expect(result.fileName).toBeTypeOf('string');
    expect(result.fileName!.length).toBeGreaterThan(0);
    expect(result.downloadUrl).toBeTypeOf('string');
    expect(result.downloadUrl!.length).toBeGreaterThan(0);
    expect(result.downloadSize).toBeTypeOf('number');
    expect(result.downloadSize!).toBeGreaterThan(0);
    expect(result.unzippedSize).toBeTypeOf('number');
    expect(result.unzippedSize!).toBeGreaterThan(0);
  });

  it('handles pending download (missing fields)', () => {
    const result = parser(dnv2sPending, 'dnv2s') as DownloadTokenCheck;
    expect(result).toBeDefined();
    // Pending response has no download data
    expect(result.fileName).toBeUndefined();
    expect(result.downloadUrl).toBeUndefined();
    expect(result.downloadSize).toBeUndefined();
    expect(result.unzippedSize).toBeUndefined();
  });
});

// ── EzwWhf — Storage Quota ────────────────────────────────────────────

describe('EzwWhf — storageQuotaParse', () => {
  const result = parser(EzwWhf, 'EzwWhf') as StorageQuota;

  it('parses storage quota', () => {
    expect(result).toBeDefined();
    expect(result.totalUsed).toBeTypeOf('number');
    expect(result.totalAvailable).toBeTypeOf('number');
    expect(result.usedByGPhotos).toBeTypeOf('number');
  });

  it('has sensible values', () => {
    expect(result.totalUsed!).toBeGreaterThan(0);
    expect(result.totalAvailable!).toBeGreaterThan(0);
    expect(result.totalAvailable!).toBeGreaterThanOrEqual(result.totalUsed!);
    expect(result.usedByGPhotos!).toBeLessThanOrEqual(result.totalUsed!);
  });
});

// ── swbisb — Remote Matches ──────────────────────────────────────────

describe('swbisb — remoteMatchesParse', () => {
  const result = parser(swbisb, 'swbisb') as RemoteMatch[];

  it('parses array of matches', () => {
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(4);
  });

  it('parses all matches with required fields', () => {
    for (const match of result) {
      expect(match.hash).toBeTypeOf('string');
      expect(match.hash!.length).toBeGreaterThan(0);
      expect(match.mediaKey).toBeTypeOf('string');
      expect(match.mediaKey!.length).toBeGreaterThan(0);
    }
  });

  it('parses thumbnail and resolution', () => {
    const withThumb = result.find((m) => m.thumb != null);
    expect(withThumb).toBeDefined();
    expect(withThumb!.thumb).toBeTypeOf('string');
    expect(withThumb!.resWidth).toBeTypeOf('number');
    expect(withThumb!.resHeight).toBeTypeOf('number');
  });

  it('parses timestamps', () => {
    const withTs = result.find((m) => m.timestamp != null);
    expect(withTs).toBeDefined();
    expect(withTs!.timestamp).toBeTypeOf('number');
    expect(withTs!.dedupKey).toBeTypeOf('string');
  });
});
