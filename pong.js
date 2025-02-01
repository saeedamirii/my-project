// انتخاب عنصر canvas
const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');

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
};

// پدل کامپیوتر
const com = {
    x: canvas.width - 60,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "#FF3B3B",
};

// تنظیمات سطح
let gameLevel = 'medium'; // سطح پیش فرض متوسط

// تغییر سطح بازی
function chooseLevel() {
    gameLevel = document.getElementById("levelSelect").value;
    document.getElementById("levelForm").style.display = "none";
    startGame();
}

// شروع بازی
function startGame() {
    configureGameLevel();
    loop = setInterval(game, 1000 / 50);  // شروع بازی
}

// تنظیمات بازی بر اساس سطح انتخابی
function configureGameLevel() {
    if (gameLevel === 'easy') {
        ball.speed = 4;
        com.height = 120;
        com.y = (canvas.height - com.height) / 2;
        // قدرت‌های ویژه برای سطح آسان
        user.width = 10;
        user.height = 100;
    } else if (gameLevel === 'medium') {
        ball.speed = 6;
        com.height = 100;
        com.y = (canvas.height - com.height) / 2;
        // قدرت‌های ویژه برای سطح متوسط
        user.width = 10;
        user.height = 100;
    } else if (gameLevel === 'hard') {
        ball.speed = 8;
        com.height = 80;
        com.y = (canvas.height - com.height) / 2;
        // قدرت‌های ویژه برای سطح سخت
        user.width = 10;
        user.height = 100;
    }
}

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

// تابع بروزرسانی وضعیت بازی
function update() {
    if (ball.x - ball.radius < 0) {
        com.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        resetBall();
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // حرکت کامپیوتر با کمی خطا
    let randomError = Math.random() * 0.5 - 0.25;
    com.y += (ball.y - (com.y + com.height / 2)) * 0.05 + randomError;

    // جلوگیری از خارج شدن توپ از زمین
    if (ball.y - ball.radius < 50 || ball.y + ball.radius > canvas.height - 50) {
        ball.velocityY = -ball.velocityY;
    }

    let player = (ball.x < canvas.width / 2) ? user : com;

    if (collision(ball, player)) {
        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.1;
    }
}

// تابع رسم تمام عناصر بازی
function render() {
    // پس‌زمینه گرادینتی شیک
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#0F2027");
    gradient.addColorStop(0.5, "#203A43");
    gradient.addColorStop(1, "#2C5364");
    drawRect(0, 0, canvas.width, canvas.height, gradient);

    // داخل میز
    drawRect(50, 50, canvas.width - 100, canvas.height - 100, "#1C1C1C");

    // امتیازدهی
    drawText(user.score, canvas.width / 4, canvas.height / 5);
    drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5);

    // خط وسط زمین
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 50);
    ctx.lineTo(canvas.width / 2, canvas.height - 50);
    ctx.stroke();
    ctx.setLineDash([]);

    // افکت Glow برای توپ و پدل‌ها
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00FFFF";
    drawArc(ball.x, ball.y, ball.radius, "#00FFFF");

    ctx.shadowColor = "#007BFF";
    drawRect(user.x, user.y, user.width, user.height, "#007BFF");

    ctx.shadowColor = "#FF3B3B";
    drawRect(com.x, com.y, com.width, com.height, "#FF3B3B");

    ctx.shadowBlur = 0;
}

// تابع اجرای بازی
function game() {
    update();
    render();
}
