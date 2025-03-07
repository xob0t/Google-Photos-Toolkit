import log from './ui/logic/log.js';

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
