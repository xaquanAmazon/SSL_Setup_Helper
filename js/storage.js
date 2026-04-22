import { STORAGE_KEYS } from './constants.js';

export function loadSavedData() {
  return new Promise(resolve => chrome.storage.local.get(STORAGE_KEYS, resolve));
}

export function saveDataToStorage(data) {
  return new Promise(resolve => chrome.storage.local.set(data, resolve));
}

export function clearSavedData() {
  return new Promise(resolve => chrome.storage.local.remove(STORAGE_KEYS, resolve));
}
