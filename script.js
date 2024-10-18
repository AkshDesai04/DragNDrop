const assets = document.querySelectorAll('.asset');
const canvas = document.getElementById('canvas');
const svg = document.getElementById('connection-lines');
const connectionLabel = document.getElementById('connection-label');
const errorMessage = document.getElementById('error-message');

let draggedItem = null;
let assetCounter = 0;
let selectedDot = null;
let isDraggingAsset = false;
let draggedAsset = null;

// Store connections as an adjacency list
const connections = {};
const assetList = new LinkedList(); // Create a linked list to manage assets

// Linked List Structure
function LinkedList() {
  this.head = null;
  this.tail = null;
}

function ListNode(asset) {
  this.asset = asset;
  this.next = null;
}

// Add asset to the linked list
LinkedList.prototype.add = function(asset) {
  const newNode = new ListNode(asset);
  if (!this.head) {
    this.head = newNode;
    this.tail = newNode;
  } else {
    this.tail.next = newNode;
    this.tail = newNode;
  }
};

// Drag and Drop events for the asset panel
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

  // Create the connection dots on all sides
  const dotTop = createDot('top');
  const dotRight = createDot('right');
  const dotBottom = createDot('bottom');
  const dotLeft = createDot('left');

  newAsset.appendChild(dotTop);
  newAsset.appendChild(dotRight);
  newAsset.appendChild(dotBottom);
  newAsset.appendChild(dotLeft);

  newAsset.addEventListener('mousedown', initiateDrag);
  
  // Add the new asset to the linked list and connections
  assetList.add(newAsset);
  connections[newAsset.dataset.id] = []; // Initialize connections for the new asset

  canvas.appendChild(newAsset);
}

// Function to create a dot for a side of the asset
function createDot(position) {
  const dot = document.createElement('div');
  dot.className = `dot dot-${position}`;
  dot.dataset.id = `dot${assetCounter}-${position}`;
  dot.addEventListener('click', handleDotClick);
  return dot;
}

// Handle click on a dot for connecting lines
function handleDotClick(e) {
  const dot = e.target;

  if (!selectedDot) {
    selectedDot = dot;
    dot.style.backgroundColor = 'red'; // Highlight selected dot
  } else {
    // Create a line between two dots
    if (isCyclicConnection(selectedDot, dot)) {
      showErrorMessage();
    } else {
      createLine(selectedDot, dot);
      selectedDot.style.backgroundColor = ''; // Reset color
    }
    selectedDot = null;
  }
}

// Check for cyclic connections
function isCyclicConnection(startDot, endDot) {
  const startAsset = startDot.parentElement.dataset.id;
  const endAsset = endDot.parentElement.dataset.id;

  // Check if there is an existing connection between the two assets
  if (connections[startAsset].includes(endAsset) || connections[endAsset].includes(startAsset)) {
    return false; // Already connected, no cycle
  }

  // Perform DFS to check for cycles
  const visited = new Set();
  const path = new Set();

  function dfs(currentAsset) {
    if (path.has(currentAsset)) return true; // Cycle detected
    if (visited.has(currentAsset)) return false; // Already visited

    visited.add(currentAsset);
    path.add(currentAsset);

    const neighbors = connections[currentAsset];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) return true; // Cycle found in the path
    }
    path.delete(currentAsset); // Backtrack
    return false;
  }

  return dfs(endAsset); // Check from the end asset
}

// Create a line between two dots
function createLine(startDot, endDot) {
  const startAsset = startDot.parentElement;
  const endAsset = endDot.parentElement;

  const startRect = startDot.getBoundingClientRect();
  const endRect = endDot.getBoundingClientRect();

  const startX = startRect.left + startRect.width / 2 - canvas.offsetLeft;
  const startY = startRect.top + startRect.height / 2 - canvas.offsetTop;
  const endX = endRect.left + endRect.width / 2 - canvas.offsetLeft;
  const endY = endRect.top + endRect.height / 2 - canvas.offsetTop;

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', startX);
  line.setAttribute('y1', startY);
  line.setAttribute('x2', endX);
  line.setAttribute('y2', endY);
  line.classList.add('line');
  svg.appendChild(line);

  // Store the associated dots and line for future reference
  line.dataset.startDot = startDot.dataset.id;
  line.dataset.endDot = endDot.dataset.id;

  // Update connections array and label
  updateConnections(startAsset, endAsset, startDot, endDot);
}

// Show error message for cyclic connections
function showErrorMessage() {
  errorMessage.style.display = 'block';
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 3000); // Display for 3 seconds
}

// Update connections array and the connection label
function updateConnections(startAsset, endAsset, startDot, endDot) {
  const startLabel = `${startAsset.textContent}.${startDot.classList[1].split('-')[1]}`;
  const endLabel = `${endAsset.textContent}.${endDot.classList[1].split('-')[1]}`;

  // Prevent duplicate entries
  if (!connections[startAsset.dataset.id].includes(endAsset.dataset.id)) {
    connections[startAsset.dataset.id].push(endAsset.dataset.id); // Add connection
  }

  if (!connections[endAsset.dataset.id].includes(startAsset.dataset.id)) {
    connections[endAsset.dataset.id].push(startAsset.dataset.id); // Add reverse connection
  }

  // Build the connection label for all current connections
  const allConnections = getAllConnections();
  connectionLabel.textContent = `Connections: ${allConnections}`;
}

// Function to get a string representation of all connections
function getAllConnections() {
  const result = [];
  for (const assetId in connections) {
    const connectedAssets = connections[assetId].map(id => {
      const dot = getDotPosition(id);
      return `${id}.${dot}`;
    });
    result.push(`${assetId} -> ${connectedAssets.join(' -> ')}`);
  }
  return result.join(' -> ');
}

// Helper function to get the dot position (top, right, bottom, left)
function getDotPosition(assetId) {
  // Get the first dot (assuming all assets have dots)
  const assetElement = document.querySelector(`[data-id="${assetId}"]`);
  if (assetElement) {
    return 'top'; // Change this logic if needed based on your requirements
  }
  return '';
}

// Drag functionality for placed assets
function initiateDrag(e) {
  if (e.target.classList.contains('asset-item')) {
    draggedAsset = e.target;

    // Calculate the offset to keep the asset under the cursor
    const rect = draggedAsset.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    isDraggingAsset = true;

    const moveHandler = (event) => {
      if (isDraggingAsset && draggedAsset) {
        draggedAsset.style.left = `${event.clientX - offsetX}px`;
        draggedAsset.style.top = `${event.clientY - offsetY}px`;
        updateLines(draggedAsset);
      }
    };

    const dropHandler = () => {
      isDraggingAsset = false;
      draggedAsset = null;
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', dropHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', dropHandler);
  }
}

// Update lines when an asset is moved
function updateLines(asset) {
  const lines = svg.querySelectorAll('line');
  lines.forEach(line => {
    if (line.dataset.startDot.includes(asset.dataset.id) || line.dataset.endDot.includes(asset.dataset.id)) {
      // Update line coordinates
      const startDot = document.querySelector(`[data-id="${line.dataset.startDot}"]`);
      const endDot = document.querySelector(`[data-id="${line.dataset.endDot}"]`);

      const startRect = startDot.getBoundingClientRect();
      const endRect = endDot.getBoundingClientRect();

      line.setAttribute('x1', startRect.left + startRect.width / 2 - canvas.offsetLeft);
      line.setAttribute('y1', startRect.top + startRect.height / 2 - canvas.offsetTop);
      line.setAttribute('x2', endRect.left + endRect.width / 2 - canvas.offsetLeft);
      line.setAttribute('y2', endRect.top + endRect.height / 2 - canvas.offsetTop);
    }
  });
}

// Initialize the error message display
errorMessage.style.display = 'none';
