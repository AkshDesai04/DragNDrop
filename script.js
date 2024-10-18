const assets = document.querySelectorAll('.asset');
const canvas = document.getElementById('canvas');
const svg = document.getElementById('connection-lines');

let draggedItem = null;
let assetCounter = 0;
let startPoint = null;

// Drag and Drop events
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
  newAsset.addEventListener('mousedown', handleAssetClick);

  canvas.appendChild(newAsset);
}

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
}
