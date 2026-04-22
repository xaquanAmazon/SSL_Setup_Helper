import { DEFAULT_WORK_CENTER_URL, MES_SFC_SEARCH_INPUT_ID } from './constants.js';
import { delay } from './utils.js';

function queryActiveTab() {
  return new Promise(resolve => chrome.tabs.query({ active: true, currentWindow: true }, resolve));
}

async function getWorkCenterUrlTemplate() {
  return new Promise(resolve => {
    chrome.storage.local.get('workCenterUrlTemplate', data => {
      resolve(data.workCenterUrlTemplate || DEFAULT_WORK_CENTER_URL);
    });
  });
}

function buildWorkCenterUrl(template, siteId, workCenterId) {
  return template.replace('{Work_Center_ID}', workCenterId).replace('{SITE}', siteId);
}

export async function openWorkCenter(siteId, workCenterId, isMesWorkCenterPage) {
  if (!workCenterId) {
    alert('Please select a work center first.');
    return;
  }

  const template = await getWorkCenterUrlTemplate();
  const workCenterUrl = buildWorkCenterUrl(template, siteId, workCenterId);
  const [activeTab] = await queryActiveTab();

  if (isMesWorkCenterPage || !activeTab || !activeTab.url) {
    chrome.tabs.update({ url: workCenterUrl });
    return;
  }

  chrome.tabs.create({ url: workCenterUrl, index: activeTab.index + 1 });
}

export async function workCenterSearch(isMesWorkCenterPage, sfcs, tab, wcSearchBtn) {
  if (!isMesWorkCenterPage) {
    alert('Please open the Work Center website first!');
    return;
  }

  if (!sfcs || sfcs.length === 0) {
    alert('SFCs list is empty!');
    return;
  }

  const originalText = wcSearchBtn.textContent;
  wcSearchBtn.textContent = 'Searching...';
  wcSearchBtn.classList.add('searching');

  const notFoundSfcs = [];

  try {
    for (const sfc of sfcs) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (inputId, value) => {
          const input = document.getElementById(inputId);
          if (!input) return false;
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        },
        args: [MES_SFC_SEARCH_INPUT_ID, sfc],
      });

      await delay(300);

      const [checkResult] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: inputId => {
          const input = document.getElementById(inputId);
          return input ? input.value.trim() : '';
        },
        args: [MES_SFC_SEARCH_INPUT_ID],
      });

      if (checkResult.result !== '') {
        notFoundSfcs.push(sfc);
      }
    }

    if (notFoundSfcs.length > 0) {
      alert(`Search completed!\nThe following SFCs were not found:\n${notFoundSfcs.join('\n')}\nPlease verify the SFC(s), date or Resource (Incoming, Fixturing, ...)!`);
    } else {
      alert('Search completed successfully!');
    }
  } catch (error) {
    console.error('Error during work center search:', error);
    alert('An error occurred while processing the request.');
  } finally {
    wcSearchBtn.textContent = originalText;
    wcSearchBtn.classList.remove('searching');
    window.close();
  }
}
