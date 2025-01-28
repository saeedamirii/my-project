const result = document.getElementById("result");
const guessNumberInput = document.getElementById("guess-number");
const difficultySelect = document.getElementById("difficulty");
const historyList = document.getElementById("history-list");
const timerElement = document.getElementById("timer");

let number = 0;
let health = 5;
let maxNumber = 10; // بازه پیش‌فرض برای سطح ساده
let timer = 0;
let timerInterval;

// ایجاد عدد تصادفی
function generateRandomNumber() {
    number = Math.floor(Math.random() * (maxNumber + 1)); // بازه بین 0 و maxNumber
    console.log("Generated number:", number); // برای تست
}

// بازنشانی بازی
function resetGame() {
    generateRandomNumber();
    health = 5;
    clearInterval(timerInterval);
    timer = 0;
    timerElement.innerText = "زمان: 0 ثانیه";
    historyList.innerHTML = ""; // پاک کردن تاریخچه حدس‌ها
    guessNumberInput.value = ""; // پاک کردن فیلد ورودی
    result.innerHTML = ""; // پاک کردن پیام‌ها
    for (let i = 1; i <= 5; i++) {
        document.getElementById("heart" + i).src = "src/heart.png"; // بازیابی قلب‌ها
    }
}

// انتخاب سطح سختی
difficultySelect.addEventListener("change", function () {
    const difficulty = difficultySelect.value;
    if (difficulty === "easy") maxNumber = 10;
    else if (difficulty === "medium") maxNumber = 100;
    else if (difficulty === "hard") maxNumber = 500;

    resetGame(); // بازنشانی بازی پس از تغییر سطح
    result.innerHTML = `اعداد بین 0 تا ${maxNumber} انتخاب می‌شوند.`;
});

// تایمر بازی
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        timerElement.innerText = `زمان: ${timer} ثانیه`;
    }, 1000);
}

// پیام‌ها
function showMessage(message, duration = 2000) {
    result.innerHTML = message;
    setTimeout(() => {
        if (result.innerHTML === message) result.innerHTML = "";
    }, duration);
}

// کم کردن قلب‌ها
function decreaseHealth() {
    if (health <= 1) {
        if (confirm("شکست خوردی! آیا می‌خواهی دوباره بازی کنی؟")) {
            resetGame();
            startTimer();
        }
        return;
    }
    document.getElementById("heart" + health).src = "src/heart-off.png";
    health--;
}

// بررسی حدس کاربر
function guessNumber() {
    const guessed = parseInt(guessNumberInput.value, 10);
    if (isNaN(guessed)) {
        showMessage("لطفاً یک عدد وارد کن!", 3000);
        return;
    }

    // ثبت در تاریخچه
    const historyItem = document.createElement("li");
    historyItem.innerText = guessed;
    historyList.appendChild(historyItem);

    if (guessed === number) {
        clearInterval(timerInterval);
        document.getElementById("main-number").innerText = number; // نمایش عدد درست
        if (confirm("تبریک! درست حدس زدی! آیا می‌خواهی دوباره بازی کنی؟")) {
            resetGame();
            startTimer();
        }
    } else if (guessed < number) {
        showMessage("برو بالاتر!", 3000);
        decreaseHealth();
    } else if (guessed > number) {
        showMessage("بیا پایین‌تر!", 3000);
        decreaseHealth();
    }
}

// شروع بازی
window.onload = function () {
    generateRandomNumber();
    startTimer();
};
