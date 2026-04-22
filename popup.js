import { loadSavedData, saveDataToStorage, clearSavedData } from './js/storage.js';
import { loadStationData } from './js/stations.js';
import { openWorkCenter, workCenterSearch } from './js/workCenter.js';
import { generateQRLayout } from './js/qrGenerator.js';
import { parseLines } from './js/utils.js';

function getActiveTab() {
    return new Promise(resolve => chrome.tabs.query({ active: true, currentWindow: true }, resolve));
}

function getInputValues() {
    return {
        layerNumber: parseInt(document.getElementById('layerNum').value, 10) || 1,
        rows: parseInt(document.getElementById('rows').value, 10) || 1,
        cols: parseInt(document.getElementById('cols').value, 10) || 1,
        workCenterId: document.getElementById('workCenterSelect').value,
        siteId: document.getElementById('siteId').value,
        sfcText: document.getElementById('sfcsText').value,
    };
}

function saveCurrentData() {
    const { layerNumber, rows, cols, workCenterId, siteId, sfcText } = getInputValues();
    return saveDataToStorage({
        savedData: sfcText,
        LayerNumber: layerNumber,
        Rows: rows,
        Cols: cols,
        WorkCenterId: workCenterId,
        SiteId: siteId,
    });
}

function populateSavedValues(data) {
    if (!data) {
        return;
    }

    const sfcsText = document.getElementById('sfcsText');
    const layerNumInput = document.getElementById('layerNum');
    const rowsInput = document.getElementById('rows');
    const colsInput = document.getElementById('cols');
    const workCenterSelect = document.getElementById('workCenterSelect');
    const siteIdInput = document.getElementById('siteId');

    if (data.savedData) sfcsText.value = data.savedData;
    if (data.LayerNumber) layerNumInput.value = data.LayerNumber;
    if (data.Rows) rowsInput.value = data.Rows;
    if (data.Cols) colsInput.value = data.Cols;
    if (data.WorkCenterId) workCenterSelect.value = data.WorkCenterId;
    if (data.SiteId) siteIdInput.value = data.SiteId;
}

async function loadWorkSites(selectEl, savedSiteId) {
    const data = await new Promise(resolve => chrome.storage.local.get('workSites', resolve));
    const text = data.workSites || '133,Default';
    selectEl.innerHTML = '';
    text.trim().split(/\r?\n/).forEach(line => {
        const [id, ...rest] = line.split(',').map(s => s.trim());
        if (!id) return;
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = rest.length ? `${id} - ${rest.join(',')}` : id;
        selectEl.appendChild(opt);
    });
    if (savedSiteId) selectEl.value = savedSiteId;
}

async function initialize() {
    const generateButton = document.getElementById('generate');
    const clearButton = document.getElementById('clear');
    const copyButton = document.getElementById('copyLayout');
    const wcSearchBtn = document.getElementById('wcSearch');
    const openWorkCenterBtn = document.getElementById('openWorkCenter');
    const workCenterSelect = document.getElementById('workCenterSelect');

    const siteSelect = document.getElementById('siteId');

    let isMesWorkCenterPage = false;
    const [tab] = await getActiveTab();
    if (tab?.url?.includes('/POD_WC/')) {
        isMesWorkCenterPage = true;
    }

    const savedData = await loadSavedData();
    populateSavedValues(savedData);
    await loadWorkSites(siteSelect, savedData?.SiteId || '');
    await loadStationData(workCenterSelect, savedData?.WorkCenterId || '');

    generateButton.addEventListener('click', async () => {
        await saveCurrentData();
        const { layerNumber, rows, cols, sfcText } = getInputValues();
        const sfcList = parseLines(sfcText);
        generateQRLayout(sfcList, layerNumber, rows, cols);
    });

    clearButton.addEventListener('click', async () => {
        document.getElementById('sfcsText').value = '';
        await clearSavedData();
    });

    copyButton.addEventListener('click', async () => {
        try {
            const textContent = document.getElementById('sfcsText').value;
            const clipboardData = [new ClipboardItem({
                'text/plain': new Blob([textContent], { type: 'text/plain' }),
            })];

            await navigator.clipboard.write(clipboardData);
            const originalText = copyButton.innerText;
            copyButton.innerText = 'Copied!';
            copyButton.disabled = true;
            setTimeout(() => {
                copyButton.innerText = originalText;
                copyButton.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('Failed to copy table:', error);
            alert('Copy failed. See console for details.');
        }
    });

    openWorkCenterBtn.addEventListener('click', async () => {
        await saveCurrentData();
        const { workCenterId, siteId } = getInputValues();
        await openWorkCenter(siteId, workCenterId, isMesWorkCenterPage);
    });

    wcSearchBtn.addEventListener('click', async () => {
        await saveCurrentData();
        const { sfcText } = getInputValues();
        const sfcList = parseLines(sfcText);
        await workCenterSearch(isMesWorkCenterPage, sfcList, tab, wcSearchBtn);
    });

    document.getElementById('openSettings').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });
}

document.addEventListener('DOMContentLoaded', initialize);
