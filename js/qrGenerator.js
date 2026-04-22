import { QR_SIZE, CSS_SRC, QR_CODE_SRC } from './constants.js';

function createLayout(sfcList, layerCount, rows, cols) {
  const layerNum = Number(layerCount);
  const rowCount = Number(rows);
  const colCount = Number(cols);
  const qrContainer = document.createElement('div');
  qrContainer.id = 'qrLayoutContainer';

  for (let layerIndex = 0; layerIndex < layerNum; layerIndex++) {
    const layerHeader = document.createElement('h3');
    layerHeader.textContent = `Layer ${layerIndex + 1}`;
    qrContainer.appendChild(layerHeader);

    const layerTable = document.createElement('table');
    layerTable.className = 'layerTable';
    const tbody = document.createElement('tbody');

    for (let row = 0; row < rowCount; row++) {
      const tr = document.createElement('tr');

      for (let col = 0; col < colCount; col++) {
        const itemIndex = row * colCount + col;
        const value = sfcList[itemIndex];

        if (!value) {
          continue;
        }

        const td = document.createElement('td');

        const posDiv = document.createElement('div');
        posDiv.className = 'qr-pos';
        posDiv.textContent = `Pos: ${itemIndex + 1}`;
        td.appendChild(posDiv);

        const qrDiv = document.createElement('div');
        qrDiv.className = 'qr-item';
        qrDiv.dataset.value = value;
        td.appendChild(qrDiv);

        const sfcDiv = document.createElement('div');
        sfcDiv.className = 'qr-id';
        sfcDiv.textContent = `ID#: ${value}`;
        td.appendChild(sfcDiv);

        tr.appendChild(td);
      }

      if (tr.childNodes.length > 0) {
        tbody.appendChild(tr);
      }
    }

    layerTable.appendChild(tbody);
    qrContainer.appendChild(layerTable);
  }

  return qrContainer;
}

function getAutoSize(targetWindow, requestedSize) {
  const firstRow = targetWindow.document.querySelector('.layerTable tr');
  if (!firstRow) return requestedSize;
  const cols = firstRow.children.length;
  if (cols === 0) return requestedSize;
  const available = Math.floor(targetWindow.innerWidth / cols) - 40;
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

export function generateQRLayout(sfcList, layerCount, rows, cols) {
  const qrContainer = createLayout(sfcList, layerCount, rows, cols);
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
