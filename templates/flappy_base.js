const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let charImg = new Image();
let bgImg = new Image();
let obsImg = new Image();
charImg.src = "char.png";
bgImg.src = "bg.png";
obsImg.src = "obs.png";

let charY = 250;
let velocity = 0;
let gravity = 0.3;
let jump = -10;
let obstacles = [];
let score = 0;
let gameOver = false;
let gameStarted = false;

function resetGame() {
  charY = 250;
  velocity = 0;
  obstacles = [];
  score = 0;
  gameOver = false;
}

function drawBackground() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

function drawCharacter() {
  ctx.drawImage(charImg, 80, charY, 50, 50);
}

function drawObstacles() {
  obstacles.forEach(obs => {
    ctx.drawImage(obsImg, obs.x, obs.y, 60, obs.h);
  });
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "24px Orbitron";
  ctx.fillText("Score: " + score, 20, 40);
}

function updateObstacles() {
  for (let obs of obstacles) {
    obs.x -= 3;
  }

  if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 200) {
    let gapY = Math.random() * 200 + 100;
    let topPipe = { x: canvas.width, y: 0, h: gapY - 100, scored: false, isTop: true };
    let bottomPipe = { x: canvas.width, y: gapY + 100, h: canvas.height - gapY - 100 };
    obstacles.push(topPipe, bottomPipe);
  }

  obstacles = obstacles.filter(obs => obs.x + 60 > 0);

  for (let obs of obstacles) {
    if (obs.isTop && !obs.scored && 80 > obs.x + 60) {
      score++;
      obs.scored = true;
    }
  }
}

function checkCollision() {
  for (let obs of obstacles) {
    if (
      80 < obs.x + 60 &&
      130 > obs.x &&
      charY < obs.y + obs.h &&
      charY + 50 > obs.y
    ) {
      gameOver = true;
    }
  }
  if (charY > canvas.height || charY < 0) {
    gameOver = true;
  }
}

function drawPlayButton() {
  ctx.fillStyle = "#000a";
  ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 40, 200, 80);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(canvas.width / 2 - 100, canvas.height / 2 - 40, 200, 80);
  ctx.fillStyle = "#fff";
  ctx.font = "28px Orbitron";
  ctx.textAlign = "center";
  ctx.fillText("PLAY", canvas.width / 2, canvas.height / 2 + 10);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (!gameStarted) {
    drawCharacter();
    drawPlayButton();
    return requestAnimationFrame(gameLoop);
  }

  drawCharacter();
  drawObstacles();
  drawScore();

  velocity += gravity;
  charY += velocity;

  updateObstacles();
  checkCollision();

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "40px Orbitron";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
    ctx.font = "20px Orbitron";
    ctx.fillText("Click to Restart", canvas.width / 2 - 80, canvas.height / 2 + 40);
    return;
  }

  requestAnimationFrame(gameLoop);
}

function handleJump() {
  if (!gameOver && gameStarted) velocity = jump;
}

function handleStartOrRestart() {
  if (!gameStarted) {
    gameStarted = true;
    resetGame();
    gameLoop();
  } else if (gameOver) {
    resetGame();
    gameLoop();
  }
}

document.addEventListener("keydown", handleJump);
canvas.addEventListener("click", handleStartOrRestart);
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  if (!gameStarted || gameOver) {
    handleStartOrRestart();
  } else {
    handleJump();
  }
}, { passive: false });

window.onload = () => {
  gameLoop();
};
