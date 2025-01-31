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

// متغیر برای نام کاربر
let username = "";

// نمایش و مخفی کردن فرم نام
const nameForm = document.getElementById("nameForm");
const startGameBtn = document.getElementById("startGameBtn");
const usernameInput = document.getElementById("username");

// شروع بازی بعد از وارد کردن نام
startGameBtn.addEventListener("click", function () {
    username = usernameInput.value.trim();
    if (username !== "") {
        nameForm.style.display = "none"; // مخفی کردن فرم نام
        startGame(); // شروع بازی
    } else {
        alert("لطفاً نام خود را وارد کنید.");
    }
});

// شروع بازی
function startGame() {
    // توابع بازی و رویدادها...
    
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

    // ادامه توابع مربوط به بازی و رندر بازی...

    // تعداد فریم در ثانیه
    let framePerSecond = 50;
    let loop = setInterval(game, 1000 / framePerSecond);

    function game() {
        update();
        render();
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
