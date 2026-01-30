import Api from './api';
import log from '../ui/logic/log';
import splitArrayIntoChunks from '../utils/splitArrayIntoChunks';
import { apiSettingsDefault } from './api-utils-default-presets';
import type { MediaItem, Album, SharedLink, ApiSettings, PaginatedPage, ItemInfoExt, BulkMediaInfo } from '../types';
import type Core from '../gptk-core';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */

export default class ApiUtils {
  api: Api;
  core: Core;
  maxConcurrentSingleApiReq: number;
  maxConcurrentBatchApiReq: number;
  operationSize: number;
  lockedFolderOpSize: number;
  infoSize: number;

  constructor(core: Core, settings?: ApiSettings) {
    this.api = new Api();
    this.core = core;

    const resolvedSettings = settings ?? apiSettingsDefault;
    this.maxConcurrentSingleApiReq = Math.floor(Number(resolvedSettings.maxConcurrentSingleApiReq));
    this.maxConcurrentBatchApiReq = Math.floor(Number(resolvedSettings.maxConcurrentBatchApiReq));
    this.operationSize = Math.floor(Number(resolvedSettings.operationSize));
    this.lockedFolderOpSize = Math.floor(Number(resolvedSettings.lockedFolderOpSize));
    this.infoSize = Math.floor(Number(resolvedSettings.infoSize));
  }

  async executeWithConcurrency(
    apiMethod: (...args: any[]) => Promise<any>,
    operationSize: number,
    itemsArray: any[],
    ...args: any[]
  ): Promise<any[]> {
    const promisePool = new Set<Promise<void>>();
    const results: any[] = [];
    const chunkedItems = splitArrayIntoChunks(itemsArray, operationSize);
    // FIX #9: Use strict equality
    const maxConcurrentApiReq =
      operationSize === 1 ? this.maxConcurrentSingleApiReq : this.maxConcurrentBatchApiReq;

    for (const chunk of chunkedItems) {
      if (!this.core.isProcessRunning) return results;

      while (promisePool.size >= maxConcurrentApiReq) {
        await Promise.race(promisePool);
      }

      // FIX #9: Use strict equality
      if (operationSize !== 1) log(`Processing ${chunk.length} items`);

      const promise = apiMethod.call(this.api, chunk, ...args);
      promisePool.add(promise);

      promise
        .then((result: any) => {
          // FIX #81/#100/#108: Guard against null/non-iterable results.
          // When the API returns null (rate-limited, error response),
          // `results.push(...null)` threw "result is not iterable".
          if (result == null) {
            log(`Null result from ${apiMethod.name}, skipping chunk`, 'error');
          } else if (!Array.isArray(result)) {
            log(`Non-array result from ${apiMethod.name}, skipping chunk`, 'error');
          } else {
            results.push(...result);
            if (operationSize === 1 && results.length % 100 === 0) {
              log(`Processed ${results.length} items`);
            }
          }
        })
        .catch((error: Error) => {
          log(`${apiMethod.name} Api error ${String(error)}`, 'error');
        })
        .finally(() => {
          promisePool.delete(promise);
        });
    }
    await Promise.all(promisePool);
    return results;
  }

  async getAllItems<T>(
    apiMethod: (...args: any[]) => Promise<PaginatedPage<T>>,
    ...args: any[]
  ): Promise<T[]> {
    const items: T[] = [];
    let nextPageId: string | undefined;
    do {
      if (!this.core.isProcessRunning) return items;
      try {
        const page = await apiMethod.call(this.api, ...args, nextPageId);
        if (page?.items && page.items.length > 0) {
          log(`Found ${page.items.length} items`);
          items.push(...page.items);
        }
        nextPageId = page?.nextPageId;
      } catch (error) {
        log(`Error fetching page, skipping: ${error instanceof Error ? error.message : String(error)}`, 'error');
        // Stop pagination — we can't get nextPageId from a failed request
        break;
      }
    } while (nextPageId);
    return items;
  }

  async getAllAlbums(): Promise<Album[]> {
    return await this.getAllItems<Album>(this.api.getAlbums.bind(this.api));
  }

  async getAllSharedLinks(): Promise<SharedLink[]> {
    return await this.getAllItems<SharedLink>(this.api.getSharedLinks.bind(this.api));
  }

  async getAllMediaInSharedLink(sharedLinkId: string): Promise<MediaItem[]> {
    return await this.getAllItems<MediaItem>(this.api.getAlbumPage.bind(this.api), sharedLinkId);
  }

  async getAllMediaInAlbum(albumMediaKey: string): Promise<MediaItem[]> {
    return await this.getAllItems<MediaItem>(this.api.getAlbumPage.bind(this.api), albumMediaKey);
  }

  async getAllTrashItems(): Promise<MediaItem[]> {
    return await this.getAllItems<MediaItem>(this.api.getTrashItems.bind(this.api));
  }

  async getAllFavoriteItems(): Promise<MediaItem[]> {
    return await this.getAllItems<MediaItem>(this.api.getFavoriteItems.bind(this.api));
  }

  async getAllSearchItems(searchQuery: string): Promise<MediaItem[]> {
    return await this.getAllItems<MediaItem>(this.api.search.bind(this.api), searchQuery);
  }

  async getAllLockedFolderItems(): Promise<MediaItem[]> {
    return await this.getAllItems<MediaItem>(this.api.getLockedFolderItems.bind(this.api));
  }

  async moveToLockedFolder(mediaItems: MediaItem[]): Promise<void> {
    log(`Moving ${mediaItems.length} items to locked folder`);
    const dedupKeyArray = mediaItems.map((item) => item.dedupKey);
    await this.executeWithConcurrency(this.api.moveToLockedFolder.bind(this.api), this.lockedFolderOpSize, dedupKeyArray);
  }

  async removeFromLockedFolder(mediaItems: MediaItem[]): Promise<void> {
    log(`Moving ${mediaItems.length} items out of locked folder`);
    const dedupKeyArray = mediaItems.map((item) => item.dedupKey);
    await this.executeWithConcurrency(this.api.removeFromLockedFolder.bind(this.api), this.lockedFolderOpSize, dedupKeyArray);
  }

  async moveToTrash(mediaItems: MediaItem[]): Promise<void> {
    log(`Moving ${mediaItems.length} items to trash`);
    const dedupKeyArray = mediaItems.map((item) => item.dedupKey);
    await this.executeWithConcurrency(this.api.moveItemsToTrash.bind(this.api), this.operationSize, dedupKeyArray);
  }

  async restoreFromTrash(trashItems: MediaItem[]): Promise<void> {
    log(`Restoring ${trashItems.length} items from trash`);
    const dedupKeyArray = trashItems.map((item) => item.dedupKey);
    await this.executeWithConcurrency(this.api.restoreFromTrash.bind(this.api), this.operationSize, dedupKeyArray);
  }

  async sendToArchive(mediaItems: MediaItem[]): Promise<void> {
    log(`Sending ${mediaItems.length} items to archive`);
    const filtered = mediaItems.filter((item) => item?.isArchived !== true);
    // FIX #5: Use .length check — empty array is truthy
    if (filtered.length === 0) {
      log('All target items are already archived');
      return;
    }
    const dedupKeyArray = filtered.map((item) => item.dedupKey);
    await this.executeWithConcurrency(this.api.setArchive.bind(this.api), this.operationSize, dedupKeyArray, true);
  }

  async unArchive(mediaItems: MediaItem[]): Promise<void> {
    log(`Removing ${mediaItems.length} items from archive`);
    const filtered = mediaItems.filter((item) => item?.isArchived !== false);
    // FIX #5: Use .length check — empty array is truthy
    if (filtered.length === 0) {
      log('All target items are not archived');
      return;
    }
    const dedupKeyArray = filtered.map((item) => item.dedupKey);
    await this.executeWithConcurrency(this.api.setArchive.bind(this.api), this.operationSize, dedupKeyArray, false);
  }

  async setAsFavorite(mediaItems: MediaItem[]): Promise<void> {
    log(`Setting ${mediaItems.length} items as favorite`);
    const filtered = mediaItems.filter((item) => item?.isFavorite !== true);
    // FIX #5: Use .length check — empty array is truthy
    if (filtered.length === 0) {
      log('All target items are already favorite');
      return;
    }
    const dedupKeyArray = filtered.map((item) => item.dedupKey);
    await this.executeWithConcurrency(this.api.setFavorite.bind(this.api), this.operationSize, dedupKeyArray, true);
  }

  async unFavorite(mediaItems: MediaItem[]): Promise<void> {
    log(`Removing ${mediaItems.length} items from favorites`);
    const filtered = mediaItems.filter((item) => item?.isFavorite !== false);
    // FIX #5: Use .length check — empty array is truthy
    if (filtered.length === 0) {
      log('All target items are not favorite');
      return;
    }
    const dedupKeyArray = filtered.map((item) => item.dedupKey);
    await this.executeWithConcurrency(this.api.setFavorite.bind(this.api), this.operationSize, dedupKeyArray, false);
  }

  /**
   * Google Photos albums have a hard limit of 20,000 items.
   * When the item count would exceed this, we split across
   * sequentially numbered albums.
   *
   * @see https://developers.google.com/photos/library/guides/manage-albums#adding-items-to-album
   * Fixes #2.
   */
  private static readonly ALBUM_ITEM_LIMIT = 20_000;

  async addToExistingAlbum(
    mediaItems: MediaItem[],
    targetAlbum: Album,
    preserveOrder = false
  ): Promise<void> {
    const existingCount = targetAlbum.itemCount ?? 0;
    const remaining = Math.max(0, ApiUtils.ALBUM_ITEM_LIMIT - existingCount);

    if (mediaItems.length <= remaining) {
      // Everything fits in the target album
      await this.addItemsToSingleAlbum(mediaItems, targetAlbum, preserveOrder);
    } else {
      // Split: fill the current album, then overflow into new albums
      const firstBatch = mediaItems.slice(0, remaining);
      const overflow = mediaItems.slice(remaining);

      if (firstBatch.length > 0) {
        log(`Album "${targetAlbum.title}" can accept ${remaining} more items (limit: ${ApiUtils.ALBUM_ITEM_LIMIT})`);
        await this.addItemsToSingleAlbum(firstBatch, targetAlbum, preserveOrder);
      }

      // Create overflow albums
      const overflowChunks = splitArrayIntoChunks(overflow, ApiUtils.ALBUM_ITEM_LIMIT);
      for (let i = 0; i < overflowChunks.length; i++) {
        const chunk = overflowChunks[i];
        const overflowName = `${targetAlbum.title} (${i + 2})`;
        log(`Creating overflow album "${overflowName}" for ${chunk.length} items`);
        const newAlbumMediaKey = await this.api.createAlbum(overflowName);
        const overflowAlbum: Album = {
          title: overflowName,
          isShared: false,
          mediaKey: newAlbumMediaKey,
          itemCount: 0,
        };
        await this.addItemsToSingleAlbum(chunk, overflowAlbum, preserveOrder);
      }
    }
  }

  private async addItemsToSingleAlbum(
    mediaItems: MediaItem[],
    targetAlbum: Album,
    preserveOrder: boolean
  ): Promise<void> {
    log(`Adding ${mediaItems.length} items to album "${targetAlbum.title}"`);
    const mediaKeyArray = mediaItems.map((item) => item.mediaKey);

    const addItemFunction = targetAlbum.isShared
      ? this.api.addItemsToSharedAlbum.bind(this.api)
      : this.api.addItemsToAlbum.bind(this.api);

    await this.executeWithConcurrency(addItemFunction, this.operationSize, mediaKeyArray, targetAlbum.mediaKey);

    if (preserveOrder) {
      log('Setting album item order');
      const albumItems = await this.getAllMediaInAlbum(targetAlbum.mediaKey);
      const orderMap = new Map<string, number>();
      mediaItems.forEach((item, index) => {
        orderMap.set(item.dedupKey, index);
      });
      const sortedAlbumItems = [...albumItems].sort((a, b) => {
        const indexA = orderMap.get(a.dedupKey) ?? Infinity;
        const indexB = orderMap.get(b.dedupKey) ?? Infinity;
        return indexA - indexB;
      });
      const sortedMediaKeys = sortedAlbumItems.map((item) => item.mediaKey);
      for (const key of sortedMediaKeys.reverse()) {
        await this.api.setAlbumItemOrder(targetAlbum.mediaKey, [key]);
      }
    }
  }

  async addToNewAlbum(
    mediaItems: MediaItem[],
    targetAlbumName: string,
    preserveOrder = false
  ): Promise<void> {
    log(`Creating new album "${targetAlbumName}"`);
    const album: Album = {
      title: targetAlbumName,
      isShared: false,
      mediaKey: await this.api.createAlbum(targetAlbumName),
      itemCount: 0,
    };
    await this.addToExistingAlbum(mediaItems, album, preserveOrder);
  }

  async getBatchMediaInfoChunked(mediaItems: MediaItem[]): Promise<BulkMediaInfo[]> {
    log("Getting items' media info");
    const mediaKeyArray = mediaItems.map((item) => item.mediaKey);
    const mediaInfoData = await this.executeWithConcurrency(this.api.getBatchMediaInfo.bind(this.api), this.infoSize, mediaKeyArray);
    return mediaInfoData;
  }

  private async copyOneDescriptionFromOther(mediaItems: MediaItem[]): Promise<[boolean]> {
    // This method returns an array containing a single boolean indicating
    // whether the description was copied.
    try {
      const item = mediaItems[0];
      const itemInfoExt: ItemInfoExt = await this.api.getItemInfoExt(item.mediaKey);
      // Only copy the description if the Google Photos description field
      // is empty and the 'Other' description is non-empty.
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- intentional: empty string should be falsy
      if (itemInfoExt.descriptionFull || !itemInfoExt.other) {
        return [false];
      }
      // Adding a zero-width space (U+200B) since the Google Photos API
      // doesn't allow the description to be identical to the "Other" field.
      const description = itemInfoExt.other + '\u200B';
      await this.api.setItemDescription(item.dedupKey, description);
      return [true];
    } catch (error) {
      console.error('Error in copyOneDescriptionFromOther:', error);
      throw error;
    }
  }

  async copyDescriptionFromOther(mediaItems: MediaItem[]): Promise<void> {
    log(`Copying up to ${mediaItems.length} descriptions from 'Other' field`);
    const results = await this.executeWithConcurrency(
      this.copyOneDescriptionFromOther.bind(this),
      1,
      mediaItems
    );
    log(`Copied ${results.filter(Boolean).length} descriptions from 'Other' field`);
  }
}
