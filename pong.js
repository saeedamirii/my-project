// انتخاب عنصر canvas
const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');

// رنگ‌ها و استایل جدید
const backgroundColor = "#1E1E1E"; // پس‌زمینه تیره
const paddleColor = "#00FFEA"; // رنگ نئونی برای پدل‌ها
const ballColor = "#FF007F"; // رنگ توپ صورتی نئونی
const netColor = "#FFFFFF"; // رنگ خط وسط سفید
const textColor = "#FFD700"; // رنگ امتیازات طلایی

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
    color: ballColor
}

// بازیکن و حریف
const user = { x: 0, y: (canvas.height - 100) / 2, width: 10, height: 100, score: 0, color: paddleColor }
const com = { x: canvas.width - 10, y: (canvas.height - 100) / 2, width: 10, height: 100, score: 0, color: paddleColor }
const net = { x: (canvas.width - 2) / 2, y: 0, height: 10, width: 2, color: netColor }

// تابع رسم مستطیل
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// تابع رسم دایره (توپ)
function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.shadowBlur = 10; 
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

// کنترل بازیکن با ماوس
canvas.addEventListener("mousemove", evt => {
    let rect = canvas.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height / 2;
});

// ریست کردن بازی
function resetGame(winner) {
    alert(winner + " برنده شد! بازی دوباره شروع می‌شود.");
    user.score = 0;
    com.score = 0;
    resetBall();
}

// ریست کردن موقعیت توپ
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

// رسم خط وسط
function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// رسم امتیازات با فونت مدرن
function drawText(text, x, y) {
    ctx.fillStyle = textColor;
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.shadowBlur = 10;
    ctx.shadowColor = textColor;
    ctx.fillText(text, x, y);
}

// تشخیص برخورد توپ با پدل
function collision(b, p) {
    return p.x < b.x + b.radius && p.x + p.width > b.x - b.radius && p.y < b.y + b.radius && p.y + p.height > b.y - b.radius;
}

// هوش مصنوعی
function moveAI() {
    let errorMargin = Math.random() * 40 - 20;
    let targetY = ball.y - com.height / 2 + errorMargin;
    let aiSpeed = 3;

    if (com.y < targetY) {
        com.y += aiSpeed;
    } else if (com.y > targetY) {
        com.y -= aiSpeed;
    }
}

// به‌روزرسانی بازی
function update() {
    if (user.score >= 20) { resetGame("بازیکن"); return; }
    if (com.score >= 20) { resetGame("کامپیوتر"); return; }

    if (ball.x - ball.radius < 0) {
        com.score++;
        comScore.play();
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        userScore.play();
        resetBall();
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    moveAI();

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
        wall.play();
    }

    let player = (ball.x + ball.radius < canvas.width / 2) ? user : com;

    if (collision(ball, player)) {
        hit.play();
        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.1;
    }
}

// نمایش بازی
function render() {
    drawRect(0, 0, canvas.width, canvas.height, backgroundColor);
    drawText(user.score, canvas.width / 4, canvas.height / 5);
    drawText(com.score, 3 * canvas.width / 4, canvas.height / 5);
    drawNet();
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    drawArc(ball.x, ball.y, ball.radius, ball.color);
}

// حلقه بازی
function game() {
    update();
    render();
}

// تنظیم نرخ فریم
let framePerSecond = 50;
let loop = setInterval(game, 1000 / framePerSecond);
