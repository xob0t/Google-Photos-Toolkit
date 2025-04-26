import { windowGlobalData } from '../windowGlobalData.js';

export default function saveToStorage(key, value) {
  if (typeof Storage !== 'undefined') {
    let userStorage = JSON.parse(localStorage.getItem(windowGlobalData.account)) || {};
    userStorage[key] = value;
    localStorage.setItem(windowGlobalData.account, JSON.stringify(userStorage));
    console.log('Data saved to localStorage:', key);
  } else {
    console.log('Sorry, your browser does not support localStorage');
  }
}
