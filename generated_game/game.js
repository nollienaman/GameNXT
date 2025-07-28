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

let char = { x: 100, y: 400, vy: 0, jumping: false };
let gravity = 0.8;
let jumpStrength = -15;
let ground = 500;
let speed = 5;
let bgX = 0;

let obstacles = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let spawnTimer;

function resetGame() {
  char.y = 400;
  char.vy = 0;
  char.jumping = false;
  bgX = 0;
  obstacles = [];
  score = 0;
  gameOver = false;
}

function spawnObstacle() {
  if (gameStarted && !gameOver) {
    obstacles.push({ x: canvas.width, y: 440, w: 40, h: 60, scored: false });
  }
}

function drawBackground() {
  bgX -= speed / 2;
  if (bgX <= -canvas.width) bgX = 0;
  ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);
}

function drawGround() {
  ctx.fillStyle = "#444";
  ctx.fillRect(0, ground, canvas.width, canvas.height - ground);
}

function drawCharacter() {
  ctx.drawImage(charImg, char.x, char.y, 50, 50);
}

function drawObstacles() {
  for (let obs of obstacles) {
    ctx.drawImage(obsImg, obs.x, obs.y, obs.w, obs.h);
  }
}

function updateObstacles() {
  for (let obs of obstacles) {
    obs.x -= speed;
    if (!obs.scored && obs.x + obs.w < char.x) {
      score++;
      obs.scored = true;
    }
  }
  obstacles = obstacles.filter(obs => obs.x + obs.w > 0);
}

function checkCollision() {
  for (let obs of obstacles) {
    if (
      char.x < obs.x + obs.w &&
      char.x + 50 > obs.x &&
      char.y + 50 > obs.y
    ) {
      gameOver = true;
    }
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
  drawGround();

  if (!gameStarted) {
    drawCharacter();
    drawPlayButton();
    return requestAnimationFrame(gameLoop);
  }

  drawCharacter();
  drawObstacles();

  if (char.jumping) char.vy += gravity;
  char.y += char.vy;

  if (char.y > ground - 50) {
    char.y = ground - 50;
    char.vy = 0;
    char.jumping = false;
  }

  updateObstacles();
  checkCollision();

  ctx.fillStyle = "#fff";
  ctx.font = "20px Orbitron";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 20, 30);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "36px Orbitron";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "24px Orbitron";
    ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 30);
    return;
  }

  requestAnimationFrame(gameLoop);
}

function handleJump() {
  if (!char.jumping && gameStarted && !gameOver) {
    char.vy = jumpStrength;
    char.jumping = true;
  }
}

function handleStartOrRestart() {
  if (!gameStarted) {
    gameStarted = true;
    resetGame();
    spawnTimer = setInterval(spawnObstacle, 1500);
    gameLoop();
  } else if (gameOver) {
    resetGame();
    gameLoop();
  } else {
    handleJump();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") handleJump();
});

canvas.addEventListener("click", handleStartOrRestart);

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  handleStartOrRestart();
}, { passive: false });

window.onload = () => {
  gameLoop();
};