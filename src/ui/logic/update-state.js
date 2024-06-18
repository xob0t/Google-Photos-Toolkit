import { generateFilterDescription } from './filter-description-gen.js';
import getFormData from './utils/getFormData.js';
import { disableActionBar } from './utils/disable-action-bar.js';
import { core } from '../../globals.js';

export function updateUI() {
  function toggleVisibility(element, toggle) {
    const allDescendants = element.querySelectorAll('*');
    if (toggle) {
      element.style.display = 'block';
      for (const node of allDescendants) node.disabled = false;
    } else {
      element.style.display = 'none';
      for (const node of allDescendants) node.disabled = true;
    }
  }

  async function filterPreviewUpdate() {
    const previewElement = document.querySelector('.filter-preview span');
    try {
      const description = generateFilterDescription(getFormData('.filters-form'));
      previewElement.innerText = description;
    } catch {
      previewElement.innerText = 'Failed to generate description';
    }
  }

  function isActiveTab(tabName) {
    return document.querySelector('input[name="source"]:checked').id === tabName;
  }

  function lockedFolderTabState() {
    const lockedFolderTab = document.getElementById('lockedFolder');
    if (!window.location.href.includes('lockedfolder')) {
      lockedFolderTab.disabled = true;
      lockedFolderTab.parentNode.title = 'To process items in the locked folder, you must open GPTK while in it';
    }
  }

  function updateActionButtonStates() {
    document.getElementById('unArchive').disabled = archivedExcluded;
    document.getElementById('toFavorite').disabled = favoritesOnly || isActiveTab('favorites');
    document.getElementById('unFavorite').disabled = favoritesExcluded;
    document.getElementById('toArchive').disabled = archivedOnly;
    document.getElementById('restoreTrash').disabled = !isActiveTab('trash');
    document.getElementById('toTrash').disabled = isActiveTab('trash');
    document.getElementById('lock').disabled = isActiveTab('lockedFolder');
    document.getElementById('unLock').disabled = !isActiveTab('lockedFolder');
  }

  function updateFilterVisibility() {
    const filterElements = {
      livePhotoType: document.querySelector('.type input[value=live]').parentNode,
      includeAlbums: document.querySelector('.include-albums'),
      owned: document.querySelector('.owned'),
      search: document.querySelector('.search'),
      favorite: document.querySelector('.favorite'),
      quality: document.querySelector('.quality'),
      size: document.querySelector('.size'),
      filename: document.querySelector('.filename'),
      description: document.querySelector('.description'),
      space: document.querySelector('.space'),
      excludeAlbums: document.querySelector('.exclude-albums'),
      archive: document.querySelector('.archive'),
      excludeShared: document.querySelector('.exclude-shared'),
      excludeFavorite: document.querySelector('.exclude-favorites'),
    };

    // Default: hide all
    Object.values(filterElements).forEach((el) => toggleVisibility(el, false));

    // Conditions for showing filters based on the active tab.
    if (isActiveTab('albums')) {
      toggleVisibility(filterElements.includeAlbums, true);
    }
    if (['library', 'search', 'favorites'].some(isActiveTab)) {
      toggleVisibility(filterElements.owned, true);
    }
    if (isActiveTab('search')) {
      toggleVisibility(filterElements.search, true);
      toggleVisibility(filterElements.favorite, true);
      toggleVisibility(filterElements.archive, true);
    }
    if (!isActiveTab('trash')) {
      toggleVisibility(filterElements.livePhotoType, true);
      toggleVisibility(filterElements.quality, true);
      toggleVisibility(filterElements.size, true);
      toggleVisibility(filterElements.filename, true);
      toggleVisibility(filterElements.description, true);
      toggleVisibility(filterElements.space, true);
      if (!isActiveTab('lockedFolder')) {
        toggleVisibility(filterElements.excludeAlbums, true);
      }
      if (!isActiveTab('sharedLinks')) {
        toggleVisibility(filterElements.excludeShared, true);
      }
    }
    if (isActiveTab('library')) {
      toggleVisibility(filterElements.excludeFavorite, true);
    }
  }

  lockedFolderTabState();

  const filter = getFormData('.filters-form');

  // console.log(filter);

  const favoritesOnly = filter.favorite === 'true';
  const favoritesExcluded = filter.excludeFavorites === 'true' || filter.favorite === 'false';
  const archivedOnly = filter.archived === 'true';
  const archivedExcluded = filter.archived === 'false';

  if (core.isProcessRunning) {
    disableActionBar(true);
    document.getElementById('stopProcess').style.display = 'block';
  } else {
    document.getElementById('stopProcess').style.display = 'none';
    disableActionBar(false);
    updateActionButtonStates();
  }

  updateFilterVisibility();
  filterPreviewUpdate();
}
