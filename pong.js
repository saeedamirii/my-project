const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');
let gameMode = ""; // سطح بازی انتخاب شده

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

// آیتم‌های جدید
let goldenItem = { x: 0, y: 0, width: 20, height: 20, color: "#FFD700", isActive: false };
let redItem = { x: 0, y: 0, width: 20, height: 20, color: "#FF0000", isActive: false };

// نمایش منو هنگام لود صفحه
window.onload = function () {
    document.getElementById("menu").style.display = "block";
    canvas.style.display = "none";
};

// تابع شروع بازی
function startGame(level) {
    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";
    gameMode = level;

    if (level === 'easy') goldenItem.isActive = true;
    if (level === 'hard') spawnRedItem();

    loop = setInterval(game, 1000 / 50);
}

// تابع اضافه کردن آیتم قرمز (سطح سخت)
function spawnRedItem() {
    setInterval(() => {
        redItem.x = Math.random() * (canvas.width - 100) + 50;
        redItem.y = Math.random() * (canvas.height - 100) + 50;
        redItem.isActive = true;
        setTimeout(() => redItem.isActive = false, 3000);
    }, 7000);
}

// کنترل ماوس
canvas.addEventListener("mousemove", (evt) => {
    let rect = canvas.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height / 2;
});

// بررسی برخورد توپ با آیتم‌ها
function checkItemCollision() {
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
        reversePaddleControl();
        redItem.isActive = false;
    }
}

// برعکس کردن کنترل پدل
function reversePaddleControl() {
    canvas.removeEventListener("mousemove", normalControl);
    canvas.addEventListener("mousemove", reversedControl);
    setTimeout(() => {
        canvas.removeEventListener("mousemove", reversedControl);
        canvas.addEventListener("mousemove", normalControl);
    }, 3000);
}

function normalControl(evt) {
    let rect = canvas.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height / 2;
}

function reversedControl(evt) {
    let rect = canvas.getBoundingClientRect();
    user.y = canvas.height - (evt.clientY - rect.top) - user.height;
}

// ریست کردن توپ
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

// آپدیت وضعیت بازی
function update() {
    checkItemCollision();

    if (ball.x - ball.radius < 0) {
        com.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        resetBall();
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    let player = (ball.x < canvas.width / 2) ? user : com;

    if (ball.y - ball.radius < 50 || ball.y + ball.radius > canvas.height - 50) {
        ball.velocityY = -ball.velocityY;
    }

    if (collision(ball, player)) {
        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.1;
    }
}

// تابع رسم بازی
function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#0F2027");
    drawArc(ball.x, ball.y, ball.radius, "#00FFFF");
    drawRect(user.x, user.y, user.width, user.height, "#007BFF");
    drawRect(com.x, com.y, com.width, com.height, "#FF3B3B");

    if (goldenItem.isActive) drawRect(goldenItem.x, goldenItem.y, goldenItem.width, goldenItem.height, goldenItem.color);
    if (redItem.isActive) drawRect(redItem.x, redItem.y, redItem.width, redItem.height, redItem.color);
}

// اجرای بازی
function game() {
    update();
    render();
}

// رسم اشکال
function drawRect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function drawArc(x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function collision(b, p) { return (b.x - b.radius < p.x + p.width && b.x + b.radius > p.x && b.y - b.radius < p.y + p.height && b.y + b.radius > p.y); }
