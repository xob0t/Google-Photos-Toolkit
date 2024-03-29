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
    let {
      maxConcurrentApiReq,
      operationSize,
      infoSize,
      lockedFolderOpSize
    } = settings || apiSettingsDefault;

    this.maxConcurrentApiReq = parseInt(maxConcurrentApiReq);
    this.operationSize = parseInt(operationSize);
    this.lockedFolderOpSize = parseInt(lockedFolderOpSize);
    this.infoSize = parseInt(infoSize); 
  }

  async executeWithConcurrency(apiMethod, successCheck, operationSize, itemsArray, ...args) {
    const promisePool = [];
    const results = [];
    const chunkedItems = splitArrayIntoChunks(itemsArray, operationSize);
  
    for (const chunk of chunkedItems) {
      if (!this.core.isProcessRunning) return;
      while(promisePool.length >= this.maxConcurrentApiReq){
        await Promise.race(promisePool);
        promisePool.shift();
      }

      log(`Processing ${chunk.length} items`);
  
      const promise = apiMethod.call(this.api, chunk, ...args); // Call apiMethod with correct context
      promisePool.push(promise);
  
      promise
        .then(result => {
          results.push(...result);
          if (successCheck && !successCheck(result)) {
            log(`Error executing action ${apiMethod.name}`, 'error');
            promisePool.shift();
          }
        }) // Remove fulfilled promise from pool
        .catch(error => {
          log(`${apiMethod.name} Api error ${error}`, 'error');
          promisePool.shift();
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
    return await this.getAllItems(this.api.listAlbums);
  }

  async getAllSharedLinks() {
    return await this.getAllItems(this.api.listSharedLinks);
  }

  async getAllMediaInSharedLink(sharedLinkId) {
    return await this.getAllItems(this.api.listAlbumItems, sharedLinkId);
  }

  async getAllMediaInAlbum(albumId) {
    return await this.getAllItems(this.api.listAlbumItems, albumId);
  }

  async getAllTrashItems() {
    return await this.getAllItems(this.api.listTrashItems);
  }

  async getAllFavoriteItems() {
    return await this.getAllItems(this.api.listFavorites);
  }

  async getAllSearchItems(searchQuery) {
    return await this.getAllItems(this.api.search, searchQuery);
  }

  async getAllLockedFolderItems() {
    return await this.getAllItems(this.api.listLockedFolderItems);
  }

  async moveToLockedFolder(mediaItems) {
    log(`Moving ${mediaItems.length} items to locked folder`);
    const isSuccess = result => Array.isArray(result);
    const mediaIdList = mediaItems.map(item => item.mediaId);
    await this.executeWithConcurrency(this.api.moveToLockedFolder, isSuccess, this.lockedFolderOpSize, mediaIdList);
  }

  async removeFromLockedFolder(mediaItems) {
    log(`Moving ${mediaItems.length} items out of locked folder`);
    const isSuccess = result => Array.isArray(result);
    const mediaIdList = mediaItems.map(item => item.mediaId);
    await this.executeWithConcurrency(this.api.removeFromLockedFolder, isSuccess, this.lockedFolderOpSize, mediaIdList);
  }

  async moveToTrash(mediaItems) {
    log(`Moving ${mediaItems.length} items to trash`);
    const isSuccess = result => Array.isArray(result);
    const mediaIdList = mediaItems.map(item => item.mediaId);
    await this.executeWithConcurrency(this.api.moveMediaToTrash, isSuccess, this.operationSize, mediaIdList);
  }

  async restoreFromTrash(trashItems) {
    log(`Restoring ${trashItems.length} items from trash`);
    const isSuccess = result => Array.isArray(result);
    const mediaIdList = trashItems.map(item => item.mediaId);
    await this.executeWithConcurrency(this.api.restoreFromTrash, isSuccess, this.operationSize, mediaIdList);
  }

  async sendToArchive(mediaItems) {
    log(`Sending ${mediaItems.length} items to archive`);
    const isSuccess = result => Array.isArray(result);
    mediaItems = mediaItems.filter(item => item?.isArchived !== true);
    const mediaIdList = mediaItems.map(item => item.mediaId);
    if(!mediaItems){
      log('All target items are already archived!');
      return;
    }
    await this.executeWithConcurrency(this.api.setArchive, isSuccess, this.operationSize, mediaIdList, true);
  }

  async unArchive(mediaItems) {
    log(`Removing ${mediaItems.length} items from archive`);
    const isSuccess = result => Array.isArray(result);
    mediaItems = mediaItems.filter(item => item?.isArchived !== false);
    const mediaIdList = mediaItems.map(item => item.mediaId);
    if(!mediaItems){
      log('All target items are not archived!');
      return;
    }
    await this.executeWithConcurrency(this.api.setArchive, isSuccess, this.operationSize, mediaIdList, false);
  }
  
  async setAsFavorite(mediaItems) {
    log(`Setting ${mediaItems.length} items as favorite`);
    const isSuccess = result => Array.isArray(result);
    mediaItems = mediaItems.filter(item => item?.isFavorite !== true);
    if(!mediaItems){
      log('All target items are already favorite!');
      return;
    }
    const mediaIdList = mediaItems.map(item => item.mediaId);
    await this.executeWithConcurrency(this.api.setFavorite, isSuccess, this.operationSize, mediaIdList, true);
  }
  
  async unFavorite(mediaItems) {
    log(`Removing ${mediaItems.length} items from favorites`);
    const isSuccess = result => Array.isArray(result);
    mediaItems = mediaItems.filter(item => item?.isFavorite !== false);
    if(!mediaItems){
      log('All target items are not favorite!');
      return;
    }
    const mediaIdList = mediaItems.map(item => item.mediaId);
    await this.executeWithConcurrency(this.api.setFavorite, isSuccess, this.operationSize, mediaIdList, false);
  }

  async addToExistingAlbum(mediaItems, targetAlbumId) {
    log(`Adding ${mediaItems.length} items to album`);
    const isSuccess = result => Array.isArray(result);
    const productIdList = mediaItems.map(item => item.productId);
    await this.executeWithConcurrency(this.api.addItemsToAlbum, isSuccess, this.operationSize, productIdList, targetAlbumId);
  }

  async addToNewAlbum(mediaItems, targetAlbumName) {
    log(`Creating new album "${targetAlbumName}"`);
    const targetAlbumId = await this.api.createEmptyAlbum(targetAlbumName);
    await this.addToExistingAlbum(mediaItems, targetAlbumId);
  }

  async getBatchMediaInfoChunked(mediaItems) {
    log('Getting items\' media info');
    const productIdList = mediaItems.map(item => item.productId);
    const mediaInfoData = await this.executeWithConcurrency(this.api.getBatchMediaInfo, null, this.infoSize, productIdList);
    return mediaInfoData;
  }
}