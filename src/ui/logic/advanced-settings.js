import saveToStorage from '../../utils/saveToStorage.js';
import getFromStorage from '../../utils/getFromStorage.js';
import log from './log.js';
import { apiSettingsDefault } from '../../api/api-utils-default-presets.js';
import getFormData from './utils/getFormData.js';

export default function advancedSettingsListenersSetUp() {
  function saveApiSettings(event) {
    event.preventDefault();

    const userInptSettings = getFormData('.settings-form');

    // Save values to localStorage
    saveToStorage('apiSettings', userInptSettings);
    log('Api settings saved');
  }

  function restoreApiDefaults() {
    // Save default values to localStorage
    saveToStorage('apiSettings', apiSettingsDefault);

    // Update the form with default values
    maxConcurrentApiReqInput.value = apiSettingsDefault.maxConcurrentApiReq;
    operationSizeInput.value = apiSettingsDefault.operationSize;
    lockedFolderOpSizeInput.value = apiSettingsDefault.lockedFolderOpSize;
    infoSizeInput.value = apiSettingsDefault.infoSize;
    log('Default api settings restored');
  }
  const maxConcurrentApiReqInput = document.querySelector('input[name="maxConcurrentApiReq"]');
  const operationSizeInput = document.querySelector('input[name="operationSize"]');
  const lockedFolderOpSizeInput = document.querySelector('input[name="lockedFolderOpSize"]');
  const infoSizeInput = document.querySelector('input[name="infoSize"]');
  const defaultButton = document.querySelector('button[name="default"]');
  const settingsForm = document.querySelector('.settings-form');

  const restoredSettings = getFromStorage('apiSettings');

  maxConcurrentApiReqInput.value = restoredSettings?.maxConcurrentApiReq || apiSettingsDefault.maxConcurrentApiReq;
  operationSizeInput.value = restoredSettings?.operationSize || apiSettingsDefault.operationSize;
  lockedFolderOpSizeInput.value = restoredSettings?.lockedFolderOpSize || apiSettingsDefault.lockedFolderOpSize;
  infoSizeInput.value = restoredSettings?.infoSize || apiSettingsDefault.infoSize;

  // Add event listener for form submission
  settingsForm.addEventListener('submit', saveApiSettings);
  // Add event listener for "Default" button click
  defaultButton.addEventListener('click', restoreApiDefaults);
}
