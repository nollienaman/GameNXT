const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gridSize = 6;
const tileSize = 80;
const tilePadding = 5;
const types = ["char", "blue", "green", "pink"];

let board = [];
let selected = null;
let charImg = new Image();
let bgImg = new Image();
charImg.src = "char.png";
bgImg.src = "bg.png";

function randomTile() {
  return types[Math.floor(Math.random() * types.length)];
}

function drawTile(type, x, y) {
  const px = x * tileSize + tilePadding;
  const py = y * tileSize + tilePadding;

  if (type === "char") {
    ctx.drawImage(charImg, px, py, tileSize - tilePadding * 2, tileSize - tilePadding * 2);
  } else {
    let color = {
      blue: "#00f",
      green: "#0f0",
      pink: "#f0f"
    }[type];

    ctx.fillStyle = color;
    ctx.fillRect(px, py, tileSize - tilePadding * 2, tileSize - tilePadding * 2);
  }
}

function drawBoard() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      drawTile(board[y][x], x, y);
    }
  }
}

function swap(a, b) {
  const temp = board[a.y][a.x];
  board[a.y][a.x] = board[b.y][b.x];
  board[b.y][b.x] = temp;
}

function validMatch() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize - 2; x++) {
      const t = board[y][x];
      if (t && t === board[y][x + 1] && t === board[y][x + 2]) return true;
    }
  }
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize - 2; y++) {
      const t = board[y][x];
      if (t && t === board[y + 1][x] && t === board[y + 2][x]) return true;
    }
  }
  return false;
}

function initBoard() {
  board = [];
  for (let y = 0; y < gridSize; y++) {
    let row = [];
    for (let x = 0; x < gridSize; x++) {
      row.push(randomTile());
    }
    board.push(row);
  }
}

function handleSelect(x, y) {
  if (selected) {
    const dx = Math.abs(x - selected.x);
    const dy = Math.abs(y - selected.y);
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      swap(selected, { x, y });
      if (!validMatch()) {
        swap(selected, { x, y });
      }
      selected = null;
    } else {
      selected = { x, y };
    }
  } else {
    selected = { x, y };
  }
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tileSize);
  const y = Math.floor((e.clientY - rect.top) / tileSize);
  handleSelect(x, y);
});

canvas.addEventListener("touchstart", (e) => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = Math.floor((touch.clientX - rect.left) / tileSize);
  const y = Math.floor((touch.clientY - rect.top) / tileSize);
  handleSelect(x, y);
}, { passive: true });

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  requestAnimationFrame(gameLoop);
}

initBoard();

window.onload = () => {
  gameLoop();
};