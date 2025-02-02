import parser from './parser.js';
import { assertType, assertInstance } from '../utils/helpers.js';
import { windowGlobalData } from '../windowGlobalData.js';

export default class Api {
  async makeApiRequest(rpcid, requestData) {
    // type assertion
    if (rpcid) assertType(rpcid, 'string');

    requestData = [[[rpcid, JSON.stringify(requestData), null, 'generic']]];

    const requestDataString = `f.req=${encodeURIComponent(JSON.stringify(requestData))}&at=${encodeURIComponent(windowGlobalData.at)}&`;

    const params = {
      rpcids: rpcid,
      'source-path': window.location.pathname,
      'f.sid': windowGlobalData['f.sid'],
      bl: windowGlobalData.bl,
      pageId: 'none',
      rt: 'c',
    };
    // if in locked folder send rapt
    if (windowGlobalData.rapt) params.rapt = windowGlobalData.rapt;
    const paramsString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    const url = `https://photos.google.com${windowGlobalData.path}data/batchexecute?${paramsString}`;
    try {
      const response = await fetch(url, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: requestDataString,
        method: 'POST',
        credentials: 'include',
      });

      const responseBody = await response.text();
      const jsonLines = responseBody.split('\n').filter((line) => line.includes('wrb.fr'));
      let parsedData = JSON.parse(jsonLines[0]);
      return JSON.parse(parsedData[0][2]);
    } catch (error) {
      console.error(`Error in ${rpcid} request:`, error);
      throw error;
    }
  }

  async getItemsByTakenDate(timestamp = null, source = null, pageId = null, pageSize = 500, parseResponse = true) {
    // type assertion
    if (timestamp) assertType(timestamp, 'number');
    if (source) assertType(source, 'string');
    if (pageId) assertType(pageId, 'string');
    if (pageSize) assertType(pageSize, 'number');
    if (parseResponse) assertType(parseResponse, 'boolean');

    // Retrieves media items created before the provided timestamp
    if (source === 'library') source = 1;
    else if (source === 'archive') source = 2;
    else if (!source) source = 3; //both

    const rpcid = 'lcxiM';
    const requestData = [pageId, timestamp, pageSize, null, 1, source];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getItemsByTakenDate:', error);
      throw error;
    }
  }

  async getItemsByUploadedDate(pageId = null, parseResponse = true) {
    // type assertion
    if (pageId) assertType(pageId, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'EzkLib';
    const requestData = ['', [[4, 'ra', 0, 0]], pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getItemsByUploadedDate:', error);
      throw error;
    }
  }

  async search(searchQuery, pageId = null, parseResponse = true) {
    // type assertion
    if (searchQuery) assertType(searchQuery, 'string');
    if (pageId) assertType(pageId, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'EzkLib';
    const requestData = [searchQuery, null, pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  async getRemoteMatchesByHash(hashArray, parseResponse = true) {
    // each hash is a base64-encoded binary SHA1 hash of a file
    // $ sha1sum "/path/to"/file" | xxd -r -p | base64

    // type assertion
    if (hashArray) assertInstance(hashArray, Array);
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'swbisb';
    const requestData = [hashArray, null, 3, 0];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getRemoteMatchesByHash:', error);
      throw error;
    }
  }

  async getFavoriteItems(pageId = null, parseResponse = true) {
    // type assertion
    if (pageId) assertType(pageId, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'EzkLib';
    const requestData = ['Favorites', [[5, '8', 0, 9]], pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getFavoriteItems:', error);
      throw error;
    }
  }

  async getTrashItems(pageId = null, parseResponse = true) {
    // type assertion
    if (pageId) assertType(pageId, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'zy0IHe';
    const requestData = [pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getTrashItems:', error);
      throw error;
    }
  }

  async getLockedFolderItems(pageId = null, parseResponse = true) {
    // type assertion
    if (pageId) assertType(pageId, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'nMFwOc';
    const requestData = [pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getLockedFolderItems:', error);
      throw error;
    }
  }

  async moveItemsToTrash(dedupKeyArray) {
    // type assertion
    if (dedupKeyArray) assertInstance(dedupKeyArray, Array);

    const rpcid = 'XwAOJf';
    const requestData = [null, 1, dedupKeyArray, 3];
    // note: It seems that '3' here corresponds to items' location
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response[0];
    } catch (error) {
      console.error('Error in moveItemsToTrash:', error);
      throw error;
    }
  }

  async restoreFromTrash(dedupKeyArray) {
    // type assertion
    if (dedupKeyArray) assertInstance(dedupKeyArray, Array);

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

  async getSharedLinks(pageId = null, parseResponse = true) {
    // type assertion
    if (pageId) assertType(pageId, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'F2A0H';
    const requestData = [pageId, null, 2, null, 3];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getSharedLinks:', error);
      throw error;
    }
  }

  async getAlbums(pageId = null, pageSize = 100, parseResponse = true) {
    // type assertion
    if (pageId) assertType(pageId, 'string');
    if (pageSize) assertType(pageSize, 'number');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'Z5xsfc';
    const requestData = [pageId, null, null, null, 1, null, null, pageSize, [2], 5];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getAlbums:', error);
      throw error;
    }
  }

  async getAlbumPage(albumMediaKey, pageId = null, authKey = null, parseResponse = true) {
    // get items of an album or a shared link with the given id

    // type assertion
    if (albumMediaKey) assertType(albumMediaKey, 'string');
    if (pageId) assertType(pageId, 'string');
    if (authKey) assertType(authKey, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'snAcKc';
    const requestData = [albumMediaKey, pageId, null, authKey];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getAlbumPage:', error);
      throw error;
    }
  }

  async removeItemsFromAlbum(itemAlbumMediaKeyArray) {
    // regular mediaKey's won't cut it, you need to get them from an album

    // type assertion
    if (itemAlbumMediaKeyArray) assertInstance(itemAlbumMediaKeyArray, Array);

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

  async createAlbum(albumName) {
    // returns string id of the created album

    // type assertion
    if (albumName) assertType(albumName, 'string');

    const rpcid = 'OXvT9d';
    let requestData = [albumName, null, 2];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response[0][0];
    } catch (error) {
      console.error('Error in createAlbum:', error);
      throw error;
    }
  }

  async addItemsToAlbum(mediaKeyArray, albumMediaKey = null, albumName = null) {
    // supply album ID for adding to an existing album, or a name for a new one

    // type assertion
    if (mediaKeyArray) assertInstance(mediaKeyArray, Array);
    if (albumMediaKey) assertType(albumMediaKey, 'string');
    if (albumName) assertType(albumName, 'string');

    const rpcid = 'E1Cajb';
    let requestData = null;

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

  async addItemsToSharedAlbum(mediaKeyArray, albumMediaKey = null, albumName = null) {
    // supply album ID for adding to an existing album, or a name for a new one

    // type assertion
    if (mediaKeyArray) assertInstance(mediaKeyArray, Array);
    if (albumMediaKey) assertType(albumMediaKey, 'string');
    if (albumName) assertType(albumName, 'string');

    const rpcid = 'laUYf';
    let requestData = null;

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

  async setFavorite(dedupKeyArray, action = true) {
    // type assertion
    if (dedupKeyArray) assertInstance(dedupKeyArray, Array);
    if (action) assertType(action, 'boolean');

    if (action === true) action = 1; //set favorite
    else if (action === false) action = 2; //un favorite
    dedupKeyArray = dedupKeyArray.map((item) => [null, item]);
    const rpcid = 'Ftfh0';
    const requestData = [dedupKeyArray, [action]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setFavorite:', error);
      throw error;
    }
  }

  async setArchive(dedupKeyArray, action = true) {
    // type assertion
    if (dedupKeyArray) assertInstance(dedupKeyArray, Array);
    if (action) assertType(action, 'boolean');

    if (action === true) action = 1; // send to archive
    else if (action === false) action = 2; // un archive

    dedupKeyArray = dedupKeyArray.map((item) => [null, [action], [null, item]]);
    const rpcid = 'w7TP3c';
    const requestData = [dedupKeyArray, null, 1];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setArchive:', error);
      throw error;
    }
  }

  async moveToLockedFolder(dedupKeyArray) {
    // type assertion
    if (dedupKeyArray) assertInstance(dedupKeyArray, Array);

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

  async removeFromLockedFolder(dedupKeyArray) {
    // type assertion
    if (dedupKeyArray) assertInstance(dedupKeyArray, Array);

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

  async getStorageQuota(parseResponse = true) {
    // type assertion
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'EzwWhf';
    const requestData = [];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getDownloadUrl:', error);
      throw error;
    }
  }

  // there are at least two rpcid's that are used for file downloading
  // getDownloadUrl uses `pLFTfd`
  // getDownloadToken uses `yCLA7`
  // Both take mediaKeyArray as an argument
  // getDownloadUrl receives a dl url, and can use authKey to download shared media - dl url does not have a Content-Length header
  // getDownloadToken receives a token, which is then used to check if the dl url is ready with checkDownloadToken - dl url has a Content-Length header

  async getDownloadUrl(mediaKeyArray, authKey = null) {
    // type assertion
    if (mediaKeyArray) assertInstance(mediaKeyArray, Array);

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

  async getDownloadToken(mediaKeyArray) {
    // use the token with checkDownloadToken to check if DL ulr is ready

    // type assertion
    if (mediaKeyArray) assertInstance(mediaKeyArray, Array);

    const rpcid = 'yCLA7';
    mediaKeyArray = mediaKeyArray.map((id) => [id]);
    const requestData = [mediaKeyArray];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response[0];
    } catch (error) {
      console.error('Error in getDownloadToken:', error);
      throw error;
    }
  }

  async checkDownloadToken(dlToken, parseResponse = true) {
    // returns dl url if one found

    // type assertion
    if (dlToken) assertType(dlToken, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'dnv2s';
    const requestData = [[dlToken]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in checkDownloadToken:', error);
      throw error;
    }
  }

  async removeItemsFromSharedAlbum(albumMediaKey, mediaKeyArray) {
    // type assertion
    if (albumMediaKey) assertType(albumMediaKey, 'string');
    if (mediaKeyArray) assertInstance(mediaKeyArray, Array);

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

  async saveSharedMediaToLibrary(albumMediaKey, mediaKeyArray) {
    // save shared media to own library
    // type assertion
    if (albumMediaKey) assertType(albumMediaKey, 'string');
    if (mediaKeyArray) assertInstance(mediaKeyArray, Array);

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

  async savePartnerSharedMediaToLibrary(mediaKeyArray) {
    // save partner shared media to own library
    // type assertion
    if (mediaKeyArray) assertInstance(mediaKeyArray, Array);

    const rpcid = 'Es7fke';
    mediaKeyArray = mediaKeyArray.map((id) => [id]);
    const requestData = [mediaKeyArray];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in savePartnerSharedMediaToLibrary:', error);
      throw error;
    }
  }

  async getPartnerSharedMedia(partnerActorId, gaiaId, pageId, parseResponse = true) {
    // partner's actorId, your account's gaiaId
    // type assertion
    if (partnerActorId) assertType(partnerActorId, 'string');
    if (gaiaId) assertType(gaiaId, 'string');
    if (pageId) assertType(pageId, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'e9T5je';
    const requestData = [pageId, null, [null, [[[2, 1]]], [partnerActorId], [null, gaiaId], 1]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getPartnerSharedMedia:', error);
      throw error;
    }
  }

  async setItemGeoData(dedupKeyArray, center, visible1, visible2, scale, gMapsPlaceId) {
    // type assertion
    if (dedupKeyArray) assertInstance(dedupKeyArray, Array);
    if (center) assertInstance(center, Array);
    if (visible1) assertInstance(visible1, Array);
    if (visible2) assertInstance(visible2, Array);
    if (scale) assertInstance(scale, 'number');
    if (gMapsPlaceId) assertInstance(gMapsPlaceId, 'string');

    // every point is an array of coordinates, every coordinate is 9 digit-long int
    // coordinates and scale can be extracted from mapThumb, but gMapsPlaceId is not exposed in GP
    const rpcid = 'EtUHOe';
    dedupKeyArray = dedupKeyArray.map((dedupKey) => [null, dedupKey]);
    const requestData = [dedupKeyArray, [2, center, [visible1, visible2], [null, null, scale], gMapsPlaceId]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setItemGeoData:', error);
      throw error;
    }
  }

  async deleteItemGeoData(dedupKeyArray) {
    // type assertion
    if (dedupKeyArray) assertInstance(dedupKeyArray, Array);

    const rpcid = 'EtUHOe';
    dedupKeyArray = dedupKeyArray.map((dedupKey) => [null, dedupKey]);
    const requestData = [dedupKeyArray, [1]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in deleteItemGeoData:', error);
      throw error;
    }
  }

  async setItemTimestamp(dedupKey, timestamp, timezone) {
    // timestamp in epoch miliseconds
    // timesone as an offset e.g 19800 is GMT+05:30

    // type assertion
    if (dedupKey) assertType(dedupKey, 'string');
    if (timestamp) assertType(timestamp, 'number');
    if (timezone) assertType(timezone, 'number');
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

  async setItemDescription(dedupKey, description) {
    // type assertion
    if (dedupKey) assertType(dedupKey, 'string');
    if (description) assertType(description, 'string');

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

  async getItemInfo(mediaKey, albumMediaKey = null, authKey = null, parseResponse = true) {
    // type assertion
    if (mediaKey) assertType(mediaKey, 'string');
    if (albumMediaKey) assertType(albumMediaKey, 'string');
    if (authKey) assertType(authKey, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'VrseUb';

    const requestData = [mediaKey, null, authKey, null, albumMediaKey];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getItemInfo:', error);
      throw error;
    }
  }

  async getItemInfoExt(mediaKey, authKey = null, parseResponse = true) {
    // type assertion
    if (mediaKey) assertType(mediaKey, 'string');
    if (authKey) assertType(authKey, 'boolean');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'fDcn4b';
    const requestData = [mediaKey, 1, authKey, null, 1];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getItemInfoExt:', error);
      throw error;
    }
  }

  async getBatchMediaInfo(mediaKeyArray, parseResponse = true) {
    // type assertion
    if (mediaKeyArray) assertInstance(mediaKeyArray, Array);
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'EWgK9e';
    mediaKeyArray = mediaKeyArray.map((id) => [id]);
    // prettier-ignore
    const requestData = [[[mediaKeyArray], [[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null, null, null, null, null, null, null, null, null, []]]]];
    try {
      let response = await this.makeApiRequest(rpcid, requestData);
      response = response[0][1];
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getBatchMediaInfo:', error);
      throw error;
    }
  }
}
