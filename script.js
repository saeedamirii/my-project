const result = document.getElementById("result");
let number = 0;
let health = 5;
let timeLeft = 30; // زمان بازی به ثانیه
let timerInterval;
let guessHistory = []; // تاریخچه حدس‌ها

const correctSound = new Audio("src/correct.mp3");
const wrongSound = new Audio("src/wrong.mp3");
const loseSound = new Audio("src/lose.mp3");

let difficulty = "medium"; // پیش‌فرض سطح متوسط

// شروع تایمر
function startTimer() {
    timeLeft = 30; // شروع تایمر از 30 ثانیه
    timerInterval = setInterval(() => {
        timeLeft--;
        showMessage(`زمان باقی‌مانده: ${timeLeft} ثانیه`);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showMessage("زمان تمام شد! 😢 بازی را باختی.");
            setTimeout(reset, 2000); // بعد از 2 ثانیه بازی رو ریست می‌کنیم
        }
    }, 1000);
}

// تنظیم سطح بازی
function setDifficulty(level) {
    difficulty = level;
    reset(); // بعد از تغییر سطح بازی رو ریست می‌کنیم
}

// تولید عدد تصادفی بر اساس سطح سختی
function generateRandomNumber() {
    if (difficulty === "easy") {
        number = Math.floor(Math.random() * 50); // بین 0 تا 50
    } else if (difficulty === "medium") {
        number = Math.floor(Math.random() * 100); // بین 0 تا 100
    } else {
        number = Math.floor(Math.random() * 200); // بین 0 تا 200
    }
}

// نمایش پیغام
function showMessage(messeage) {
    result.innerHTML = messeage;
}

// حدس عدد
function guessNumber() {
    const guessed = document.getElementById("guess-number").value;

    if (guessed === "") {
        showMessage("داداش هنوز عددی حدس نزدی که!");
        return;
    }

    guessHistory.push(guessed); // حدس جدید رو به تاریخچه اضافه می‌کنیم
    updateGuessHistory(); // تاریخچه رو آپدیت می‌کنیم

    if (guessed == number && health > 0) {
        correctSound.play(); // پخش صدای درست
        if (confirm("به به دمت گرم. خود خودشه ! خیلی حال داد. یه بار دیگه بازی میکنی؟")) {
            reset();
        }
    } else if (guessed < number) {
        wrongSound.play(); // پخش صدای اشتباه
        showMessage("برو بالاتر!");
        decreaseHealth();
    } else if (guessed > number) {
        wrongSound.play(); // پخش صدای اشتباه
        showMessage("چه خبره؟ بیا پاین تر!");
        decreaseHealth();
    }
}

// کاهش سلامتی
function decreaseHealth() {
    if (health <= 0) {
        loseSound.play(); // پخش صدای باخت
        if (confirm("جونی واسه ادامه دادن نمونده یرات!  یه بار دیگه بازی میکنی؟")) {
            reset();
        }
        return;
    }

    const healthEle = document.getElementById("heart" + health);
    healthEle.src = "src/heart-off.png";
    health--;
}

// آپدیت تاریخچه حدس‌ها
function updateGuessHistory() {
    const historyContainer = document.getElementById("guess-history");
    historyContainer.innerHTML = "<h3>حدس‌های قبلی:</h3>";
    guessHistory.forEach((guess, index) => {
        const p = document.createElement("p");
        p.textContent = `حدس ${index + 1}: ${guess}`;
        historyContainer.appendChild(p);
    });
}

// ریست بازی
function reset() {
    generateRandomNumber();
    health = 5;
    clearInterval(timerInterval); // تایمر رو متوقف می‌کنیم
    startTimer(); // تایمر جدید رو شروع می‌کنیم

    for (let index = 1; index <= 5; index++) {
        const healthEle = document.getElementById("heart" + index);
        healthEle.src = "src/heart.png";
    }

    document.getElementById("guess-number").value = "";
    showMessage("");
}

// منوی انتخاب سطح
const difficultySelect = document.createElement("select");
difficultySelect.innerHTML = `
    <option value="easy">آسان (1-50)</option>
    <option value="medium" selected>متوسط (1-100)</option>
    <option value="hard">سخت (1-200)</option>
`;
difficultySelect.addEventListener("change", (event) => setDifficulty(event.target.value));
document.getElementById("main-section").prepend(difficultySelect);

// اضافه کردن بخش تاریخچه به HTML
const historyContainer = document.createElement("div");
historyContainer.id = "guess-history";
document.getElementById("main-section").appendChild(historyContainer);

// شروع تایمر هنگام بارگذاری صفحه
window.onload = function () {
    generateRandomNumber();
    startTimer();
}
