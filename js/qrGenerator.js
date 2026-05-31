import { QR_SIZE, CSS_SRC, QR_CODE_SRC } from './constants.js';

function parseLayers(sfcList) {
  const layers = [];
  let currentLayer = null;
  let currentRow = [];
  let pos = 0;

  for (const line of sfcList) {
    if (line.startsWith('#')) {
      // Start a new layer
      if (currentLayer) {
        if (currentRow.length) currentLayer.rows.push(currentRow);
        layers.push(currentLayer);
      }
      currentLayer = { title: line.slice(1).trim() || `Layer ${layers.length + 1}`, rows: [] };
      currentRow = [];
    } else if (line.startsWith('---')) {
      // New row
      if (!currentLayer) currentLayer = { title: 'Layer 1', rows: [] };
      if (currentRow.length) currentLayer.rows.push(currentRow);
      currentRow = [];
    } else {
      // SFC item
      if (!currentLayer) currentLayer = { title: 'Layer 1', rows: [] };
      pos++;
      currentRow.push({ value: line, pos });
    }
  }

  if (currentLayer) {
    if (currentRow.length) currentLayer.rows.push(currentRow);
    layers.push(currentLayer);
  }
  return layers;
}

function createLayout(sfcList) {
  const layers = parseLayers(sfcList);
  const qrContainer = document.createElement('div');
  qrContainer.id = 'qrLayoutContainer';

  for (const layer of layers) {
    const layerHeader = document.createElement('h3');
    layerHeader.textContent = layer.title;
    qrContainer.appendChild(layerHeader);

    const layerTable = document.createElement('table');
    layerTable.className = 'layerTable';
    const tbody = document.createElement('tbody');

    for (const row of layer.rows) {
      const tr = document.createElement('tr');
      for (const item of row) {
        const td = document.createElement('td');

        const posDiv = document.createElement('div');
        posDiv.className = 'qr-pos';
        posDiv.textContent = `Pos: ${item.pos}`;
        td.appendChild(posDiv);

        const qrDiv = document.createElement('div');
        qrDiv.className = 'qr-item';
        qrDiv.dataset.value = item.value;
        td.appendChild(qrDiv);

        const sfcDiv = document.createElement('div');
        sfcDiv.className = 'qr-id';
        sfcDiv.textContent = `ID#: ${item.value}`;
        td.appendChild(sfcDiv);

        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    layerTable.appendChild(tbody);
    qrContainer.appendChild(layerTable);
  }

  return qrContainer;
}

function getAutoSize(targetWindow, requestedSize) {
  const rows = targetWindow.document.querySelectorAll('.layerTable tr');
  if (!rows.length) return requestedSize;
  let maxCols = 0;
  rows.forEach(row => { if (row.children.length > maxCols) maxCols = row.children.length; });
  if (maxCols === 0) return requestedSize;
  const available = Math.floor(targetWindow.innerWidth / maxCols) - 40;
  return Math.max(32, Math.min(requestedSize, available));
}

function renderQRCodes(targetWindow, size, sizeDisplay) {
  const effectiveSize = getAutoSize(targetWindow, size);
  if (sizeDisplay) sizeDisplay.textContent = `${effectiveSize}px`;
  const qrDivs = targetWindow.document.getElementsByClassName('qr-item');
  Array.from(qrDivs).forEach(div => {
    const itemId = div.dataset.value || div.nextSibling?.textContent?.replace('ID#: ', '') || '';
    div.innerHTML = '';
    if (!itemId) {
      return;
    }
    new targetWindow.QRCode(div, {
      text: itemId,
      width: effectiveSize,
      height: effectiveSize,
      correctLevel: targetWindow.QRCode.CorrectLevel.H,
    });
  });
}

function createZoomToolbar(targetWindow, renderFn) {
  const toolbar = targetWindow.document.createElement('div');
  toolbar.className = 'zoom-toolbar';

  const sizeDisplay = targetWindow.document.createElement('span');
  sizeDisplay.className = 'zoom-size';
  sizeDisplay.textContent = `${QR_SIZE}px`;

  const zoomOut = targetWindow.document.createElement('button');
  zoomOut.textContent = '-';
  zoomOut.title = 'Decrease QR size';

  const zoomIn = targetWindow.document.createElement('button');
  zoomIn.textContent = '+';
  zoomIn.title = 'Increase QR size';

  const reset = targetWindow.document.createElement('button');
  reset.className = 'zoom-reset';
  reset.textContent = '↻';
  reset.title = 'Reset QR size';

  let currentSize = QR_SIZE;

  function updateSize(newSize) {
    const clamped = Math.min(512, Math.max(32, newSize));
    currentSize = clamped;
    renderFn(currentSize, sizeDisplay);
  }

  zoomOut.addEventListener('click', () => updateSize(currentSize - 16));
  zoomIn.addEventListener('click', () => updateSize(currentSize + 16));
  reset.addEventListener('click', () => updateSize(QR_SIZE));

  toolbar.append(zoomOut, sizeDisplay, zoomIn, reset);
  return { toolbar, sizeDisplay };
}

export function generateQRLayout(sfcList) {
  const qrContainer = createLayout(sfcList);
  openNewWindow(qrContainer);
}

export function openNewWindow(content) {
  const newWindow = window.open('', '', 'alwaysOnTop=yes,alwaysRaised=yes,width=1200,height=700');
  if (!newWindow) {
    alert('Unable to open a new window. Please check your browser settings.');
    return;
  }

  newWindow.document.title = 'QR CODE Layout';

  const link = newWindow.document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL(CSS_SRC);
  newWindow.document.head.appendChild(link);

  const script = newWindow.document.createElement('script');
  script.src = chrome.runtime.getURL(QR_CODE_SRC);

  script.onload = () => {
    let currentSize = QR_SIZE;
    const { toolbar, sizeDisplay } = createZoomToolbar(newWindow, (size, display) => {
      currentSize = size;
      renderQRCodes(newWindow, size, display);
    });
    newWindow.document.body.appendChild(toolbar);
    newWindow.document.body.appendChild(content);
    renderQRCodes(newWindow, QR_SIZE, sizeDisplay);

    let resizeTimer;
    newWindow.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => renderQRCodes(newWindow, currentSize, sizeDisplay), 150);
    });
  };

  newWindow.document.body.appendChild(script);
}
