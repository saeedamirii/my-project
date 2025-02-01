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

// آیتم‌های جدید برای سطوح
let goldenItem = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: "#FFD700", // رنگ طلایی
    isActive: false
};

let redItem = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: "#FF0000", // رنگ قرمز
    isActive: false
};

let invertedControls = false;  // برای تغییر کنترل در سطح سخت

// سطح بازی
let gameLevel = "";

// نمایش منوی انتخاب سطح
function showLevelSelection() {
    document.getElementById("nameForm").style.display = "none"; // مخفی کردن فرم نام
    document.getElementById("levelSelection").style.display = "block"; // نمایش منو انتخاب سطح
}

// تنظیم سطح بازی
function setLevel(level) {
    gameLevel = level;
    document.getElementById("levelSelection").style.display = "none"; // مخفی کردن منو انتخاب سطح
    user.name = document.getElementById("playerName").value; // گرفتن نام بازیکن
    loop = setInterval(game, 1000 / framePerSecond); // شروع بازی
}

// تابع اسپاون (ظاهر شدن) قدرت‌ها
function spawnGoldenItem() {
    if (gameLevel === "easy" && !goldenItem.isActive) {
        goldenItem.x = Math.random() * (canvas.width - 100) + 50;
        goldenItem.y = Math.random() * (canvas.height - 100) + 50;
        goldenItem.isActive = true;
        setTimeout(() => {
            goldenItem.isActive = false;
        }, 5000);
    }
}

function spawnRedItem() {
    if (gameLevel === "hard" && !redItem.isActive) {
        redItem.x = Math.random() * (canvas.width - 100) + 50;
        redItem.y = Math.random() * (canvas.height - 100) + 50;
        redItem.isActive = true;
    }
}

// بررسی برخورد توپ با آیتم‌ها
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

function checkRedItemCollision() {
    if (redItem.isActive &&
        ball.x - ball.radius < redItem.x + redItem.width &&
        ball.x + ball.radius > redItem.x &&
        ball.y - ball.radius < redItem.y + redItem.height &&
        ball.y + ball.radius > redItem.y) {

        redItem.isActive = false;
        invertedControls = true;  // معکوس کردن کنترل
        setTimeout(() => {
            invertedControls = false;  // برگشت به حالت عادی
        }, 5000);
    }
}

// گوش دادن به حرکت ماوس برای کنترل پدل بازیکن
canvas.addEventListener("mousemove", function(evt) {
    let rect = canvas.getBoundingClientRect();
    if (!invertedControls) {
        user.y = evt.clientY - rect.top - user.height / 2;
    } else {
        user.y = canvas.height - (evt.clientY - rect.top) - user.height / 2;
    }
});

// تابع بروزرسانی وضعیت بازی
function update() {
    spawnGoldenItem();
    spawnRedItem();

    checkGoldenItemCollision();
    checkRedItemCollision();

    // بررسی برخورد توپ با دیوار
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

    // برخورد توپ با سقف و کف
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
        wall.play();
    }

    // حرکت پدل کامپیوتر
    if (gameLevel === "hard") {
        if (ball.y < com.y + com.height / 2) {
            com.y -= 4;
        } else if (ball.y > com.y + com.height / 2) {
            com.y += 4;
        }
    } else {
        // حرکت ساده‌تر پدل کامپیوتر در سطوح آسان و متوسط
        if (ball.y < com.y + com.height / 2) {
            com.y -= 2;
        } else if (ball.y > com.y + com.height / 2) {
            com.y += 2;
        }
    }

    // برخورد توپ با پدل‌ها
    let player = (ball.x - ball.radius < user.x + user.width && ball.x - ball.radius > user.x) ? user : com;
    if (ball.x - ball.radius < player.x + player.width && ball.x + ball.radius > player.x) {
        if (ball.y > player.y && ball.y < player.y + player.height) {
            ball.velocityX = -ball.velocityX;
            hit.play();
        }
    }
}

// رسم عناصر بازی
function draw() {
    // پس‌زمینه
    ctx.fillStyle = "#2e3d49";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // توپ
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // پدل‌ها
    ctx.fillStyle = user.color;
    ctx.fillRect(user.x, user.y, user.width, user.height);

    ctx.fillStyle = com.color;
    ctx.fillRect(com.x, com.y, com.width, com.height);

    // آیتم‌های ویژه
    if (goldenItem.isActive) {
        ctx.fillStyle = goldenItem.color;
        ctx.fillRect(goldenItem.x, goldenItem.y, goldenItem.width, goldenItem.height);
    }

    if (redItem.isActive) {
        ctx.fillStyle = redItem.color;
        ctx.fillRect(redItem.x, redItem.y, redItem.width, redItem.height);
    }

    // امتیازات
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText(user.name + ": " + user.score, 50, 30);
    ctx.fillText("کامپیوتر: " + com.score, canvas.width - 150, 30);
}

// بازنشانی توپ
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.velocityY = 5;
}

// حلقه اصلی بازی
let framePerSecond = 60;
let loop;

function game() {
    update();
    draw();
}

// شروع بازی
function startGame() {
    showLevelSelection(); // نمایش منو انتخاب سطح بازی
}
