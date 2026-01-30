import { windowGlobalData } from '../windowGlobalData';

export default function getFromStorage<T = unknown>(key: string): T | null {
  if (typeof Storage !== 'undefined') {
    const userStorage = JSON.parse(localStorage.getItem(windowGlobalData.account) ?? '{}') as Record<string, unknown>;
    const storedData = userStorage[key] as T | undefined;

    if (storedData !== undefined && storedData !== null) {
      console.log('Retrieved data from localStorage:', key);
      return storedData;
    } else {
      console.log('No data found in localStorage for key:', key);
      return null;
    }
  } else {
    console.log('Sorry, your browser does not support localStorage');
    return null;
  }
}
