// متغیرهای global برای نگهداری وضعیت بازی
let paddleWidth = 100;
let paddleHeight = 15;
let ballRadius = 10;
let ballSpeedX = 2;
let ballSpeedY = -2;
let ballX = 200;
let ballY = 300;
let paddleX = 150;
let paddleSpeed = 20;
let score = 0;
let gameInterval;
let level = 'easy'; // تنظیم سطح بازی پیش‌فرض
let goldenItemInterval;
let redItemInterval;
let goldenItemX, goldenItemY;
let redItemX, redItemY;
let redItemActive = false;

// دریافت المنت canvas و تنظیم context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// بارگذاری صداها
const hitSound = new Audio('sounds/hit.mp3');
const scoreSound = new Audio('sounds/score.mp3');
const gameOverSound = new Audio('sounds/gameover.mp3');

// رسم راکت
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// رسم توپ
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// رسم آیتم طلایی
function drawGoldenItem() {
  if (goldenItemX && goldenItemY) {
    ctx.beginPath();
    ctx.arc(goldenItemX, goldenItemY, 10, 0, Math.PI*2);
    ctx.fillStyle = "gold";
    ctx.fill();
    ctx.closePath();
  }
}

// رسم آیتم قرمز
function drawRedItem() {
  if (redItemX && redItemY) {
    ctx.beginPath();
    ctx.arc(redItemX, redItemY, 10, 0, Math.PI*2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }
}

// حرکت توپ
function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if(ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
    ballSpeedX = -ballSpeedX;
  }
  if(ballY + ballSpeedY < ballRadius) {
    ballSpeedY = -ballSpeedY;
  } else if(ballY + ballSpeedY > canvas.height - ballRadius) {
    if(ballX > paddleX && ballX < paddleX + paddleWidth) {
      ballSpeedY = -ballSpeedY;
      score++;
      scoreSound.play();
    } else {
      gameOver();
    }
  }
  
  // برخورد با آیتم طلایی
  if (goldenItemX && goldenItemY) {
    if (ballX > goldenItemX - 10 && ballX < goldenItemX + 10 && ballY > goldenItemY - 10 && ballY < goldenItemY + 10) {
      score++;
      goldenItemX = null;
      goldenItemY = null;
      scoreSound.play();
    }
  }

  // برخورد با آیتم قرمز
  if (redItemX && redItemY) {
    if (ballX > redItemX - 10 && ballX < redItemX + 10 && ballY > redItemY - 10 && ballY < redItemY + 10) {
      ballSpeedX = -ballSpeedX; // تغییر جهت توپ
      ballSpeedY = -ballSpeedY; // تغییر جهت توپ
      redItemX = null;
      redItemY = null;
    }
  }
}

// حرکت راکت
function movePaddle(event) {
  if(event.key === "Right" || event.key === "ArrowRight") {
    if(paddleX < canvas.width - paddleWidth) {
      paddleX += paddleSpeed;
    }
  } else if(event.key === "Left" || event.key === "ArrowLeft") {
    if(paddleX > 0) {
      paddleX -= paddleSpeed;
    }
  }
}

// مدیریت سطح بازی
function setLevel(newLevel) {
  level = newLevel;
  score = 0; // ریست کردن امتیاز
  ballX = 200;
  ballY = 300;
  ballSpeedX = 2;
  ballSpeedY = -2;
  paddleX = 150;
  
  // تغییرات سطح بازی
  if(level === 'easy') {
    ballSpeedX = 2;
    ballSpeedY = -2;
    clearInterval(goldenItemInterval);
    goldenItemInterval = setInterval(generateGoldenItem, 3000); // آیتم طلایی هر 3 ثانیه
    clearInterval(redItemInterval);
    redItemInterval = null;
  } else if(level === 'medium') {
    ballSpeedX = 3;
    ballSpeedY = -3;
    clearInterval(goldenItemInterval);
    goldenItemInterval = null;
    clearInterval(redItemInterval);
    redItemInterval = null;
  } else if(level === 'hard') {
    ballSpeedX = 4;
    ballSpeedY = -4;
    clearInterval(goldenItemInterval);
    goldenItemInterval = null;
    clearInterval(redItemInterval);
    redItemInterval = setInterval(generateRedItem, 2000); // آیتم قرمز هر 2 ثانیه
  }
  clearInterval(gameInterval);
  gameInterval = setInterval(update, 10);
}

// بروزرسانی وضعیت بازی
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // پاک کردن صفحه
  drawBall();
  drawPaddle();
  drawGoldenItem();
  drawRedItem();
  moveBall();
}

// شروع بازی
function startGame(level) {
  setLevel(level);
}

// پایان بازی
function gameOver() {
  clearInterval(gameInterval);
  gameOverSound.play();
  alert("Game Over! Your score was " + score);
}

// تولید آیتم طلایی
function generateGoldenItem() {
  goldenItemX = Math.random() * (canvas.width - 20) + 10;
  goldenItemY = Math.random() * (canvas.height - 200) + 10;
}

// تولید آیتم قرمز
function generateRedItem() {
  redItemX = Math.random() * (canvas.width - 20) + 10;
  redItemY = Math.random() * (canvas.height - 200) + 10;
}

// نمایش منو برای انتخاب سطح بازی
function showLevelMenu() {
  const levelMenu = document.getElementById('levelMenu');
  levelMenu.style.display = 'block';

  document.getElementById('easyBtn').addEventListener('click', () => {
    showGameScreen();
    startGame('easy');
  });

  document.getElementById('mediumBtn').addEventListener('click', () => {
    showGameScreen();
    startGame('medium');
  });

  document.getElementById('hardBtn').addEventListener('click', () => {
    showGameScreen();
    startGame('hard');
  });
}

// نمایش صفحه بازی پس از انتخاب سطح
function showGameScreen() {
  const levelMenu = document.getElementById('levelMenu');
  const gameScreen = document.getElementById('gameScreen');
  levelMenu.style.display = 'none';
  gameScreen.style.display = 'block';
}

// فراخوانی منو سطح بازی
window.onload = showLevelMenu;
