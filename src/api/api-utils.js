import Api from './api.js';
import log from '../ui/logic/log.js';
import splitArrayIntoChunks from '../utils/splitArrayIntoChunks.js';
import { apiSettingsDefault } from './api-utils-deafault-presets.js';

export default class ApiUtils {
  constructor(core = null, settings) {
    this.api = new Api();
    this.executeWithConcurrency = this.executeWithConcurrency.bind(this);
    this.getAllItems = this.getAllItems.bind(this);
    this.core = core;
    let { maxConcurrentApiReq, operationSize, infoSize, lockedFolderOpSize } = settings || apiSettingsDefault;

    this.maxConcurrentApiReq = parseInt(maxConcurrentApiReq);
    this.operationSize = parseInt(operationSize);
    this.lockedFolderOpSize = parseInt(lockedFolderOpSize);
    this.infoSize = parseInt(infoSize);
  }

  async executeWithConcurrency(apiMethod, successCheck, operationSize, itemsArray, ...args) {
    const promisePool = new Set();
    const results = [];
    const chunkedItems = splitArrayIntoChunks(itemsArray, operationSize);

    for (const chunk of chunkedItems) {
      if (!this.core.isProcessRunning) return;

      while (promisePool.size >= this.maxConcurrentApiReq) {
        await Promise.race(promisePool);
      }

      log(`Processing ${chunk.length} items`);

      const promise = apiMethod.call(this.api, chunk, ...args);
      promisePool.add(promise);

      promise
        .then((result) => {
          results.push(...result);
          if (successCheck && !successCheck(result)) {
            log(`Error executing action ${apiMethod.name}`, 'error');
          }
        })
        .catch((error) => {
          log(`${apiMethod.name} Api error ${error}`, 'error');
        })
        .finally(() => {
          promisePool.delete(promise);
        });
    }
    await Promise.all(promisePool);
    return results;
  }

  async getAllItems(apiMethod, ...args) {
    const items = [];
    let nextPageId = null;
    do {
      if (!this.core.isProcessRunning) return;
      const page = await apiMethod.call(this.api, ...args, nextPageId);
      if (!page?.items) {
        log('No items found!', 'error');
        return [];
      }
      items.push(...page.items);
      log(`Found ${page.items.length} items`);
      nextPageId = page.nextPageId;
    } while (nextPageId);
    return items;
  }

  async getAllAlbums() {
    return await this.getAllItems(this.api.getAlbums);
  }

  async getAllSharedLinks() {
    return await this.getAllItems(this.api.getSharedLinks);
  }

  async getAllMediaInSharedLink(sharedLinkId) {
    return await this.getAllItems(this.api.getAlbumItems, sharedLinkId);
  }

  async getAllMediaInAlbum(albumId) {
    return await this.getAllItems(this.api.getAlbumItems, albumId);
  }

  async getAllTrashItems() {
    return await this.getAllItems(this.api.getTrashItems);
  }

  async getAllFavoriteItems() {
    return await this.getAllItems(this.api.getFavoriteItems);
  }

  async getAllSearchItems(searchQuery) {
    return await this.getAllItems(this.api.search, searchQuery);
  }

  async getAllLockedFolderItems() {
    return await this.getAllItems(this.api.getLockedFolderItems);
  }

  async moveToLockedFolder(mediaItems) {
    log(`Moving ${mediaItems.length} items to locked folder`);
    const isSuccess = (result) => Array.isArray(result);
    const mediaIdList = mediaItems.map((item) => item.mediaId);
    await this.executeWithConcurrency(this.api.moveToLockedFolder, isSuccess, this.lockedFolderOpSize, mediaIdList);
  }

  async removeFromLockedFolder(mediaItems) {
    log(`Moving ${mediaItems.length} items out of locked folder`);
    const isSuccess = (result) => Array.isArray(result);
    const mediaIdList = mediaItems.map((item) => item.mediaId);
    await this.executeWithConcurrency(this.api.removeFromLockedFolder, isSuccess, this.lockedFolderOpSize, mediaIdList);
  }

  async moveToTrash(mediaItems) {
    log(`Moving ${mediaItems.length} items to trash`);
    const isSuccess = (result) => Array.isArray(result);
    const mediaIdList = mediaItems.map((item) => item.mediaId);
    await this.executeWithConcurrency(this.api.moveItemsToTrash, isSuccess, this.operationSize, mediaIdList);
  }

  async restoreFromTrash(trashItems) {
    log(`Restoring ${trashItems.length} items from trash`);
    const isSuccess = (result) => Array.isArray(result);
    const mediaIdList = trashItems.map((item) => item.mediaId);
    await this.executeWithConcurrency(this.api.restoreFromTrash, isSuccess, this.operationSize, mediaIdList);
  }

  async sendToArchive(mediaItems) {
    log(`Sending ${mediaItems.length} items to archive`);
    const isSuccess = (result) => Array.isArray(result);
    mediaItems = mediaItems.filter((item) => item?.isArchived !== true);
    const mediaIdList = mediaItems.map((item) => item.mediaId);
    if (!mediaItems) {
      log('All target items are already archived!');
      return;
    }
    await this.executeWithConcurrency(this.api.setArchive, isSuccess, this.operationSize, mediaIdList, true);
  }

  async unArchive(mediaItems) {
    log(`Removing ${mediaItems.length} items from archive`);
    const isSuccess = (result) => Array.isArray(result);
    mediaItems = mediaItems.filter((item) => item?.isArchived !== false);
    const mediaIdList = mediaItems.map((item) => item.mediaId);
    if (!mediaItems) {
      log('All target items are not archived!');
      return;
    }
    await this.executeWithConcurrency(this.api.setArchive, isSuccess, this.operationSize, mediaIdList, false);
  }

  async setAsFavorite(mediaItems) {
    log(`Setting ${mediaItems.length} items as favorite`);
    const isSuccess = (result) => Array.isArray(result);
    mediaItems = mediaItems.filter((item) => item?.isFavorite !== true);
    if (!mediaItems) {
      log('All target items are already favorite!');
      return;
    }
    const mediaIdList = mediaItems.map((item) => item.mediaId);
    await this.executeWithConcurrency(this.api.setFavorite, isSuccess, this.operationSize, mediaIdList, true);
  }

  async unFavorite(mediaItems) {
    log(`Removing ${mediaItems.length} items from favorites`);
    const isSuccess = (result) => Array.isArray(result);
    mediaItems = mediaItems.filter((item) => item?.isFavorite !== false);
    if (!mediaItems) {
      log('All target items are not favorite!');
      return;
    }
    const mediaIdList = mediaItems.map((item) => item.mediaId);
    await this.executeWithConcurrency(this.api.setFavorite, isSuccess, this.operationSize, mediaIdList, false);
  }

  async addToExistingAlbum(mediaItems, targetAlbum) {
    log(`Adding ${mediaItems.length} items to album "${targetAlbum.name}"`);

    const isSuccess = (result) => Array.isArray(result);
    const productIdList = mediaItems.map((item) => item.productId);

    const addItemFunction = targetAlbum.isShared ? this.api.addItemsToSharedAlbum : this.api.addItemsToAlbum;

    await this.executeWithConcurrency(
      addItemFunction,
      isSuccess,
      this.operationSize,
      productIdList,
      targetAlbum.productId
    );
  }

  async addToNewAlbum(mediaItems, targetAlbumName) {
    log(`Creating new album "${targetAlbumName}"`);
    const album = {};
    album.name = targetAlbumName;
    album.shared = false;
    album.productId = await this.api.createAlbum(targetAlbumName);
    await this.addToExistingAlbum(mediaItems, album);
  }

  async getBatchMediaInfoChunked(mediaItems) {
    log('Getting items\' media info');
    const productIdList = mediaItems.map((item) => item.productId);
    const mediaInfoData = await this.executeWithConcurrency(
      this.api.getBatchMediaInfo,
      null,
      this.infoSize,
      productIdList
    );
    return mediaInfoData;
  }
}
