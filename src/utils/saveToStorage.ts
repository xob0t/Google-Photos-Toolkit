import { windowGlobalData } from '../windowGlobalData';

export default function saveToStorage(key: string, value: unknown): void {
  if (typeof Storage !== 'undefined') {
    const userStorage = JSON.parse(localStorage.getItem(windowGlobalData.account) ?? '{}') as Record<string, unknown>;
    userStorage[key] = value;
    localStorage.setItem(windowGlobalData.account, JSON.stringify(userStorage));
  }
}
