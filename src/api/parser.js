export default function parser(data, rpcid) {

  /* notes

  add =w417-h174-k-no?authuser=0 to thumbnail url to set custon size, remove 'video' watermark, remove auth requirement

  */

  function libraryItemParse(itemData) {
    return {
      mediaKey: itemData?.[0],
      timestamp: itemData?.[2],
      timezoneOffset: itemData?.[4],
      creationTimestamp: itemData?.[5],
      dedupKey: itemData?.[3],
      thumb: itemData?.[1]?.[0],
      resWidth: itemData?.[1]?.[1],
      resHeight: itemData?.[1]?.[2],
      isPartialUpload: itemData[12]?.[0] === 20,
      isArchived: itemData?.[13],
      isFavorite: itemData?.at(-1)?.[163238866]?.[0],
      duration: itemData?.at(-1)?.[76647426]?.[0],
      descriptionShort: itemData?.at(-1)?.[396644657]?.[0],
      isLivePhoto: itemData?.at(-1)?.[146008172] ? true : false,
      livePhotoDuration: itemData?.at(-1)?.[146008172]?.[1],
      isOwned: itemData[7]?.filter((subArray) => subArray.includes(27)).length === 0,
      geoLocation: {
        coordinates: itemData?.at(-1)?.[129168200]?.[1]?.[0],
        name: itemData?.at(-1)?.[129168200]?.[1]?.[4]?.[0]?.[1]?.[0]?.[0],
      },
    };
  }

  function libraryTimelinePage(data) {
    return {
      items: data?.[0]?.map((itemData) => libraryItemParse(itemData)),
      nextPageId: data?.[1],
      lastItemTimestamp: parseInt(data?.[2]),
    };
  }

  function libraryGenericPage(data) {
    return {
      items: data?.[0]?.map((itemData) => libraryItemParse(itemData)),
      nextPageId: data?.[1],
    };
  }

  function lockedFolderItemParse(itemData) {
    return {
      mediaKey: itemData?.[0],
      timestamp: itemData?.[2],
      creationTimestamp: itemData?.[5],
      dedupKey: itemData?.[3],
      duration: itemData?.at(-1)?.[76647426]?.[0],
    };
  }

  function lockedFolderPage(data) {
    return {
      nextPageId: data?.[0],
      items: data?.[1]?.map((itemData) => lockedFolderItemParse(itemData)),
    };
  }

  function linkParse(itemData) {
    return {
      mediaKey: itemData?.[6],
      linkId: itemData?.[17],
      itemCount: itemData?.[3],
    };
  }

  function linksPage(data) {
    return {
      items: data?.[0]?.map((itemData) => linkParse(itemData)),
      nextPageId: data?.[1],
    };
  }

  function albumParse(itemData) {
    return {
      mediaKey: itemData?.[0],
      ownerActorId: itemData?.[6]?.[0],
      title: itemData?.at(-1)?.[72930366]?.[1],
      thumb: itemData?.[1]?.[0],
      itemCount: itemData?.at(-1)?.[72930366]?.[3],
      creationTimestamp: itemData?.at(-1)?.[72930366]?.[2]?.[4],
      modifiedTimestamp: itemData?.at(-1)?.[72930366]?.[2]?.[9],
      timestampRange: [itemData?.at(-1)?.[72930366]?.[2]?.[5], itemData?.at(-1)?.[72930366]?.[2]?.[6]],
      isShared: itemData?.at(-1)?.[72930366]?.[4] || false,
    };
  }

  function albumsPage(data) {
    return {
      items: data?.[0]?.map((itemData) => albumParse(itemData)),
      nextPageId: data?.[1],
    };
  }

  function albumItemParse(itemData) {
    return {
      mediaKey: itemData?.[0],
      thumb: itemData?.[1]?.[0],
      resWidth: itemData[1]?.[1],
      resHeight: itemData[1]?.[2],
      timestamp: itemData?.[2],
      timezoneOffset: itemData?.[4],
      creationTimestamp: itemData?.[5],
      dedupKey: itemData?.[3],
      isLivePhoto: itemData?.at(-1)?.[146008172] ? true : false,
      livePhotoDuration: itemData?.at(-1)?.[146008172]?.[1],
      duration: itemData?.at(-1)?.[76647426]?.[0],
    };
  }

  function trashItemParse(itemData) {
    return {
      mediaKey: itemData?.[0],
      thumb: itemData?.[1]?.[0],
      resWidth: itemData?.[1]?.[1],
      resHeight: itemData?.[1]?.[2],
      timestamp: itemData?.[2],
      timezoneOffset: itemData?.[4],
      creationTimestamp: itemData?.[5],
      dedupKey: itemData?.[3],
      duration: itemData?.at(-1)?.[76647426]?.[0],
    };
  }

  function actorParse(data) {
    return {
      actorId: data?.[0],
      gaiaId: data?.[1],
      name: data?.[11]?.[0],
      gender: data?.[11]?.[2],
      profiePhotoUrl: data?.[12]?.[0],
    };
  }

  function albumItemsPage(data) {
    return {
      items: data?.[1]?.map((itemData) => albumItemParse(itemData)),
      nextPageId: data?.[2],
      mediaKey: data?.[3][0],
      title: data?.[3][1],
      owner: actorParse(data?.[3][5]),
      startTimestamp: data?.[3][2][5],
      endTimestamp: data?.[3][2][6],
      lastActivityTimestamp: data?.[3][2][7],
      creationTimestamp: data?.[3][2][8],
      newestOperationTimestamp: data?.[3][2][9],
      totalItemCount: data?.[3][2][21],
      authKey: data?.[3][19],
      members: data?.[3][9]?.map((itemData) => actorParse(itemData)),
    };
  }

  function trashPage(data) {
    return {
      items: data?.[0].map((itemData) => trashItemParse(itemData)),
      nextPageId: data?.[1],
    };
  }

  function itemBulkMediaInfoParse(itemData) {
    return {
      mediaKey: itemData?.[0],
      descriptionFull: itemData?.[1]?.[2],
      fileName: itemData?.[1]?.[3],
      timestamp: itemData?.[1]?.[6],
      timezoneOffset: itemData?.[1]?.[7],
      creationTimestamp: itemData?.[1]?.[8],
      size: itemData?.[1]?.[9],
      takesUpSpace: itemData?.[1]?.at(-1)?.[0] === undefined ? null : itemData?.[1]?.at(-1)?.[0] === 1,
      spaceTaken: itemData?.[1]?.at(-1)?.[1],
      isOriginalQuality: itemData?.[1]?.at(-1)?.[2] === undefined ? null : itemData?.[1]?.at(-1)?.[2] === 2,
    };
  }

  function itemInfoExtParse(itemData) {
    const source = [];

    const sourceMap = {
      1: 'mobile',
      2: 'web',
      3: 'shared',
      4: 'partnerShared',
      7: 'drive',
      8: 'pc',
      11: 'gmail',
    };

    source[0] = itemData[0]?.[27]?.[0] ? sourceMap[itemData[0][27][0]] : null;

    const sourceMapSecondary = {
      1: 'android',
      3: 'ios',
    };

    source[1] = itemData[0]?.[27]?.[1]?.[2] ? sourceMapSecondary[itemData[0][27][1][2]] : null;

    let owner = null;
    if (itemData[0]?.[27]?.length > 0){
      owner = actorParse(itemData[0]?.[27]?.[3]?.[0] || itemData[0]?.[27]?.[4]?.[0]);
    }
    if (!owner?.actorId){
      owner = actorParse(itemData[0]?.[28]);
    }

    return {
      mediaKey: itemData[0]?.[0],
      dedupKey: itemData[0]?.[11],
      descriptionFull: itemData[0]?.[1],
      fileName: itemData[0]?.[2],
      timestamp: itemData[0]?.[3],
      timezoneOffset: itemData[0]?.[4],
      size: itemData[0]?.[5],
      resWidth: itemData[0]?.[6],
      resHeight: itemData[0]?.[7],
      cameraInfo: itemData[0]?.[23],
      albums: itemData[0]?.[19]?.map((itemData) => albumParse(itemData)),
      source: source,
      takesUpSpace: itemData[0]?.[30]?.[0] === undefined ? null : itemData[0]?.[30]?.[0] === 1,
      spaceTaken: itemData[0]?.[30]?.[1],
      isOriginalQuality: itemData[0]?.[30]?.[2] === undefined ? null : itemData[0][30][2] === 2,
      savedToYourPhotos: itemData[0]?.[12].filter((subArray) => subArray.includes(20)).length === 0,
      owner: owner,
      geoLocation: {
        coordinates: itemData[0]?.[9]?.[0] || itemData[0]?.[13]?.[0],
        name: itemData[0]?.[13]?.[2]?.[0]?.[1]?.[0]?.[0],
        mapThumb: itemData?.[1],
      },
      other: itemData[0]?.[31],
    };
  }

  function itemInfoParse(itemData) {
    return {
      mediaKey: itemData[0]?.[0],
      dedupKey: itemData[0]?.[3],
      resWidth: itemData[0]?.[1]?.[1],
      resHeight: itemData[0]?.[1]?.[2],
      isPartialUpload: itemData[0]?.[12]?.[0] === 20,
      timestamp: itemData[0]?.[2],
      timezoneOffset: itemData[0]?.[4],
      creationTimestamp: itemData[0]?.[5],
      downloadUrl: itemData?.[1],
      downloadOriginalUrl: itemData?.[7], // url to download the original if item was modified after the upload
      savedToYourPhotos: itemData[0]?.[15]?.[163238866]?.length > 0,
      isArchived: itemData[0]?.[13],
      takesUpSpace: itemData[0]?.[15]?.[318563170]?.[0]?.[0] === undefined ? null : itemData[0]?.[15]?.[318563170]?.[0]?.[0] === 1,
      spaceTaken: itemData[0]?.[15]?.[318563170]?.[0]?.[1],
      isOriginalQuality: itemData[0]?.[15]?.[318563170]?.[0]?.[2] === undefined ? null : itemData[0]?.[15]?.[318563170]?.[0]?.[2] === 2,
      isFavorite: itemData[0]?.[15]?.[163238866]?.[0],
      duration: itemData[0]?.[15]?.[76647426]?.[0],
      isLivePhoto: itemData[0]?.[15]?.[146008172] ? true : false,
      livePhotoDuration: itemData[0]?.[15]?.[146008172]?.[1],
      livePhotoVideoDownloadUrl: itemData[0]?.[15]?.[146008172]?.[3],
      trashTimestamp: itemData[0]?.[15]?.[225032867]?.[0],
      descriptionFull: itemData[10],
      thumb: itemData[12],
    };
  }

  function bulkMediaInfo(data) {
    return data.map((itemData) => itemBulkMediaInfoParse(itemData));
  }

  function downloadTokenCheckParse(data) {
    return {
      fileName: data?.[0]?.[0]?.[0]?.[2]?.[0]?.[0],
      downloadUrl: data?.[0]?.[0]?.[0]?.[2]?.[0]?.[1],
      downloadSize: data?.[0]?.[0]?.[0]?.[2]?.[0]?.[2],
      unzippedSize: data?.[0]?.[0]?.[0]?.[2]?.[0]?.[3],
    };
  }

  function storageQuotaParse(data){
    return{
      totalUsed: data?.[6]?.[0],
      totalAvailable: data?.[6]?.[1],
      usedByGPhotos: data?.[6]?.[3],
    };
  }

  function remoteMatchParse(itemData){
    return{
      hash: itemData?.[0],
      mediaKey: itemData?.[1]?.[0],
      thumb: itemData?.[1]?.[1]?.[0],
      resWidth: itemData?.[1]?.[1]?.[1],
      resHeight: itemData?.[1]?.[1]?.[2],
      timestamp: itemData?.[1]?.[2],
      dedupKey: itemData?.[1]?.[3],
      timezoneOffset: itemData?.[1]?.[4],
      creationTimestamp: itemData?.[1]?.[5],
      duration: itemData?.[1]?.at(-1)?.[76647426]?.[0],
      cameraInfo: itemData?.[1]?.[1]?.[8],
    };
  }

  function remoteMatchesParse(data) {
    return data[0].map((itemData) => remoteMatchParse(itemData));
  }

  if (!data?.length) return null;
  if (rpcid === 'lcxiM') return libraryTimelinePage(data);
  if (rpcid === 'nMFwOc') return lockedFolderPage(data);
  if (rpcid === 'EzkLib') return libraryGenericPage(data);
  if (rpcid === 'F2A0H') return linksPage(data);
  if (rpcid === 'Z5xsfc') return albumsPage(data);
  if (rpcid === 'snAcKc') return albumItemsPage(data);
  if (rpcid === 'zy0IHe') return trashPage(data);
  if (rpcid === 'VrseUb') return itemInfoParse(data);
  if (rpcid === 'fDcn4b') return itemInfoExtParse(data);
  if (rpcid === 'EWgK9e') return bulkMediaInfo(data);
  if (rpcid === 'dnv2s') return downloadTokenCheckParse(data);
  if (rpcid === 'EzwWhf') return storageQuotaParse(data);
  if (rpcid === 'swbisb') return remoteMatchesParse(data);
}
