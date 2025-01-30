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
    color: "WHITE"
}

// بازیکن
const user = {
    x: 0,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "WHITE"
}

// حریف (کامپیوتر)
const com = {
    x: canvas.width - 10,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "WHITE"
}

// خط وسط
const net = {
    x: (canvas.width - 2) / 2,
    y: 0,
    height: 10,
    width: 2,
    color: "WHITE"
}

// تابع رسم مستطیل
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// تابع رسم دایره (توپ)
function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

// کنترل بازیکن با ماوس
canvas.addEventListener("mousemove", getMousePos);
function getMousePos(evt) {
    let rect = canvas.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height / 2;
}

// ریست کردن بازی
function resetGame(winner) {
    alert(winner + " برنده شد! بازی دوباره شروع می‌شود.");
    
    // ریست امتیازات
    user.score = 0;
    com.score = 0;
    
    // ریست توپ و سرعت آن
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

// رسم امتیازات
function drawText(text, x, y) {
    ctx.fillStyle = "#FFF";
    ctx.font = "75px fantasy";
    ctx.fillText(text, x, y);
}

// تشخیص برخورد توپ با پدل
function collision(b, p) {
    return p.x < b.x + b.radius && 
           p.x + p.width > b.x - b.radius &&
           p.y < b.y + b.radius && 
           p.y + p.height > b.y - b.radius;
}

// هوش مصنوعی حریف (اصلاح‌شده)
function moveAI() {
    let errorMargin = Math.random() * 40 - 20; // ایجاد خطای تصادفی بین -20 تا 20 پیکسل
    let targetY = ball.y - com.height / 2 + errorMargin;

    let aiSpeed = 3; // کاهش سرعت حرکت حریف

    if (com.y < targetY) {
        com.y += aiSpeed;
    } else if (com.y > targetY) {
        com.y -= aiSpeed;
    }
}

// به‌روزرسانی بازی
function update() {
    // بررسی امتیاز و اعلام برنده
    if (user.score >= 20) {
        resetGame("بازیکن");
        return;
    }
    if (com.score >= 20) {
        resetGame("کامپیوتر");
        return;
    }

    // بررسی امتیازات و ریست توپ
    if (ball.x - ball.radius < 0) {
        com.score++;
        comScore.play();
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        userScore.play();
        resetBall();
    }

    // حرکت توپ
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // حرکت هوش مصنوعی
    moveAI();

    // برخورد توپ با دیوار بالا و پایین
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
        wall.play();
    }

    // تشخیص برخورد با پدل بازیکن یا حریف
    let player = (ball.x + ball.radius < canvas.width / 2) ? user : com;

    if (collision(ball, player)) {
        hit.play();

        // محاسبه نقطه برخورد
        let collidePoint = (ball.y - (player.y + player.height / 2));
        collidePoint = collidePoint / (player.height / 2);

        // تعیین زاویه جدید توپ
        let angleRad = (Math.PI / 4) * collidePoint;

        // تعیین جهت حرکت توپ
        let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // افزایش سرعت توپ
        ball.speed += 0.1;
    }
}

// نمایش بازی
function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#000");

    // نمایش امتیازات
    drawText(user.score, canvas.width / 4, canvas.height / 5);
    drawText(com.score, 3 * canvas.width / 4, canvas.height / 5);

    // نمایش خط وسط
    drawNet();

    // نمایش پدل بازیکن و حریف
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);

    // نمایش توپ
    drawArc(ball.x, ball.y, ball.radius, ball.color);
}

// حلقه بازی
function game() {
    update();
    render();
}

// تعیین نرخ فریم
let framePerSecond = 50;
let loop = setInterval(game, 1000 / framePerSecond);
