import type { ApiSettings } from '../types';

export const apiSettingsDefault: ApiSettings = {
  maxConcurrentSingleApiReq: 3,
  maxConcurrentBatchApiReq: 3,
  operationSize: 250,
  lockedFolderOpSize: 100,
  infoSize: 5000,
};
