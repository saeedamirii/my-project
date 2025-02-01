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
let powerUpGreen = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: "#4CAF50",
    isActive: false
};

let powerUpGold = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: "#FFD700",
    isActive: false
};

let powerUpRed = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: "#FF0000",
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

// بررسی برخورد توپ با پدل‌ها
function checkPaddleCollision() {
    // برخورد توپ با پدل بازیکن
    if (ball.x - ball.radius < user.x + user.width &&
        ball.y > user.y && 
        ball.y < user.y + user.height) {
        
        // تغییر جهت توپ به صورت منطقی
        ball.velocityX = Math.abs(ball.velocityX);  // همیشه توپ به سمت راست برود
        let angle = (ball.y - (user.y + user.height / 2)) / (user.height / 2) * Math.PI / 4; // تغییر زاویه برخورد توپ
        ball.velocityY = Math.sin(angle) * ball.speed;  // تغییر زاویه برخورد توپ با راکت
        hit.play();
    }

    // برخورد توپ با پدل کامپیوتر
    if (ball.x + ball.radius > com.x &&
        ball.y > com.y && 
        ball.y < com.y + com.height) {
        
        // تغییر جهت توپ به صورت منطقی
        ball.velocityX = -Math.abs(ball.velocityX);  // همیشه توپ به سمت چپ برود
        let angle = (ball.y - (com.y + com.height / 2)) / (com.height / 2) * Math.PI / 4; // تغییر زاویه برخورد توپ
        ball.velocityY = Math.sin(angle) * ball.speed;  // تغییر زاویه برخورد توپ با راکت
        hit.play();
    }
}

// تابع اسپاون قدرت‌ها
function spawnPowerUps() {
    if (!powerUpGold.isActive) {
        powerUpGold.x = Math.random() * (canvas.width - 100) + 50;
        powerUpGold.y = Math.random() * (canvas.height - 100) + 50;
        powerUpGold.isActive = true;
    }

    if (!powerUpGreen.isActive) {
        powerUpGreen.x = Math.random() * (canvas.width - 100) + 50;
        powerUpGreen.y = Math.random() * (canvas.height - 100) + 50;
        powerUpGreen.isActive = true;
    }

    if (!powerUpRed.isActive) {
        powerUpRed.x = Math.random() * (canvas.width - 100) + 50;
        powerUpRed.y = Math.random() * (canvas.height - 100) + 50;
        powerUpRed.isActive = true;
    }
}

// بررسی برخورد توپ با قدرت‌ها
function checkPowerUpCollision() {
    // برخورد با ایتم طلایی (سطح آسان)
    if (powerUpGold.isActive &&
        ball.x - ball.radius < powerUpGold.x + powerUpGold.width &&
        ball.x + ball.radius > powerUpGold.x &&
        ball.y - ball.radius < powerUpGold.y + powerUpGold.height &&
        ball.y + ball.radius > powerUpGold.y) {
        
        user.height += 20;
        powerUpGold.isActive = false;
        setTimeout(() => {
            user.height -= 20;
        }, 5000);
    }

    // برخورد با ایتم سبز (سطح آسان یا متوسط)
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

    // برخورد با ایتم قرمز (سطح سخت)
    if (powerUpRed.isActive &&
        ball.x - ball.radius < powerUpRed.x + powerUpRed.width &&
        ball.x + ball.radius > powerUpRed.x &&
        ball.y - ball.radius < powerUpRed.y + powerUpRed.height &&
        ball.y + ball.radius > powerUpRed.y) {
        
        user.y = canvas.height - user.height - user.y;
        powerUpRed.isActive = false;
        setTimeout(() => {
            user.y = canvas.height - user.height - user.y;
        }, 5000);
    }
}

// بروزرسانی وضعیت بازی
function update() {
    spawnPowerUps();
    checkPowerUpCollision();
    checkPaddleCollision();

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

    // هوش مصنوعی (راکت کامپیوتر)
    let errorMargin = 0.05; // خطای کوچک برای حرکت طبیعی
    let targetY = ball.y - com.height / 2;
    com.y += (targetY - com.y) * errorMargin;

    // محدود کردن حرکت راکت‌ها
    com.y = Math.max(Math.min(com.y, canvas.height - com.height), 0);  // راکت حریف نباید از محدوده بازی خارج بشه
    user.y = Math.max(Math.min(user.y, canvas.height - user.height), 0);  // راکت کاربر نباید از محدوده بازی خارج بشه

    if (ball.y - ball.radius < 50 || ball.y + ball.radius > canvas.height - 50) {
        ball.velocityY = -ball.velocityY;
        wall.play();
    }

    // حرکت طبیعی‌تر توپ
    if (ball.velocityX > 0) {
        ball.velocityX += 0.01; // افزایش تدریجی سرعت در راستای x
    }

    // محدود کردن سرعت توپ
    ball.speed = 7;

    // اگر امتیاز یکی از بازیکنان به 20 برسد، بازی تمام می‌شود
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

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00FFFF";
    drawArc(ball.x, ball.y, ball.radius, "#00FFFF");

    ctx.shadowColor = "#007BFF";
    drawRect(user.x, user.y, user.width, user.height, user.color);

    ctx.shadowColor = "#FF3B3B";
    drawRect(com.x, com.y, com.width, com.height, com.color);

    if (powerUpGold.isActive) {
        ctx.shadowColor = "#FFD700";
        drawRect(powerUpGold.x, powerUpGold.y, powerUpGold.width, powerUpGold.height, powerUpGold.color);
    }

    if (powerUpGreen.isActive) {
        ctx.shadowColor = "#4CAF50";
        drawRect(powerUpGreen.x, powerUpGreen.y, powerUpGreen.width, powerUpGreen.height, powerUpGreen.color);
    }

    if (powerUpRed.isActive) {
        ctx.shadowColor = "#FF0000";
        drawRect(powerUpRed.x, powerUpRed.y, powerUpRed.width, powerUpRed.height, powerUpRed.color);
    }
}

// ایجاد یک حلقه بازی
function game() {
    update();
    render();
}

// راه اندازی بازی
let framePerSecond = 60;
let loop = setInterval(game, 1000 / framePerSecond);
