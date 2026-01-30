import { generateFilterDescription } from './filter-description-gen';
import getFormData from './utils/getFormData';
import { disableActionBar } from './utils/disable-action-bar';
import { core } from '../../globals';
import type { Filter } from '../../types';

export function updateUI(): void {
  function toggleVisibility(element: HTMLElement, toggle: boolean): void {
    const allDescendants = element.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>('input, select, button, textarea');
    if (toggle) {
      element.style.display = 'block';
      for (const node of allDescendants) node.disabled = false;
    } else {
      element.style.display = 'none';
      for (const node of allDescendants) node.disabled = true;
    }
  }

  function filterPreviewUpdate(): void {
    const previewElement = document.querySelector('.filter-preview span');
    if (!previewElement) return;
    try {
      const description = generateFilterDescription(getFormData('.filters-form') as unknown as Filter);
      previewElement.textContent = description;
    } catch {
      previewElement.textContent = 'Failed to generate description';
    }
  }

  function isActiveTab(tabName: string): boolean {
    const checkedInput = document.querySelector('input[name="source"]:checked');
    return checkedInput?.id === tabName;
  }

  function lockedFolderTabState(): void {
    const lockedFolderTab = document.getElementById('lockedFolder') as HTMLInputElement | null;
    if (lockedFolderTab && !window.location.href.includes('lockedfolder')) {
      lockedFolderTab.disabled = true;
      if (lockedFolderTab.parentNode instanceof HTMLElement) {
        lockedFolderTab.parentNode.title = 'To process items in the locked folder, you must open GPTK while in it';
      }
    }
  }

  function updateActionButtonStates(): void {
    const setDisabled = (id: string, disabled: boolean): void => {
      const el = document.getElementById(id) as HTMLButtonElement | null;
      if (el) el.disabled = disabled;
    };

    setDisabled('unArchive', archivedExcluded);
    setDisabled('toFavorite', favoritesOnly || isActiveTab('favorites'));
    setDisabled('unFavorite', favoritesExcluded);
    setDisabled('toArchive', archivedOnly);
    setDisabled('restoreTrash', !isActiveTab('trash'));
    setDisabled('toTrash', isActiveTab('trash'));
    setDisabled('lock', isActiveTab('lockedFolder'));
    setDisabled('unLock', !isActiveTab('lockedFolder'));
    setDisabled('copyDescFromOther', isActiveTab('trash'));
  }

  function updateFilterVisibility(): void {
    const filterElements: Record<string, HTMLElement | null> = {
      livePhotoType: (document.querySelector('.type input[value=live]'))?.parentNode as HTMLElement | null,
      includeAlbums: document.querySelector<HTMLElement>('.include-albums'),
      owned: document.querySelector<HTMLElement>('.owned'),
      search: document.querySelector<HTMLElement>('.search'),
      favorite: document.querySelector<HTMLElement>('.favorite'),
      quality: document.querySelector<HTMLElement>('.quality'),
      size: document.querySelector<HTMLElement>('.size'),
      filename: document.querySelector<HTMLElement>('.filename'),
      description: document.querySelector<HTMLElement>('.description'),
      space: document.querySelector<HTMLElement>('.space'),
      excludeAlbums: document.querySelector<HTMLElement>('.exclude-albums'),
      uploadStatus: document.querySelector<HTMLElement>('.upload-status'),
      archive: document.querySelector<HTMLElement>('.archive'),
      excludeShared: document.querySelector<HTMLElement>('.exclude-shared'),
      excludeFavorite: document.querySelector<HTMLElement>('.exclude-favorites'),
    };

    // Default: hide all
    Object.values(filterElements).forEach((el) => {
      if (el) toggleVisibility(el, false);
    });

    // Conditions for showing filters based on the active tab
    if (isActiveTab('albums') && filterElements.includeAlbums) {
      toggleVisibility(filterElements.includeAlbums, true);
    }
    if (['library', 'search', 'favorites'].some(isActiveTab)) {
      if (filterElements.owned) toggleVisibility(filterElements.owned, true);
      if (filterElements.uploadStatus) toggleVisibility(filterElements.uploadStatus, true);
      if (filterElements.archive) toggleVisibility(filterElements.archive, true);
    }
    if (isActiveTab('search')) {
      if (filterElements.search) toggleVisibility(filterElements.search, true);
      if (filterElements.favorite) toggleVisibility(filterElements.favorite, true);
    }
    if (!isActiveTab('trash')) {
      if (filterElements.livePhotoType) toggleVisibility(filterElements.livePhotoType, true);
      if (filterElements.quality) toggleVisibility(filterElements.quality, true);
      if (filterElements.size) toggleVisibility(filterElements.size, true);
      if (filterElements.filename) toggleVisibility(filterElements.filename, true);
      if (filterElements.description) toggleVisibility(filterElements.description, true);
      if (filterElements.space) toggleVisibility(filterElements.space, true);
      if (!isActiveTab('lockedFolder') && filterElements.excludeAlbums) {
        toggleVisibility(filterElements.excludeAlbums, true);
      }
      if (!isActiveTab('sharedLinks') && filterElements.excludeShared) {
        toggleVisibility(filterElements.excludeShared, true);
      }
    }
    if (isActiveTab('library') && filterElements.excludeFavorite) {
      toggleVisibility(filterElements.excludeFavorite, true);
    }
  }

  lockedFolderTabState();

  const filter = getFormData('.filters-form') as unknown as Filter;

  const favoritesOnly = filter.favorite === 'true';
  const favoritesExcluded = filter.excludeFavorites === 'true' || filter.favorite === 'false';
  const archivedOnly = filter.archived === 'true';
  const archivedExcluded = filter.archived === 'false';

  if (core.isProcessRunning) {
    disableActionBar(true);
    const stopBtn = document.getElementById('stopProcess');
    if (stopBtn) stopBtn.style.display = 'block';
  } else {
    const stopBtn = document.getElementById('stopProcess');
    if (stopBtn) stopBtn.style.display = 'none';
    disableActionBar(false);
    updateActionButtonStates();
  }

  updateFilterVisibility();
  filterPreviewUpdate();
  highlightActiveFilters();
}

function hasChangedFromDefault(container: HTMLElement): boolean {
  // Text, number, date inputs — compare value to defaultValue
  const textInputs = container.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="input"], input[type="number"], input[type="datetime-local"]');
  for (const input of textInputs) {
    if (input.value.trim() !== input.defaultValue.trim()) return true;
  }

  // Radio buttons — check if checked state differs from defaultChecked
  const radios = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
  for (const radio of radios) {
    if (radio.checked !== radio.defaultChecked) return true;
  }

  // Checkboxes — check if checked state differs from defaultChecked
  const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
  for (const checkbox of checkboxes) {
    if (checkbox.checked !== checkbox.defaultChecked) return true;
  }

  // Multi-selects — check if selected state differs from defaultSelected
  const selects = container.querySelectorAll<HTMLSelectElement>('select');
  for (const select of selects) {
    for (const option of select.options) {
      if (option.selected !== option.defaultSelected) return true;
    }
  }

  return false;
}

function highlightActiveFilters(): void {
  const filtersForm = document.querySelector<HTMLFormElement>('.filters-form');
  if (!filtersForm) return;

  // Details-based filters
  const detailsList = filtersForm.querySelectorAll<HTMLDetailsElement>('details');
  for (const details of detailsList) {
    details.classList.toggle('filter-active', hasChangedFromDefault(details));
  }

  // Standalone checkbox fieldsets (exclude-shared, exclude-favorites, sort-by-size)
  const checkboxFieldsets = filtersForm.querySelectorAll<HTMLElement>(':scope > fieldset');
  for (const fieldset of checkboxFieldsets) {
    fieldset.classList.toggle('filter-active', hasChangedFromDefault(fieldset));
  }
}
