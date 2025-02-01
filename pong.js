const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

let gameLevel = "medium"; // سطح پیش‌فرض
let gameRunning = false;

// صداها
let hit = new Audio("sounds/hit.mp3");
let wall = new Audio("sounds/wall.mp3");
let userScore = new Audio("sounds/userScore.mp3");
let comScore = new Audio("sounds/comScore.mp3");

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

// شیء راکت‌ها
const user = { x: 50, y: (canvas.height - 100) / 2, width: 10, height: 100, score: 0, color: "#007BFF" };
const com = { x: canvas.width - 60, y: (canvas.height - 100) / 2, width: 10, height: 100, score: 0, color: "#FF3B3B" };

// آیتم‌های ویژه
let goldenItem = { x: 0, y: 0, width: 15, height: 15, isActive: false };
let redItem = { x: 0, y: 0, width: 15, height: 15, isActive: false };

// تابع برای نمایش بازی بعد از انتخاب سطح
function startGame(level) {
    gameLevel = level;
    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";
    gameRunning = true;
}

// کنترل راکت کاربر
canvas.addEventListener("mousemove", (evt) => {
    let rect = canvas.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height / 2;
});

// تابع برای رسم مستطیل
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// تابع برای رسم دایره (توپ)
function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

// ریست کردن توپ بعد از امتیاز
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
}

// بررسی برخورد توپ با راکت
function collision(b, p) {
    return b.x - b.radius < p.x + p.width && b.x + b.radius > p.x &&
           b.y - b.radius < p.y + p.height && b.y + b.radius > p.y;
}

// اسپاون آیتم طلایی (فقط در سطح آسان)
function spawnGoldenItem() {
    if (gameLevel === "easy" && !goldenItem.isActive) {
        goldenItem.x = Math.random() * (canvas.width - 100) + 50;
        goldenItem.y = Math.random() * (canvas.height - 100) + 50;
        goldenItem.isActive = true;
    }
}

// اسپاون آیتم قرمز (فقط در سطح سخت)
function spawnRedItem() {
    if (gameLevel === "hard" && !redItem.isActive) {
        redItem.x = Math.random() * (canvas.width - 100) + 50;
        redItem.y = Math.random() * (canvas.height - 100) + 50;
        redItem.isActive = true;
    }
}

// بررسی برخورد توپ با آیتم‌ها
function checkItemCollisions() {
    if (goldenItem.isActive &&
        ball.x - ball.radius < goldenItem.x + goldenItem.width &&
        ball.x + ball.radius > goldenItem.x &&
        ball.y - ball.radius < goldenItem.y + goldenItem.height &&
        ball.y + ball.radius > goldenItem.y) {
        user.score++;
        goldenItem.isActive = false;
    }

    if (redItem.isActive &&
        ball.x - ball.radius < redItem.x + redItem.width &&
        ball.x + ball.radius > redItem.x &&
        ball.y - ball.radius < redItem.y + redItem.height &&
        ball.y + ball.radius > redItem.y) {
        user.y = canvas.height - user.y - user.height;
        redItem.isActive = false;
    }
}

// بروزرسانی وضعیت بازی
function update() {
    if (!gameRunning) return;

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    if (gameLevel === "easy") spawnGoldenItem();
    if (gameLevel === "hard") spawnRedItem();

    checkItemCollisions();

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
        wall.play();
    }

    let player = (ball.x < canvas.width / 2) ? user : com;

    if (collision(ball, player)) {
        hit.play();
        ball.velocityX = -ball.velocityX;
    }

    if (ball.x - ball.radius < 0) {
        com.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        resetBall();
    }
}

// رسم عناصر بازی
function render() {
    drawRect(0, 0, canvas.width, canvas.height, "black");

    drawText(user.score, canvas.width / 4, 50);
    drawText(com.score, (3 * canvas.width) / 4, 50);

    drawArc(ball.x, ball.y, ball.radius, ball.color);

    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);

    if (goldenItem.isActive) drawRect(goldenItem.x, goldenItem.y, goldenItem.width, goldenItem.height, "gold");
    if (redItem.isActive) drawRect(redItem.x, redItem.y, redItem.width, redItem.height, "red");
}

// اجرای بازی
function gameLoop() {
    update();
    render();
}

// تنظیم حلقه بازی
setInterval(gameLoop, 1000 / 60);
