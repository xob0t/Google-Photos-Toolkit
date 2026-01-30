import log from './ui/logic/log';
import { defer } from './utils/helpers';
import type { MediaItem, Filter } from './types';
import type Core from './gptk-core';

export function fileNameFilter(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  log('Filtering by filename');
  const regex = new RegExp(filter.fileNameRegex ?? '');
  let result = mediaItems;
  if (filter.fileNameMatchType === 'include') result = mediaItems.filter((item) => regex.test(item.fileName ?? ''));
  else if (filter.fileNameMatchType === 'exclude') result = mediaItems.filter((item) => !regex.test(item.fileName ?? ''));
  log(`Item count after filtering: ${result.length}`);
  return result;
}

export function descriptionFilter(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  log('Filtering by description');
  const regex = new RegExp(filter.descriptionRegex ?? '');
  let result = mediaItems;
  if (filter.descriptionMatchType === 'include') result = mediaItems.filter((item) => regex.test(item.descriptionFull ?? ''));
  else if (filter.descriptionMatchType === 'exclude') result = mediaItems.filter((item) => !regex.test(item.descriptionFull ?? ''));
  log(`Item count after filtering: ${result.length}`);
  return result;
}

export function sizeFilter(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  log('Filtering by size');
  let result = mediaItems;
  if (parseInt(filter.higherBoundarySize ?? '0') > 0) {
    result = result.filter((item) => (item.size ?? 0) < parseInt(filter.higherBoundarySize ?? '0'));
  }
  if (parseInt(filter.lowerBoundarySize ?? '0') > 0) {
    result = result.filter((item) => (item.size ?? 0) > parseInt(filter.lowerBoundarySize ?? '0'));
  }
  log(`Item count after filtering: ${result.length}`);
  return result;
}

export function resolutionFilter(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  log('Filtering by resolution');
  let result = mediaItems;
  const minW = parseInt(filter.minWidth ?? '0');
  const maxW = parseInt(filter.maxWidth ?? '0');
  const minH = parseInt(filter.minHeight ?? '0');
  const maxH = parseInt(filter.maxHeight ?? '0');
  if (minW > 0) result = result.filter((item) => (item.resWidth ?? 0) >= minW);
  if (maxW > 0) result = result.filter((item) => (item.resWidth ?? 0) <= maxW);
  if (minH > 0) result = result.filter((item) => (item.resHeight ?? 0) >= minH);
  if (maxH > 0) result = result.filter((item) => (item.resHeight ?? 0) <= maxH);
  log(`Item count after filtering: ${result.length}`);
  return result;
}

export function qualityFilter(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  log('Filtering by quality');
  let result = mediaItems;
  if (filter.quality === 'original') result = mediaItems.filter((item) => item.isOriginalQuality);
  else if (filter.quality === 'storage-saver') result = mediaItems.filter((item) => !item.isOriginalQuality);
  log(`Item count after filtering: ${result.length}`);
  return result;
}

export function spaceFilter(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  log('Filtering by space');
  let result = mediaItems;
  if (filter.space === 'consuming') result = mediaItems.filter((item) => item.takesUpSpace);
  else if (filter.space === 'non-consuming') result = mediaItems.filter((item) => !item.takesUpSpace);
  log(`Item count after filtering: ${result.length}`);
  return result;
}

export function filterByDate(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  log('Filtering by date');
  let lowerBoundaryDate = new Date(filter.lowerBoundaryDate ?? '').getTime();
  let higherBoundaryDate = new Date(filter.higherBoundaryDate ?? '').getTime();

  lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
  higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;

  let result = mediaItems;

  if (filter.intervalType === 'include') {
    if (filter.dateType === 'taken') {
      result = mediaItems.filter((item) => item.timestamp >= lowerBoundaryDate && item.timestamp <= higherBoundaryDate);
    } else if (filter.dateType === 'uploaded') {
      result = mediaItems.filter((item) => item.creationTimestamp >= lowerBoundaryDate && item.creationTimestamp <= higherBoundaryDate);
    }
  } else if (filter.intervalType === 'exclude') {
    if (filter.dateType === 'taken') {
      result = mediaItems.filter((item) => item.timestamp < lowerBoundaryDate || item.timestamp > higherBoundaryDate);
    } else if (filter.dateType === 'uploaded') {
      result = mediaItems.filter((item) => item.creationTimestamp < lowerBoundaryDate || item.creationTimestamp > higherBoundaryDate);
    }
  }
  log(`Item count after filtering: ${result.length}`);
  return result;
}

export function filterByMediaType(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  // if has duration - video, else image
  log('Filtering by media type');
  let result = mediaItems;
  if (filter.type === 'video') result = mediaItems.filter((item) => item.duration);
  else if (filter.type === 'image') result = mediaItems.filter((item) => !item.duration);
  else if (filter.type === 'live') result = mediaItems.filter((item) => item.isLivePhoto);
  log(`Item count after filtering: ${result.length}`);
  return result;
}

export function filterFavorite(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  log('Filtering favorites');
  let result = mediaItems;
  if (filter.favorite === 'true') {
    result = mediaItems.filter((item) => item.isFavorite !== false);
  } else if (filter.favorite === 'false' || filter.excludeFavorites) {
    result = mediaItems.filter((item) => item.isFavorite !== true);
  }
  log(`Item count after filtering: ${result.length}`);
  return result;
}

// Coordinates from Google's API are in microdegrees (×10⁷).
// Convert to decimal degrees for comparison.
function toDecimalDegrees(microDeg: number): number {
  // Values > 360 or < -360 are clearly microdegrees
  return Math.abs(microDeg) > 360 ? microDeg / 1e7 : microDeg;
}

export function filterByLocation(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  log('Filtering by location');
  let result = mediaItems;
  if (filter.hasLocation === 'true') {
    result = result.filter((item) => item.geoLocation?.coordinates?.length);
  } else if (filter.hasLocation === 'false') {
    result = result.filter((item) => !item.geoLocation?.coordinates?.length);
  }

  // Bounding box filter
  const south = parseFloat(filter.boundSouth ?? '');
  const west = parseFloat(filter.boundWest ?? '');
  const north = parseFloat(filter.boundNorth ?? '');
  const east = parseFloat(filter.boundEast ?? '');
  const hasBounds = !isNaN(south) && !isNaN(west) && !isNaN(north) && !isNaN(east);

  if (hasBounds) {
    log(`Filtering by bounding box: S${south} W${west} N${north} E${east}`);
    result = result.filter((item) => {
      const coords = item.geoLocation?.coordinates;
      if (!coords?.length) return false;
      const lat = toDecimalDegrees(coords[0]);
      const lng = toDecimalDegrees(coords[1]);
      if (lat < south || lat > north) return false;
      // Handle boxes that cross the antimeridian (west > east)
      if (west <= east) {
        return lng >= west && lng <= east;
      } else {
        return lng >= west || lng <= east;
      }
    });
  }

  log(`Item count after filtering: ${result.length}`);
  return result;
}

export function filterOwned(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  log('Filtering owned');
  let result = mediaItems;
  if (filter.owned === 'true') {
    result = mediaItems.filter((item) => item.isOwned !== false);
  } else if (filter.owned === 'false') {
    result = mediaItems.filter((item) => item.isOwned !== true);
  }
  log(`Item count after filtering: ${result.length}`);
  return result;
}

export function filterByUploadStatus(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  log('Filtering by upload status');
  let result = mediaItems;
  if (filter.uploadStatus === 'full') {
    result = mediaItems.filter((item) => item.isPartialUpload === false);
  } else if (filter.uploadStatus === 'partial') {
    result = mediaItems.filter((item) => item.isPartialUpload === true);
  }
  log(`Item count after filtering: ${result.length}`);
  return result;
}

export function filterArchived(mediaItems: MediaItem[], filter: Filter): MediaItem[] {
  log('Filtering archived');
  let result = mediaItems;
  if (filter.archived === 'true') {
    result = mediaItems.filter((item) => item.isArchived !== false);
  } else if (filter.archived === 'false') {
    result = mediaItems.filter((item) => item.isArchived !== true);
  }
  log(`Item count after filtering: ${result.length}`);
  return result;
}

// Process images in batches with yield points
async function processBatch<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R | null>,
  batchSize = 5,
  core: Core
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    if (!core.isProcessRunning) return results;

    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => {
        if (!core.isProcessRunning) return Promise.resolve(null);
        return processFn(item);
      })
    );
    for (const r of batchResults) {
      if (r !== null) results.push(r);
    }
    // Yield to UI thread after each batch
    await defer(() => {});
  }
  return results;
}

// This being a userscript prevents it from using web workers
// dHash implementation with non-blocking behavior
async function generateImageHash(hashSize: number, blob: Blob, core: Core): Promise<bigint | null> {
  if (!blob) return null;
  if (!core.isProcessRunning) return null;

  // Load image
  const img = new Image();
  const url = URL.createObjectURL(blob);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  if (!core.isProcessRunning) {
    URL.revokeObjectURL(url);
    return null;
  }

  // Yield to UI thread after image loads
  await defer(() => {});

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = hashSize + 1;
  canvas.height = hashSize;

  // Draw the image scaled down
  ctx.drawImage(img, 0, 0, hashSize + 1, hashSize);
  URL.revokeObjectURL(url);

  if (!core.isProcessRunning) return null;

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, hashSize + 1, hashSize);
  const pixels = imageData.data;

  // Yield to UI thread before processing pixels
  return await defer(() => {
    // Calculate the hash using differences between adjacent pixels
    let hash = 0n;

    for (let y = 0; y < hashSize; y++) {
      for (let x = 0; x < hashSize; x++) {
        if (!core.isProcessRunning) return null;

        // Position in the pixel array
        const pos = (y * (hashSize + 1) + x) * 4;
        const nextPos = (y * (hashSize + 1) + x + 1) * 4;

        // Convert to grayscale
        const gray1 = (pixels[pos] + pixels[pos + 1] + pixels[pos + 2]) / 3;
        const gray2 = (pixels[nextPos] + pixels[nextPos + 1] + pixels[nextPos + 2]) / 3;

        // Set bit if left pixel is brighter than right pixel
        if (gray1 > gray2) {
          hash |= 1n << BigInt(y * hashSize + x);
        }
      }
    }

    return hash;
  });
}

export function hammingDistance(hash1: bigint | null, hash2: bigint | null): number {
  if (hash1 === null || hash2 === null) return Infinity;

  let xor = hash1 ^ hash2;
  let distance = 0;

  while (xor !== 0n) {
    distance += Number(xor & 1n);
    xor >>= 1n;
  }

  return distance;
}

interface ImageHashEntry {
  hash: bigint;
  [key: string]: unknown;
}

async function groupSimilarImages(
  imageHashes: ImageHashEntry[],
  similarityThreshold: number,
  hashSize = 8,
  core: Core
): Promise<ImageHashEntry[][]> {
  const groups: ImageHashEntry[][] = [];

  // Process in small batches to prevent UI blocking
  const batchSize = 10;
  for (let i = 0; i < imageHashes.length; i += batchSize) {
    const batch = imageHashes.slice(i, i + batchSize);
    for (const image of batch) {
      let addedToGroup = false;

      for (const group of groups) {
        if (!core.isProcessRunning) return groups;

        const groupHash = group[0].hash;
        const distance = hammingDistance(image.hash, groupHash);

        // Max distance for a 8x8 hash is 64
        const maxPossibleDistance = hashSize * hashSize;
        const similarity = 1 - distance / maxPossibleDistance;

        if (similarity >= similarityThreshold) {
          group.push(image);
          addedToGroup = true;
          break;
        }
      }

      if (!addedToGroup) {
        groups.push([image]);
      }
    }

    // Yield to UI thread after each batch
    await defer(() => {});
  }

  return groups.filter((group) => group.length > 1);
}

// Fetch image blobs with concurrency control
async function fetchImageBlobs(
  mediaItems: MediaItem[],
  maxConcurrency: number,
  imageHeight: number,
  core: Core
): Promise<(MediaItem & { blob: Blob })[]> {
  const fetchWithLimit = async (
    item: MediaItem,
    retries = 3
  ): Promise<(MediaItem & { blob: Blob }) | null> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      if (!core.isProcessRunning) return null;

      const url = item.thumb + `=h${imageHeight}`; // Resize image
      try {
        const response = await fetch(url, {
          cache: 'force-cache',
          credentials: 'include',
          signal: AbortSignal.timeout(10000), // fetch timeout 10s
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!core.isProcessRunning) return null;

        const blob = await response.blob();
        return { ...item, blob };
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        if (attempt < retries) {
          log(`Attempt ${attempt} failed for ${item.mediaKey} (${errMsg}). Retrying...`, 'error');
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // backoff
        } else {
          log(`Failed to fetch thumb ${item.mediaKey} after ${retries} attempts. Final error: ${errMsg}`, 'error');
          return null;
        }
      }
    }
    return null;
  };

  const results: (MediaItem & { blob: Blob })[] = [];
  const queue = [...mediaItems];

  // Process the queue with concurrency control
  const worker = async (): Promise<void> => {
    while (queue.length > 0) {
      if (!core.isProcessRunning) return;

      const item = queue.shift();
      if (!item) continue;
      const result = await fetchWithLimit(item);
      if (result) results.push(result);
    }
  };

  // Start multiple workers to handle concurrent fetches
  const workers = Array.from({ length: maxConcurrency }, () => worker());
  await Promise.all(workers);

  return results;
}

// Calculate an appropriate hash size based on image height
export function calculateHashSize(imageHeight: number): number {
  // Base hash size on the square root of the height
  const baseSize = Math.max(8, Math.floor(Math.sqrt(imageHeight) / 4));

  // Keep hash size reasonable to prevent performance issues
  return Math.min(32, baseSize);
}

// Main function to filter similar media items
export async function filterSimilar(core: Core, mediaItems: MediaItem[], filter: Filter): Promise<MediaItem[]> {
  const maxConcurrentFetches = 50;
  const similarityThreshold = Number(filter.similarityThreshold) || 0.9;
  const imageHeight = Number(filter.imageHeight) || 100;
  const hashSize = calculateHashSize(imageHeight); // Dynamic hash size

  // FIX #82: Skip items that have no thumbnail URL. Expired or missing
  // thumbs cause HTTP 400 errors that abort the entire similarity run.
  const itemsWithThumbs = mediaItems.filter((item) => !!item.thumb);
  const skippedCount = mediaItems.length - itemsWithThumbs.length;
  if (skippedCount > 0) {
    log(`Skipped ${skippedCount} items with no thumbnail`);
  }

  log('Fetching images');
  const itemsWithBlobs = await fetchImageBlobs(itemsWithThumbs, maxConcurrentFetches, imageHeight, core);
  if (!core.isProcessRunning) return [];

  log('Generating image hashes');
  // Process images in batches to prevent UI blocking
  const itemsWithHashes = await processBatch(
    itemsWithBlobs,
    async (item) => {
      if (!core.isProcessRunning) return null;
      const hash = await generateImageHash(hashSize, item.blob, core);
      return hash !== null ? { ...item, hash } : null;
    },
    50, // Process 50 images per batch
    core
  );
  if (!core.isProcessRunning) return [];

  log('Grouping similar images');
  const groups = await groupSimilarImages(
    itemsWithHashes as ImageHashEntry[],
    similarityThreshold,
    hashSize,
    core
  );

  // Flatten the groups into a single array of items
  const flattenedGroups = groups.flat() as unknown as MediaItem[];

  log(`Found ${flattenedGroups.length} similar items across ${groups.length} groups`);
  return flattenedGroups;
}
