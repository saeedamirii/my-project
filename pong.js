// انتخاب عنصر canvas
const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');

// بارگذاری صداها
let hit = new Audio();
let wall = new Audio();
let userScore = new Audio();
let comScore = new Audio();

hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";

// شیء توپ
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,
    speed: 7,
    color: "#00FFFF"
};

// پدل بازیکن
const user = {
    x: 50,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "#007BFF"
};

// پدل حریف (کامپیوتر)
const com = {
    x: canvas.width - 60,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "#FF3B3B"
};

// آیتم‌های قدرت (سبز + طلایی مخصوص سطح آسان)
let greenPowerUp = {
    x: Math.random() * (canvas.width - 100) + 50,
    y: Math.random() * (canvas.height - 100) + 50,
    width: 20,
    height: 20,
    color: "#00FF00",
    isActive: true
};

let goldenPowerUp = {
    x: Math.random() * (canvas.width - 100) + 50,
    y: Math.random() * (canvas.height - 100) + 50,
    width: 20,
    height: 20,
    color: "#FFD700",
    isActive: true
};

// بررسی برخورد توپ با آیتم‌ها
function checkPowerUpCollision() {
    if (greenPowerUp.isActive &&
        ball.x - ball.radius < greenPowerUp.x + greenPowerUp.width &&
        ball.x + ball.radius > greenPowerUp.x &&
        ball.y - ball.radius < greenPowerUp.y + greenPowerUp.height &&
        ball.y + ball.radius > greenPowerUp.y) {
        
        user.height += 20;
        greenPowerUp.isActive = false;
        setTimeout(() => {
            user.height -= 20;
        }, 5000);
    }

    if (goldenPowerUp.isActive &&
        ball.x - ball.radius < goldenPowerUp.x + goldenPowerUp.width &&
        ball.x + ball.radius > goldenPowerUp.x &&
        ball.y - ball.radius < goldenPowerUp.y + goldenPowerUp.height &&
        ball.y + ball.radius > goldenPowerUp.y) {
        
        user.score++;  // افزایش امتیاز کاربر
        goldenPowerUp.isActive = false;
    }
}

// تابع رسم آیتم‌ها
function drawPowerUps() {
    if (greenPowerUp.isActive) {
        drawRect(greenPowerUp.x, greenPowerUp.y, greenPowerUp.width, greenPowerUp.height, greenPowerUp.color);
    }
    if (goldenPowerUp.isActive) {
        drawRect(goldenPowerUp.x, goldenPowerUp.y, goldenPowerUp.width, goldenPowerUp.height, goldenPowerUp.color);
    }
}

// اضافه کردن آیتم‌ها به تابع render
function render() {
    // سایر بخش‌های رسم بازی

    // رسم آیتم‌های قدرت (سبز و طلایی)
    drawPowerUps();
}
