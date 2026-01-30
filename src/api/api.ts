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

/**
 * Low-level client for Google Photos' undocumented `batchexecute` RPC API.
 *
 * Every method wraps a single RPC call, handles retry with exponential
 * backoff, and (optionally) parses the raw response into a typed object.
 *
 * Exposed globally as `gptkApi` for console scripting:
 * ```js
 * const info = await gptkApi.getItemInfoExt('MEDIA_KEY');
 * ```
 */
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
   *
   * @param rpcid - The RPC method identifier (e.g. `'lcxiM'`, `'EzkLib'`).
   * @param requestData - The payload to send, will be JSON-stringified.
   * @returns The parsed JSON payload from the `wrb.fr` envelope.
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

  /**
   * Retrieve library items ordered by the date they were taken (EXIF date).
   *
   * Pages backward through the timeline starting from `timestamp`.
   *
   * @param timestamp - Upper bound epoch timestamp in ms. `null` starts from the most recent.
   * @param source - `'library'` (non-archived), `'archive'`, or `null` (both).
   * @param pageId - Continuation token from a previous page's `nextPageId`.
   * @param pageSize - Number of items per page (default `500`).
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns A page of library items with `nextPageId` and `lastItemTimestamp`.
   */
  async getItemsByTakenDate(
    timestamp: number | null = null,
    source: string | null = null,
    pageId: string | null = null,
    pageSize = 500,
    parseResponse = true
  ): Promise<LibraryTimelinePage> {
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

  /**
   * Retrieve library items ordered by upload date (newest first).
   *
   * @param pageId - Continuation token from a previous page's `nextPageId`.
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns A page of library items with `nextPageId`.
   */
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

  /**
   * Search the library with a text query (same as the Google Photos search bar).
   *
   * @param searchQuery - Free-text search string (e.g. `'cats'`, `'beach 2023'`).
   * @param pageId - Continuation token for paginated results.
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns A page of matching media items.
   */
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

  /**
   * Find remote media items that match the given file hashes.
   *
   * @param hashArray - Array of file hash strings to look up.
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns Array of matched remote items with their metadata.
   */
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

  /**
   * Retrieve items marked as favorites.
   *
   * @param pageId - Continuation token for paginated results.
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns A page of favorite media items.
   */
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

  /**
   * Retrieve items in the trash.
   *
   * @param pageId - Continuation token for paginated results.
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns A page of trashed media items.
   */
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

  /**
   * Retrieve items in the Locked Folder.
   *
   * Requires the page to be opened on the locked folder URL
   * so that the `rapt` authentication token is available.
   *
   * @param pageId - Continuation token for paginated results.
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns A page of locked folder items.
   */
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

  /**
   * Move items to the trash.
   *
   * @param dedupKeyArray - Array of dedup keys identifying the items.
   * @returns The API response status.
   */
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

  /**
   * Restore items from the trash back to the library.
   *
   * @param dedupKeyArray - Array of dedup keys identifying the trashed items.
   * @returns The API response status.
   */
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

  /**
   * Retrieve all shared links created by the current user.
   *
   * @param pageId - Continuation token for paginated results.
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns A page of shared links with their link IDs and item counts.
   */
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

  /**
   * Retrieve the user's albums.
   *
   * @param pageId - Continuation token for paginated results.
   * @param pageSize - Number of albums per page (default `100`).
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns A page of albums with metadata (title, item count, shared status).
   */
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

  /**
   * Retrieve a page of items from an album or shared link.
   *
   * @param albumMediaKey - The album's media key (or shared link ID).
   * @param pageId - Continuation token for paginated results.
   * @param authKey - Auth key for accessing shared albums you don't own.
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns A page of album items with album metadata (title, owner, members).
   */
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

  /**
   * Remove items from an album (does not delete them from the library).
   *
   * @param itemAlbumMediaKeyArray - Array of item-album media keys to remove.
   * @returns The API response.
   */
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

  /**
   * Create a new empty album.
   *
   * @param albumName - The title for the new album.
   * @returns The media key of the newly created album.
   */
  async createAlbum(albumName: string): Promise<string> {
    const rpcid = 'OXvT9d';
    const requestData = [albumName, null, 2];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response?.[0]?.[0];
    } catch (error) {
      console.error('Error in createAlbum:', error);
      throw error;
    }
  }

  /**
   * Add items to an existing (non-shared) album, or create a new one.
   *
   * Provide either `albumMediaKey` (existing) or `albumName` (new).
   *
   * @param mediaKeyArray - Array of media keys to add.
   * @param albumMediaKey - The target album's media key (for existing albums).
   * @param albumName - Name for a new album to create and add items to.
   * @returns The API response.
   */
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

  /**
   * Add items to a shared album, or create a new shared album.
   *
   * Provide either `albumMediaKey` (existing) or `albumName` (new).
   *
   * @param mediaKeyArray - Array of media keys to add.
   * @param albumMediaKey - The target shared album's media key.
   * @param albumName - Name for a new shared album to create.
   * @returns The API response.
   */
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

  /**
   * Reorder items within an album.
   *
   * @param albumMediaKey - The album's media key.
   * @param albumItemKeys - Array of item keys to reposition.
   * @param insertAfter - Place the items after this key. `null` moves them to the beginning.
   * @returns The API response.
   */
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

  /**
   * Set or unset the favorite flag on items.
   *
   * @param dedupKeyArray - Array of dedup keys identifying the items.
   * @param action - `true` to favorite, `false` to unfavorite.
   * @returns The API response.
   */
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

  /**
   * Archive or unarchive items.
   *
   * @param dedupKeyArray - Array of dedup keys identifying the items.
   * @param action - `true` to archive, `false` to unarchive.
   * @returns The API response.
   */
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

  /**
   * Move items into the Locked Folder.
   *
   * @param dedupKeyArray - Array of dedup keys identifying the items.
   * @returns The API response.
   */
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

  /**
   * Remove items from the Locked Folder back to the library.
   *
   * @param dedupKeyArray - Array of dedup keys identifying the items.
   * @returns The API response.
   */
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

  /**
   * Get the current Google account's storage quota.
   *
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns Storage quota with total used, total available, and Google Photos usage.
   */
  async getStorageQuota(parseResponse = true): Promise<StorageQuota> {
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

  /**
   * Get download URLs for one or more media items.
   *
   * @param mediaKeyArray - Array of media keys to get download URLs for.
   * @param authKey - Auth key for shared album items.
   * @returns The download URL data.
   */
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

  /**
   * Request a download token for bulk-downloading items as a zip archive.
   *
   * Use {@link checkDownloadToken} to poll for completion.
   *
   * @param mediaKeyArray - Array of media keys to include in the download.
   * @returns The download token string.
   */
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

  /**
   * Check the status of a bulk download token.
   *
   * Poll this method until `downloadUrl` is non-null (download ready).
   *
   * @param dlToken - The download token obtained from {@link getDownloadToken}.
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns Download status with filename, URL, and sizes (when ready).
   */
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

  /**
   * Remove items from a shared album.
   *
   * @param albumMediaKey - The shared album's media key.
   * @param mediaKeyArray - Array of media keys to remove from the album.
   * @returns The API response.
   */
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

  /**
   * Save shared album media to your own library.
   *
   * @param albumMediaKey - The shared album's media key.
   * @param mediaKeyArray - Array of media keys to save.
   * @returns The API response.
   */
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

  /**
   * Save partner-shared media to your own library.
   *
   * @param mediaKeyArray - Array of media keys from the partner sharing feed.
   * @returns The API response.
   */
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

  /**
   * Retrieve media shared by a partner (partner sharing feature).
   *
   * @param partnerActorId - The partner's actor ID.
   * @param gaiaId - The partner's Gaia ID.
   * @param pageId - Continuation token for paginated results.
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns A page of partner-shared items with member info.
   */
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

  /**
   * Set geographic location data on one or more items.
   *
   * @param dedupKeyArray - Array of dedup keys identifying the items.
   * @param center - `[latitude, longitude]` of the location center.
   * @param visible1 - First corner of the visible map area `[lat, lng]`.
   * @param visible2 - Second corner of the visible map area `[lat, lng]`.
   * @param scale - Map zoom scale level.
   * @param gMapsPlaceId - Google Maps Place ID for the location.
   * @returns The API response.
   */
  async setItemGeoData(
    dedupKeyArray: string[],
    center: number[],
    visible1: number[],
    visible2: number[],
    scale: number,
    gMapsPlaceId: string
  ): Promise<any> {
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

  /**
   * Remove geographic location data from one or more items.
   *
   * @param dedupKeyArray - Array of dedup keys identifying the items.
   * @returns The API response.
   */
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

  /**
   * Change the date/time of a media item.
   *
   * @param dedupKey - The dedup key of the item.
   * @param timestamp - New timestamp in epoch milliseconds.
   * @param timezone - Timezone offset (e.g. `19800` for GMT+05:30).
   * @returns The API response.
   */
  async setItemTimestamp(dedupKey: string, timestamp: number, timezone: number): Promise<any> {
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

  /**
   * Set or update the description of a media item.
   *
   * @param dedupKey - The dedup key of the item.
   * @param description - The new description text.
   * @returns The API response.
   */
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

  /**
   * Get basic info for a single media item.
   *
   * Returns download URLs, quality, favorite/archive status, and more.
   *
   * @param mediaKey - The media key of the item.
   * @param albumMediaKey - Album context (for album-specific metadata).
   * @param authKey - Auth key for shared album items.
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns Item info including download URLs, timestamps, and status flags.
   */
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

  /**
   * Get extended info for a single media item.
   *
   * Returns everything from {@link getItemInfo} plus EXIF camera info,
   * album membership, upload source, owner, and the "Other" description field.
   *
   * @param mediaKey - The media key of the item.
   * @param authKey - Auth key for shared album items.
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns Extended item info with source, owner, camera, albums, and geo data.
   */
  async getItemInfoExt(
    mediaKey: string,
    authKey: string | null = null,
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

  /**
   * Get media info for multiple items in a single request.
   *
   * Returns filename, description, size, quality, and space consumption
   * for each item. More efficient than calling {@link getItemInfoExt} per item.
   *
   * @param mediaKeyArray - Array of media keys (supports large batches).
   * @param parseResponse - When `false`, returns the raw API response.
   * @returns Array of bulk media info objects, one per item.
   */
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
      response = response?.[0]?.[1];
      if (parseResponse) return parser(response, rpcid) as BulkMediaInfo[];
      return response;
    } catch (error) {
      console.error('Error in getBatchMediaInfo:', error);
      throw error;
    }
  }
}
