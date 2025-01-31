const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');

const nameForm = document.getElementById("nameForm");
const startGameBtn = document.getElementById("startGameBtn");
const usernameInput = document.getElementById("username");

let username = "";
let gameRunning = false;

startGameBtn.addEventListener("click", function () {
    username = usernameInput.value.trim();
    if (username !== "") {
        nameForm.style.display = "none";
        canvas.style.display = "block";
        document.getElementById("leaderboard").style.display = "block";
        startGame();
    } else {
        alert("لطفاً نام خود را وارد کنید.");
    }
});

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,
    speed: 7,
    color: "white"
};

const user = { x: 0, y: canvas.height / 2 - 50, width: 10, height: 100, score: 0, color: "blue" };
const com = { x: canvas.width - 10, y: canvas.height / 2 - 50, width: 10, height: 100, score: 0, color: "red" };

canvas.addEventListener("mousemove", (evt) => {
    let rect = canvas.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height / 2;
});

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y) {
    ctx.fillStyle = "#FFD700";
    ctx.font = "40px Arial";
    ctx.fillText(text, x, y);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRect(0, 0, canvas.width, canvas.height, "black");
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    drawBall(ball.x, ball.y, ball.radius, ball.color);
    drawText(user.score, canvas.width / 4, 50);
    drawText(com.score, (3 * canvas.width) / 4, 50);
}

function update() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY *= -1;
    }

    if (ball.x - ball.radius < 0) {
        com.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        resetBall();
    }

    if (user.score === 20 || com.score === 20) {
        endGame();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
}

function game() {
    update();
    render();
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        setInterval(game, 1000 / 60);
    }
}

// 📌 جدول رتبه‌بندی
function updateLeaderboard(winner) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {};
    
    leaderboard[winner] = (leaderboard[winner] || 0) + 1;

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    displayLeaderboard(leaderboard);
}

function displayLeaderboard(leaderboard) {
    let sortedPlayers = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);

    let leaderboardHTML = "";
    sortedPlayers.forEach((player, index) => {
        let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
        leaderboardHTML += `<li>${medal} ${player[0]} - ${player[1]} برد</li>`;
    });

    document.getElementById("leaderboard-list").innerHTML = leaderboardHTML;
}

// 📌 پایان بازی و ثبت برنده
function endGame() {
    clearInterval(game);

    let winner = user.score === 20 ? username : "کامپیوتر";
    updateLeaderboard(winner);

    setTimeout(() => {
        alert(user.score === 20 ? `🎉 تبریک ${username}! تو برنده شدی!` : "😢 باختی! دوباره امتحان کن!");
        user.score = 0;
        com.score = 0;
        resetBall();
        startGame();
    }, 1000);
}

// نمایش جدول هنگام بارگذاری صفحه
displayLeaderboard(JSON.parse(localStorage.getItem("leaderboard")) || {});
