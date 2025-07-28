const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let charImg = new Image();
charImg.src = "char.png";

const holes = [
  { x: 150, y: 200 },
  { x: 350, y: 200 },
  { x: 550, y: 200 }
];

let moles = [];
let score = 0;
let gameOver = false;
let activeKeys = new Set();

function spawnMole() {
  const hole = holes[Math.floor(Math.random() * holes.length)];
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z

  moles.push({
    x: hole.x,
    y: hole.y,
    letter,
    timeout: Date.now() + 2000
  });
}

function drawBackground() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#444";
  holes.forEach(h => {
    ctx.fillRect(h.x, h.y, 100, 100);
  });
}

function drawMoles() {
  moles.forEach(m => {
    ctx.drawImage(charImg, m.x + 10, m.y + 10, 80, 80);
    ctx.fillStyle = "white";
    ctx.font = "30px Orbitron";
    ctx.fillText(m.letter, m.x + 40, m.y + 60);
  });
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "24px Orbitron";
  ctx.fillText("Score: " + score, 20, 30);
}

function updateMoles() {
  const now = Date.now();
  moles = moles.filter(m => now < m.timeout);
}

function checkKey(letter) {
  for (let i = 0; i < moles.length; i++) {
    if (moles[i].letter === letter.toUpperCase()) {
      moles.splice(i, 1);
      score++;
      break;
    }
  }
}

document.addEventListener("keydown", (e) => {
  const key = e.key.toUpperCase();
  if (!activeKeys.has(key)) {
    activeKeys.add(key);
    checkKey(key);
  }
});

document.addEventListener("keyup", (e) => {
  activeKeys.delete(e.key.toUpperCase());
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawMoles();
  drawScore();
  updateMoles();

  requestAnimationFrame(gameLoop);
}

setInterval(spawnMole, 1500);

// INSERT_CUSTOM_LOGIC_HERE

window.onload = () => {
  gameLoop();
};