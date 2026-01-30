/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
// Raw RPC responses from Google's batchexecute endpoint are untyped JSON.
// The no-unsafe-* rules are expected for this low-level API layer.

import parser from './parser';
import { windowGlobalData } from '../windowGlobalData';
import type {
  LibraryTimelinePage,
  LibraryGenericPage,
  LockedFolderPage,
  LinksPage,
  AlbumsPage,
  AlbumItemsPage,
  PartnerSharedItemsPage,
  TrashPage,
  BulkMediaInfo,
  ItemInfoExt,
  ItemInfo,
  DownloadTokenCheck,
  StorageQuota,
  RemoteMatch,
} from '../types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default class Api {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_BASE_DELAY_MS = 2000;

  /**
   * Core RPC request with retry and response validation.
   *
   * Fixes #74, #85, #96, #110 — the Google batchexecute endpoint can
   * return empty bodies, HTTP errors, or responses without the expected
   * `wrb.fr` envelope (e.g. rate-limiting, timeouts).  Previously this
   * caused `JSON.parse(undefined)` to throw an opaque SyntaxError.
   * We now validate every step and retry with exponential backoff.
   */
  async makeApiRequest(rpcid: string, requestData: unknown): Promise<any> {
    const wrappedData: unknown[][][] = [[[rpcid, JSON.stringify(requestData), null, 'generic']]];

    const requestDataString = `f.req=${encodeURIComponent(JSON.stringify(wrappedData))}&at=${encodeURIComponent(windowGlobalData.at)}&`;

    const params: Record<string, string> = {
      rpcids: rpcid,
      'source-path': window.location.pathname,
      'f.sid': windowGlobalData['f.sid'],
      bl: windowGlobalData.bl,
      pageId: 'none',
      rt: 'c',
    };
    // If in locked folder, send rapt
    if (windowGlobalData.rapt) params['rapt'] = String(windowGlobalData.rapt);

    const paramsString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    const url = `https://photos.google.com${windowGlobalData.path}data/batchexecute?${paramsString}`;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= Api.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: requestDataString,
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const responseBody = await response.text();

        if (!responseBody) {
          throw new Error('Empty response body');
        }

        const jsonLines = responseBody.split('\n').filter((line) => line.includes('wrb.fr'));

        if (jsonLines.length === 0) {
          throw new Error('No wrb.fr envelope found in response');
        }

        const parsedData = JSON.parse(jsonLines[0]);

        if (!parsedData?.[0]?.[2]) {
          throw new Error('Missing payload in parsed response');
        }

        return JSON.parse(parsedData[0][2]);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Error in ${rpcid} request (attempt ${attempt}/${Api.MAX_RETRIES}):`, lastError.message);

        if (attempt < Api.MAX_RETRIES) {
          const delay = Api.RETRY_BASE_DELAY_MS * attempt;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError ?? new Error(`${rpcid} request failed after ${Api.MAX_RETRIES} attempts`);
  }

  async getItemsByTakenDate(
    timestamp: number | null = null,
    source: string | null = null,
    pageId: string | null = null,
    pageSize = 500,
    parseResponse = true
  ): Promise<LibraryTimelinePage> {
    // Retrieves media items created before the provided timestamp
    let sourceCode: number;
    if (source === 'library') sourceCode = 1;
    else if (source === 'archive') sourceCode = 2;
    else sourceCode = 3; // both

    const rpcid = 'lcxiM';
    const requestData = [pageId, timestamp, pageSize, null, 1, sourceCode];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as LibraryTimelinePage;
      return response;
    } catch (error) {
      console.error('Error in getItemsByTakenDate:', error);
      throw error;
    }
  }

  async getItemsByUploadedDate(
    pageId: string | null = null,
    parseResponse = true
  ): Promise<LibraryGenericPage> {
    const rpcid = 'EzkLib';
    const requestData = ['', [[4, 'ra', 0, 0]], pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as LibraryGenericPage;
      return response;
    } catch (error) {
      console.error('Error in getItemsByUploadedDate:', error);
      throw error;
    }
  }

  async search(
    searchQuery: string,
    pageId: string | null = null,
    parseResponse = true
  ): Promise<LibraryGenericPage> {
    const rpcid = 'EzkLib';
    const requestData = [searchQuery, null, pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as LibraryGenericPage;
      return response;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  async getRemoteMatchesByHash(
    hashArray: string[],
    parseResponse = true
  ): Promise<RemoteMatch[]> {
    const rpcid = 'swbisb';
    const requestData = [hashArray, null, 3, 0];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as RemoteMatch[];
      return response;
    } catch (error) {
      console.error('Error in getRemoteMatchesByHash:', error);
      throw error;
    }
  }

  async getFavoriteItems(
    pageId: string | null = null,
    parseResponse = true
  ): Promise<LibraryGenericPage> {
    const rpcid = 'EzkLib';
    const requestData = ['Favorites', [[5, '8', 0, 9]], pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as LibraryGenericPage;
      return response;
    } catch (error) {
      console.error('Error in getFavoriteItems:', error);
      throw error;
    }
  }

  async getTrashItems(
    pageId: string | null = null,
    parseResponse = true
  ): Promise<TrashPage> {
    const rpcid = 'zy0IHe';
    const requestData = [pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as TrashPage;
      return response;
    } catch (error) {
      console.error('Error in getTrashItems:', error);
      throw error;
    }
  }

  async getLockedFolderItems(
    pageId: string | null = null,
    parseResponse = true
  ): Promise<LockedFolderPage> {
    const rpcid = 'nMFwOc';
    const requestData = [pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as LockedFolderPage;
      return response;
    } catch (error) {
      console.error('Error in getLockedFolderItems:', error);
      throw error;
    }
  }

  async moveItemsToTrash(dedupKeyArray: string[]): Promise<any> {
    const rpcid = 'XwAOJf';
    const requestData = [null, 1, dedupKeyArray, 3];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response[0];
    } catch (error) {
      console.error('Error in moveItemsToTrash:', error);
      throw error;
    }
  }

  async restoreFromTrash(dedupKeyArray: string[]): Promise<any> {
    const rpcid = 'XwAOJf';
    const requestData = [null, 3, dedupKeyArray, 2];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response[0];
    } catch (error) {
      console.error('Error in restoreFromTrash:', error);
      throw error;
    }
  }

  async getSharedLinks(
    pageId: string | null = null,
    parseResponse = true
  ): Promise<LinksPage> {
    const rpcid = 'F2A0H';
    const requestData = [pageId, null, 2, null, 3];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as LinksPage;
      return response;
    } catch (error) {
      console.error('Error in getSharedLinks:', error);
      throw error;
    }
  }

  async getAlbums(
    pageId: string | null = null,
    pageSize = 100,
    parseResponse = true
  ): Promise<AlbumsPage> {
    const rpcid = 'Z5xsfc';
    const requestData = [pageId, null, null, null, 1, null, null, pageSize, [2], 5];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as AlbumsPage;
      return response;
    } catch (error) {
      console.error('Error in getAlbums:', error);
      throw error;
    }
  }

  async getAlbumPage(
    albumMediaKey: string,
    pageId: string | null = null,
    authKey: string | null = null,
    parseResponse = true
  ): Promise<AlbumItemsPage> {
    const rpcid = 'snAcKc';
    const requestData = [albumMediaKey, pageId, null, authKey];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as AlbumItemsPage;
      return response;
    } catch (error) {
      console.error('Error in getAlbumPage:', error);
      throw error;
    }
  }

  async removeItemsFromAlbum(itemAlbumMediaKeyArray: string[]): Promise<any> {
    const rpcid = 'ycV3Nd';
    const requestData = [itemAlbumMediaKeyArray];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in removeItemsFromAlbum:', error);
      throw error;
    }
  }

  async createAlbum(albumName: string): Promise<string> {
    const rpcid = 'OXvT9d';
    const requestData = [albumName, null, 2];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response[0][0];
    } catch (error) {
      console.error('Error in createAlbum:', error);
      throw error;
    }
  }

  async addItemsToAlbum(
    mediaKeyArray: string[],
    albumMediaKey: string | null = null,
    albumName: string | null = null
  ): Promise<any> {
    const rpcid = 'E1Cajb';
    let requestData: unknown[] | null = null;

    if (albumName) requestData = [mediaKeyArray, null, albumName];
    else if (albumMediaKey) requestData = [mediaKeyArray, albumMediaKey];

    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in addItemsToAlbum:', error);
      throw error;
    }
  }

  async addItemsToSharedAlbum(
    mediaKeyArray: string[],
    albumMediaKey: string | null = null,
    albumName: string | null = null
  ): Promise<any> {
    const rpcid = 'laUYf';
    let requestData: unknown[] | null = null;

    if (albumName) requestData = [mediaKeyArray, null, albumName];
    else if (albumMediaKey) requestData = [albumMediaKey, [2, null, mediaKeyArray.map((id) => [[id]]), null, null, null, [1]]];

    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in addItemsToSharedAlbum:', error);
      throw error;
    }
  }

  async setAlbumItemOrder(
    albumMediaKey: string,
    albumItemKeys: string[],
    insertAfter: string | null = null
  ): Promise<any> {
    const rpcid = 'QD9nKf';

    const albumItemKeysArray = albumItemKeys.map((item) => [[item]]);

    let requestData: unknown[];
    if (insertAfter) {
      requestData = [albumMediaKey, null, 3, null, albumItemKeysArray, [[insertAfter]]];
    } else {
      requestData = [albumMediaKey, null, 1, null, albumItemKeysArray];
    }

    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setAlbumItemOrder:', error);
      throw error;
    }
  }

  async setFavorite(dedupKeyArray: string[], action = true): Promise<any> {
    const actionCode = action ? 1 : 2;
    const mappedKeys = dedupKeyArray.map((item) => [null, item]);
    const rpcid = 'Ftfh0';
    const requestData = [mappedKeys, [actionCode]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setFavorite:', error);
      throw error;
    }
  }

  async setArchive(dedupKeyArray: string[], action = true): Promise<any> {
    const actionCode = action ? 1 : 2;
    const mappedKeys = dedupKeyArray.map((item) => [null, [actionCode], [null, item]]);
    const rpcid = 'w7TP3c';
    const requestData = [mappedKeys, null, 1];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setArchive:', error);
      throw error;
    }
  }

  async moveToLockedFolder(dedupKeyArray: string[]): Promise<any> {
    const rpcid = 'StLnCe';
    const requestData = [dedupKeyArray, []];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in moveToLockedFolder:', error);
      throw error;
    }
  }

  async removeFromLockedFolder(dedupKeyArray: string[]): Promise<any> {
    const rpcid = 'Pp2Xxe';
    const requestData = [dedupKeyArray];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in removeFromLockedFolder:', error);
      throw error;
    }
  }

  async getStorageQuota(parseResponse = true  ): Promise<StorageQuota> {
    const rpcid = 'EzwWhf';
    const requestData: unknown[] = [];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as StorageQuota;
      return response;
    } catch (error) {
      console.error('Error in getStorageQuota:', error);  // Fixed: was "getDownloadUrl"
      throw error;
    }
  }

  async getDownloadUrl(mediaKeyArray: string[], authKey: string | null = null): Promise<any> {
    const rpcid = 'pLFTfd';
    const requestData = [mediaKeyArray, null, authKey];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response[0];
    } catch (error) {
      console.error('Error in getDownloadUrl:', error);
      throw error;
    }
  }

  async getDownloadToken(mediaKeyArray: string[]): Promise<any> {
    const rpcid = 'yCLA7';
    const mappedKeys = mediaKeyArray.map((id) => [id]);
    const requestData = [mappedKeys];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response[0];
    } catch (error) {
      console.error('Error in getDownloadToken:', error);
      throw error;
    }
  }

  async checkDownloadToken(
    dlToken: string,
    parseResponse = true
  ): Promise<DownloadTokenCheck> {
    const rpcid = 'dnv2s';
    const requestData = [[dlToken]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as DownloadTokenCheck;
      return response;
    } catch (error) {
      console.error('Error in checkDownloadToken:', error);
      throw error;
    }
  }

  async removeItemsFromSharedAlbum(albumMediaKey: string, mediaKeyArray: string[]): Promise<any> {
    const rpcid = 'LjmOue';
    const requestData = [
      [albumMediaKey],
      [mediaKeyArray],
      [[null, null, null, [null, [], []], null, null, null, null, null, null, null, null, null, []]],
    ];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in removeItemsFromSharedAlbum:', error);
      throw error;
    }
  }

  async saveSharedMediaToLibrary(albumMediaKey: string, mediaKeyArray: string[]): Promise<any> {
    const rpcid = 'V8RKJ';
    const requestData = [mediaKeyArray, null, albumMediaKey];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in saveSharedMediaToLibrary:', error);
      throw error;
    }
  }

  async savePartnerSharedMediaToLibrary(mediaKeyArray: string[]): Promise<any> {
    const rpcid = 'Es7fke';
    const mappedKeys = mediaKeyArray.map((id) => [id]);
    const requestData = [mappedKeys];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in savePartnerSharedMediaToLibrary:', error);
      throw error;
    }
  }

  async getPartnerSharedMedia(
    partnerActorId: string,
    gaiaId: string,
    pageId: string,
    parseResponse = true
  ): Promise<PartnerSharedItemsPage> {
    const rpcid = 'e9T5je';
    const requestData = [pageId, null, [null, [[[2, 1]]], [partnerActorId], [null, gaiaId], 1]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as PartnerSharedItemsPage;
      return response;
    } catch (error) {
      console.error('Error in getPartnerSharedMedia:', error);
      throw error;
    }
  }

  async setItemGeoData(
    dedupKeyArray: string[],
    center: number[],
    visible1: number[],
    visible2: number[],
    scale: number,
    gMapsPlaceId: string
  ): Promise<any> {
    // FIX #3: Changed assertInstance to assertType for primitives (now handled by TS)
    const rpcid = 'EtUHOe';
    const mappedKeys = dedupKeyArray.map((dedupKey) => [null, dedupKey]);
    const requestData = [mappedKeys, [2, center, [visible1, visible2], [null, null, scale], gMapsPlaceId]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setItemGeoData:', error);
      throw error;
    }
  }

  async deleteItemGeoData(dedupKeyArray: string[]): Promise<any> {
    const rpcid = 'EtUHOe';
    const mappedKeys = dedupKeyArray.map((dedupKey) => [null, dedupKey]);
    const requestData = [mappedKeys, [1]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in deleteItemGeoData:', error);
      throw error;
    }
  }

  async setItemTimestamp(dedupKey: string, timestamp: number, timezone: number): Promise<any> {
    // timestamp in epoch milliseconds
    // timezone as an offset e.g. 19800 is GMT+05:30
    const rpcid = 'DaSgWe';
    const requestData = [[[dedupKey, timestamp, timezone]]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setItemTimestamp:', error);
      throw error;
    }
  }

  async setItemDescription(dedupKey: string, description: string): Promise<any> {
    const rpcid = 'AQNOFd';
    const requestData = [null, description, dedupKey];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setItemDescription:', error);
      throw error;
    }
  }

  async getItemInfo(
    mediaKey: string,
    albumMediaKey: string | null = null,
    authKey: string | null = null,
    parseResponse = true
  ): Promise<ItemInfo> {
    const rpcid = 'VrseUb';
    const requestData = [mediaKey, null, authKey, null, albumMediaKey];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as ItemInfo;
      return response;
    } catch (error) {
      console.error('Error in getItemInfo:', error);
      throw error;
    }
  }

  async getItemInfoExt(
    mediaKey: string,
    authKey: string | null = null,  // FIX #2: authKey is string, not boolean
    parseResponse = true
  ): Promise<ItemInfoExt> {
    const rpcid = 'fDcn4b';
    const requestData = [mediaKey, 1, authKey, null, 1];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid) as ItemInfoExt;
      return response;
    } catch (error) {
      console.error('Error in getItemInfoExt:', error);
      throw error;
    }
  }

  async getBatchMediaInfo(
    mediaKeyArray: string[],
    parseResponse = true
  ): Promise<BulkMediaInfo[]> {
    const rpcid = 'EWgK9e';
    const mappedKeys = mediaKeyArray.map((id) => [id]);
    // prettier-ignore
    const requestData = [[[mappedKeys], [[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null, null, null, null, null, null, null, null, null, []]]]];
    try {
      let response = await this.makeApiRequest(rpcid, requestData);
      response = response[0][1];
      if (parseResponse) return parser(response, rpcid) as BulkMediaInfo[];
      return response;
    } catch (error) {
      console.error('Error in getBatchMediaInfo:', error);
      throw error;
    }
  }
}
