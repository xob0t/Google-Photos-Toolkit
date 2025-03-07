import Api from './api/api.js';
import ApiUtils from './api/api-utils.js';
import { timeToHHMMSS, isPatternValid } from './utils/helpers.js';
import log from './ui/logic/log.js';
import { apiSettingsDefault } from './api/api-utils-deafault-presets.js';

export default class Core {
  constructor() {
    this.isProcessRunning = false;
    this.api = new Api();
  }

  async getAndFilterMedia(filter, source) {
    const mediaItems = await this.fetchMediaItems(source, filter);
    log(`Found items: ${mediaItems.length}`);
    if (!this.isProcessRunning || !mediaItems?.length) return mediaItems;

    const filteredItems = await this.applyFilters(mediaItems, filter, source);
    return filteredItems;
  }

  async fetchMediaItems(source, filter) {
    const sourceHandlers = {
      library: async () => {
        log('Reading library');
        return filter.dateType === 'uploaded' ? await this.getLibraryItemsByUploadDate(filter) : await this.getLibraryItemsByTakenDate(filter);
      },
      search: async () => {
        log('Reading search results');
        return await this.apiUtils.getAllSearchItems(filter.searchQuery);
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
        if (!sharedLinks) {
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
          throw new Error('no target album!');
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

  async applyFilters(mediaItems, filter, source) {
    let filteredItems = mediaItems;

    const filtersToApply = [
      {
        condition: source !== 'library' && (filter.lowerBoundaryDate || filter.higherBoundaryDate),
        method: () => this.filterByDate(filteredItems, filter),
      },
      {
        condition: filter.albumsExclude,
        method: async () => await this.excludeAlbumItems(filteredItems, filter),
      },
      {
        condition: filter.excludeShared,
        method: async () => await this.excludeSharedItems(filteredItems),
      },
      {
        condition: filter.owned,
        method: () => this.filterOwned(filteredItems, filter),
      },
      {
        condition: filter.uploadStatus,
        method: () => this.filterByUploadStatus(filteredItems, filter),
      },
      {
        condition: filter.archived,
        method: () => this.filterArchived(filteredItems, filter),
      },
      {
        condition: filter.favorite || filter.excludeFavorites,
        method: () => this.filterFavorite(filteredItems, filter),
      },
      {
        condition: filter.type,
        method: () => this.filterByMediaType(filteredItems, filter),
      },
    ];

    let i = 0;
    do {
      const { condition, method } = filtersToApply[i];
      if (condition && filteredItems.length) {
        filteredItems = await method();
      }
      i++;
    } while (i < filtersToApply.length && filteredItems.length);

    // Apply filters based in extended media info (if applicable)
    if (
      filteredItems.length &&
      (filter.space || filter.quality || filter.lowerBoundarySize || filter.higherBoundarySize || filter.fileNameRegex || filter.descriptionRegex)
    ) {
      filteredItems = await this.extendMediaItemsWithMediaInfo(filteredItems);

      const extendedFilters = [
        { condition: filter.fileNameRegex, method: () => this.fileNameFilter(filteredItems, filter) },
        { condition: filter.descriptionRegex, method: () => this.descriptionFilter(filteredItems, filter) },
        { condition: filter.space, method: () => this.spaceFilter(filteredItems, filter) },
        { condition: filter.quality, method: () => this.qualityFilter(filteredItems, filter) },
        {
          condition: filter.lowerBoundarySize || filter.higherBoundarySize,
          method: () => this.sizeFilter(filteredItems, filter),
        },
      ];

      i = 0;
      do {
        const { condition, method } = extendedFilters[i];
        if (condition && filteredItems.length) {
          filteredItems = await method();
        }
        i++;
      } while (i < extendedFilters.length && filteredItems.length);
    }

    return filteredItems;
  }

  async excludeAlbumItems(mediaItems, filter) {
    const itemsToExclude = [];
    const albumMediaKeys = Array.isArray(filter.albumsExclude) ? filter.albumsExclude : [filter.albumsExclude];

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

  async excludeSharedItems(mediaItems) {
    log('Getting shared links items to exclude');
    const itemsToExclude = [];
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

  async extendMediaItemsWithMediaInfo(mediaItems) {
    const mediaInfoData = await this.apiUtils.getBatchMediaInfoChunked(mediaItems);

    const extendedMediaItems = mediaItems.map((item) => {
      const matchingInfoItem = mediaInfoData.find((infoItem) => infoItem.mediaKey === item.mediaKey);
      return { ...item, ...matchingInfoItem };
    });
    return extendedMediaItems;
  }

  async getLibraryItemsByTakenDate(filter) {
    let source;
    if (filter.archived === 'true') {
      source = 'archive';
    } else if (filter.archived === 'false') {
      source = 'library';
    }

    let lowerBoundaryDate = new Date(filter.lowerBoundaryDate).getTime();
    let higherBoundaryDate = new Date(filter.higherBoundaryDate).getTime();

    lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
    higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;

    const mediaItems = [];

    let nextPageId = null;

    if (Number.isInteger(lowerBoundaryDate || Number.isInteger(higherBoundaryDate)) && filter.intervalType === 'include') {
      let nextPageTimestamp = higherBoundaryDate !== Infinity ? higherBoundaryDate : null;
      do {
        if (!this.isProcessRunning) return;
        let mediaPage = await this.api.getItemsByTakenDate(nextPageTimestamp, source, nextPageId);
        nextPageId = mediaPage?.nextPageId;
        if (!mediaPage) break;
        nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
        mediaPage.items = mediaPage.items.filter((item) => item.timestamp >= lowerBoundaryDate && item.timestamp <= higherBoundaryDate);
        if (!mediaPage.items || mediaPage?.items?.length === 0) continue;
        log(`Found ${mediaPage?.items?.length} items`);
        mediaItems.push(...mediaPage.items);
      } while ((nextPageId && !nextPageTimestamp) || (nextPageTimestamp && nextPageTimestamp > lowerBoundaryDate));
    } else if (Number.isInteger(lowerBoundaryDate || Number.isInteger(higherBoundaryDate)) && filter.intervalType === 'exclude') {
      let nextPageTimestamp = null;
      do {
        if (!this.isProcessRunning) return;
        let mediaPage = await this.api.getItemsByTakenDate(nextPageTimestamp, source, nextPageId);
        nextPageId = mediaPage?.nextPageId;
        if (!mediaPage) break;
        nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
        mediaPage.items = mediaPage.items.filter((item) => item.timestamp < lowerBoundaryDate || item.timestamp > higherBoundaryDate);

        if (nextPageTimestamp > lowerBoundaryDate && nextPageTimestamp < higherBoundaryDate) {
          nextPageTimestamp = lowerBoundaryDate;
        } else {
          nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
        }

        if (!mediaPage.items || mediaPage?.items?.length === 0) continue;

        log(`Found ${mediaPage?.items?.length} items`);
        mediaItems.push(...mediaPage.items);
      } while (nextPageId);
    } else {
      let nextPageTimestamp = null;
      do {
        if (!this.isProcessRunning) return;
        let mediaPage = await this.api.getItemsByTakenDate(nextPageTimestamp, source, nextPageId);
        nextPageId = mediaPage?.nextPageId;
        if (!mediaPage) break;
        nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
        if (!mediaPage.items || mediaPage?.items?.length === 0) continue;
        log(`Found ${mediaPage?.items?.length} items`);
        mediaItems.push(...mediaPage.items);
      } while (nextPageId);
    }

    return mediaItems;
  }

  async getLibraryItemsByUploadDate(filter) {
    let lowerBoundaryDate = new Date(filter.lowerBoundaryDate).getTime();
    let higherBoundaryDate = new Date(filter.higherBoundaryDate).getTime();

    lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
    higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;

    const mediaItems = [];

    let nextPageId = null;

    let skipTheRest = false;

    do {
      if (!this.isProcessRunning) return;
      let mediaPage = await this.api.getItemsByUploadedDate(nextPageId);
      const lastTimeStamp = mediaPage.items.at(-1).creationTimestamp;
      nextPageId = mediaPage?.nextPageId;
      if (!mediaPage) break;
      if (filter.intervalType === 'include') {
        mediaPage.items = mediaPage.items.filter(
          (item) => item.creationTimestamp >= lowerBoundaryDate && item.creationTimestamp <= higherBoundaryDate
        );
        skipTheRest = lastTimeStamp < lowerBoundaryDate;
      } else if (filter.intervalType === 'exclude') {
        mediaPage.items = mediaPage.items.filter((item) => item.creationTimestamp < lowerBoundaryDate || item.creationTimestamp > higherBoundaryDate);
      }
      if (!mediaPage.items || mediaPage?.items?.length === 0) continue;
      log(`Found ${mediaPage?.items?.length} items`);
      mediaItems.push(...mediaPage.items);
    } while (nextPageId && !skipTheRest);

    return mediaItems;
  }

  fileNameFilter(mediaItems, filter) {
    log('Filtering by filename');
    const regex = new RegExp(filter.fileNameRegex);
    if (filter?.fileNameMatchType === 'include') mediaItems = mediaItems.filter((item) => regex.test(item.fileName));
    else if (filter?.fileNameMatchType === 'exclude') mediaItems = mediaItems.filter((item) => !regex.test(item.fileName));
    log(`Item count after filtering: ${mediaItems?.length}`);
    return mediaItems;
  }

  descriptionFilter(mediaItems, filter) {
    log('Filtering by description');
    const regex = new RegExp(filter.descriptionRegex);
    if (filter?.descriptionMatchType === 'include') mediaItems = mediaItems.filter((item) => regex.test(item.descriptionFull));
    else if (filter?.descriptionMatchType === 'exclude') mediaItems = mediaItems.filter((item) => !regex.test(item.descriptionFull));
    log(`Item count after filtering: ${mediaItems?.length}`);
    return mediaItems;
  }

  sizeFilter(mediaItems, filter) {
    log('Filtering by size');
    if (parseInt(filter?.higherBoundarySize) > 0) mediaItems = mediaItems.filter((item) => item.size < filter.higherBoundarySize);
    if (parseInt(filter?.lowerBoundarySize) > 0) mediaItems = mediaItems.filter((item) => item.size > filter.lowerBoundarySize);
    log(`Item count after filtering: ${mediaItems?.length}`);
    return mediaItems;
  }

  qualityFilter(mediaItems, filter) {
    log('Filtering by quality');
    if (filter.quality == 'original') mediaItems = mediaItems.filter((item) => item.isOriginalQuality);
    else if (filter.quality == 'storage-saver') mediaItems = mediaItems.filter((item) => !item.isOriginalQuality);
    log(`Item count after filtering: ${mediaItems?.length}`);
    return mediaItems;
  }

  spaceFilter(mediaItems, filter) {
    log('Filtering by space');
    if (filter.space === 'consuming') mediaItems = mediaItems.filter((item) => item.takesUpSpace);
    else if (filter.space === 'non-consuming') mediaItems = mediaItems.filter((item) => !item.takesUpSpace);
    log(`Item count after filtering: ${mediaItems?.length}`);
    return mediaItems;
  }

  filterByDate(mediaItems, filter) {
    log('Filtering by date');
    let lowerBoundaryDate = new Date(filter.lowerBoundaryDate).getTime();
    let higherBoundaryDate = new Date(filter.higherBoundaryDate).getTime();

    lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
    higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;

    if (filter.intervalType === 'include') {
      if (filter.dateType === 'taken') {
        mediaItems = mediaItems.filter((item) => item.timestamp >= lowerBoundaryDate && item.timestamp <= higherBoundaryDate);
      } else if (filter.dateType === 'uploaded') {
        mediaItems = mediaItems.filter((item) => item.creationTimestamp >= lowerBoundaryDate && item.creationTimestamp <= higherBoundaryDate);
      }
    } else if (filter.intervalType === 'exclude') {
      if (filter.dateType === 'taken') {
        mediaItems = mediaItems.filter((item) => item.timestamp < lowerBoundaryDate || item.timestamp > higherBoundaryDate);
      } else if (filter.dateType === 'uploaded') {
        mediaItems = mediaItems.filter((item) => item.creationTimestamp < lowerBoundaryDate || item.creationTimestamp > higherBoundaryDate);
      }
    }
    log(`Item count after filtering: ${mediaItems?.length}`);
    return mediaItems;
  }

  filterByMediaType(mediaItems, filter) {
    // if has duration - video, else image
    log('Filtering by media type');
    if (filter.type === 'video') mediaItems = mediaItems.filter((item) => item.duration);
    else if (filter.type === 'image') mediaItems = mediaItems.filter((item) => !item.duration);
    else if (filter.type === 'live') mediaItems = mediaItems.filter((item) => item.isLivePhoto);
    log(`Item count after filtering: ${mediaItems?.length}`);
    return mediaItems;
  }

  filterFavorite(mediaItems, filter) {
    log('Filtering favorites');
    if (filter.favorite === 'true') {
      mediaItems = mediaItems.filter((item) => item?.isFavorite !== false);
    } else if (filter.favorite === 'false' || filter.excludeFavorites) {
      mediaItems = mediaItems.filter((item) => item?.isFavorite !== true);
    }

    log(`Item count after filtering: ${mediaItems?.length}`);
    return mediaItems;
  }

  filterOwned(mediaItems, filter) {
    log('Filtering owned');
    if (filter.owned === 'true') {
      mediaItems = mediaItems.filter((item) => item?.isOwned !== false);
    } else if (filter.owned === 'false') {
      mediaItems = mediaItems.filter((item) => item?.isOwned !== true);
    }
    log(`Item count after filtering: ${mediaItems?.length}`);
    return mediaItems;
  }

  filterByUploadStatus(mediaItems, filter) {
    log('Filtering by upload status');
    if (filter.uploadStatus === 'full') {
      mediaItems = mediaItems.filter((item) => item?.isPartialUpload === false);
    } else if (filter.uploadStatus === 'partial') {
      mediaItems = mediaItems.filter((item) => item?.isPartialUpload === true);
    }

    log(`Item count after filtering: ${mediaItems?.length}`);
    return mediaItems;
  }

  filterArchived(mediaItems, filter) {
    log('Filtering archived');
    if (filter.archived === 'true') {
      mediaItems = mediaItems.filter((item) => item?.isArchived !== false);
    } else if (filter.archived === 'false') {
      mediaItems = mediaItems.filter((item) => item?.isArchived !== true);
    }

    log(`Item count after filtering: ${mediaItems?.length}`);
    return mediaItems;
  }

  preChecks(filter) {
    if (filter.fileNameRegex) {
      const isValid = isPatternValid(filter.fileNameRegex);
      if (isValid !== true) throw new Error(isValid);
    }
    if (filter.descriptionRegex) {
      const isValid = isPatternValid(filter.descriptionRegex);
      if (isValid !== true) throw new Error(isValid);
    }
    if (parseInt(filter.lowerBoundarySize) >= parseInt(filter.higherBoundarySize)) {
      throw new Error('Invalid Size Filter');
    }
  }

  async actionWithFilter(action, filter, source, targetAlbum, newTargetAlbumName, apiSettings) {
    try {
      this.preChecks(filter);
    } catch (error) {
      log(error, 'error');
      return;
    }

    this.isProcessRunning = true;

    // dispatching event to upate the ui without importing it
    document.dispatchEvent(new Event('change'));

    this.apiUtils = new ApiUtils(this, apiSettings || apiSettingsDefault);

    try {
      const startTime = new Date();
      const mediaItems = await this.getAndFilterMedia(filter, source, apiSettings);
      if (!mediaItems?.length) log('No items to process.');
      else {
        log(`Items to process: ${mediaItems?.length}`);
        if (action.elementId === 'restoreTrash' || source === 'trash') await this.apiUtils.restoreFromTrash(mediaItems);
        if (action.elementId === 'unLock' || source === 'lockedFolder') await this.apiUtils.removeFromLockedFolder(mediaItems);
        if (action.elementId === 'lock') await this.apiUtils.moveToLockedFolder(mediaItems);
        if (action.elementId === 'toExistingAlbum') await this.apiUtils.addToExistingAlbum(mediaItems, targetAlbum);
        if (action.elementId === 'toNewAlbum') await this.apiUtils.addToNewAlbum(mediaItems, newTargetAlbumName);
        if (action.elementId === 'toTrash') await this.apiUtils.moveToTrash(mediaItems);
        if (action.elementId === 'toArchive') await this.apiUtils.sendToArchive(mediaItems);
        if (action.elementId === 'unArchive') await this.apiUtils.unArchive(mediaItems);
        if (action.elementId === 'toFavorite') await this.apiUtils.setAsFavorite(mediaItems);
        if (action.elementId === 'unFavorite') await this.apiUtils.unFavorite(mediaItems);
        log(`Task completed in ${timeToHHMMSS(new Date() - startTime)}`, 'success');
      }
    } catch (error) {
      log(error.stack, 'error');
    }
    this.isProcessRunning = false;
  }
}
