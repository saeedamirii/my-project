const gameArea = document.getElementById("game-area");
const scoreEl = document.getElementById("score");
const missedEl = document.getElementById("missed");
const startBtn = document.getElementById("startBtn");

const canvas = document.getElementById("slash-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fruits = [];
let isRunning = false;
let score = 0;
let missed = 0;
let trail = [];

const fruitImages = [
  "https://cdn-icons-png.flaticon.com/512/590/590685.png", // apple
  "https://cdn-icons-png.flaticon.com/512/590/590682.png", // banana
  "https://cdn-icons-png.flaticon.com/512/590/590686.png", // orange
  "https://cdn-icons-png.flaticon.com/512/590/590688.png", // strawberry
];

startBtn.onclick = () => {
  resetGame();
  isRunning = true;
  spawnFruits();
  animate();
};

function resetGame() {
  fruits = [];
  score = 0;
  missed = 0;
  scoreEl.textContent = "0";
  missedEl.textContent = "0";
}

function spawnFruits() {
  if (!isRunning) return;

  const fruit = {
    x: Math.random() * (gameArea.clientWidth - 60),
    y: gameArea.clientHeight,
    vx: (Math.random() - 0.5) * 6,
    vy: -12 - Math.random() * 5,
    gravity: 0.4,
    img: new Image(),
    sliced: false,
  };

  fruit.img.src = fruitImages[Math.floor(Math.random() * fruitImages.length)];
  fruits.push(fruit);

  setTimeout(spawnFruits, 1000);
}

function animate() {
  if (!isRunning) return;

  gameArea.innerHTML = "";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // آپدیت میوه‌ها
  for (let i = 0; i < fruits.length; i++) {
    const f = fruits[i];

    if (f.sliced) continue;

    f.x += f.vx;
    f.y += f.vy;
    f.vy += f.gravity;

    if (f.y > gameArea.clientHeight) {
      fruits.splice(i, 1);
      i--;
      missed++;
      missedEl.textContent = missed;
      if (missed >= 3) {
        endGame();
        return;
      }
      continue;
    }

    const fruitEl = document.createElement("img");
    fruitEl.src = f.img.src;
    fruitEl.className = "fruit";
    fruitEl.style.left = `${f.x}px`;
    fruitEl.style.top = `${f.y}px`;
    gameArea.appendChild(fruitEl);
  }

  drawTrail();
  checkSlice();
  requestAnimationFrame(animate);
}

function drawTrail() {
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "red";
  for (let i = 0; i < trail.length; i++) {
    const p = trail[i];
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // محدودیت طول
  if (trail.length > 10) trail.shift();
}

function checkSlice() {
  fruits.forEach((f) => {
    if (f.sliced) return;

    for (const p of trail) {
      const insideX = p.x >= f.x && p.x <= f.x + 60;
      const insideY = p.y >= f.y && p.y <= f.y + 60;
      if (insideX && insideY) {
        f.sliced = true;
        score++;
        scoreEl.textContent = score;
        splash(p.x, p.y);
      }
    }
  });
}

function splash(x, y) {
  ctx.beginPath();
  ctx.fillStyle = "rgba(255,0,0,0.5)";
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
}

function endGame() {
  isRunning = false;
  alert(`بازی تمام شد! امتیاز شما: ${score}`);
}

canvas.addEventListener("mousemove", (e) => {
  trail.push({ x: e.clientX, y: e.clientY });
});
canvas.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  trail.push({ x: t.clientX, y: t.clientY });
});
