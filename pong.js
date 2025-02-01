const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

let difficulty;
let isControlReversed = false;

function startGame(level) {
    difficulty = level;
    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";
    initializeGame();
}

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,
    speed: 7,
    color: "#00FFFF"
};

let user = { x: 50, y: (canvas.height - 100) / 2, width: 10, height: 100, score: 0, color: "#007BFF" };
let com = { x: canvas.width - 60, y: (canvas.height - 100) / 2, width: 10, height: 100, score: 0, color: "#FF3B3B" };

let goldenItem = { x: 0, y: 0, size: 15, color: "gold", isActive: false };
let redItem = { x: 0, y: 0, size: 15, color: "red", isActive: false };

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y) {
    ctx.fillStyle = "#FFD700";
    ctx.font = "50px fantasy";
    ctx.fillText(text, x, y);
}

canvas.addEventListener("mousemove", (evt) => {
    let rect = canvas.getBoundingClientRect();
    let movement = evt.clientY - rect.top - user.height / 2;
    user.y = isControlReversed ? canvas.height - movement - user.height : movement;
});

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

function spawnGoldenItem() {
    if (!goldenItem.isActive) {
        goldenItem.x = Math.random() * (canvas.width - 100) + 50;
        goldenItem.y = Math.random() * (canvas.height - 100) + 50;
        goldenItem.isActive = true;
        setTimeout(() => goldenItem.isActive = false, 5000);
    }
}

function spawnRedItem() {
    redItem.x = Math.random() * (canvas.width - 100) + 50;
    redItem.y = Math.random() * (canvas.height - 100) + 50;
    redItem.isActive = true;
}

function checkItemCollisions() {
    if (goldenItem.isActive && ball.x > goldenItem.x && ball.x < goldenItem.x + goldenItem.size &&
        ball.y > goldenItem.y && ball.y < goldenItem.y + goldenItem.size) {
        user.score++;
        goldenItem.isActive = false;
    }

    if (redItem.isActive && ball.x > redItem.x && ball.x < redItem.x + redItem.size &&
        ball.y > redItem.y && ball.y < redItem.y + redItem.size) {
        isControlReversed = true;
        setTimeout(() => isControlReversed = false, 5000);
    }
}

function collision(b, p) {
    return (b.x - b.radius < p.x + p.width &&
            b.x + b.radius > p.x &&
            b.y - b.radius < p.y + p.height &&
            b.y + b.radius > p.y);
}

function update() {
    if (difficulty === "easy") spawnGoldenItem();
    if (difficulty === "hard" && !redItem.isActive) spawnRedItem();

    checkItemCollisions();

    if (ball.x - ball.radius < 0) {
        com.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        resetBall();
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    com.y += (ball.y - (com.y + com.height / 2)) * 0.1;

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
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

function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#1C1C1C");
    drawText(user.score, canvas.width / 4, 50);
    drawText(com.score, (3 * canvas.width) / 4, 50);
    drawArc(ball.x, ball.y, ball.radius, ball.color);
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    
    if (goldenItem.isActive) drawRect(goldenItem.x, goldenItem.y, goldenItem.size, goldenItem.size, goldenItem.color);
    if (redItem.isActive) drawRect(redItem.x, redItem.y, redItem.size, redItem.size, redItem.color);
}

function gameLoop() {
    update();
    render();
}

function initializeGame() {
    setInterval(gameLoop, 1000 / 60);
}
