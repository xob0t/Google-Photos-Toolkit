import saveToStorage from '../../utils/saveToStorage';
import getFromStorage from '../../utils/getFromStorage';
import log from './log';
import { apiSettingsDefault } from '../../api/api-utils-default-presets';
import getFormData from './utils/getFormData';
import type { ApiSettings } from '../../types';

export default function advancedSettingsListenersSetUp(): void {
  const maxConcurrentSingleApiReqInput = document.querySelector('input[name="maxConcurrentSingleApiReq"]') as HTMLInputElement;
  const maxConcurrentBatchApiReqInput = document.querySelector('input[name="maxConcurrentBatchApiReq"]') as HTMLInputElement;
  const operationSizeInput = document.querySelector('input[name="operationSize"]') as HTMLInputElement;
  const lockedFolderOpSizeInput = document.querySelector('input[name="lockedFolderOpSize"]') as HTMLInputElement;
  const infoSizeInput = document.querySelector('input[name="infoSize"]') as HTMLInputElement;
  const defaultButton = document.querySelector('button[name="default"]');
  const settingsForm = document.querySelector('.settings-form');

  function saveApiSettings(event: Event): void {
    event.preventDefault();
    const userInputSettings = getFormData('.settings-form');
    saveToStorage('apiSettings', userInputSettings);
    log('Api settings saved');
  }

  function restoreApiDefaults(): void {
    saveToStorage('apiSettings', apiSettingsDefault);

    maxConcurrentSingleApiReqInput.value = String(apiSettingsDefault.maxConcurrentSingleApiReq);
    maxConcurrentBatchApiReqInput.value = String(apiSettingsDefault.maxConcurrentBatchApiReq);
    operationSizeInput.value = String(apiSettingsDefault.operationSize);
    lockedFolderOpSizeInput.value = String(apiSettingsDefault.lockedFolderOpSize);
    infoSizeInput.value = String(apiSettingsDefault.infoSize);
    log('Default api settings restored');
  }

  const restoredSettings = getFromStorage<ApiSettings>('apiSettings');

  maxConcurrentSingleApiReqInput.value =
    String(restoredSettings?.maxConcurrentSingleApiReq ?? apiSettingsDefault.maxConcurrentSingleApiReq);
  maxConcurrentBatchApiReqInput.value =
    String(restoredSettings?.maxConcurrentBatchApiReq ?? apiSettingsDefault.maxConcurrentBatchApiReq);
  operationSizeInput.value = String(restoredSettings?.operationSize ?? apiSettingsDefault.operationSize);
  lockedFolderOpSizeInput.value = String(restoredSettings?.lockedFolderOpSize ?? apiSettingsDefault.lockedFolderOpSize);
  infoSizeInput.value = String(restoredSettings?.infoSize ?? apiSettingsDefault.infoSize);

  // Add event listener for form submission
  settingsForm?.addEventListener('submit', saveApiSettings);
  // Add event listener for "Default" button click
  defaultButton?.addEventListener('click', restoreApiDefaults);
}
