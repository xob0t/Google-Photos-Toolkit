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

  async getItemsByTakenDate(timestamp = null, source = null, pageId = null, parseResponse = true) {
    // type assertion
    if (timestamp) assertType(timestamp, 'number');
    if (source) assertType(source, 'string');
    if (pageId) assertType(pageId, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    // Retrieves media items created before the provided timestamp
    if (source === 'library') source = 1;
    else if (source === 'archive') source = 2;
    else if (!source) source = 3; //both

    const rpcid = 'lcxiM';
    const limit = 500; // 500 is max
    const requestData = [pageId, timestamp, limit, null, 1, source];
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

  async moveItemsToTrash(mediaIdList) {
    // type assertion
    if (mediaIdList) assertInstance(mediaIdList, Array);

    const rpcid = 'XwAOJf';
    const requestData = [null, 1, mediaIdList, 3];
    // note: It seems that '3' here corresponds to items' location
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response[0];
    } catch (error) {
      console.error('Error in moveItemsToTrash:', error);
      throw error;
    }
  }

  async restoreFromTrash(mediaIdList) {
    // type assertion
    if (mediaIdList) assertInstance(mediaIdList, Array);

    const rpcid = 'XwAOJf';
    const requestData = [null, 3, mediaIdList, 2];
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

  async getAlbums(pageId = null, parseResponse = true) {
    // type assertion
    if (pageId) assertType(pageId, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'Z5xsfc';
    const requestData = [pageId, null, null, null, 1, null, null, 100];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getAlbums:', error);
      throw error;
    }
  }

  async getAlbumItems(albumProductId, pageId = null, parseResponse = true) {
    // get items of an album or a shared link with the given id

    // type assertion
    if (albumProductId) assertType(albumProductId, 'string');
    if (pageId) assertType(pageId, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'snAcKc';
    const requestData = [albumProductId, pageId, null, null, 1];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getAlbumItems:', error);
      throw error;
    }
  }

  async removeItemsFromAlbum(itemAlbumProductIdList) {
    // regular productId's won't cut it, you need to get them from an album

    // type assertion
    if (itemAlbumProductIdList) assertInstance(itemAlbumProductIdList, Array);

    const rpcid = 'ycV3Nd';
    const requestData = [itemAlbumProductIdList];
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

  async addItemsToAlbum(productIdList, albumId = null, albumName = null) {
    // supply album ID for adding to an existing album, or a name for a new one

    // type assertion
    if (productIdList) assertInstance(productIdList, Array);
    if (albumId) assertType(albumId, 'string');
    if (albumName) assertType(albumName, 'string');

    const rpcid = 'E1Cajb';
    let requestData = null;

    if (albumName) requestData = [productIdList, null, albumName];
    else if (albumId) requestData = [productIdList, albumId];

    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in addItemsToAlbum:', error);
      throw error;
    }
  }

  async addItemsToSharedAlbum(productIdList, albumId = null, albumName = null) {
    // supply album ID for adding to an existing album, or a name for a new one

    // type assertion
    if (productIdList) assertInstance(productIdList, Array);
    if (albumId) assertType(albumId, 'string');
    if (albumName) assertType(albumName, 'string');

    const rpcid = 'laUYf';
    let requestData = null;

    if (albumName) requestData = [productIdList, null, albumName];
    else if (albumId) requestData = [albumId, [2, null, productIdList.map((id) => [[id]]), null, null, null, [1]]];

    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in addItemsToSharedAlbum:', error);
      throw error;
    }
  }

  async setFavorite(mediaIdList, action = true) {
    // type assertion
    if (mediaIdList) assertInstance(mediaIdList, Array);
    if (action) assertType(action, 'boolean');

    if (action === true) action = 1; //set favorite
    else if (action === false) action = 2; //un favorite
    mediaIdList = mediaIdList.map((item) => [null, item]);
    const rpcid = 'Ftfh0';
    const requestData = [mediaIdList, [action]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setFavorite:', error);
      throw error;
    }
  }

  async setArchive(mediaIdList, action = true) {
    // type assertion
    if (mediaIdList) assertInstance(mediaIdList, Array);
    if (action) assertType(action, 'boolean');

    if (action === true) action = 1; // send to archive
    else if (action === false) action = 2; // un archive

    mediaIdList = mediaIdList.map((item) => [null, [action], [null, item]]);
    const rpcid = 'w7TP3c';
    const requestData = [mediaIdList, null, 1];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setArchive:', error);
      throw error;
    }
  }

  async moveToLockedFolder(mediaIdList) {
    // type assertion
    if (mediaIdList) assertInstance(mediaIdList, Array);

    const rpcid = 'StLnCe';
    const requestData = [mediaIdList, []];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in moveToLockedFolder:', error);
      throw error;
    }
  }

  async removeFromLockedFolder(mediaIdList) {
    // type assertion
    if (mediaIdList) assertInstance(mediaIdList, Array);

    const rpcid = 'Pp2Xxe';
    const requestData = [mediaIdList];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in removeFromLockedFolder:', error);
      throw error;
    }
  }

  async removeItemsFromSharedAlbum(albumProductId, itemProductIdList) {
    // type assertion
    if (albumProductId) assertType(albumProductId, 'string');
    if (itemProductIdList) assertInstance(itemProductIdList, Array);

    const rpcid = 'LjmOue';
    const requestData = [
      [albumProductId],
      [itemProductIdList],
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

  async setItemGeoData(mediaId, center, visible1, visible2, scale, gMapsPlaceId) {
    // type assertion
    if (mediaId) assertType(mediaId, 'string');
    if (center) assertInstance(center, Array);
    if (visible1) assertInstance(visible1, Array);
    if (visible2) assertInstance(visible2, Array);
    if (scale) assertInstance(scale, 'number');
    if (gMapsPlaceId) assertInstance(gMapsPlaceId, 'string');

    // every point is an array of coordinates, every coordinate is 9 digit-long int
    // coordinates and scale can be extracted from mapThumb, but gMapsPlaceId is not exposed in GP
    const rpcid = 'EtUHOe';
    const requestData = [[[null, mediaId]], [2, center, [visible1, visible2], [null, null, scale], gMapsPlaceId]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setItemGeoData:', error);
      throw error;
    }
  }

  async deleteItemGeoData(mediaId) {
    // type assertion
    if (mediaId) assertType(mediaId, 'string');

    const rpcid = 'EtUHOe';
    const requestData = [[[null, mediaId]], [1]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in deleteItemGeoData:', error);
      throw error;
    }
  }

  async setItemTimestamp(mediaId, timestamp, timezone) {
    // timestamp in epoch miliseconds
    // timesone as an offset e.g 19800 is GMT+05:30

    // type assertion
    if (mediaId) assertType(mediaId, 'string');
    if (timestamp) assertType(timestamp, 'number');
    if (timezone) assertType(timezone, 'number');
    const rpcid = 'DaSgWe';
    const requestData = [[[mediaId, timestamp, timezone]]];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setItemTimestamp:', error);
      throw error;
    }
  }

  async setItemDescription(mediaId, description) {
    // type assertion
    if (mediaId) assertType(mediaId, 'string');
    if (description) assertType(description, 'string');

    const rpcid = 'AQNOFd';
    const requestData = [null, description, mediaId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in setItemDescription:', error);
      throw error;
    }
  }

  async getItemInfo(productId, parseResponse = true) {
    // type assertion
    if (productId) assertType(productId, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'VrseUb';
    const requestData = [productId, null, null, 1];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getItemInfo:', error);
      throw error;
    }
  }

  async getItemInfoExt(productId, parseResponse = true) {
    // type assertion
    if (productId) assertType(productId, 'string');
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'fDcn4b';
    const requestData = [productId, 1];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in getItemInfoExt:', error);
      throw error;
    }
  }

  async getBatchMediaInfo(productIdList, parseResponse = true) {
    // type assertion
    if (productIdList) assertInstance(productIdList, Array);
    if (parseResponse) assertType(parseResponse, 'boolean');

    const rpcid = 'EWgK9e';
    productIdList = productIdList.map((id) => [id]);
    // prettier-ignore
    const requestData = [[[productIdList], [[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null, null, null, null, null, null, null, null, null, []]]]];
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
