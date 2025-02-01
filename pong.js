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
    color: "#00FFFF" // آبی نئونی
};

// پدل بازیکن
const user = {
    x: 50,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "#007BFF", // آبی الکتریکی
    name: ""
};

// پدل حریف (کامپیوتر)
const com = {
    x: canvas.width - 60,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "#FF3B3B" // قرمز مات
};

// متغیر برای قدرت‌ها
let powerUpActive = false;
let powerUp = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: "#4CAF50",  // رنگ سبز برای قدرت مثبت
    isActive: false
};

let gameLevel = "medium"; // مقدار پیش‌فرض سطح بازی متوسط

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
    user.y = evt.clientY - rect.top - user.height / 2;
}

// ریست کردن توپ هنگام امتیازگیری
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

// رسم امتیازها
function drawText(text, x, y) {
    ctx.fillStyle = "#FFD700"; // طلایی متالیک
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

// تابع اسپاون (ظاهر شدن) قدرت
function spawnPowerUp() {
    if (!powerUp.isActive) {
        powerUp.x = Math.random() * (canvas.width - 100) + 50; // موقعیت افقی تصادفی
        powerUp.y = Math.random() * (canvas.height - 100) + 50; // موقعیت عمودی تصادفی
        powerUp.isActive = true;
    }
}

// تابع بررسی برخورد با آیتم قدرت
function checkPowerUpCollision() {
    if (powerUp.isActive && ball.x - ball.radius < powerUp.x + powerUp.width && 
        ball.x + ball.radius > powerUp.x && 
        ball.y - ball.radius < powerUp.y + powerUp.height &&
        ball.y + ball.radius > powerUp.y) {
        
        // وقتی توپ به آیتم برخورد کرد
        user.height += 20;  // بزرگ کردن راکت بازیکن
        powerUp.isActive = false;  // مخفی کردن آیتم بعد از برخورد
        setTimeout(() => {
            user.height -= 20;  // بازگشت به اندازه اولیه بعد از 5 ثانیه
        }, 5000);  // مدت زمان 5 ثانیه
    }
}

// تابع بروزرسانی وضعیت بازی
function update() {
    // اسپاون آیتم قدرت
    spawnPowerUp();
    
    // بررسی برخورد توپ با آیتم
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

    // حرکت کامپیوتر با کمی خطا
    let randomError = Math.random() * 0.5 - 0.25; // ایجاد یک خطای تصادفی کوچیک
    com.y += (ball.y - (com.y + com.height / 2)) * 0.05 + randomError;

    // جلوگیری از خارج شدن توپ از زمین
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

    // وقتی امتیاز یک نفر به 20 رسید
    if (user.score === 20 || com.score === 20) {
        // اگر یکی از بازیکنان به 20 برسد، بازی تمام می‌شود
        gameOver();
    }
}

// تابع بازی تمام شده
function gameOver() {
    let winner = (user.score > com.score) ? "شما برنده شدید!" : "کامپیوتر برنده شد!";
    alert(winner + "\nامتیاز نهایی شما: " + user.score + " - کامپیوتر: " + com.score);
    resetGame();
}

// ریست کردن بازی
function resetGame() {
    user.score = 0;
    com.score = 0;
    resetBall();
    draw();
}

// رسم تمام اجزا
function draw() {
    drawRect(0, 0, canvas.width, canvas.height, "black");
    drawText(user.score, canvas.width / 4, canvas.height / 5);
    drawText(com.score, 3 * canvas.width / 4, canvas.height / 5);
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    drawArc(ball.x, ball.y, ball.radius, ball.color);
    
    // اگر آیتم قدرت فعال باشد، آن را رسم کنیم
    if (powerUp.isActive) {
        drawRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, powerUp.color);
    }

    // بازی را هر فریم بروزرسانی کن
    requestAnimationFrame(update);
}

// نمایش صفحه انتخاب سطح بازی
function showLevelSelection() {
    document.getElementById('nameForm').style.display = 'none';
    document.getElementById('levelSelect').style.display = 'block';
}

// شروع بازی با سطح انتخابی
function startGame(level) {
    gameLevel = level;
    document.getElementById('levelSelect').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'block';
    // تنظیم سرعت و ویژگی‌های بازی طبق سطح انتخابی
    switch (gameLevel) {
        case 'easy':
            ball.speed = 4;
            break;
        case 'medium':
            ball.speed = 7;
            break;
        case 'hard':
            ball.speed = 10;
            break;
    }
    resetGame();
    draw();
                            }
