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

// متغیر برای آیتم سبز (از سطح متوسط)
let powerUp = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: "#4CAF50",
    isActive: false
};

// متغیر برای آیتم طلایی (جدید در سطح آسان)
let goldenItem = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: "#FFD700",
    isActive: false
};

// رسم مستطیل
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// رسم دایره
function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

// حرکت ماوس برای کنترل پدل بازیکن
canvas.addEventListener("mousemove", (evt) => {
    let rect = canvas.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height / 2;
});

// ریست کردن توپ
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

// تابع اسپاون آیتم‌ها
function spawnPowerUp() {
    if (!powerUp.isActive) {
        powerUp.x = Math.random() * (canvas.width - 100) + 50;
        powerUp.y = Math.random() * (canvas.height - 100) + 50;
        powerUp.isActive = true;
    }
}

function spawnGoldenItem() {
    if (!goldenItem.isActive) {
        goldenItem.x = Math.random() * (canvas.width - 100) + 50;
        goldenItem.y = Math.random() * (canvas.height - 100) + 50;
        goldenItem.isActive = true;
    }
}

// بررسی برخورد توپ با آیتم‌ها
function checkPowerUpCollision() {
    if (powerUp.isActive &&
        ball.x - ball.radius < powerUp.x + powerUp.width &&
        ball.x + ball.radius > powerUp.x &&
        ball.y - ball.radius < powerUp.y + powerUp.height &&
        ball.y + ball.radius > powerUp.y) {
        
        user.height += 20;
        powerUp.isActive = false;
        setTimeout(() => {
            user.height -= 20;
        }, 5000);
    }
}

function checkGoldenItemCollision() {
    if (goldenItem.isActive &&
        ball.x - ball.radius < goldenItem.x + goldenItem.width &&
        ball.x + ball.radius > goldenItem.x &&
        ball.y - ball.radius < goldenItem.y + goldenItem.height &&
        ball.y + ball.radius > goldenItem.y) {
        
        user.score++;
        goldenItem.isActive = false;
    }
}

// بروزرسانی وضعیت بازی
function update() {
    spawnPowerUp();
    spawnGoldenItem();
    checkPowerUpCollision();
    checkGoldenItemCollision();

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    if (ball.y - ball.radius < 50 || ball.y + ball.radius > canvas.height - 50) {
        ball.velocityY = -ball.velocityY;
        wall.play();
    }
}

// تابع رسم بازی
function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#000");
    drawRect(50, 50, canvas.width - 100, canvas.height - 100, "#1C1C1C");

    drawText(user.score, canvas.width / 4, canvas.height / 5);
    drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5);

    drawArc(ball.x, ball.y, ball.radius, ball.color);
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);

    if (powerUp.isActive) {
        drawRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, powerUp.color);
    }
    if (goldenItem.isActive) {
        drawRect(goldenItem.x, goldenItem.y, goldenItem.width, goldenItem.height, goldenItem.color);
    }
}

// اجرای بازی
function game() {
    update();
    render();
}

// اجرای حلقه بازی
let framePerSecond = 50;
let loop = setInterval(game, 1000 / framePerSecond);
