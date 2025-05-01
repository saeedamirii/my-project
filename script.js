const gameArea = document.getElementById("game-area");
const scoreEl = document.getElementById("score");
const missedEl = document.getElementById("missed");
const startBtn = document.getElementById("start-btn");
const canvas = document.getElementById("slash-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fruits = [];
let score = 0;
let missed = 0;
let maxMissed = 3;
let isGameRunning = false;
let lastTimestamp = 0;
let mouseTrail = [];

startBtn.addEventListener("click", startGame);

function startGame() {
  isGameRunning = true;
  score = 0;
  missed = 0;
  fruits = [];
  scoreEl.textContent = score;
  missedEl.textContent = missed;
  startBtn.disabled = true;
  spawnFruitLoop();
  animate();
}

function spawnFruitLoop() {
  if (!isGameRunning) return;
  spawnFruit();
  setTimeout(spawnFruitLoop, 1000 + Math.random() * 500);
}

function spawnFruit() {
  const fruit = {
    x: Math.random() * (gameArea.clientWidth - 60),
    y: gameArea.clientHeight,
    speedY: -7 - Math.random() * 3,
    speedX: (Math.random() - 0.5) * 5,
    img: new Image(),
    width: 60,
    height: 60,
    sliced: false,
  };

  const fruitImgs = [
    'https://i.imgur.com/QYp3B9F.png', // apple
    'https://i.imgur.com/WJ8gxqN.png', // banana
    'https://i.imgur.com/T0XnLne.png', // kiwi
    'https://i.imgur.com/VcJwKiS.png', // strawberry
  ];

  fruit.img.src = fruitImgs[Math.floor(Math.random() * fruitImgs.length)];
  fruits.push(fruit);
}

function animate(timestamp) {
  if (!isGameRunning) return;

  const dt = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  gameArea.innerHTML = '';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // به‌روزرسانی میوه‌ها
  for (let i = 0; i < fruits.length; i++) {
    const fruit = fruits[i];

    fruit.x += fruit.speedX;
    fruit.y += fruit.speedY;
    fruit.speedY += 0.3; // gravity

    if (fruit.y > gameArea.clientHeight && !fruit.sliced) {
      missed++;
      missedEl.textContent = missed;
      fruits.splice(i, 1);
      i--;
      if (missed >= maxMissed) {
        endGame();
        return;
      }
      continue;
    }

    const fruitEl = document.createElement("img");
    fruitEl.className = "fruit";
    fruitEl.src = fruit.img.src;
    fruitEl.style.left = fruit.x + "px";
    fruitEl.style.top = fruit.y + "px";
    fruitEl.style.transform = fruit.sliced ? "scale(0.6) rotate(45deg)" : "";
    gameArea.appendChild(fruitEl);
  }

  drawSlash();
  checkFruitSlash();
  requestAnimationFrame(animate);
}

function drawSlash() {
  ctx.strokeStyle = "red";
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i < mouseTrail.length; i++) {
    const point = mouseTrail[i];
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();

  // کاهش طول trail
  while (mouseTrail.length > 10) {
    mouseTrail.shift();
  }
}

function checkFruitSlash() {
  fruits.forEach(fruit => {
    if (fruit.sliced) return;

    for (let i = 0; i < mouseTrail.length; i++) {
      const point = mouseTrail[i];
      if (
        point.x >= fruit.x &&
        point.x <= fruit.x + fruit.width &&
        point.y >= fruit.y &&
        point.y <= fruit.y + fruit.height
      ) {
        fruit.sliced = true;
        score++;
        scoreEl.textContent = score;
        showJuiceSplash(fruit.x + 30, fruit.y + 30);
        break;
      }
    }
  });
}

function showJuiceSplash(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 25, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.fill();
}

// ثبت حرکت موس یا انگشت
canvas.addEventListener("mousemove", e => {
  mouseTrail.push({ x: e.clientX, y: e.clientY });
});
canvas.addEventListener("touchmove", e => {
  const touch = e.touches[0];
  mouseTrail.push({ x: touch.clientX, y: touch.clientY });
});

function endGame() {
  isGameRunning = false;
  alert(`بازی تمام شد! امتیاز شما: ${score}`);
  startBtn.disabled = false;
}
