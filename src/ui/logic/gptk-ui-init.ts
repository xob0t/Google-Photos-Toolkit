import { insertUi } from './insert-ui';
import { updateUI } from './update-state';
import log from './log';
import getFromStorage from '../../utils/getFromStorage';
import { addAlbums } from './album-selects-update';
import { actionsListenersSetUp } from './action-bar';
import { albumSelectsControlsSetUp } from './album-selects-controls';
import controlButtonsListeners from './main-control-buttons';  // Fixed typo: was "controlButttonsListeners"
import advancedSettingsListenersSetUp from './advanced-settings';
import filterListenersSetUp from './filter-listeners';
import registerMenuCommand from './register-menu-command';
import type { Album } from '../../types';

export default function initUI(): void {
  registerMenuCommand();
  insertUi();
  actionsListenersSetUp();
  filterListenersSetUp();
  controlButtonsListeners();
  albumSelectsControlsSetUp();
  advancedSettingsListenersSetUp();
  updateUI();

  const cachedAlbums = getFromStorage<Album[]>('albums');
  if (cachedAlbums) {
    log('Cached Albums Restored');
    addAlbums(cachedAlbums);
  }

  // Confirm exit if process is running
  window.addEventListener('beforeunload', function (e: BeforeUnloadEvent) {
    if (unsafeWindow.gptkCore.isProcessRunning) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}
