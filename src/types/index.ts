// ============================================================
// Media Item Types
// ============================================================

export interface GeoLocation {
  coordinates?: number[];
  name?: string;
  mapThumb?: string;
}

export interface PartnerSharedItem {
  mediaKey: string;
  thumb?: string;
  resWidth?: number;
  resHeight?: number;
  timestamp: number;
  timezoneOffset?: number;
  creationTimestamp: number;
  dedupKey: string;
  saved?: boolean;
  isLivePhoto: boolean;
  livePhotoDuration?: number;
  duration?: number;
}

/**
 * Union of all media item shapes that can appear in the pipeline.
 * Extended media info fields (from getBatchMediaInfo) are optional
 * because they are only present after `extendMediaItemsWithMediaInfo`.
 */
export interface MediaItem {
  mediaKey: string;
  timestamp: number;
  timezoneOffset?: number;
  creationTimestamp: number;
  dedupKey: string;
  thumb?: string;
  resWidth?: number;
  resHeight?: number;
  isPartialUpload?: boolean;
  isArchived?: boolean;
  isFavorite?: boolean;
  duration?: number;
  descriptionShort?: string;
  isLivePhoto?: boolean;
  livePhotoDuration?: number;
  isOwned?: boolean;
  geoLocation?: GeoLocation;
  saved?: boolean;
  // Extended media info (from getBatchMediaInfo)
  descriptionFull?: string;
  fileName?: string;
  size?: number;
  takesUpSpace?: boolean | null;
  spaceTaken?: number;
  isOriginalQuality?: boolean | null;
  // Similarity filtering additions
  blob?: Blob;
  hash?: bigint;
}

// ============================================================
// Album Types
// ============================================================

export interface Album {
  mediaKey: string;
  ownerActorId?: string;
  title?: string;
  thumb?: string;
  itemCount?: number;
  creationTimestamp?: number;
  modifiedTimestamp?: number;
  timestampRange?: [number?, number?];
  isShared?: boolean;
}

// ============================================================
// Shared Link Types
// ============================================================

export interface SharedLink {
  mediaKey: string;
  linkId: string;
  itemCount?: number;
}

// ============================================================
// Actor Types
// ============================================================

export interface Actor {
  actorId?: string;
  gaiaId?: string;
  name?: string;
  gender?: string;
  profilePhotoUrl?: string;  // Fixed typo: was "profiePhotoUrl"
}

// ============================================================
// Page / Paginated Response Types
// ============================================================

export interface LibraryTimelinePage {
  items?: MediaItem[];
  nextPageId?: string;
  lastItemTimestamp: number;
}

export interface LibraryGenericPage {
  items?: MediaItem[];
  nextPageId?: string;
}

export interface LockedFolderPage {
  nextPageId?: string;
  items?: MediaItem[];
}

export interface LinksPage {
  items?: SharedLink[];
  nextPageId?: string;
}

export interface AlbumsPage {
  items?: Album[];
  nextPageId?: string;
}

export interface AlbumItemsPage {
  items?: MediaItem[];
  nextPageId?: string;
  mediaKey?: string;
  title?: string;
  owner?: Actor;
  startTimestamp?: [number, number];
  endTimestamp?: [number, number];
  lastActivityTimestamp?: number;
  creationTimestamp?: number;
  newestOperationTimestamp?: number;
  itemCount?: number;
  authKey?: string;
  members?: Actor[];
}

export interface PartnerSharedItemsPage {
  nextPageId?: string;
  items?: PartnerSharedItem[];
  members?: Actor[];
  partnerActorId?: string;  // Fixed typo: was "parnterActorId"
  gaiaId?: string;
}

export interface TrashPage {
  items?: MediaItem[];
  nextPageId?: string;
}

// ============================================================
// Media Info Types
// ============================================================

export interface BulkMediaInfo {
  mediaKey: string;
  descriptionFull?: string;
  fileName?: string;
  timestamp?: number;
  timezoneOffset?: number;
  creationTimestamp?: number;
  size?: number;
  takesUpSpace?: boolean | null;
  spaceTaken?: number;
  isOriginalQuality?: boolean | null;
}

export interface ItemInfoExt {
  mediaKey?: string;
  dedupKey?: string;
  descriptionFull?: string;
  fileName?: string;
  timestamp?: number;
  timezoneOffset?: number;
  size?: number;
  resWidth?: number;
  resHeight?: number;
  cameraInfo?: unknown;
  albums?: Album[];
  source: [string | null, string | null];
  takesUpSpace?: boolean | null;
  spaceTaken?: number;
  isOriginalQuality?: boolean | null;
  savedToYourPhotos?: boolean;
  owner?: Actor | null;
  geoLocation?: GeoLocation;
  other?: string;
}

export interface ItemInfo {
  mediaKey?: string;
  dedupKey?: string;
  resWidth?: number;
  resHeight?: number;
  isPartialUpload?: boolean;
  timestamp?: number;
  timezoneOffset?: number;
  creationTimestamp?: number;
  downloadUrl?: string;
  downloadOriginalUrl?: string;
  savedToYourPhotos?: boolean;
  isArchived?: boolean;
  takesUpSpace?: boolean | null;
  spaceTaken?: number;
  isOriginalQuality?: boolean | null;
  isFavorite?: boolean;
  duration?: number;
  isLivePhoto?: boolean;
  livePhotoDuration?: number;
  livePhotoVideoDownloadUrl?: string;
  trashTimestamp?: number;
  descriptionFull?: string;
  thumb?: string;
}

// ============================================================
// Download Types
// ============================================================

export interface DownloadTokenCheck {
  fileName?: string;
  downloadUrl?: string;
  downloadSize?: number;
  unzippedSize?: number;
}

// ============================================================
// Storage Quota Types
// ============================================================

export interface StorageQuota {
  totalUsed?: number;
  totalAvailable?: number;
  usedByGPhotos?: number;
}

// ============================================================
// Remote Match Types
// ============================================================

export interface RemoteMatch {
  hash?: string;
  mediaKey?: string;
  thumb?: string;
  resWidth?: number;
  resHeight?: number;
  timestamp?: number;
  dedupKey?: string;
  timezoneOffset?: number;
  creationTimestamp?: number;
  duration?: number;
  cameraInfo?: unknown;
}

// ============================================================
// Filter Types
// ============================================================

export interface Filter {
  dateType?: 'taken' | 'uploaded';
  intervalType?: 'include' | 'exclude';
  lowerBoundaryDate?: string;
  higherBoundaryDate?: string;
  lowerBoundarySize?: string;
  higherBoundarySize?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  type?: 'video' | 'image' | 'live';
  quality?: 'original' | 'storage-saver';
  space?: 'consuming' | 'non-consuming';
  owned?: 'true' | 'false';
  archived?: 'true' | 'false';
  favorite?: 'true' | 'false';
  excludeFavorites?: string;
  hasLocation?: 'true' | 'false';
  boundSouth?: string;
  boundWest?: string;
  boundNorth?: string;
  boundEast?: string;
  uploadStatus?: 'full' | 'partial';
  fileNameRegex?: string;
  fileNameMatchType?: 'include' | 'exclude';
  descriptionRegex?: string;
  descriptionMatchType?: 'include' | 'exclude';
  albumsInclude?: string | string[];
  albumsExclude?: string | string[];
  excludeShared?: string;
  searchQuery?: string;
  similarityThreshold?: string;
  imageHeight?: string;
  sortBySize?: string;
}

export type Source = 'library' | 'search' | 'trash' | 'lockedFolder' | 'favorites' | 'sharedLinks' | 'albums';

// ============================================================
// API Settings Types
// ============================================================

export interface ApiSettings {
  maxConcurrentSingleApiReq: number;
  maxConcurrentBatchApiReq: number;
  operationSize: number;
  lockedFolderOpSize: number;
  infoSize: number;
}

// ============================================================
// Action Types
// ============================================================

export interface Action {
  elementId: string;
  targetId?: string;
}

// ============================================================
// Window Global Data
// ============================================================

export interface WindowGlobalData {
  rapt?: unknown;
  account: string;
  'f.sid': string;
  bl: string;
  path: string;
  at: string;
}

// ============================================================
// Parsed page type (generic for getAllItems)
// ============================================================

export interface PaginatedPage<T = MediaItem> {
  items?: T[];
  nextPageId?: string;
  lastItemTimestamp?: number;
}

// ============================================================
// Image hash for similarity filtering
// ============================================================

export interface ImageHash {
  hash: bigint;
  mediaKey: string;
  dedupKey: string;
  [key: string]: unknown;
}
