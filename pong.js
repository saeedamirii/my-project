const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');

// متغیرها برای تنظیمات سطح بازی
let gameLevel = '';  // سطح بازی
let loop;            // حلقه بازی
let framePerSecond = 60;  // تعداد فریم‌ها در ثانیه

// تنظیمات برای توپ، پدل‌ها و قدرت‌ها
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,
    speed: 7,
    color: "#00FFFF"
};

const user = {
    x: 50,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "#007BFF",
    reversed: false
};

const com = {
    x: canvas.width - 60,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "#FF3B3B"
};

let powerUpActive = false;
let powerUp = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: "#4CAF50",
    isActive: false
};

// صداها
let hit = new Audio();
let wall = new Audio();
let userScore = new Audio();
let comScore = new Audio();

hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";

// رسم مستطیل (برای پدل‌ها و پس‌زمینه)
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// رسم دایره (برای توپ)
function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

// گوش دادن به حرکت ماوس برای کنترل پدل بازیکن
canvas.addEventListener("mousemove", getMousePos);
function getMousePos(evt) {
    let rect = canvas.getBoundingClientRect();
    if (!user.reversed) {
        user.y = evt.clientY - rect.top - user.height / 2;
    } else {
        user.y = canvas.height - (evt.clientY - rect.top + user.height / 2);
    }
}

// تابع اسپاون قدرت‌ها
function spawnPowerUp() {
    if (!powerUp.isActive && gameLevel === 'hard') {
        powerUp.x = Math.random() * (canvas.width - 100) + 50; 
        powerUp.y = Math.random() * (canvas.height - 100) + 50;
        powerUp.isActive = true;
    }
}

// بررسی برخورد با آیتم‌ها
function checkPowerUpCollision() {
    if (powerUp.isActive && ball.x - ball.radius < powerUp.x + powerUp.width && 
        ball.x + ball.radius > powerUp.x && 
        ball.y - ball.radius < powerUp.y + powerUp.height &&
        ball.y + ball.radius > powerUp.y) {
        
        user.height += 20;  
        powerUp.isActive = false;
        setTimeout(() => { user.height -= 20; }, 5000);
    }
}

// تابع بروزرسانی وضعیت بازی
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
    drawRect(user.x, user.y, user.width, user.height, "#007BFF");

    ctx.shadowColor = "#FF3B3B";
    drawRect(com.x, com.y, com.width, com.height, "#FF3B3B");

    ctx.shadowBlur = 0;

    if (powerUp.isActive) {
        drawRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, powerUp.color);
    }
}

// تابع شروع بازی
function startGame(level) {
    gameLevel = level;
    document.getElementById("levelMenu").style.display = "none";  // مخفی کردن منو

    // شروع بازی پس از انتخاب سطح
    loop = setInterval(game, 1000 / framePerSecond);
}

// بازی
function game() {
    update();
    render();
}
