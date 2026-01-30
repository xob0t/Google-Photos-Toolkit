import type { ApiSettings } from '../types';

// FIX #4: Default settings now include both maxConcurrentSingleApiReq and
// maxConcurrentBatchApiReq instead of the single mismatched key "maxConcurrentApiReq"
export const apiSettingsDefault: ApiSettings = {
  maxConcurrentSingleApiReq: 3,
  maxConcurrentBatchApiReq: 3,
  operationSize: 250,
  lockedFolderOpSize: 100,
  infoSize: 5000,
};
