import { insertUi } from './insert-ui.js';
import { updateUI } from './update-state.js';
import log from './log.js';
import getFromStorage from '../../utils/getFromStorage.js';
import { addAlbums } from './album-selects-update.js';
import { actionsListenersSetUp } from './action-bar.js';
import { albumSelectsControlsSetUp } from './album-selects-controls.js';
import controlButttonsListeners from './main-control-buttons.js';
import advancedSettingsListenersSetUp from './advanced-settings.js';
import filterListenersSetUp from './filter-listeners.js';

export default async function initUI() {
  insertUi();
  actionsListenersSetUp();
  filterListenersSetUp();
  controlButttonsListeners();
  albumSelectsControlsSetUp();
  advancedSettingsListenersSetUp();
  updateUI();

  const cachedAlbums = getFromStorage('albums');
  if (cachedAlbums) {
    log('Cached Albums Restored');
    addAlbums(cachedAlbums);
  }
}
