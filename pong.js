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
    name: "",
    velocityX: 0 // برای معکوس کردن جهت راکت
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

// سطح بازی
let gameLevel = ''; // سطح بازی

// نمایش منوی انتخاب سطح بازی
function showLevelMenu() {
    let name = document.getElementById("playerName").value;
    if (name) {
        user.name = name;
        document.getElementById("nameForm").style.display = "none"; // مخفی کردن فرم وارد کردن نام
        document.getElementById("levelMenu").style.display = "block"; // نمایش منوی انتخاب سطح
    } else {
        alert("لطفاً نام خود را وارد کنید!");
    }
}

// شروع بازی با سطح انتخابی
function startGameWithLevel(level) {
    gameLevel = level;
    document.getElementById("levelMenu").style.display = "none"; // مخفی کردن منوی انتخاب سطح
    loop = setInterval(game, 1000 / framePerSecond); // شروع بازی
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
        
        if (gameLevel === 'easy') {
            // سطح آسان: وقتی توپ به آیتم برخورد کرد، یک امتیاز به بازیکن اضافه می‌شود
            user.score++;
        } else if (gameLevel === 'hard') {
            // سطح سخت: وقتی توپ به آیتم برخورد کرد، کنترل راکت برعکس می‌شود
            user.velocityX = -user.velocityX;
            com.velocityX = -com.velocityX;
        }
        powerUp.isActive = false;  // مخفی کردن آیتم بعد از برخورد
    }
}

// سایر توابع و منطق بازی مانند سابق
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
        // بازی متوقف می‌شود
        clearInterval(loop);
        
        // پیام به بازیکن
        setTimeout(() => {
            let winner = user.score === 20 ? "تو" : "کامپیوتر";
            let message = user.score === 20 
                ? "🎉 آفرین! تو برنده شدی! 🏆👏" 
                : "😢 آخی! باختی! دوباره امتحان کن، شاید دفعه بعد برنده بشی! 😎";
            alert(message); // پیام ساده
            // ریست کردن امتیازات و شروع دوباره
            user.score = 0;
            com.score = 0;
            resetBall();
            loop = setInterval(game, 1000 / framePerSecond);  // شروع دوباره بازی
        }, 1000); // یک ثانیه صبر می‌کنیم که بازیکن نتیجه رو ببینه
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

    // رندر کردن آیتم قدرت
    if (powerUp.isActive) {
        drawRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, powerUp.color);
    }
}

// تابع اجرای بازی
function game() {
    update();
    render();
}

// تعداد فریم در ثانیه
let framePerSecond = 50;
let loop;

// تابع شروع بازی
function startGame() {
    let name = document.getElementById("playerName").value;
    if (name) {
        user.name = name;
        document.getElementById("nameForm").style.display = "none"; // مخفی کردن فرم وارد کردن نام
        loop = setInterval(game, 1000 / framePerSecond); // شروع بازی
    } else {
        alert("لطفاً نام خود را وارد کنید!");
    }
}

// ذخیره و نمایش جدول رتبه‌بندی
function updateLeaderboard(winner) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {};
    
    // افزایش برد بازیکن
    leaderboard[winner] = (leaderboard[winner] || 0) + 1;

    // ذخیره در LocalStorage
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    // مرتب‌سازی و نمایش رتبه‌بندی
    displayLeaderboard(leaderboard);
}

// نمایش جدول رتبه‌بندی
function displayLeaderboard(leaderboard) {
    let sortedPlayers = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);

    let leaderboardHTML = "";
    sortedPlayers.forEach((player, index) => {
        let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
        leaderboardHTML += `<li>${medal} ${player[0]} - ${player[1]} برد</li>`;
    });

    document.getElementById("leaderboard-list").innerHTML = leaderboardHTML;
}

// نمایش رتبه‌بندی در شروع بازی
displayLeaderboard(JSON.parse(localStorage.getItem("leaderboard")) || {});
