import { STATION_SRC } from './constants.js';

function parseStationCsv(rawData) {
  const rows = rawData.trim().split(/\r?\n/);
  const firstLine = rows[0]?.toLowerCase() || '';
  const start = firstLine.includes('work_center_id') || firstLine.includes('station_description') ? 1 : 0;
  return rows.slice(start)
    .map(row => {
      const [id, ...rest] = row.split(',').map(s => s.trim());
      return { id, description: rest.join(',') };
    })
    .filter(s => s.id && s.description)
    .sort((a, b) => a.description.localeCompare(b.description));
}

function getStoredCsv() {
  return new Promise(resolve => {
    chrome.storage.local.get('stationsCsv', data => resolve(data.stationsCsv || null));
  });
}

async function getDefaultCsv() {
  try {
    const url = chrome.runtime.getURL(STATION_SRC);
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.text();
  } catch { return null; }
}

export async function loadStationData(workCenterSelect, selected = '') {
  try {
    const rawData = await getStoredCsv() || await getDefaultCsv();
    if (!rawData) {
      workCenterSelect.innerHTML = '<option value="">Go to Settings to add work centers</option>';
      return;
    }
    const stations = parseStationCsv(rawData);

    workCenterSelect.innerHTML = '<option value="">Select a station...</option>';
    stations.forEach(station => {
      const option = document.createElement('option');
      option.value = station.id;
      option.textContent = station.description;
      workCenterSelect.appendChild(option);
    });

    if (selected) workCenterSelect.value = selected;
  } catch (error) {
    console.error('Error loading station data:', error);
  }
}
