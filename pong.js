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
    color: "#007BFF" // آبی الکتریکی
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

// ذخیره نام بازیکن
let playerName = "";

// دریافت موقعیت ماوس
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

// تابع شروع بازی
function startGame() {
    playerName = document.getElementById("playerName").value.trim();
    
    if (playerName === "") {
        alert("لطفاً یک نام وارد کنید!");
        return;
    }

    // مخفی کردن فرم نام
    document.getElementById("nameInput").style.display = "none";

    loop = setInterval(game, 1000 / framePerSecond);
}

// ذخیره و نمایش جدول رتبه‌بندی
function updateLeaderboard(winner) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {};

    leaderboard[winner] = (leaderboard[winner] || 0) + 1;

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

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

// بروزرسانی وضعیت بازی
function update() {
    // ... سایر کدهای بازی که نیاز به تغییر ندارند
}

// تابع اجرای بازی
function game() {
    update();
    render();
}

// تعداد فریم در ثانیه
let framePerSecond = 50;
let loop = setInterval(game, 1000 / framePerSecond);

// پایان بازی و ذخیره نتیجه
function endGame() {
    clearInterval(loop);

    let winner = user.score === 20 ? playerName : "کامپیوتر";
    updateLeaderboard(winner);

    setTimeout(() => {
        alert(user.score === 20 ? "🎉 آفرین! تو برنده شدی! 🏆👏" : "😢 آخی! باختی! دوباره امتحان کن، شاید دفعه بعد برنده بشی! 😎");
        user.score = 0;
        com.score = 0;
        resetBall();
        loop = setInterval(game, 1000 / framePerSecond);
    }, 1000);
}

// نمایش رتبه‌بندی در شروع بازی
displayLeaderboard(JSON.parse(localStorage.getItem("leaderboard")) || {});
