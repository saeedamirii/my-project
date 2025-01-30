// انتخاب عنصر Canvas
const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');

// بارگذاری صداها
let hit = new Audio();
let wall = new Audio();
let userScore = new Audio();
let comScore = new Audio();
let powerupSound = new Audio();

hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";
powerupSound.src = "sounds/powerup.mp3";

// شیء توپ
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,
    speed: 7,
    color: "#00FFFF" // آبی نئونی
}

// پدل بازیکن
const user = {
    x: 50,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "#007BFF" // آبی الکتریکی
}

// پدل کامپیوتر
const com = {
    x: canvas.width - 60,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "#FF3B3B" // قرمز مات
}

// Power-ups
let powerUp = {
    x: Math.random() * (canvas.width - 50) + 25,
    y: Math.random() * (canvas.height - 50) + 25,
    size: 15,
    active: false,
    type: null,  // نوع power-up
    color: "GREEN"
};

// تابع رسم مستطیل (برای پدل‌ها و پس‌زمینه)
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// تابع رسم دایره (برای توپ و power-ups)
function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

// شنونده حرکت ماوس برای کنترل پدل کاربر
canvas.addEventListener("mousemove", (evt) => {
    let rect = canvas.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height / 2;
});

// تابع ریست کردن توپ
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

// رسم امتیازها
function drawText(text, x, y) {
    ctx.fillStyle = "#FFD700"; // طلایی متالیک
    ctx.font = "50px fantasy";
    ctx.fillText(text, x, y);
}

// تابع بررسی برخورد توپ با پدل
function collision(b, p) {
    return b.x - b.radius < p.x + p.width &&
           b.x + b.radius > p.x &&
           b.y - b.radius < p.y + p.height &&
           b.y + b.radius > p.y;
}

// بروزرسانی وضعیت بازی
function update() {
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

    com.y += (ball.y - (com.y + com.height / 2)) * 0.1;

    if (ball.y - ball.radius < 50 || ball.y + ball.radius > canvas.height - 50) {
        ball.velocityY = -ball.velocityY;
        wall.play();
    }

    let player = (ball.x + ball.radius < canvas.width / 2) ? user : com;

    if (collision(ball, player)) {
        hit.play();
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.1;
    }

    // بررسی برخورد توپ با Power-up
    if (powerUp.active && ball.x > powerUp.x - powerUp.size && ball.x < powerUp.x + powerUp.size &&
        ball.y > powerUp.y - powerUp.size && ball.y < powerUp.y + powerUp.size) {
        activatePowerUp(powerUp.type);
        powerUp.active = false;
    }
}

// فعال‌سازی Power-up
function activatePowerUp(type) {
    powerupSound.play();
    switch (type) {
        case "biggerPaddle":
            user.height += 20;
            setTimeout(() => user.height -= 20, 5000);
            break;
        case "extraPoint":
            user.score++;
            break;
        case "doubleBall":
            ball.speed -= 2;
            setTimeout(() => ball.speed += 2, 5000);
            break;
        case "fasterBall":
            ball.speed += 3;
            setTimeout(() => ball.speed -= 3, 5000);
            break;
        case "reverseControls":
            canvas.addEventListener("mousemove", (evt) => {
                let rect = canvas.getBoundingClientRect();
                user.y = canvas.height - (evt.clientY - rect.top) - user.height / 2;
            });
            setTimeout(() => {
                canvas.addEventListener("mousemove", (evt) => {
                    let rect = canvas.getBoundingClientRect();
                    user.y = evt.clientY - rect.top - user.height / 2;
                });
            }, 5000);
            break;
    }
}

// رسم Power-up
function drawPowerUp() {
    if (powerUp.active) {
        drawArc(powerUp.x, powerUp.y, powerUp.size, powerUp.color);
    }
}

// ایجاد Power-up جدید
setInterval(() => {
    powerUp.x = Math.random() * (canvas.width - 50) + 25;
    powerUp.y = Math.random() * (canvas.height - 50) + 25;
    powerUp.type = ["biggerPaddle", "extraPoint", "doubleBall", "fasterBall", "reverseControls"][Math.floor(Math.random() * 5)];
    powerUp.color = (["biggerPaddle", "extraPoint", "doubleBall"].includes(powerUp.type)) ? "GREEN" : "RED";
    powerUp.active = true;
}, 10000);

// رندر کردن بازی
function render() {
    // پس‌زمینه گرادینتی شیک
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#0F2027");
    gradient.addColorStop(0.5, "#203A43");
    gradient.addColorStop(1, "#2C5364");
    drawRect(0, 0, canvas.width, canvas.height, gradient);

    // داخل میز (زمین بازی)
    drawRect(50, 50, canvas.width - 100, canvas.height - 100, "#1C1C1C");

    // امتیازدهی
    drawText(user.score, canvas.width / 4, canvas.height / 5);
    drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5);

    // خط وسط زمین
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // رسم پدل‌ها و توپ
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    drawArc(ball.x, ball.y, ball.radius, ball.color);

    // رسم Power-up‌ها
    drawPowerUp();
}

// اجرای بازی
function game() {
    update();
    render();
}

// شروع بازی
setInterval(game, 1000 / 50);
