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

// متغیر برای قدرت‌ها
let powerUp = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: "#4CAF50", // رنگ سبز مثل سطح متوسط
    isActive: false
};

// متغیر برای آیتم طلایی
let goldenItem = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: "#FFD700", // رنگ طلایی
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

// تابع اسپاون قدرت‌ها
function spawnPowerUp() {
    if (!powerUp.isActive) {
        powerUp.x = Math.random() * (canvas.width - 100) + 50;
        powerUp.y = Math.random() * (canvas.height - 100) + 50;
        powerUp.isActive = true;
    }
}

// تابع اسپاون آیتم طلایی
function spawnGoldenItem() {
    if (!goldenItem.isActive) {
        goldenItem.x = Math.random() * (canvas.width - 100) + 50;
        goldenItem.y = Math.random() * (canvas.height - 100) + 50;
        goldenItem.isActive = true;
    }
}

// بررسی برخورد توپ با قدرت
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

// بررسی برخورد توپ با آیتم طلایی
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
}

// تابع رسم بازی
function render() {
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#0F2027");
    gradient.addColorStop(0.5, "#203A43");
    gradient.addColorStop(1, "#2C5364");
    drawRect(0, 0, canvas.width, canvas.height, gradient);

    drawRect(50, 50, canvas.width - 100, canvas.height - 100, "#1C1C1C");

    drawText(user.score, canvas.width / 4, canvas.height / 5);
    drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5);

    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 50);
    ctx.lineTo(canvas.width / 2, canvas.height - 50);
    ctx.stroke();
    ctx.setLineDash([]);

    drawArc(ball.x, ball.y, ball.radius, "#00FFFF");
    drawRect(user.x, user.y, user.width, user.height, "#007BFF");
    drawRect(com.x, com.y, com.width, com.height, "#FF3B3B");

    if (powerUp.isActive) {
        drawRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, powerUp.color);
    }

    if (goldenItem.isActive) {
        drawRect(goldenItem.x, goldenItem.y, goldenItem.width, goldenItem.height, goldenItem.color);
    }
}

// تابع اجرای بازی
function game() {
    update();
    render();
}

// اجرای بازی
let framePerSecond = 50;
let loop = setInterval(game, 1000 / framePerSecond);




function checkGameEnd() {
    if (user.score >= 30) {
        setTimeout(() => {
            alert("🎉 آفرین! ولی سطح آسان بود، برو سطح بالاتر! 😉");
            restartGame();
        }, 100);
    } else if (com.score >= 30) {
        setTimeout(() => {
            alert("😢 داداش زشت نیست تو این سطح ببازی؟ یکبار دیگه شروع کن ببینم! 💪");
            restartGame();
        }, 100);
    }
}

// تابعی برای ریست بازی بدون نیاز به چندبار کلیک روی OK
function restartGame() {
    user.score = 0;
    com.score = 0;
    resetBall();
}

// اجرای بررسی پایان بازی در هر فریم
const originalUpdate = update;
update = function () {
    originalUpdate();
    checkGameEnd();
};
