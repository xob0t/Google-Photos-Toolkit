import parser from './parser.js';
import { windowGlobalData } from '../windowGlobalData.js';

export default class Api {
  async makeApiRequest(rpcid, requestData) {
    requestData = [[[rpcid, JSON.stringify(requestData), null, 'generic']]];

    const requestDataString = `f.req=${encodeURIComponent(JSON.stringify(requestData))}&at=${encodeURIComponent(windowGlobalData.at)}&`;

    const params = {
      rpcids: rpcid,
      'source-path': window.location.pathname,
      'f.sid': windowGlobalData['f.sid'],
      bl: windowGlobalData.bl,
      pageId: 'none',
      rt: 'c'
    };
    // if in locked folder send rapt
    if(windowGlobalData.rapt) params.rapt = windowGlobalData.rapt;
    const paramsString = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
    const url = `https://photos.google.com${windowGlobalData.path}data/batchexecute?${paramsString}`;
    try {
      const response = await fetch(url, {
        'headers': {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        'body': requestDataString,
        'method': 'POST',
        'credentials': 'include'
      });

      const responseBody = await response.text();
      const jsonLines = responseBody.split('\n').filter(line => line.includes('wrb.fr'));
      let parsedData = JSON.parse(jsonLines[0]);
      return JSON.parse(parsedData[0][2]);
    } catch (error) {
      console.error(`Error in ${rpcid} request:`, error);
      throw error;
    }
  }

  async listItemsByTakenDate(timestamp = null, source = null, pageId = null, parseResponse = true) {
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
      console.error('Error in listItemsByTakenDate:', error);
      throw error;
    }
  }

  async listItemsByUploadedDate(pageId = null, parseResponse = true) {
    const rpcid = 'EzkLib';
    const requestData = ['', [[4, 'ra', 0, 0]], pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in listItemsByUploadedDate:', error);
      throw error;
    }
  }

  async search(searchQuery, pageId = null, parseResponse = true) {
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

  async listFavorites(pageId = null, parseResponse = true) {
    const rpcid = 'EzkLib';
    const requestData = ['Favorites', [[5, '8', 0, 9]], pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in listFavorites:', error);
      throw error;
    }
  }

  async listTrashItems(pageId = null, parseResponse = true) {
    const rpcid = 'zy0IHe';
    const requestData = [pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in listTrashItems:', error);
      throw error;
    }
  }

  async listLockedFolderItems(pageId = null, parseResponse = true) {
    const rpcid = 'nMFwOc';
    const requestData = [pageId];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in listLockedFolderItems:', error);
      throw error;
    }
  }

  async moveMediaToTrash(mediaIdList) {
    const rpcid = 'XwAOJf';
    const requestData = [null, 1, mediaIdList, 3];
    // note: It seems that '3' here corresponds to items' location
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response[0];
    } catch (error) {
      console.error('Error in moveMediaToTrash:', error);
      throw error;
    }
  }

  async restoreFromTrash(mediaIdList) {
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

  async listSharedLinks(pageId = null, parseResponse = true) {
    const rpcid = 'F2A0H';
    const requestData = [pageId, null, 2, null, 3];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in listSharedLinks:', error);
      throw error;
    }
  }

  async listAlbums(pageId = null, parseResponse = true) {
    const rpcid = 'Z5xsfc';
    const requestData = [pageId, null, null, null, 1, null, null, 100];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in listAlbums:', error);
      throw error;
    }
  }

  async listAlbumItems(albumId, pageId = null, parseResponse = true) {
    // list items of an album or a shared link with the given id
    const rpcid = 'snAcKc';
    const requestData = [albumId, pageId, null, null, 1];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      if (parseResponse) return parser(response, rpcid);
      return response;
    } catch (error) {
      console.error('Error in listAlbumItems:', error);
      throw error;
    }
  }

  async removeFromAlbum(albumItemIdList) {
    const rpcid = 'ycV3Nd';
    const requestData = [albumItemIdList];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response;
    } catch (error) {
      console.error('Error in removeFromAlbum:', error);
      throw error;
    }
  }

  async createEmptyAlbum(albumName) {
    // returns string id of the created album
    const rpcid = 'OXvT9d';
    let requestData = [albumName, null, 2];
    try {
      const response = await this.makeApiRequest(rpcid, requestData);
      return response[0][0];
    } catch (error) {
      console.error('Error in createEmptyAlbum:', error);
      throw error;
    }
  }

  async addItemsToAlbum(productIdList, albumId = null, albumName = null) {
    // supply album ID for adding to an existing album, or a name for a new one
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

  async setFavorite(mediaIdList, action = true) {
    if (action === true) action = 1; //set favorite
    else if (action === false) action = 2;//un favorite
    mediaIdList = mediaIdList.map(item => [null, item]);
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
    if (action === true) action = 1;// send to archive
    else if (action === false) action = 2;// un archive

    mediaIdList = mediaIdList.map(item => [null, [action], [null, item]]);
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

  async getBatchMediaInfo(productIdList, parseResponse = true) {
    const rpcid = 'EWgK9e';
    productIdList = productIdList.map(id => [id]);
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
