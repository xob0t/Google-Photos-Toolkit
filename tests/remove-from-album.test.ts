import { describe, it, expect, vi } from 'vitest';

// api-utils transitively imports windowGlobalData, which reads the Tampermonkey
// `unsafeWindow` global at module load. Stub it so the module loads under Node.
vi.mock('../src/windowGlobalData', () => ({ windowGlobalData: {} }));

import ApiUtils from '../src/api/api-utils';
import type Core from '../src/gptk-core';
import type { ApiSettings, MediaItem } from '../src/types';

function makeItem(mediaKey: string): MediaItem {
  return { mediaKey, dedupKey: `dedup-${mediaKey}`, timestamp: 0, creationTimestamp: 0 };
}

const settings: ApiSettings = {
  maxConcurrentSingleApiReq: 1,
  maxConcurrentBatchApiReq: 3,
  operationSize: 2,
  lockedFolderOpSize: 100,
  infoSize: 5000,
};

describe('ApiUtils.removeFromAlbum', () => {
  it('removes items using their album-scoped mediaKey, chunked by operationSize', async () => {
    const core = { isProcessRunning: true } as unknown as Core;
    const apiUtils = new ApiUtils(core, settings);
    const spy = vi.spyOn(apiUtils.api, 'removeItemsFromAlbum').mockResolvedValue([]);

    await apiUtils.removeFromAlbum([makeItem('a'), makeItem('b'), makeItem('c')]);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, ['a', 'b']);
    expect(spy).toHaveBeenNthCalledWith(2, ['c']);
  });

  it('does nothing for an empty selection', async () => {
    const core = { isProcessRunning: true } as unknown as Core;
    const apiUtils = new ApiUtils(core, settings);
    const spy = vi.spyOn(apiUtils.api, 'removeItemsFromAlbum').mockResolvedValue([]);

    await apiUtils.removeFromAlbum([]);

    expect(spy).not.toHaveBeenCalled();
  });

  it('routes shared-album items to removeItemsFromSharedAlbum', async () => {
    const core = { isProcessRunning: true } as unknown as Core;
    const apiUtils = new ApiUtils(core, settings);
    const regular = vi.spyOn(apiUtils.api, 'removeItemsFromAlbum').mockResolvedValue([]);
    const shared = vi.spyOn(apiUtils.api, 'removeItemsFromSharedAlbum').mockResolvedValue([]);

    await apiUtils.removeFromAlbum([
      { ...makeItem('a'), sourceAlbumMediaKey: 'ALB', sourceAlbumIsShared: true },
      { ...makeItem('b'), sourceAlbumMediaKey: 'ALB', sourceAlbumIsShared: true },
    ]);

    expect(regular).not.toHaveBeenCalled();
    expect(shared).toHaveBeenCalledWith('ALB', ['a', 'b']);
  });

  it('routes each source album to the matching RPC', async () => {
    const core = { isProcessRunning: true } as unknown as Core;
    const apiUtils = new ApiUtils(core, settings);
    const regular = vi.spyOn(apiUtils.api, 'removeItemsFromAlbum').mockResolvedValue([]);
    const shared = vi.spyOn(apiUtils.api, 'removeItemsFromSharedAlbum').mockResolvedValue([]);

    await apiUtils.removeFromAlbum([
      { ...makeItem('a'), sourceAlbumMediaKey: 'REG', sourceAlbumIsShared: false },
      { ...makeItem('s'), sourceAlbumMediaKey: 'SHARED', sourceAlbumIsShared: true },
    ]);

    expect(regular).toHaveBeenCalledWith(['a']);
    expect(shared).toHaveBeenCalledWith('SHARED', ['s']);
  });
});
