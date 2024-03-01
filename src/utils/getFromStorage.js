import { windowGlobalData } from '../windowGlobalData.js';

export default function getFromStorage(key) {
  if (typeof Storage !== 'undefined') {
    const userStorage = JSON.parse(localStorage.getItem(windowGlobalData.account)) || {};
    const storedData = userStorage[key];

    if (storedData) {
      console.log('Retrieved data from localStorage:', key);
      return storedData;
    } else {
      console.log('No data found in localStorage for key:', key);
      return null;
    }
  } else {
    console.log('Sorry, your browser does not support localStorage.');
    return null;
  }
}
