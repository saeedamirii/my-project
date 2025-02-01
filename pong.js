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

// آیتم سبز (افزایش طول راکت کاربر)
let powerUpGreen = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: "#4CAF50",
    isActive: false
};

// آیتم طلایی (افزایش امتیاز مستقیم)
let powerUpGold = {
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

// رسم امتیازها
function drawText(text, x, y) {
    ctx.fillStyle = "#FFD700";
    ctx.font = "50px fantasy";
    ctx.fillText(text, x, y);
}

// بررسی برخورد توپ با پدل
function collision(b, p) {
    return (
        b.x - b.radius < p.x + p.width &&
        b.x + b.radius > p.x &&
        b.y - b.radius < p.y + p.height &&
        b.y + b.radius > p.y
    );
}

// تابع اسپاون آیتم‌ها
function spawnPowerUp() {
    if (!powerUpGreen.isActive) {
        powerUpGreen.x = Math.random() * (canvas.width - 100) + 50;
        powerUpGreen.y = Math.random() * (canvas.height - 100) + 50;
        powerUpGreen.isActive = true;
    }
    if (!powerUpGold.isActive) {
        powerUpGold.x = Math.random() * (canvas.width - 100) + 50;
        powerUpGold.y = Math.random() * (canvas.height - 100) + 50;
        powerUpGold.isActive = true;
    }
}

// بررسی برخورد توپ با آیتم‌ها
function checkPowerUpCollision() {
    if (powerUpGreen.isActive &&
        ball.x - ball.radius < powerUpGreen.x + powerUpGreen.width &&
        ball.x + ball.radius > powerUpGreen.x &&
        ball.y - ball.radius < powerUpGreen.y + powerUpGreen.height &&
        ball.y + ball.radius > powerUpGreen.y) {
        
        user.height += 20;
        powerUpGreen.isActive = false;
        setTimeout(() => {
            user.height -= 20;
        }, 5000);
    }

    if (powerUpGold.isActive &&
        ball.x - ball.radius < powerUpGold.x + powerUpGold.width &&
        ball.x + ball.radius > powerUpGold.x &&
        ball.y - ball.radius < powerUpGold.y + powerUpGold.height &&
        ball.y + ball.radius > powerUpGold.y) {
        
        user.score++;
        powerUpGold.isActive = false;
    }
}

// بروزرسانی وضعیت بازی
function update() {
    spawnPowerUp();
    checkPowerUpCollision();

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

    // هوش مصنوعی: دنبال کردن توپ
    let randomError = Math.random() * 0.5 - 0.25;
    com.y += (ball.y - (com.y + com.height / 2)) * 0.05 + randomError;

    if (ball.y - ball.radius < 50 || ball.y + ball.radius > canvas.height - 50) {
        ball.velocityY = -ball.velocityY;
        wall.play();
    }

    let player = (ball.x < canvas.width / 2) ? user : com;

    if (collision(ball, player)) {
        hit.play();
        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.1;
    }

    if (user.score === 20 || com.score === 20) {
        clearInterval(loop);
        setTimeout(() => {
            let message = user.score === 20
                ? "🎉 آفرین! تو برنده شدی! 🏆👏"
                : "😢 آخی! باختی! دوباره امتحان کن!";
            alert(message);
            user.score = 0;
            com.score = 0;
            resetBall();
            loop = setInterval(game, 1000 / framePerSecond);
        }, 1000);
    }
}

// تابع رسم بازی
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawRect(0, 0, canvas.width, canvas.height, "#000");

    drawText(user.score, canvas.width / 4, canvas.height / 5);
    drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5);

    drawArc(ball.x, ball.y, ball.radius, ball.color);
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);

    if (powerUpGreen.isActive) {
        drawRect(powerUpGreen.x, powerUpGreen.y, powerUpGreen.width, powerUpGreen.height, powerUpGreen.color);
    }
    if (powerUpGold.isActive) {
        drawRect(powerUpGold.x, powerUpGold.y, powerUpGold.width, powerUpGold.height, powerUpGold.color);
    }
}

// تابع اجرای بازی
function game() {
    update();
    render();
}

// تعداد فریم در ثانیه
let framePerSecond = 50;
let loop = setInterval(game, 1000 / framePerSecond);
