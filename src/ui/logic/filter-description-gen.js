export function generateFilterDescription(filter) {

  // date check
  if (filter.lowerBoundaryDate >= filter.higherBoundaryDate) return 'Error: Invalid Date Interval';
  // size check
  if (parseInt(filter.lowerBoundarySize) >= parseInt(filter.higherBoundarySize)) return 'Error: Invalid Size Filter';
  let descriptionParts = ['Filter: All'];

  if (filter.owned === 'true') descriptionParts.push('owned');
  else if (filter.owned === 'false') descriptionParts.push('not owned');

  if (filter.space === 'consuming') descriptionParts.push('space consuming');
  if (filter.space === 'non-consuming') descriptionParts.push('non-space consuming');

  if (filter.excludeShared === 'true') descriptionParts.push('non-shared');

  if (filter.favorite === 'true') descriptionParts.push('favorite');
  if (filter.excludeFavorites === 'true' || filter.favorite === 'false') descriptionParts.push('non-favorite');

  if (filter.quality === 'original') descriptionParts.push('original quality');
  else if (filter.quality === 'storage-saver') descriptionParts.push('storage-saver quality');
  if (filter.archived === 'true') descriptionParts.push('archived');
  else if (filter.archived === 'false') descriptionParts.push('non-archived');

  if (!filter.type) descriptionParts.push('media');
  else if (filter.type === 'video') descriptionParts.push('videos');
  else if (filter.type === 'image') descriptionParts.push('images');

  if (filter.searchQuery) descriptionParts.push(`in search results of query "${filter.searchQuery}"`);

  if (filter.fileNameRegex) {
    descriptionParts.push('with filename');
    if (filter.fileNameMatchType === 'include') descriptionParts.push('matching');
    if (filter.fileNameMatchType === 'exclude') descriptionParts.push('not matching');
    descriptionParts.push(`regex "${filter.fileNameRegex}"`);
  }

  if (filter.descriptionRegex) {
    descriptionParts.push('with description');
    if (filter.descriptionMatchType === 'include') descriptionParts.push('matching');
    if (filter.descriptionMatchType === 'exclude') descriptionParts.push('not matching');
    descriptionParts.push(`regex "${filter.descriptionRegex}"`);
  }

  if (parseInt(filter.lowerBoundarySize) > 0) descriptionParts.push(`larger than ${parseInt(filter.lowerBoundarySize)} bytes`);
  if (parseInt(filter.lowerBoundarySize) > 0 && parseInt(filter.higherBoundarySize) > 0) descriptionParts.push('and');
  if (parseInt(filter.higherBoundarySize) > 0) descriptionParts.push(`smaller than ${parseInt(filter.higherBoundarySize)} bytes`);

  if (filter.albumsInclude) {
    descriptionParts.push(Array.isArray(filter.albumsInclude) ? 'in the target albums' : 'in the target album');
  }
  if (filter.albumsExclude) {
    descriptionParts.push('excluding items');
    descriptionParts.push(Array.isArray(filter.albumsExclude) ? 'in the selected albums' : 'in the selected album');
  }

  if (filter.lowerBoundaryDate || filter.higherBoundaryDate) {
    const lowerBoundaryDate = filter.lowerBoundaryDate ? new Date(filter.lowerBoundaryDate).toLocaleString('en-GB') : null;
    const higherBoundaryDate = filter.higherBoundaryDate ? new Date(filter.higherBoundaryDate).toLocaleString('en-GB') : null;

    if (filter.dateType === 'taken') descriptionParts.push('taken');
    else if (filter.dateType === 'uploaded') descriptionParts.push('uploaded');

    if (lowerBoundaryDate && higherBoundaryDate) {

      if (filter.intervalType === 'exclude') {
        descriptionParts.push(`before ${lowerBoundaryDate} and after ${higherBoundaryDate}`);
      }
      else if (filter.intervalType === 'include') {
        descriptionParts.push(`from ${lowerBoundaryDate} to ${higherBoundaryDate}`);
      }
    } else if (lowerBoundaryDate) {
      if (filter.intervalType === 'exclude') descriptionParts.push(`before ${lowerBoundaryDate}`);
      else if (filter.intervalType === 'include') descriptionParts.push(`after ${lowerBoundaryDate}`);

    } else if (higherBoundaryDate) {
      if (filter.intervalType === 'exclude') descriptionParts.push(`after ${higherBoundaryDate}`);
      else if (filter.intervalType === 'include') descriptionParts.push(`before ${higherBoundaryDate}`);
    }
  }

  let filterDescriptionString = descriptionParts.join(' ');
  if (filterDescriptionString == 'Filter: All media') filterDescriptionString = 'Filter: None';
  return filterDescriptionString;
}