import { STATION_SRC, DEFAULT_WORK_CENTER_URL } from './js/constants.js';

// Work Sites
const workSitesContent = document.getElementById('workSitesContent');
const saveSitesBtn = document.getElementById('saveSites');
const sitesStatusMsg = document.getElementById('sitesStatusMsg');

function showSitesStatus(msg, isError = false) {
  sitesStatusMsg.textContent = msg;
  sitesStatusMsg.className = `status-msg ${isError ? 'error' : 'success'}`;
  setTimeout(() => { sitesStatusMsg.textContent = ''; sitesStatusMsg.className = 'status-msg'; }, 3000);
}

async function loadWorkSites() {
  return new Promise(resolve => {
    chrome.storage.local.get('workSites', data => resolve(data.workSites || ''));
  });
}

saveSitesBtn.addEventListener('click', () => {
  const text = workSitesContent.value.trim();
  if (!text) { showSitesStatus('Nothing to save', true); return; }
  chrome.storage.local.set({ workSites: text }, () => showSitesStatus('Sites saved'));
});

const csvContent = document.getElementById('csvContent');
const csvFileInput = document.getElementById('csvFileInput');
const saveBtn = document.getElementById('saveContent');

const statusMsg = document.getElementById('statusMsg');

function showStatus(msg, isError = false) {
  statusMsg.textContent = msg;
  statusMsg.className = `status-msg ${isError ? 'error' : 'success'}`;
  setTimeout(() => { statusMsg.textContent = ''; statusMsg.className = 'status-msg'; }, 3000);
}

function parseCsv(raw) {
  const lines = raw.trim().split(/\r?\n/);
  const firstLine = lines[0]?.toLowerCase() || '';
  const start = firstLine.includes('work_center_id') || firstLine.includes('station_description') ? 1 : 0;
  return lines.slice(start)
    .map(line => {
      const [id, ...rest] = line.split(',').map(s => s.trim());
      return { id, description: rest.join(',') };
    })
    .filter(s => s.id && s.description);
}


async function loadDefaultCsv() {
  try {
    const url = chrome.runtime.getURL(STATION_SRC);
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.text();
  } catch { return null; }
}

async function loadCurrentCsv() {
  return new Promise(resolve => {
    chrome.storage.local.get('stationsCsv', data => {
      resolve(data.stationsCsv || null);
    });
  });
}

// URL Template
const urlTemplateInput = document.getElementById('urlTemplate');
const saveUrlBtn = document.getElementById('saveUrl');
const urlStatusMsg = document.getElementById('urlStatusMsg');

function showUrlStatus(msg, isError = false) {
  urlStatusMsg.textContent = msg;
  urlStatusMsg.className = `status-msg ${isError ? 'error' : 'success'}`;
  setTimeout(() => { urlStatusMsg.textContent = ''; urlStatusMsg.className = 'status-msg'; }, 3000);
}

saveUrlBtn.addEventListener('click', () => {
  const text = urlTemplateInput.value.trim();
  if (!text) { showUrlStatus('Nothing to save', true); return; }
  chrome.storage.local.set({ workCenterUrlTemplate: text }, () => showUrlStatus('URL template saved'));
});

async function initialize() {
  const csv = await loadCurrentCsv() || await loadDefaultCsv();
  if (csv) csvContent.value = csv;

  workSitesContent.value = await loadWorkSites();

  const urlData = await new Promise(r => chrome.storage.local.get('workCenterUrlTemplate', r));
  urlTemplateInput.value = urlData.workCenterUrlTemplate || DEFAULT_WORK_CENTER_URL;
}


csvFileInput.addEventListener('change', () => {
  const file = csvFileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    csvContent.value = e.target.result;
    showStatus(`Loaded "${file.name}" - click Save to persist`);
  };
  reader.readAsText(file);
});

saveBtn.addEventListener('click', () => {
  const text = csvContent.value.trim();
  if (!text) { showStatus('Nothing to save', true); return; }
  const stations = parseCsv(text);
  if (stations.length === 0) { showStatus('No valid stations found in CSV', true); return; }
  chrome.storage.local.set({ stationsCsv: text }, () => {
    showStatus(`Saved ${stations.length} stations to storage`);
  });
});

document.getElementById('clearStations').addEventListener('click', () => {
  csvContent.value = '';
  chrome.storage.local.remove(['stationsCsv', 'WorkCenterId'], () => showStatus('Work center list cleared'));
});


// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

document.addEventListener('DOMContentLoaded', initialize);
