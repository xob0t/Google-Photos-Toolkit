import { windowGlobalData } from '../../windowGlobalData';
import { core } from '../../globals';
import getFormData from './utils/getFormData';
import { generateFilterDescription } from './filter-description-gen';
import { updateUI } from './update-state';
import { disableActionBar } from './utils/disable-action-bar';
import getFromStorage from '../../utils/getFromStorage';
import type { Action, Album, ApiSettings, Filter, Source } from '../../types';

const actions: Action[] = [
  { elementId: 'toExistingAlbum', targetId: 'existingAlbum' },
  { elementId: 'toNewAlbum', targetId: 'newAlbumName' },
  { elementId: 'toTrash' },
  { elementId: 'restoreTrash' },
  { elementId: 'toArchive' },
  { elementId: 'unArchive' },
  { elementId: 'toFavorite' },
  { elementId: 'unFavorite' },
  { elementId: 'lock' },
  { elementId: 'unLock' },
  { elementId: 'copyDescFromOther' },
];

function userConfirmation(action: Action, filter: Filter): boolean {
  function generateWarning(action: Action, filter: Filter): string {
    const filterDescription = generateFilterDescription(filter);
    const sourceLabel = document.querySelector('input[name="source"]:checked+label');
    const sourceHuman = sourceLabel?.textContent?.trim() ?? 'Unknown';
    const actionElement = document.getElementById(action.elementId);
    const warning: string[] = [];
    warning.push(`Account: ${windowGlobalData.account}`);
    warning.push(`\nSource: ${sourceHuman}`);
    warning.push(`\n${filterDescription}`);
    warning.push(`\nAction: ${actionElement?.title ?? action.elementId}`);
    return warning.join(' ');
  }
  const warning = generateWarning(action, filter);
  return window.confirm(`${warning}\nProceed?`);
}

async function runAction(actionId: string): Promise<void> {
  const action = actions.find((a) => a.elementId === actionId);
  if (!action) return;

  // Get the target album if action has one
  let targetAlbum: Album | undefined;
  let newTargetAlbumName: string | undefined;

  if (actionId === 'toExistingAlbum') {
    const albumSelect = document.getElementById(action.targetId ?? '') as HTMLSelectElement | null;
    const albumMediaKey = albumSelect?.value;
    const albums = getFromStorage<Album[]>('albums');
    targetAlbum = albums?.find((album) => album.mediaKey === albumMediaKey);
  } else {
    const nameInput = document.getElementById(action.targetId ?? '') as HTMLInputElement | null;
    newTargetAlbumName = nameInput?.value;
  }

  // ID of currently selected source element
  const sourceInput = document.querySelector('input[name="source"]:checked');
  const source = (sourceInput?.id ?? 'library') as Source;

  // Check filter validity
  const filtersForm = document.querySelector<HTMLFormElement>('.filters-form');
  if (filtersForm && !filtersForm.checkValidity()) {
    filtersForm.reportValidity();
    return;
  }

  // Parsed filter object
  const filter = getFormData('.filters-form') as unknown as Filter;
  // Parsed settings object
  const apiSettings = getFormData('.settings-form');

  if (!userConfirmation(action, filter)) return;

  // Disable action bar while process is running
  disableActionBar(true);
  // Add class to indicate which action is running
  const actionEl = document.getElementById(actionId);
  actionEl?.classList.add('running');
  // Run it
  await core.actionWithFilter(action, filter, source, targetAlbum, newTargetAlbumName, apiSettings as unknown as ApiSettings);
  // Remove 'running' class
  actionEl?.classList.remove('running');
  // Update the UI
  updateUI();
  // Force show main action bar
  showActionButtons();
}

function showExistingAlbumContainer(): void {
  const actionButtons = document.querySelector<HTMLElement>('.action-buttons');
  const existingContainer = document.querySelector<HTMLElement>('.to-existing-container');
  if (actionButtons) actionButtons.style.display = 'none';
  if (existingContainer) existingContainer.style.display = 'flex';
}

function showNewAlbumContainer(): void {
  const actionButtons = document.querySelector<HTMLElement>('.action-buttons');
  const newContainer = document.querySelector<HTMLElement>('.to-new-container');
  if (actionButtons) actionButtons.style.display = 'none';
  if (newContainer) newContainer.style.display = 'flex';
}

function showActionButtons(): void {
  const actionButtons = document.querySelector<HTMLElement>('.action-buttons');
  const existingContainer = document.querySelector<HTMLElement>('.to-existing-container');
  const newContainer = document.querySelector<HTMLElement>('.to-new-container');
  if (actionButtons) actionButtons.style.display = 'flex';
  if (existingContainer) existingContainer.style.display = 'none';
  if (newContainer) newContainer.style.display = 'none';
}

export function actionsListenersSetUp(): void {
  for (const action of actions) {
    const actionElement = document.getElementById(action.elementId);
    if (!actionElement) continue;

    if ((actionElement as HTMLButtonElement).type === 'button') {
      actionElement.addEventListener('click', (event: Event) => {
        event.preventDefault();
        void runAction(actionElement.id);
      });
    } else if (actionElement.tagName.toLowerCase() === 'form') {
      actionElement.addEventListener('submit', (event: Event) => {
        event.preventDefault();
        void runAction(actionElement.id);
      });
    }
  }

  const showExistingAlbumForm = document.querySelector('#showExistingAlbumForm');
  showExistingAlbumForm?.addEventListener('click', showExistingAlbumContainer);

  const showNewAlbumForm = document.querySelector('#showNewAlbumForm');
  showNewAlbumForm?.addEventListener('click', showNewAlbumContainer);

  const returnButtons = document.querySelectorAll('.return');
  for (const button of returnButtons) {
    button?.addEventListener('click', showActionButtons);
  }
}
