// انتخاب عنصر canvas
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
    color: "#00FFFF"
};

// پدل بازیکن
const user = {
    x: 50,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "#007BFF",
    speed: 10
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

// Power-Ups
const powerUps = [];
const powerUpEffects = {
    increasePaddleSize: "increasePaddleSize",
    decreasePaddleSize: "decreasePaddleSize",
    increaseBallSpeed: "increaseBallSpeed",
    decreaseBallSpeed: "decreaseBallSpeed",
    increasePaddleSpeed: "increasePaddleSpeed",
    decreasePaddleSpeed: "decreasePaddleSpeed"
};

// ایجاد Power-Up در موقعیت تصادفی
function spawnPowerUp() {
    const effectTypes = [
        powerUpEffects.increasePaddleSize,
        powerUpEffects.decreasePaddleSize,
        powerUpEffects.increaseBallSpeed,
        powerUpEffects.decreaseBallSpeed,
        powerUpEffects.increasePaddleSpeed,
        powerUpEffects.decreasePaddleSpeed
    ];
    let effect = effectTypes[Math.floor(Math.random() * effectTypes.length)];
    
    let powerUp = {
        x: Math.random() * (canvas.width - 200) + 100,
        y: Math.random() * (canvas.height - 200) + 100,
        radius: 15,
        color: effect.includes("increase") ? "#00FF00" : "#FF0000", // سبز برای مثبت، قرمز برای منفی
        effect: effect
    };

    powerUps.push(powerUp);

    setTimeout(() => {
        powerUps.splice(powerUps.indexOf(powerUp), 1);
    }, 5000);
}

// رسم Power-Ups
function drawPowerUps() {
    powerUps.forEach((p) => {
        drawArc(p.x, p.y, p.radius, p.color);
    });
}

// برخورد توپ با Power-Up
function checkPowerUpCollision() {
    powerUps.forEach((p, index) => {
        let dx = ball.x - p.x;
        let dy = ball.y - p.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.radius + p.radius) {
            powerupSound.play();
            applyPowerUpEffect(p.effect);
            powerUps.splice(index, 1);
        }
    });
}

// اعمال اثرات Power-Up
function applyPowerUpEffect(effect) {
    if (effect === powerUpEffects.increasePaddleSize) {
        user.height = Math.min(user.height + 20, 150);
    } else if (effect === powerUpEffects.decreasePaddleSize) {
        user.height = Math.max(user.height - 20, 50);
    } else if (effect === powerUpEffects.increaseBallSpeed) {
        ball.speed = Math.min(ball.speed + 2, 12);
    } else if (effect === powerUpEffects.decreaseBallSpeed) {
        ball.speed = Math.max(ball.speed - 2, 5);
    } else if (effect === powerUpEffects.increasePaddleSpeed) {
        user.speed = Math.min(user.speed + 2, 15);
    } else if (effect === powerUpEffects.decreasePaddleSpeed) {
        user.speed = Math.max(user.speed - 2, 5);
    }
}

// رسم مستطیل (برای پدل‌ها و پس‌زمینه)
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// رسم دایره (برای توپ و Power-Ups)
function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

// کنترل پدل بازیکن با ماوس
canvas.addEventListener("mousemove", getMousePos);
function getMousePos(evt) {
    let rect = canvas.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height / 2;
}

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

    // حرکت کامپیوتر
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

    // بررسی برخورد با Power-Up
    checkPowerUpCollision();

    // وقتی امتیاز یک نفر به 20 رسید
    if (user.score === 20 || com.score === 20) {
        clearInterval(loop);
        setTimeout(() => {
            let winner = user.score === 20 ? "تو" : "کامپیوتر";
            let message = user.score === 20 
                ? "🎉 آفرین! تو برنده شدی! 🏆👏" 
                : "😢 آخی! باختی! دوباره امتحان کن، شاید دفعه بعد برنده بشی! 😎";
            alert(message);
            user.score = 0;
            com.score = 0;
            resetBall();
            loop = setInterval(game, 1000 / framePerSecond); 
        }, 1000); 
    }
}

// تابع رسم تمام عناصر بازی
function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#1C1C1C");
    drawRect(50, 50, canvas.width - 100, canvas.height - 100, "#0F2027");
    drawText(user.score, canvas.width / 4, canvas.height / 5);
    drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5);
    drawArc(ball.x, ball.y, ball.radius, "#00FFFF");
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    drawPowerUps();
}

// اجرای بازی
function game() {
    update();
    render();
}

// تعداد فریم در ثانیه
let framePerSecond = 50;
let loop = setInterval(game, 1000 / framePerSecond);
setInterval(spawnPowerUp, 10000); // هر 10 ثانیه یک Power-Up ایجاد شود
