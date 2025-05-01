const gameArea = document.getElementById("game-area");
const scoreEl = document.getElementById("score");
const missedEl = document.getElementById("missed");
const startBtn = document.getElementById("start-btn");

let score = 0;
let missed = 0;
let interval;
let isPlaying = false;

const fruitImages = [
  "https://cdn-icons-png.flaticon.com/512/590/590685.png", // apple
  "https://cdn-icons-png.flaticon.com/512/590/590682.png", // banana
  "https://cdn-icons-png.flaticon.com/512/590/590686.png", // orange
  "https://cdn-icons-png.flaticon.com/512/590/590688.png", // strawberry
];

const canvas = document.getElementById("slash-canvas");
const ctx = canvas.getContext("2d");
canvas.width = gameArea.clientWidth;
canvas.height = gameArea.clientHeight;

let lastSlash = [];

function createFruit() {
  const fruit = document.createElement("img");
  fruit.src = fruitImages[Math.floor(Math.random() * fruitImages.length)];
  fruit.classList.add("fruit");
  fruit.style.left = Math.random() * (gameArea.clientWidth - 60) + "px";
  gameArea.appendChild(fruit);

  let posY = gameArea.clientHeight;
  const speed = Math.random() * 2 + 2;
  const gravity = 0.4;
  let velocity = -10 - Math.random() * 5;

  const move = setInterval(() => {
    velocity += gravity;
    posY += velocity;
    fruit.style.top = posY + "px";

    if (posY > gameArea.clientHeight) {
      clearInterval(move);
      fruit.remove();
      missed++;
      missedEl.textContent = missed;
      if (missed >= 3) {
        endGame();
      }
    }
  }, 30);

  fruit.dataset.move = move;
}

function slashEffect(x, y) {
  lastSlash.push({ x, y });
  if (lastSlash.length > 10) lastSlash.shift();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(lastSlash[0].x, lastSlash[0].y);
  for (let i = 1; i < lastSlash.length; i++) {
    ctx.lineTo(lastSlash[i].x, lastSlash[i].y);
  }
  ctx.strokeStyle = "red";
  ctx.lineWidth = 5;
  ctx.stroke();

  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 200);
}

function detectSlash(x, y) {
  const fruits = document.querySelectorAll(".fruit");
  fruits.forEach(fruit => {
    const rect = fruit.getBoundingClientRect();
    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      clearInterval(fruit.dataset.move);
      fruit.remove();
      score++;
      scoreEl.textContent = score;
    }
  });
}

function startGame() {
  if (isPlaying) return;
  isPlaying = true;
  score = 0;
  missed = 0;
  scoreEl.textContent = 0;
  missedEl.textContent = 0;
  interval = setInterval(createFruit, 1000);
}

function endGame() {
  clearInterval(interval);
  alert("باختی! امتیاز نهایی: " + score);
  document.querySelectorAll(".fruit").forEach(f => f.remove());
  isPlaying = false;
}

startBtn.addEventListener("click", startGame);

canvas.addEventListener("touchmove", e => {
  const touch = e.touches[0];
  const x = touch.clientX;
  const y = touch.clientY;
  slashEffect(x, y);
  detectSlash(x, y);
});

canvas.addEventListener("mousemove", e => {
  if (e.buttons !== 1) return;
  slashEffect(e.clientX, e.clientY);
  detectSlash(e.clientX, e.clientY);
});
