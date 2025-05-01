let score = 0;
let missed = 0;
let gameInterval;
let fruitInterval;
let maxMissed = 3;
let isGameRunning = false;

document.getElementById('start-btn').addEventListener('click', startGame);

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    score = 0;
    missed = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('missed').textContent = missed;

    document.getElementById('start-btn').disabled = true;
    gameInterval = setInterval(generateFruit, 1000); // میوه‌ها هر یک ثانیه بیایند
}

function generateFruit() {
    const gameArea = document.getElementById('game-area');
    const fruit = document.createElement('div');
    fruit.classList.add('fruit');
    fruit.style.backgroundColor = getRandomFruitColor();
    fruit.style.left = `${Math.random() * (gameArea.offsetWidth - 60)}px`; // موقعیت تصادفی
    fruit.style.top = '0px'; // شروع از بالای صفحه

    gameArea.appendChild(fruit);

    // انیمیشن حرکت میوه به پایین
    let fruitTop = 0;
    let fruitFallInterval = setInterval(() => {
        fruitTop += 5;
        fruit.style.top = `${fruitTop}px`;

        // اگر میوه به پایین رسید
        if (fruitTop >= gameArea.offsetHeight) {
            missed++;
            document.getElementById('missed').textContent = missed;
            gameArea.removeChild(fruit);
            clearInterval(fruitFallInterval);

            if (missed >= maxMissed) {
                gameOver();
            }
        }
    }, 20);

    fruit.addEventListener('click', () => {
        score++;
        document.getElementById('score').textContent = score;
        gameArea.removeChild(fruit);
        clearInterval(fruitFallInterval);
    });
}

function gameOver() {
    clearInterval(gameInterval);
    isGameRunning = false;
    alert(`بازی تمام شد! امتیاز شما: ${score}`);
    document.getElementById('start-btn').disabled = false;
}
  
function getRandomFruitColor() {
    const fruits = ['#FF6347', '#FFD700', '#32CD32', '#FF69B4', '#98FB98'];
    return fruits[Math.floor(Math.random() * fruits.length)];
}
