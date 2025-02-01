const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');
let gameLevel = "medium";  // سطح پیش‌فرض

// تعریف آیتم‌های ویژه برای سطوح مختلف
let goldenItem = { x: 0, y: 0, size: 15, color: "gold", isActive: false };
let redItem = { x: 0, y: 0, size: 15, color: "red", isActive: false };
let reverseControl = false;

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

// پدل حریف
const com = {
    x: canvas.width - 60,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "#FF3B3B"
};

// تابع شروع بازی با سطح انتخاب‌شده
function startGame(level) {
    gameLevel = level;
    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";
    resetGame();
    loop = setInterval(game, 1000 / 50);
}

// تابع تنظیم مجدد بازی
function resetGame() {
    user.score = 0;
    com.score = 0;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    reverseControl = false;

    if (gameLevel === "easy") {
        spawnGoldenItem();
    } else if (gameLevel === "hard") {
        spawnRedItem();
    }
}

// تابع ایجاد آیتم طلایی در سطح آسان
function spawnGoldenItem() {
    goldenItem.x = Math.random() * (canvas.width - 50) + 25;
    goldenItem.y = Math.random() * (canvas.height - 50) + 25;
    goldenItem.isActive = true;
}

// تابع ایجاد آیتم قرمز در سطح سخت
function spawnRedItem() {
    redItem.x = Math.random() * (canvas.width - 50) + 25;
    redItem.y = Math.random() * (canvas.height - 50) + 25;
    redItem.isActive = true;
}

// بررسی برخورد توپ با آیتم طلایی
function checkGoldenItemCollision() {
    if (goldenItem.isActive &&
        ball.x > goldenItem.x - goldenItem.size &&
        ball.x < goldenItem.x + goldenItem.size &&
        ball.y > goldenItem.y - goldenItem.size &&
        ball.y < goldenItem.y + goldenItem.size) {
        user.score++; // اضافه شدن امتیاز
        goldenItem.isActive = false;
    }
}

// بررسی برخورد توپ با آیتم قرمز
function checkRedItemCollision() {
    if (redItem.isActive &&
        ball.x > redItem.x - redItem.size &&
        ball.x < redItem.x + redItem.size &&
        ball.y > redItem.y - redItem.size &&
        ball.y < redItem.y + redItem.size) {
        reverseControl = true; // معکوس شدن کنترل
        redItem.isActive = false;
        setTimeout(() => { reverseControl = false; }, 5000); // بازگشت به حالت عادی بعد از 5 ثانیه
    }
}

// تابع بروزرسانی وضعیت بازی
function update() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    if (gameLevel === "easy") checkGoldenItemCollision();
    if (gameLevel === "hard") checkRedItemCollision();

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    let player = (ball.x < canvas.width / 2) ? user : com;

    if (collision(ball, player)) {
        let angleRad = (Math.PI / 4) * ((ball.y - (player.y + player.height / 2)) / (player.height / 2));
        ball.velocityX = (ball.x < canvas.width / 2 ? 1 : -1) * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.1;
    }

    if (ball.x - ball.radius < 0) {
        com.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        resetBall();
    }
}

// تابع رسم عناصر بازی
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawRect(0, 0, canvas.width, canvas.height, "black");
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    drawArc(ball.x, ball.y, ball.radius, ball.color);
    
    if (goldenItem.isActive) drawRect(goldenItem.x, goldenItem.y, goldenItem.size, goldenItem.size, goldenItem.color);
    if (redItem.isActive) drawRect(redItem.x, redItem.y, redItem.size, redItem.size, redItem.color);
    
    drawText(user.score, canvas.width / 4, 50);
    drawText(com.score, (3 * canvas.width) / 4, 50);
}

// تابع اجرای بازی
function game() {
    update();
    render();
}

// کنترل موس برای حرکت راکت
canvas.addEventListener("mousemove", function (evt) {
    let rect = canvas.getBoundingClientRect();
    let newY = evt.clientY - rect.top - user.height / 2;
    user.y = reverseControl ? canvas.height - newY - user.height : newY;
});

// تابع کمکی رسم مستطیل
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// تابع کمکی رسم دایره
function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

// تابع کمکی رسم متن
function drawText(text, x, y) {
    ctx.fillStyle = "#FFF";
    ctx.font = "40px Arial";
    ctx.fillText(text, x, y);
}
