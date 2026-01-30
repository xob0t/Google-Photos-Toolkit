import Api from './api/api';
import ApiUtils from './api/api-utils';
import { timeToHHMMSS, isPatternValid } from './utils/helpers';
import log from './ui/logic/log';
import * as filters from './filters';
import { apiSettingsDefault } from './api/api-utils-default-presets';
import type { MediaItem, Filter, Source, Action, Album, ApiSettings, LibraryTimelinePage } from './types';

// Action handler strategy map (FIX #10: replaces sequential if-chain)
type ActionHandler = (params: ExecuteActionParams) => Promise<void>;

interface ExecuteActionParams {
  mediaItems: MediaItem[];
  source: Source;
  targetAlbum?: Album;
  newTargetAlbumName?: string;
  preserveOrder: boolean;
}

export default class Core {
  isProcessRunning: boolean;
  api: Api;
  apiUtils!: ApiUtils;

  private actionHandlers: Record<string, ActionHandler>;

  constructor() {
    this.isProcessRunning = false;
    this.api = new Api();

    // Strategy map for actions — avoids sequential if-chain
    this.actionHandlers = {
      restoreTrash: async (p) => this.apiUtils.restoreFromTrash(p.mediaItems),
      unLock: async (p) => this.apiUtils.removeFromLockedFolder(p.mediaItems),
      lock: async (p) => this.apiUtils.moveToLockedFolder(p.mediaItems),
      toExistingAlbum: async (p) => {
        if (!p.targetAlbum) throw new Error('No target album specified');
        await this.apiUtils.addToExistingAlbum(p.mediaItems, p.targetAlbum, p.preserveOrder);
      },
      toNewAlbum: async (p) => {
        if (!p.newTargetAlbumName) throw new Error('No album name specified');
        await this.apiUtils.addToNewAlbum(p.mediaItems, p.newTargetAlbumName, p.preserveOrder);
      },
      toTrash: async (p) => this.apiUtils.moveToTrash(p.mediaItems),
      toArchive: async (p) => this.apiUtils.sendToArchive(p.mediaItems),
      unArchive: async (p) => this.apiUtils.unArchive(p.mediaItems),
      toFavorite: async (p) => this.apiUtils.setAsFavorite(p.mediaItems),
      unFavorite: async (p) => this.apiUtils.unFavorite(p.mediaItems),
      copyDescFromOther: async (p) => this.apiUtils.copyDescriptionFromOther(p.mediaItems),
    };
  }

  async getAndFilterMedia(filter: Filter, source: Source): Promise<MediaItem[]> {
    const mediaItems = await this.fetchMediaItems(source, filter);
    log(`Found items: ${mediaItems.length}`);
    if (!this.isProcessRunning || !mediaItems?.length) return mediaItems;

    const filteredItems = await this.applyFilters(mediaItems, filter, source);
    return filteredItems;
  }

  async fetchMediaItems(source: Source, filter: Filter): Promise<MediaItem[]> {
    const sourceHandlers: Record<Source, () => Promise<MediaItem[]>> = {
      library: async () => {
        log('Reading library');
        return filter.dateType === 'uploaded'
          ? await this.getLibraryItemsByUploadDate(filter)
          : await this.getLibraryItemsByTakenDate(filter);
      },
      search: async () => {
        log('Reading search results');
        return await this.apiUtils.getAllSearchItems(filter.searchQuery ?? '');
      },
      trash: async () => {
        log('Getting trash items');
        return await this.apiUtils.getAllTrashItems();
      },
      lockedFolder: async () => {
        log('Getting locked folder items');
        return await this.apiUtils.getAllLockedFolderItems();
      },
      favorites: async () => {
        log('Getting favorite items');
        return await this.apiUtils.getAllFavoriteItems();
      },
      sharedLinks: async () => {
        log('Getting shared links');
        const sharedLinks = await this.apiUtils.getAllSharedLinks();
        if (!sharedLinks || sharedLinks.length === 0) {
          log('No shared links found', 'error');
          return [];
        }
        log(`Shared Links Found: ${sharedLinks.length}`);
        const sharedLinkItems = await Promise.all(
          sharedLinks.map(async (sharedLink) => {
            log('Getting shared link items');
            return await this.apiUtils.getAllMediaInSharedLink(sharedLink.linkId);
          })
        );
        return sharedLinkItems.flat();
      },
      albums: async () => {
        if (!filter.albumsInclude) {
          log('No target album!', 'error');
          throw new Error('no target album');
        }
        const albumMediaKeys = Array.isArray(filter.albumsInclude) ? filter.albumsInclude : [filter.albumsInclude];
        const albumItems = await Promise.all(
          albumMediaKeys.map(async (albumMediaKey) => {
            log('Getting album items');
            return await this.apiUtils.getAllMediaInAlbum(albumMediaKey);
          })
        );
        return albumItems.flat();
      },
    };

    const handler = sourceHandlers[source];
    if (!handler) {
      log(`Unknown source: ${source}`, 'error');
      return [];
    }

    const mediaItems = await handler();
    log('Source read complete');
    return mediaItems;
  }

  async applyFilters(mediaItems: MediaItem[], filter: Filter, source: Source): Promise<MediaItem[]> {
    let filteredItems = mediaItems;

    const filtersToApply: Array<{ condition: boolean; method: () => MediaItem[] | Promise<MediaItem[]> }> = [
      {
        condition: source !== 'library' && Boolean(filter.lowerBoundaryDate ?? filter.higherBoundaryDate),
        method: () => filters.filterByDate(filteredItems, filter),
      },
      {
        condition: !!filter.albumsExclude,
        method: async () => await this.excludeAlbumItems(filteredItems, filter),
      },
      {
        condition: !!filter.excludeShared,
        method: async () => await this.excludeSharedItems(filteredItems),
      },
      {
        condition: !!filter.owned,
        method: () => filters.filterOwned(filteredItems, filter),
      },
      {
        condition: !!filter.uploadStatus,
        method: () => filters.filterByUploadStatus(filteredItems, filter),
      },
      {
        condition: !!filter.archived,
        method: () => filters.filterArchived(filteredItems, filter),
      },
      {
        condition: Boolean(filter.favorite ?? filter.excludeFavorites),
        method: () => filters.filterFavorite(filteredItems, filter),
      },
      {
        condition: !!filter.type,
        method: () => filters.filterByMediaType(filteredItems, filter),
      },
    ];

    // Apply basic filters
    for (const { condition, method } of filtersToApply) {
      if (condition && filteredItems.length) {
        filteredItems = await method();
      }
    }

    // Apply filters based on extended media info
    if (
      filteredItems.length &&
      (filter.space ?? filter.quality ?? filter.lowerBoundarySize ?? filter.higherBoundarySize ?? filter.fileNameRegex ?? filter.descriptionRegex)
    ) {
      filteredItems = await this.extendMediaItemsWithMediaInfo(filteredItems);

      const extendedFilters: Array<{ condition: boolean; method: () => MediaItem[] }> = [
        { condition: !!filter.fileNameRegex, method: () => filters.fileNameFilter(filteredItems, filter) },
        { condition: !!filter.descriptionRegex, method: () => filters.descriptionFilter(filteredItems, filter) },
        { condition: !!filter.space, method: () => filters.spaceFilter(filteredItems, filter) },
        { condition: !!filter.quality, method: () => filters.qualityFilter(filteredItems, filter) },
        {
          condition: Boolean(filter.lowerBoundarySize ?? filter.higherBoundarySize),
          method: () => filters.sizeFilter(filteredItems, filter),
        },
      ];

      for (const { condition, method } of extendedFilters) {
        if (condition && filteredItems.length) {
          filteredItems = method();
        }
      }
    }

    if (filter.sortBySize && filteredItems.length) {
      filteredItems = await this.extendMediaItemsWithMediaInfo(filteredItems);
      filteredItems.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
    }

    // FIX #7: Added missing `await` for filterSimilar (was returning a Promise instead of results)
    if (filteredItems.length > 0 && filter.similarityThreshold) {
      filteredItems = await filters.filterSimilar(this, filteredItems, filter);
    }

    return filteredItems;
  }

  async excludeAlbumItems(mediaItems: MediaItem[], filter: Filter): Promise<MediaItem[]> {
    const itemsToExclude: MediaItem[] = [];
    const albumMediaKeys = Array.isArray(filter.albumsExclude) ? filter.albumsExclude : [filter.albumsExclude ?? ''];

    await Promise.all(
      albumMediaKeys.map(async (albumMediaKey) => {
        log('Getting album items to exclude');
        const excludedItems = await this.apiUtils.getAllMediaInAlbum(albumMediaKey);
        itemsToExclude.push(...excludedItems);
      })
    );

    log('Excluding album items');
    return mediaItems.filter((mediaItem) => !itemsToExclude.some((excludeItem) => excludeItem.dedupKey === mediaItem.dedupKey));
  }

  async excludeSharedItems(mediaItems: MediaItem[]): Promise<MediaItem[]> {
    log('Getting shared links items to exclude');
    const itemsToExclude: MediaItem[] = [];
    const sharedLinks = await this.apiUtils.getAllSharedLinks();

    await Promise.all(
      sharedLinks.map(async (sharedLink) => {
        const sharedLinkItems = await this.apiUtils.getAllMediaInSharedLink(sharedLink.linkId);
        itemsToExclude.push(...sharedLinkItems);
      })
    );

    log('Excluding shared items');
    return mediaItems.filter((mediaItem) => !itemsToExclude.some((excludeItem) => excludeItem.dedupKey === mediaItem.dedupKey));
  }

  async extendMediaItemsWithMediaInfo(mediaItems: MediaItem[]): Promise<MediaItem[]> {
    const mediaInfoData = await this.apiUtils.getBatchMediaInfoChunked(mediaItems);

    const extendedMediaItems = mediaItems.map((item) => {
      const matchingInfoItem = mediaInfoData.find((infoItem) => infoItem.mediaKey === item.mediaKey);
      return { ...item, ...matchingInfoItem };
    });
    return extendedMediaItems;
  }

  async getLibraryItemsByTakenDate(filter: Filter): Promise<MediaItem[]> {
    let source: string | undefined;
    if (filter.archived === 'true') {
      source = 'archive';
    } else if (filter.archived === 'false') {
      source = 'library';
    }

    let lowerBoundaryDate = new Date(filter.lowerBoundaryDate ?? '').getTime();
    let higherBoundaryDate = new Date(filter.higherBoundaryDate ?? '').getTime();

    lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
    higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;

    const mediaItems: MediaItem[] = [];

    let nextPageId: string | null = null;

    // FIX #1: Fixed operator precedence bug.
    // Before: Number.isInteger(lowerBoundaryDate || Number.isInteger(higherBoundaryDate))
    // The inner Number.isInteger was evaluated first, producing a boolean, which was
    // then OR'd with lowerBoundaryDate and passed to the outer Number.isInteger.
    if ((Number.isInteger(lowerBoundaryDate) || Number.isInteger(higherBoundaryDate)) && filter.intervalType === 'include') {
      let nextPageTimestamp: number | null = higherBoundaryDate !== Infinity ? higherBoundaryDate : null;
      do {
        if (!this.isProcessRunning) return mediaItems;
        const mediaPage: LibraryTimelinePage = await this.api.getItemsByTakenDate(nextPageTimestamp, source ?? null, nextPageId);
        nextPageId = mediaPage?.nextPageId ?? null;
        if (!mediaPage) break;
        nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
        if (!mediaPage.items || mediaPage.items.length === 0) continue;
        mediaPage.items = mediaPage.items.filter((item) => item.timestamp >= lowerBoundaryDate && item.timestamp <= higherBoundaryDate);
        if (!mediaPage.items || mediaPage.items.length === 0) continue;
        log(`Found ${mediaPage.items.length} items`);
        mediaItems.push(...mediaPage.items);
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- intentional boolean OR
      } while ((nextPageId && !nextPageTimestamp) || (nextPageTimestamp && nextPageTimestamp > lowerBoundaryDate));
    } else if ((Number.isInteger(lowerBoundaryDate) || Number.isInteger(higherBoundaryDate)) && filter.intervalType === 'exclude') {
      let nextPageTimestamp: number | null = null;
      do {
        if (!this.isProcessRunning) return mediaItems;
        const mediaPage: LibraryTimelinePage = await this.api.getItemsByTakenDate(nextPageTimestamp, source ?? null, nextPageId);
        nextPageId = mediaPage?.nextPageId ?? null;
        if (!mediaPage) break;
        nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
        if (!mediaPage.items || mediaPage.items.length === 0) continue;
        mediaPage.items = mediaPage.items.filter((item) => item.timestamp < lowerBoundaryDate || item.timestamp > higherBoundaryDate);

        if (nextPageTimestamp > lowerBoundaryDate && nextPageTimestamp < higherBoundaryDate) {
          nextPageTimestamp = lowerBoundaryDate;
        } else {
          nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
        }

        if (!mediaPage.items || mediaPage.items.length === 0) continue;

        log(`Found ${mediaPage.items.length} items`);
        mediaItems.push(...mediaPage.items);
      } while (nextPageId);
    } else {
      let nextPageTimestamp: number | null = null;
      do {
        if (!this.isProcessRunning) return mediaItems;
        const mediaPage: LibraryTimelinePage = await this.api.getItemsByTakenDate(nextPageTimestamp, source ?? null, nextPageId);
        nextPageId = mediaPage?.nextPageId ?? null;
        if (!mediaPage) break;
        nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
        if (!mediaPage.items || mediaPage.items.length === 0) continue;
        log(`Found ${mediaPage.items.length} items`);
        mediaItems.push(...mediaPage.items);
      } while (nextPageId);
    }

    return mediaItems;
  }

  async getLibraryItemsByUploadDate(filter: Filter): Promise<MediaItem[]> {
    let lowerBoundaryDate = new Date(filter.lowerBoundaryDate ?? '').getTime();
    let higherBoundaryDate = new Date(filter.higherBoundaryDate ?? '').getTime();

    lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
    higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;

    const mediaItems: MediaItem[] = [];

    let nextPageId: string | null = null;
    let skipTheRest = false;

    do {
      if (!this.isProcessRunning) return mediaItems;
      const mediaPage = await this.api.getItemsByUploadedDate(nextPageId);
      nextPageId = mediaPage?.nextPageId ?? null;
      if (!mediaPage) break;
      if (!mediaPage.items || mediaPage.items.length === 0) continue;
      const lastTimeStamp = mediaPage.items[mediaPage.items.length - 1].creationTimestamp;
      let filteredPageItems = mediaPage.items;
      if (filter.intervalType === 'include') {
        filteredPageItems = mediaPage.items.filter(
          (item: MediaItem) => item.creationTimestamp >= lowerBoundaryDate && item.creationTimestamp <= higherBoundaryDate
        );
        skipTheRest = lastTimeStamp < lowerBoundaryDate;
      } else if (filter.intervalType === 'exclude') {
        filteredPageItems = mediaPage.items.filter(
          (item: MediaItem) => item.creationTimestamp < lowerBoundaryDate || item.creationTimestamp > higherBoundaryDate
        );
      }
      if (!filteredPageItems || filteredPageItems.length === 0) continue;
      log(`Found ${filteredPageItems.length} items`);
      mediaItems.push(...filteredPageItems);
    } while (nextPageId && !skipTheRest);

    return mediaItems;
  }

  preChecks(filter: Filter): void {
    if (filter.fileNameRegex) {
      const isValid = isPatternValid(filter.fileNameRegex);
      if (isValid !== true) throw new Error(String(isValid));
    }
    if (filter.descriptionRegex) {
      const isValid = isPatternValid(filter.descriptionRegex);
      if (isValid !== true) throw new Error(String(isValid));
    }
    if (parseInt(filter.lowerBoundarySize ?? '0') >= parseInt(filter.higherBoundarySize ?? '0') &&
        parseInt(filter.lowerBoundarySize ?? '0') > 0 && parseInt(filter.higherBoundarySize ?? '0') > 0) {
      throw new Error('Invalid Size Filter');
    }
  }

  async actionWithFilter(
    action: Action,
    filter: Filter,
    source: Source,
    targetAlbum?: Album,
    newTargetAlbumName?: string,
    apiSettings?: ApiSettings
  ): Promise<void> {
    try {
      this.preChecks(filter);
    } catch (error) {
      log(String(error), 'error');
      return;
    }

    this.isProcessRunning = true;
    // Dispatch event to update the UI without importing it
    document.dispatchEvent(new Event('change'));
    this.apiUtils = new ApiUtils(this, apiSettings ?? apiSettingsDefault);

    try {
      const startTime = new Date();
      const mediaItems = await this.getAndFilterMedia(filter, source);

      // Early exit if no items to process
      if (!mediaItems?.length) {
        log('No items to process');
        return;
      }

      // Exit if process was stopped externally
      if (!this.isProcessRunning) return;

      // Execute the appropriate action
      await this.executeAction(action, {
        mediaItems,
        source,
        targetAlbum,
        newTargetAlbumName,
        preserveOrder: Boolean(filter.similarityThreshold ?? filter.sortBySize),
      });

      log(`Task completed in ${timeToHHMMSS(new Date().getTime() - startTime.getTime())}`, 'success');
    } catch (error) {
      log((error instanceof Error ? error.stack : String(error)) ?? 'Unknown error', 'error');
    } finally {
      this.isProcessRunning = false;
    }
  }

  async executeAction(action: Action, params: ExecuteActionParams): Promise<void> {
    log(`Items to process: ${params.mediaItems.length}`);

    // Use strategy map — also handle special cases for source-based actions
    let actionId = action.elementId;
    if (actionId === 'restoreTrash' || params.source === 'trash') actionId = 'restoreTrash';
    if (actionId === 'unLock' || params.source === 'lockedFolder') actionId = 'unLock';

    const handler = this.actionHandlers[actionId];
    if (handler) {
      await handler(params);
    } else {
      log(`Unknown action: ${actionId}`, 'error');
    }
  }
}
