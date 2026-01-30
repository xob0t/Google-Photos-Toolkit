/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
// The parser transforms raw untyped JSON arrays from Google's undocumented
// batchexecute API into typed objects.  Every access into the response is
// inherently `any`-typed, so the no-unsafe-* rules are expected here.

import type {
  MediaItem,
  LockedFolderItem,
  SharedLink,
  Album,
  Actor,
  PartnerSharedItem,
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

/*
  Notes:
  Add =w417-h174-k-no?authuser=0 to thumbnail URL to set custom size,
  remove 'video' watermark, remove auth requirement.
*/

function libraryItemParse(itemData: any): MediaItem {
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
    isOwned: itemData[7]?.filter((subArray: any[]) => subArray.includes(27)).length === 0,
    geoLocation: {
      coordinates: itemData?.at(-1)?.[129168200]?.[1]?.[0],
      name: itemData?.at(-1)?.[129168200]?.[1]?.[4]?.[0]?.[1]?.[0]?.[0],
    },
  };
}

function libraryTimelinePage(data: any): LibraryTimelinePage {
  return {
    items: data?.[0]?.map((itemData: any) => libraryItemParse(itemData)),
    nextPageId: data?.[1],
    lastItemTimestamp: parseInt(data?.[2]),
  };
}

function libraryGenericPage(data: any): LibraryGenericPage {
  return {
    items: data?.[0]?.map((itemData: any) => libraryItemParse(itemData)),
    nextPageId: data?.[1],
  };
}

function lockedFolderItemParse(itemData: any): LockedFolderItem {
  return {
    mediaKey: itemData?.[0],
    timestamp: itemData?.[2],
    creationTimestamp: itemData?.[5],
    dedupKey: itemData?.[3],
    duration: itemData?.at(-1)?.[76647426]?.[0],
  };
}

function lockedFolderPage(data: any): LockedFolderPage {
  return {
    nextPageId: data?.[0],
    items: data?.[1]?.map((itemData: any) => lockedFolderItemParse(itemData)),
  };
}

function linkParse(itemData: any): SharedLink {
  return {
    mediaKey: itemData?.[6],
    linkId: itemData?.[17],
    itemCount: itemData?.[3],
  };
}

function linksPage(data: any): LinksPage {
  return {
    items: data?.[0]?.map((itemData: any) => linkParse(itemData)),
    nextPageId: data?.[1],
  };
}

function albumParse(itemData: any): Album {
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

function albumsPage(data: any): AlbumsPage {
  return {
    items: data?.[0]?.map((itemData: any) => albumParse(itemData)),
    nextPageId: data?.[1],
  };
}

function partnerSharedItemParse(itemData: any): PartnerSharedItem {
  return {
    mediaKey: itemData?.[0],
    thumb: itemData?.[1]?.[0],
    resWidth: itemData[1]?.[1],
    resHeight: itemData[1]?.[2],
    timestamp: itemData?.[2],
    timezoneOffset: itemData?.[4],
    creationTimestamp: itemData?.[5],
    dedupKey: itemData?.[3],
    saved: itemData?.[7]?.[3]?.[0] !== 20,
    isLivePhoto: itemData?.at(-1)?.[146008172] ? true : false,
    livePhotoDuration: itemData?.at(-1)?.[146008172]?.[1],
    duration: itemData?.at(-1)?.[76647426]?.[0],
  };
}

function albumItemParse(itemData: any): MediaItem {
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

function trashItemParse(itemData: any): MediaItem {
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

function actorParse(data: any): Actor {
  return {
    actorId: data?.[0],
    gaiaId: data?.[1],
    name: data?.[11]?.[0],
    gender: data?.[11]?.[2],
    profilePhotoUrl: data?.[12]?.[0],  // Fixed typo: was "profiePhotoUrl"
  };
}

function partnerSharedItemsPage(data: any): PartnerSharedItemsPage {
  return {
    nextPageId: data?.[0],
    items: data?.[1]?.map((itemData: any) => partnerSharedItemParse(itemData)),
    members: data?.[2]?.map((itemData: any) => actorParse(itemData)),
    partnerActorId: data?.[4],  // Fixed typo: was "parnterActorId"
    gaiaId: data?.[5],
  };
}

function albumItemsPage(data: any): AlbumItemsPage {
  return {
    items: data?.[1]?.map((itemData: any) => albumItemParse(itemData)),
    nextPageId: data?.[2],
    mediaKey: data?.[3]?.[0],
    title: data?.[3]?.[1],
    owner: actorParse(data?.[3]?.[5]),
    startTimestamp: data?.[3]?.[2]?.[5],
    endTimestamp: data?.[3]?.[2]?.[6],
    lastActivityTimestamp: data?.[3]?.[2]?.[7],
    creationTimestamp: data?.[3]?.[2]?.[8],
    newestOperationTimestamp: data?.[3]?.[2]?.[9],
    itemCount: data?.[3]?.[21],
    authKey: data?.[3]?.[19],
    members: data?.[3]?.[9]?.map((itemData: any) => actorParse(itemData)),
  };
}

function trashPage(data: any): TrashPage {
  return {
    items: data?.[0]?.map((itemData: any) => trashItemParse(itemData)),
    nextPageId: data?.[1],
  };
}

function itemBulkMediaInfoParse(itemData: any): BulkMediaInfo {
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

function itemInfoExtParse(itemData: any): ItemInfoExt {
  const source: [string | null, string | null] = [null, null];

  const sourceMap: Record<number, string> = {
    1: 'mobile',
    2: 'web',
    3: 'shared',
    4: 'partnerShared',
    7: 'drive',
    8: 'pc',
    11: 'gmail',
  };

  source[0] = itemData[0]?.[27]?.[0] ? sourceMap[itemData[0][27][0]] ?? null : null;

  const sourceMapSecondary: Record<number, string> = {
    1: 'android',
    3: 'ios',
  };

  source[1] = itemData[0]?.[27]?.[1]?.[2] ? sourceMapSecondary[itemData[0][27][1][2]] ?? null : null;

  let owner: Actor | null = null;
  if (itemData[0]?.[27]?.length > 0) {
    owner = actorParse(itemData[0]?.[27]?.[3]?.[0] || itemData[0]?.[27]?.[4]?.[0]);
  }
  if (!owner?.actorId) {
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
    albums: itemData[0]?.[19]?.map((album: any) => albumParse(album)),
    source,
    takesUpSpace: itemData[0]?.[30]?.[0] === undefined ? null : itemData[0]?.[30]?.[0] === 1,
    spaceTaken: itemData[0]?.[30]?.[1],
    isOriginalQuality: itemData[0]?.[30]?.[2] === undefined ? null : itemData[0][30][2] === 2,
    savedToYourPhotos: itemData[0]?.[12].filter((subArray: any[]) => subArray.includes(20)).length === 0,
    owner,
    geoLocation: {
      coordinates: itemData[0]?.[9]?.[0] || itemData[0]?.[13]?.[0],
      name: itemData[0]?.[13]?.[2]?.[0]?.[1]?.[0]?.[0],
      mapThumb: itemData?.[1],
    },
    other: itemData[0]?.[31],
  };
}

function itemInfoParse(itemData: any): ItemInfo {
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
    downloadOriginalUrl: itemData?.[7],
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

function bulkMediaInfo(data: any[]): BulkMediaInfo[] {
  return data.map((itemData: any) => itemBulkMediaInfoParse(itemData));
}

function downloadTokenCheckParse(data: any): DownloadTokenCheck {
  return {
    fileName: data?.[0]?.[0]?.[0]?.[2]?.[0]?.[0],
    downloadUrl: data?.[0]?.[0]?.[0]?.[2]?.[0]?.[1],
    downloadSize: data?.[0]?.[0]?.[0]?.[2]?.[0]?.[2],
    unzippedSize: data?.[0]?.[0]?.[0]?.[2]?.[0]?.[3],
  };
}

function storageQuotaParse(data: any): StorageQuota {
  return {
    totalUsed: data?.[6]?.[0],
    totalAvailable: data?.[6]?.[1],
    usedByGPhotos: data?.[6]?.[3],
  };
}

function remoteMatchParse(itemData: any): RemoteMatch {
  return {
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

function remoteMatchesParse(data: any): RemoteMatch[] {
  return data?.[0]?.map((itemData: any) => remoteMatchParse(itemData)) ?? [];
}

type ParserResult =
  | LibraryTimelinePage
  | LibraryGenericPage
  | LockedFolderPage
  | LinksPage
  | AlbumsPage
  | AlbumItemsPage
  | PartnerSharedItemsPage
  | TrashPage
  | ItemInfo
  | ItemInfoExt
  | BulkMediaInfo[]
  | DownloadTokenCheck
  | StorageQuota
  | RemoteMatch[]
  | null;

const parserRegistry: Record<string, (data: any) => ParserResult> = {
  'lcxiM': libraryTimelinePage,
  'nMFwOc': lockedFolderPage,
  'EzkLib': libraryGenericPage,
  'F2A0H': linksPage,
  'Z5xsfc': albumsPage,
  'snAcKc': albumItemsPage,
  'e9T5je': partnerSharedItemsPage,
  'zy0IHe': trashPage,
  'VrseUb': itemInfoParse,
  'fDcn4b': itemInfoExtParse,
  'EWgK9e': bulkMediaInfo,
  'dnv2s': downloadTokenCheckParse,
  'EzwWhf': storageQuotaParse,
  'swbisb': remoteMatchesParse,
};

export default function parser(data: any, rpcid: string): ParserResult {
  if (!data?.length) return null;

  const parserFn = parserRegistry[rpcid];
  if (parserFn) return parserFn(data);

  return null;
}
