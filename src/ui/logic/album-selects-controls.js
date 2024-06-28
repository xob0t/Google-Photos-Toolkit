import { addAlbums } from './album-selects-update.js';
import saveToStorage from '../../utils/saveToStorage.js';
import log from './log.js';
import { updateUI } from './update-state.js';
import { core } from '../../globals.js';
import getFormData from './utils/getFormData.js';
import ApiUtils from '../../api/api-utils.js';
import { apiSettingsDefault } from '../../api/api-utils-deafault-presets.js';

export function albumSelectsControlsSetUp() {
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

  const refreshAlumbsButtons = document.querySelectorAll('.refresh-albums');
  for (const refreshAlumbsButton of refreshAlumbsButtons) {
    refreshAlumbsButton?.addEventListener('click', refreshAlbums);
  }
}

function selectAllAlbums() {
  let parent = this.parentNode.parentNode;
  let closestSelect = parent.querySelector('select');
  for (const option of closestSelect.options) {
    if (option.value) option.selected = true;
  }
  updateUI();
}

function selectSharedAlbums() {
  updateUI();
  let parent = this.parentNode.parentNode;
  let closestSelect = parent.querySelector('select');
  for (const option of closestSelect.options) {
    if (option.value) option.selected = option.classList.contains('shared');
  }
  updateUI();
}

function selectNotSharedAlbums() {
  let parent = this.parentNode.parentNode;
  let closestSelect = parent.querySelector('select');
  for (const option of closestSelect.options) {
    if (option.value) option.selected = !option.classList.contains('shared');
  }
  updateUI();
}

function resetAlbumSelection() {
  let parent = this.parentNode.parentNode;
  let closestSelect = parent.querySelector('select');
  for (const option of closestSelect.options) option.selected = false;
  updateUI();
}

async function refreshAlbums() {
  // ugly
  core.isProcessRunning = true;
  let albums = null;
  const apiSettings = getFormData('.settings-form');
  try {
    const apiUtils = new ApiUtils(core, apiSettings || apiSettingsDefault);
    albums = await apiUtils.getAllAlbums();
    addAlbums(albums);
    saveToStorage('albums', albums);
    log('Albums Refreshed');
  } catch {
    log('Error refreshing albums', 'error');
  }
  core.isProcessRunning = false;
  updateUI();
}
