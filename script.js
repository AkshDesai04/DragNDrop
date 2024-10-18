const assets = document.querySelectorAll('.asset');
const canvas = document.getElementById('canvas');
const svg = document.getElementById('connection-lines');

let draggedItem = null;
let assetCounter = 0;
let startPoint = null;
let isDraggingAsset = false;
let offsetX, offsetY;

// Drag and Drop events for initial asset drag from the left panel
assets.forEach(asset => {
  asset.addEventListener('dragstart', handleDragStart);
  asset.addEventListener('dragend', handleDragEnd);
});

canvas.addEventListener('dragover', handleDragOver);
canvas.addEventListener('drop', handleDrop);

function handleDragStart(e) {
  draggedItem = e.target;
}

function handleDragEnd() {
  draggedItem = null;
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;

  const newAsset = document.createElement('div');
  newAsset.className = 'asset-item';
  newAsset.style.left = `${x}px`;
  newAsset.style.top = `${y}px`;
  newAsset.textContent = draggedItem.textContent;
  newAsset.dataset.id = `asset${++assetCounter}`;
  newAsset.dataset.connectedLines = '[]'; // Store connected lines
  newAsset.addEventListener('mousedown', startDraggingAsset);
  newAsset.addEventListener('mouseup', stopDraggingAsset);

  canvas.appendChild(newAsset);
}

function startDraggingAsset(e) {
  isDraggingAsset = true;
  const asset = e.target;
  asset.classList.add('dragging');

  offsetX = e.clientX - asset.offsetLeft;
  offsetY = e.clientY - asset.offsetTop;

  canvas.addEventListener('mousemove', dragAsset);
}

function dragAsset(e) {
  if (!isDraggingAsset) return;

  const asset = document.querySelector('.dragging');
  const x = e.clientX - offsetX;
  const y = e.clientY - offsetY;

  asset.style.left = `${x}px`;
  asset.style.top = `${y}px`;

  updateLines(asset);
}

function stopDraggingAsset(e) {
  const asset = e.target;
  asset.classList.remove('dragging');
  isDraggingAsset = false;

  canvas.removeEventListener('mousemove', dragAsset);
}

// Handle asset click and connecting lines
function handleAssetClick(e) {
  const asset = e.target;

  if (!startPoint) {
    startPoint = asset;
    startPoint.style.border = '2px solid red';
  } else {
    createLine(startPoint, asset);
    startPoint.style.border = '1px solid black'; // Reset border
    startPoint = null;
  }
}

function createLine(startEl, endEl) {
  const startX = startEl.offsetLeft + startEl.offsetWidth / 2;
  const startY = startEl.offsetTop + startEl.offsetHeight / 2;
  const endX = endEl.offsetLeft + endEl.offsetWidth / 2;
  const endY = endEl.offsetTop + endEl.offsetHeight / 2;

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', startX);
  line.setAttribute('y1', startY);
  line.setAttribute('x2', endX);
  line.setAttribute('y2', endY);
  line.classList.add('line');
  svg.appendChild(line);

  // Save the line information in both connected assets
  updateConnectedLines(startEl, endEl, line);
}

// Update line positions when an asset is moved
function updateLines(asset) {
  const connectedLines = JSON.parse(asset.dataset.connectedLines);

  connectedLines.forEach(lineData => {
    const line = lineData.lineElement;
    const startOrEnd = lineData.isStart ? 'start' : 'end';
    
    const assetX = asset.offsetLeft + asset.offsetWidth / 2;
    const assetY = asset.offsetTop + asset.offsetHeight / 2;

    if (startOrEnd === 'start') {
      line.setAttribute('x1', assetX);
      line.setAttribute('y1', assetY);
    } else {
      line.setAttribute('x2', assetX);
      line.setAttribute('y2', assetY);
    }
  });
}

// Store connected line data in assets
function updateConnectedLines(startEl, endEl, line) {
  let startLines = JSON.parse(startEl.dataset.connectedLines);
  let endLines = JSON.parse(endEl.dataset.connectedLines);

  startLines.push({ lineElement: line, isStart: true });
  endLines.push({ lineElement: line, isStart: false });

  startEl.dataset.connectedLines = JSON.stringify(startLines);
  endEl.dataset.connectedLines = JSON.stringify(endLines);
}
