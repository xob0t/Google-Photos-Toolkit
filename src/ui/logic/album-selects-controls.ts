import { addAlbums } from './album-selects-update';
import saveToStorage from '../../utils/saveToStorage';
import log from './log';
import { apiUtils } from '../../globals';
import { updateUI } from './update-state';
import { core } from '../../globals';

export function albumSelectsControlsSetUp(): void {
  const selectAllButtons = document.querySelectorAll('[name="selectAll"]');
  for (const selectAllButton of selectAllButtons) {
    selectAllButton?.addEventListener('click', selectAllAlbums);
  }

  const selectSharedButtons = document.querySelectorAll('[name="selectShared"]');
  for (const selectSharedButton of selectSharedButtons) {
    selectSharedButton?.addEventListener('click', selectSharedAlbums);
  }

  const selectNotSharedButtons = document.querySelectorAll('[name="selectNonShared"]');
  for (const selectNotSharedButton of selectNotSharedButtons) {
    selectNotSharedButton?.addEventListener('click', selectNotSharedAlbums);
  }

  const resetAlbumSelectionButtons = document.querySelectorAll('[name="resetAlbumSelection"]');
  for (const resetAlbumSelectionButton of resetAlbumSelectionButtons) {
    resetAlbumSelectionButton?.addEventListener('click', resetAlbumSelection);
  }

  const refreshAlbumsButtons = document.querySelectorAll('.refresh-albums');
  for (const refreshAlbumsButton of refreshAlbumsButtons) {
    refreshAlbumsButton?.addEventListener('click', () => void refreshAlbums());
  }
}

function selectAllAlbums(this: HTMLElement): void {
  const parent = this.parentNode?.parentNode as HTMLElement | null;
  const closestSelect = parent?.querySelector('select') as HTMLSelectElement | null;
  if (closestSelect) {
    for (const option of closestSelect.options) {
      if (option.value) option.selected = true;
    }
  }
  updateUI();
}

function selectSharedAlbums(this: HTMLElement): void {
  const parent = this.parentNode?.parentNode as HTMLElement | null;
  const closestSelect = parent?.querySelector('select') as HTMLSelectElement | null;
  if (closestSelect) {
    for (const option of closestSelect.options) {
      if (option.value) option.selected = option.classList.contains('shared');
    }
  }
  updateUI();
}

function selectNotSharedAlbums(this: HTMLElement): void {
  const parent = this.parentNode?.parentNode as HTMLElement | null;
  const closestSelect = parent?.querySelector('select') as HTMLSelectElement | null;
  if (closestSelect) {
    for (const option of closestSelect.options) {
      if (option.value) option.selected = !option.classList.contains('shared');
    }
  }
  updateUI();
}

function resetAlbumSelection(this: HTMLElement): void {
  const parent = this.parentNode?.parentNode as HTMLElement | null;
  const closestSelect = parent?.querySelector('select') as HTMLSelectElement | null;
  if (closestSelect) {
    for (const option of closestSelect.options) option.selected = false;
  }
  updateUI();
}

async function refreshAlbums(): Promise<void> {
  // Temporarily set process running to prevent concurrent actions
  core.isProcessRunning = true;
  try {
    const albums = await apiUtils.getAllAlbums();
    addAlbums(albums);
    saveToStorage('albums', albums);
    log('Albums Refreshed');
  } catch (e) {
    log(`Error refreshing albums ${String(e)}`, 'error');
  }
  core.isProcessRunning = false;
  updateUI();
}
