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

let player = { x: 375, y: 500, size: 50, speed: 5 };
let obstacles = [];
let score = 0;
let gameOver = false;

function spawnObstacle() {
  let x = Math.random() * (canvas.width - 50);
  obstacles.push({ x: x, y: -60, w: 50, h: 50, speed: 4 + Math.random() * 3 });
}

function drawBackground() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.drawImage(charImg, player.x, player.y, player.size, player.size);
}

function drawObstacles() {
  for (let obs of obstacles) {
    ctx.drawImage(obsImg, obs.x, obs.y, obs.w, obs.h);
  }
}

function updateObstacles() {
  for (let obs of obstacles) {
    obs.y += obs.speed;
  }
  obstacles = obstacles.filter(obs => obs.y < canvas.height + 60);
}

function checkCollision() {
  for (let obs of obstacles) {
    if (
      player.x < obs.x + obs.w &&
      player.x + player.size > obs.x &&
      player.y < obs.y + obs.h &&
      player.y + player.size > obs.y
    ) {
      gameOver = true;
    }
  }
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Orbitron";
  ctx.fillText("Score: " + score, 20, 30);
}

function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "36px Orbitron";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPlayer();
  drawObstacles();
  drawScore();

  updateObstacles();
  checkCollision();

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") player.x -= player.speed;
  if (e.key === "ArrowRight" || e.key === "d") player.x += player.speed;
  if (e.key === "ArrowUp" || e.key === "w") player.y -= player.speed;
  if (e.key === "ArrowDown" || e.key === "s") player.y += player.speed;

  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
  if (player.y < 0) {
    player.y = 0;
    score += 1;
  }
  if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;
});

canvas.addEventListener("touchstart", (e) => {
  if (gameOver) return;

  let touch = e.touches[0];
  let rect = canvas.getBoundingClientRect();
  let x = touch.clientX - rect.left;
  let y = touch.clientY - rect.top;

  if (x < player.x) player.x -= player.speed;
  else if (x > player.x + player.size) player.x += player.speed;

  if (y < player.y) player.y -= player.speed;
  else if (y > player.y + player.size) player.y += player.speed;

  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
  if (player.y < 0) {
    player.y = 0;
    score += 1;
  }
  if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;
}, { passive: true });

setInterval(spawnObstacle, 1000);

window.onload = () => {
  gameLoop();
};