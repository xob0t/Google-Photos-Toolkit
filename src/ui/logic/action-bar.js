import { windowGlobalData } from '../../windowGlobalData.js';
import { core } from '../../globals.js';
import getFormData from './utils/getFormData.js';
import { generateFilterDescription } from './filter-description-gen.js';
import { updateUI } from './update-state.js';
import { disableActionBar } from './utils/disable-action-bar.js';
import getFromStorage from '../../utils/getFromStorage.js';

const actions = [
  {
    elementId: 'toExistingAlbum',
    targetId: 'existingAlbum',
  },
  {
    elementId: 'toNewAlbum',
    targetId: 'newAlbumName',
  },
  { elementId: 'toTrash' },
  { elementId: 'restoreTrash' },
  { elementId: 'toArchive' },
  { elementId: 'unArchive' },
  { elementId: 'toFavorite' },
  { elementId: 'unFavorite' },
  { elementId: 'lock' },
  { elementId: 'unLock' },
  { elementId: 'setDescToOther' },
];

function userConfirmation(action, filter, source) {
  function generateWarning(action, filter) {
    const filterDescription = generateFilterDescription(filter);
    const sourceHuman = document.querySelector('input[name="source"]:checked+label').textContent.trim();
    const actionElement = document.getElementById(action.elementId);
    const warning = [];
    warning.push(`Account: ${windowGlobalData.account}`);
    warning.push(`\nSource: ${sourceHuman}`);
    warning.push(`\n${filterDescription}`);
    warning.push(`\nAction: ${actionElement.title}`);
    return warning.join(' ');
  }
  const warning = generateWarning(action, filter, source);
  const confirmation = window.confirm(`${warning}\nProceed?`);
  if (!confirmation) return false;
  return true;
}

async function runAction(actionId) {
  const action = actions.find((action) => action.elementId === actionId);
  // get the target album if action has one
  let targetAlbum = null;
  let newTargetAlbumName = null;
  if (actionId === 'toExistingAlbum') {
    const albumMediaKey = document.getElementById(action?.targetId)?.value;
    targetAlbum = getFromStorage('albums').find((album) => album.mediaKey === albumMediaKey);
  } else {
    newTargetAlbumName = document.getElementById(action?.targetId)?.value;
  }
  // id of currently selected source element
  const source = document.querySelector('input[name="source"]:checked').id;

  // check filter validity
  const filtersForm = document.querySelector('.filters-form');
  if (!filtersForm.checkValidity()) {
    filtersForm.reportValidity();
    return;
  }

  // Parsed filter object
  const filter = getFormData('.filters-form');
  // Parsed settings object
  const apiSettings = getFormData('.settings-form');
  if (!userConfirmation(action, filter, source)) return;

  // Disable action bar while process is running
  disableActionBar(true);
  // add class to indicate which action is running
  document.getElementById(actionId).classList.add('running');
  // Run it
  await core.actionWithFilter(action, filter, source, targetAlbum, newTargetAlbumName, apiSettings);
  // remove 'running' class
  document.getElementById(actionId).classList.remove('running');
  // Update the ui
  updateUI();
  // force show main action bar
  showActionButtons();
}

function showExistingAlbumContainer() {
  document.querySelector('.action-buttons').style.display = 'none';
  document.querySelector('.to-existing-container').style.display = 'flex';
}

function showNewAlbumContainer() {
  document.querySelector('.action-buttons').style.display = 'none';
  document.querySelector('.to-new-container').style.display = 'flex';
}

function showActionButtons() {
  document.querySelector('.action-buttons').style.display = 'flex';
  document.querySelector('.to-existing-container').style.display = 'none';
  document.querySelector('.to-new-container').style.display = 'none';
}

export function actionsListenersSetUp() {
  for (const action of actions) {
    const actionElement = document.getElementById(action.elementId);
    if (actionElement.type === 'button') {
      actionElement.addEventListener('click', async function (event) {
        event.preventDefault();
        await runAction(actionElement.id);
      });
    } else if (actionElement.tagName.toLowerCase() === 'form') {
      actionElement.addEventListener('submit', async function (event) {
        event.preventDefault();
        await runAction(actionElement.id);
      });
    }
  }

  const showExistingAlbumForm = document.querySelector('#showExistingAlbumForm');
  showExistingAlbumForm.addEventListener('click', showExistingAlbumContainer);

  const showNewAlbumForm = document.querySelector('#showNewAlbumForm');
  showNewAlbumForm.addEventListener('click', showNewAlbumContainer);

  const returnButtons = document.querySelectorAll('.return');
  for (const button of returnButtons) {
    button?.addEventListener('click', showActionButtons);
  }
}
