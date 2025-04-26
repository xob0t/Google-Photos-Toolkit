import log from './ui/logic/log.js';
import { defer } from './utils/helpers.js';

export function fileNameFilter(mediaItems, filter) {
  log('Filtering by filename');
  const regex = new RegExp(filter.fileNameRegex);
  if (filter?.fileNameMatchType === 'include') mediaItems = mediaItems.filter((item) => regex.test(item.fileName));
  else if (filter?.fileNameMatchType === 'exclude') mediaItems = mediaItems.filter((item) => !regex.test(item.fileName));
  log(`Item count after filtering: ${mediaItems?.length}`);
  return mediaItems;
}

export function descriptionFilter(mediaItems, filter) {
  log('Filtering by description');
  const regex = new RegExp(filter.descriptionRegex);
  if (filter?.descriptionMatchType === 'include') mediaItems = mediaItems.filter((item) => regex.test(item.descriptionFull));
  else if (filter?.descriptionMatchType === 'exclude') mediaItems = mediaItems.filter((item) => !regex.test(item.descriptionFull));
  log(`Item count after filtering: ${mediaItems?.length}`);
  return mediaItems;
}

export function sizeFilter(mediaItems, filter) {
  log('Filtering by size');
  if (parseInt(filter?.higherBoundarySize) > 0) mediaItems = mediaItems.filter((item) => item.size < filter.higherBoundarySize);
  if (parseInt(filter?.lowerBoundarySize) > 0) mediaItems = mediaItems.filter((item) => item.size > filter.lowerBoundarySize);
  log(`Item count after filtering: ${mediaItems?.length}`);
  return mediaItems;
}

export function qualityFilter(mediaItems, filter) {
  log('Filtering by quality');
  if (filter.quality == 'original') mediaItems = mediaItems.filter((item) => item.isOriginalQuality);
  else if (filter.quality == 'storage-saver') mediaItems = mediaItems.filter((item) => !item.isOriginalQuality);
  log(`Item count after filtering: ${mediaItems?.length}`);
  return mediaItems;
}

export function spaceFilter(mediaItems, filter) {
  log('Filtering by space');
  if (filter.space === 'consuming') mediaItems = mediaItems.filter((item) => item.takesUpSpace);
  else if (filter.space === 'non-consuming') mediaItems = mediaItems.filter((item) => !item.takesUpSpace);
  log(`Item count after filtering: ${mediaItems?.length}`);
  return mediaItems;
}

export function filterByDate(mediaItems, filter) {
  log('Filtering by date');
  let lowerBoundaryDate = new Date(filter.lowerBoundaryDate).getTime();
  let higherBoundaryDate = new Date(filter.higherBoundaryDate).getTime();

  lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
  higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;

  if (filter.intervalType === 'include') {
    if (filter.dateType === 'taken') {
      mediaItems = mediaItems.filter((item) => item.timestamp >= lowerBoundaryDate && item.timestamp <= higherBoundaryDate);
    } else if (filter.dateType === 'uploaded') {
      mediaItems = mediaItems.filter((item) => item.creationTimestamp >= lowerBoundaryDate && item.creationTimestamp <= higherBoundaryDate);
    }
  } else if (filter.intervalType === 'exclude') {
    if (filter.dateType === 'taken') {
      mediaItems = mediaItems.filter((item) => item.timestamp < lowerBoundaryDate || item.timestamp > higherBoundaryDate);
    } else if (filter.dateType === 'uploaded') {
      mediaItems = mediaItems.filter((item) => item.creationTimestamp < lowerBoundaryDate || item.creationTimestamp > higherBoundaryDate);
    }
  }
  log(`Item count after filtering: ${mediaItems?.length}`);
  return mediaItems;
}

export function filterByMediaType(mediaItems, filter) {
  // if has duration - video, else image
  log('Filtering by media type');
  if (filter.type === 'video') mediaItems = mediaItems.filter((item) => item.duration);
  else if (filter.type === 'image') mediaItems = mediaItems.filter((item) => !item.duration);
  else if (filter.type === 'live') mediaItems = mediaItems.filter((item) => item.isLivePhoto);
  log(`Item count after filtering: ${mediaItems?.length}`);
  return mediaItems;
}

export function filterFavorite(mediaItems, filter) {
  log('Filtering favorites');
  if (filter.favorite === 'true') {
    mediaItems = mediaItems.filter((item) => item?.isFavorite !== false);
  } else if (filter.favorite === 'false' || filter.excludeFavorites) {
    mediaItems = mediaItems.filter((item) => item?.isFavorite !== true);
  }

  log(`Item count after filtering: ${mediaItems?.length}`);
  return mediaItems;
}

export function filterOwned(mediaItems, filter) {
  log('Filtering owned');
  if (filter.owned === 'true') {
    mediaItems = mediaItems.filter((item) => item?.isOwned !== false);
  } else if (filter.owned === 'false') {
    mediaItems = mediaItems.filter((item) => item?.isOwned !== true);
  }
  log(`Item count after filtering: ${mediaItems?.length}`);
  return mediaItems;
}

export function filterByUploadStatus(mediaItems, filter) {
  log('Filtering by upload status');
  if (filter.uploadStatus === 'full') {
    mediaItems = mediaItems.filter((item) => item?.isPartialUpload === false);
  } else if (filter.uploadStatus === 'partial') {
    mediaItems = mediaItems.filter((item) => item?.isPartialUpload === true);
  }

  log(`Item count after filtering: ${mediaItems?.length}`);
  return mediaItems;
}

export function filterArchived(mediaItems, filter) {
  log('Filtering archived');
  if (filter.archived === 'true') {
    mediaItems = mediaItems.filter((item) => item?.isArchived !== false);
  } else if (filter.archived === 'false') {
    mediaItems = mediaItems.filter((item) => item?.isArchived !== true);
  }

  log(`Item count after filtering: ${mediaItems?.length}`);
  return mediaItems;
}

// Process images in batches with yield points
async function processBatch(items, processFn, batchSize = 5, core) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    if (!core.isProcessRunning) return results;

    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => {
        if (!core.isProcessRunning) return null;
        return processFn(item);
      })
    );
    results.push(...batchResults.filter(Boolean));
    // Yield to UI thread after each batch
    await defer(() => {});
  }
  return results;
}

// This being a usersctipt prevents it from using web workers
// dHash implementation with non-blocking behavior
async function generateImageHash(hashSize, blob, core) {
  if (!blob) return null;
  if (!core.isProcessRunning) return null;

  // Load image
  const img = new Image();
  const url = URL.createObjectURL(blob);
  await new Promise((resolve, reject) => {
    img.onload = resolve;
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

function hammingDistance(hash1, hash2) {
  if (hash1 === null || hash2 === null) return Infinity;

  let xor = hash1 ^ hash2;
  let distance = 0;

  while (xor !== 0n) {
    distance += Number(xor & 1n);
    xor >>= 1n;
  }

  return distance;
}

async function groupSimilarImages(imageHashes, similarityThreshold, hashSize = 8, core) {
  const groups = [];

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
async function fetchImageBlobs(mediaItems, maxConcurrency, imageHeight, core) {
  const fetchWithLimit = async (item, retries = 3) => {
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
        if (attempt < retries) {
          log(`Attempt ${attempt} failed for ${item.mediaKey} (${error.message}). Retrying...`, 'error');
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // backoff
        } else {
          log(`Failed to fetch thumb ${item.mediaKey} after ${retries} attempts. Final error: ${error.message}`, 'error');
          return null;
        }
      }
    }
  };

  const results = [];
  const queue = [...mediaItems];

  // Process the queue with concurrency control
  const worker = async () => {
    while (queue.length > 0) {
      if (!core.isProcessRunning) return;

      const item = queue.shift();
      const result = await fetchWithLimit(item);
      if (result) results.push(result);
    }
  };

  // Start multiple workers to handle concurrent fetches
  const workers = Array.from({ length: maxConcurrency }, worker);
  await Promise.all(workers);

  return results;
}

// Calculate an appropriate hash size based on image height
function calculateHashSize(imageHeight) {
  // Base hash size on the square root of the height
  // This provides a reasonable scaling factor
  const baseSize = Math.max(8, Math.floor(Math.sqrt(imageHeight) / 4));

  // Keep hash size as a power of 2 or other even number for efficient processing
  // Limiting to a reasonable maximum to prevent performance issues
  return Math.min(32, baseSize);
}

// Main function to filter similar media items
export async function filterSimilar(core, mediaItems, filter) {
  const maxConcurrentFetches = 50;
  const similarityThreshold = filter.similarityThreshold;
  const imageHeight = filter.imageHeight;
  const hashSize = calculateHashSize(imageHeight); // Dynamic hash size

  log('Fetching images');
  const itemsWithBlobs = await fetchImageBlobs(mediaItems, maxConcurrentFetches, imageHeight, core);
  if (!core.isProcessRunning) return [];

  log('Generating image hashes');
  // Process images in batches to prevent UI blocking
  const itemsWithHashes = await processBatch(
    itemsWithBlobs,
    async (item) => {
      if (!core.isProcessRunning) return null;
      const hash = await generateImageHash(hashSize, item.blob, core);
      return hash ? { ...item, hash } : null;
    },
    50, // Process 50 images per batch
    core
  );
  if (!core.isProcessRunning) return [];

  log('Grouping similar images');
  const groups = await groupSimilarImages(itemsWithHashes, similarityThreshold, hashSize, core);

  // Flatten the groups into a single array of items
  const flattenedGroups = groups.flat();

  log(`Found ${flattenedGroups.length} similar items across ${groups.length} groups.`);
  return flattenedGroups;
}
