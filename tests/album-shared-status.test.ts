import { describe, it, expect, vi } from 'vitest';

// gptk-core transitively imports windowGlobalData (reads Tampermonkey `unsafeWindow`);
// getFromStorage reads localStorage. Stub both so the module loads under Node.
vi.mock('../src/windowGlobalData', () => ({ windowGlobalData: {} }));
vi.mock('../src/utils/getFromStorage', () => ({ default: vi.fn(() => null) }));

import Core from '../src/gptk-core';
import type { Filter, Source } from '../src/types';

describe('Core albums source shared-status resolution', () => {
  it('fetches albums to resolve shared status when the cache is unavailable', async () => {
    const core = new Core();
    core.isProcessRunning = true;

    const getAllAlbums = vi.fn().mockResolvedValue([{ mediaKey: 'ALB', isShared: true }]);
    const getAllMediaInAlbumWithContext = vi.fn().mockResolvedValue({
      title: 'Shared Album',
      items: [{ mediaKey: 'item1', dedupKey: 'd1', timestamp: 0, creationTimestamp: 0 }],
    });
    core.apiUtils = { getAllAlbums, getAllMediaInAlbumWithContext } as unknown as Core['apiUtils'];

    const items = await core.fetchMediaItems('albums' as Source, { albumsInclude: 'ALB' } as Filter);

    // Cache was null, so the album list must be fetched to resolve shared status.
    expect(getAllAlbums).toHaveBeenCalledTimes(1);
    expect(items).toHaveLength(1);
    expect(items[0].sourceAlbumIsShared).toBe(true);
  });
});
