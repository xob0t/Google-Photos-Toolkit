import { windowGlobalData } from '../windowGlobalData';

export default function getFromStorage<T = unknown>(key: string): T | null {
  if (typeof Storage !== 'undefined') {
    const userStorage = JSON.parse(localStorage.getItem(windowGlobalData.account) ?? '{}') as Record<string, unknown>;
    const storedData = userStorage[key] as T | undefined;

    if (storedData !== undefined && storedData !== null) {
      return storedData;
    }
    return null;
  }
  return null;
}
