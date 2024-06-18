export default function parser(data, rpcid) {

  // note
  // add =w417-h174-k-no?authuser=0 to thumbnail url to
  // set custon size, remove 'video' watermark, remove auth requirement

  function libraryItemParse(rawItemData) {
    return {
      productId: rawItemData?.[0],
      timestamp: rawItemData?.[2],
      timestampTimezone: rawItemData?.[4],
      creationTimestamp: rawItemData?.[5],
      mediaId: rawItemData?.[3],
      thumb: rawItemData?.[1]?.[0],
      resWidth: rawItemData?.[1]?.[1],
      resHeight: rawItemData?.[1]?.[2],
      isArchived: rawItemData?.[13],
      isFavorite: rawItemData?.at(-1)?.[163238866]?.[0],
      duration: rawItemData?.at(-1)?.[76647426]?.[0],
      descriptionShort: rawItemData?.at(-1)?.[396644657]?.[0],
      isLivePhoto: rawItemData?.at(-1)?.[146008172] ? true : false,
      livePhotoDuration: rawItemData?.at(-1)?.[146008172]?.[1],
      isOwned: rawItemData[7]?.filter(subArray => subArray.includes(27)).length === 0,
      geoLocation: {
        coordinates: rawItemData?.at(-1)?.[129168200]?.[1]?.[0],
        name: rawItemData?.at(-1)?.[129168200]?.[1]?.[4]?.[0]?.[1]?.[0]?.[0],
      },
    };
  }

  function libraryTimelinePage(data) {
    return {
      items: data?.[0]?.map(rawItemData => libraryItemParse(rawItemData)),
      nextPageId: data?.[1],
      lastItemTimestamp: parseInt(data?.[2]),
    };
  }

  function libraryGenericPage(data) {
    return {
      items: data?.[0]?.map(rawItemData => libraryItemParse(rawItemData)),
      nextPageId: data?.[1],
    };
  }

  function lockedFolderItemParse(rawItemData) {
    return {
      productId: rawItemData?.[0],
      timestamp: rawItemData?.[2],
      creationTimestamp: rawItemData?.[5],
      mediaId: rawItemData?.[3],
      duration: rawItemData?.at(-1)?.[76647426]?.[0],
    };
  }

  function lockedFolderPage(data) {
    return {
      nextPageId: data?.[0],
      items: data?.[1]?.map(rawItemData => lockedFolderItemParse(rawItemData)),
    };
  }

  function linkParse(rawLinkData) {
    return {
      productId: rawLinkData?.[6],
      linkId: rawLinkData?.[17],
      itemCount: rawLinkData?.[3],
    };
  }

  function linksPage(data) {
    return {
      items: data?.[0]?.map(rawLinkData => linkParse(rawLinkData)),
      nextPageId: data?.[1],
    };
  }

  function albumParse(rawAlbumData) {
    return {
      productId: rawAlbumData?.[0],
      albumId: rawAlbumData?.[6]?.[0],
      name: rawAlbumData?.at(-1)?.[72930366]?.[1],
      thumb: rawAlbumData?.[1]?.[0],
      itemCount: rawAlbumData?.at(-1)?.[72930366]?.[3],
      createdTimestamp: rawAlbumData?.at(-1)?.[72930366]?.[2]?.[4],
      modifiedTimestamp: rawAlbumData?.at(-1)?.[72930366]?.[2]?.[9],
      timestampRange: [rawAlbumData?.at(-1)?.[72930366]?.[2]?.[5], rawAlbumData?.at(-1)?.[72930366]?.[2]?.[6]],
      isShared: rawAlbumData?.at(-1)?.[72930366]?.[4] || false,
    };
  }

  function albumsPage(data) {
    return {
      items: data?.[0]?.map(rawAlbumData => albumParse(rawAlbumData)),
      nextPageId: data?.[1],
    };
  }

  function albumItemParse(rawItemData) {
    return {
      albumProductId: rawItemData?.[0],
      thumb: rawItemData?.[1]?.[0],
      resWidth: rawItemData[1]?.[1],
      resHeight: rawItemData[1]?.[2],
      timestamp: rawItemData?.[2],
      timestampTimezone: rawItemData?.[4],
      creationTimestamp: rawItemData?.[5],
      mediaId: rawItemData?.[3],
      isLivePhoto: rawItemData?.at(-1)?.[146008172] ? true : false,
      livePhotoDuration: rawItemData?.at(-1)?.[146008172]?.[1],
      duration: rawItemData?.at(-1)?.[76647426]?.[0],
    };
  }

  function trashItemParse(rawItemData) {
    return {
      productId: rawItemData?.[0],
      thumb: rawItemData?.[1]?.[0],
      resWidth: rawItemData?.[1]?.[1],
      resHeight: rawItemData?.[1]?.[2],
      timestamp: rawItemData?.[2],
      timestampTimezone: rawItemData?.[4],
      creationTimestamp: rawItemData?.[5],
      mediaId: rawItemData?.[3],
      duration: rawItemData?.at(-1)?.[76647426]?.[0],
    };
  }

  function albumItemsPage(data) {
    return {
      items: data?.[1]?.map(rawItemData => albumItemParse(rawItemData)),
      nextPageId: data?.[2],
    };
  }

  function trashPage(data) {
    return {
      items: data?.[0].map(rawItemData => trashItemParse(rawItemData)),
      nextPageId: data?.[1],
    };
  }

  function itemBulkMediaInfoParse(rawItemData) {
    return {
      productId: rawItemData?.[0],
      descriptionFull: rawItemData?.[1]?.[2],
      fileName: rawItemData?.[1]?.[3],
      timestamp: rawItemData?.[1]?.[6],
      timestampTimezone: rawItemData?.[1]?.[7],
      creationTimestamp: rawItemData?.[1]?.[8],
      size: rawItemData?.[1]?.[9],
      takesUpSpace: rawItemData?.[1]?.at(-1)?.[0] === undefined ? null : rawItemData?.[1]?.at(-1)?.[0] === 1,
      spaceTaken: rawItemData?.[1]?.at(-1)?.[1],
      isOriginalQuality: rawItemData?.[1]?.at(-1)?.[2] === undefined ? null : rawItemData?.[1]?.at(-1)?.[2] === 2,
    };
  }

  function itemInfoExtParse(rawItemData) {
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

    source[0] = rawItemData[0]?.[27]?.[0] ? sourceMap[rawItemData[0][27][0]] : null;

    const sourceMapSecondary = {
      1: 'android',
      3: 'ios',
    };

    source[1] = rawItemData[0]?.[27]?.[1]?.[2] ? sourceMapSecondary[rawItemData[0][27][1][2]] : null;

    return {
      productId: rawItemData[0]?.[0],
      mediaId: rawItemData[0]?.[11],
      descriptionFull: rawItemData[0]?.[1],
      fileName: rawItemData[0]?.[2],
      timestamp: rawItemData[0]?.[3],
      timestampTimezone: rawItemData[0]?.[4],
      size: rawItemData[0]?.[5],
      resWidth: rawItemData[0]?.[6],
      resHeight: rawItemData[0]?.[7],
      cameraInfo: rawItemData[0]?.[23],
      albums: rawItemData[0]?.[19]?.map(rawItemData => albumParse(rawItemData)),
      source: source,
      takesUpSpace: rawItemData[0]?.[30]?.[0] === undefined ? null : rawItemData[0]?.[30]?.[0] === 1,
      spaceTaken: rawItemData[0]?.[30]?.[1],
      isOriginalQuality: rawItemData[0]?.[30]?.[2] === undefined ? null : rawItemData[0][30][2] === 2,
      savedToYourPhotos: rawItemData[0]?.[12].filter(subArray => subArray.includes(20)).length === 0,
      sharedByUserName: rawItemData[0]?.[27]?.[3]?.[0]?.[11]?.[0] || rawItemData[0]?.[27]?.[4]?.[0]?.[11]?.[0],
      sharedByUserId: rawItemData[0]?.[27]?.[3]?.[0]?.[1] || rawItemData[0]?.[27]?.[4]?.[0]?.[1],
      geoLocation: {
        coordinates: rawItemData[0]?.[13]?.[0],
        name: rawItemData[0]?.[13]?.[2]?.[0]?.[1]?.[0]?.[0],
        mapThumb: rawItemData?.[1],
      },
    };
  }

  function itemInfoParse(rawItemData) {
    return {
      productId: rawItemData[0]?.[0],
      mediaId: rawItemData[0]?.[3],
      resWidth: rawItemData[0]?.[1]?.[1],
      resHeight: rawItemData[0]?.[1]?.[2],
      timestamp: rawItemData[0]?.[2],
      timestampTimezone: rawItemData[0]?.[4],
      creationTimestamp: rawItemData[0]?.[5],
      downloadUrl: rawItemData?.[1],
      downloadOriginalUrl: rawItemData?.[7], // url to download the original if item was modified after the upload
      savedToYourPhotos: rawItemData[0]?.[15]?.[163238866]?.length > 0,
      isArchived: rawItemData[0]?.[13],
      takesUpSpace: rawItemData[0]?.[15]?.[318563170]?.[0]?.[0] === undefined ? null : rawItemData[0]?.[15]?.[318563170]?.[0]?.[0] === 1,
      spaceTaken: rawItemData[0]?.[15]?.[318563170]?.[0]?.[1],
      isOriginalQuality: rawItemData[0]?.[15]?.[318563170]?.[0]?.[2] === undefined ? null : rawItemData[0]?.[15]?.[318563170]?.[0]?.[2] === 2,
      isFavorite: rawItemData[0]?.[15]?.[163238866]?.[0],
      duration: rawItemData[0]?.[15]?.[76647426]?.[0],
      isLivePhoto: rawItemData[0]?.[15]?.[146008172] ? true : false,
      livePhotoDuration: rawItemData[0]?.[15]?.[146008172]?.[1],
      livePhotoVideoDownloadUrl: rawItemData[0]?.[15]?.[146008172]?.[3],
      descriptionFull : rawItemData[10],
      thumb: rawItemData[12],
    };
  }

  function bulkMediaInfo(data) {
    return data.map(rawItemData => itemBulkMediaInfoParse(rawItemData));
  }

  if(!data?.length) return null;
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
}