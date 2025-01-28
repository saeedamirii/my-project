const result = document.getElementById("result");
const historyElement = document.getElementById("history");
let number = 0;
let health = 5;
let difficulty = 'easy';
let history = [];

// تنظیم سطح بازی
document.getElementById("difficulty-select").addEventListener("change", function () {
    difficulty = this.value;
    reset();
});

function generateRandomNumber() {
    switch (difficulty) {
        case 'easy':
            number = Math.floor(Math.random() * 100);
            break;
        case 'medium':
            number = Math.floor(Math.random() * 500);
            break;
        case 'hard':
            number = Math.floor(Math.random() * 1000);
            break;
    }
}

window.onload = function () {
    generateRandomNumber();
}

function showMessage(message) {
    result.innerHTML = message;
    setTimeout(() => {
        result.innerHTML = ''; 
    }, 3000);  // نمایش پیام برای 3 ثانیه
}

function guessNumber() {
    const guessed = document.getElementById("guess-number").value;
    if (guessed == "") {
        showMessage("داداش هنوز عددی حدس نزدی که!");
        return;
    }

    history.push(guessed);  // افزودن حدس جدید به تاریخچه
    updateHistory();  // به‌روزرسانی تاریخچه

    if (guessed == number && health > 0) {
        if (confirm("به به دمت گرم. خود خودشه! خیلی حال داد. یه بار دیگه بازی میکنی؟")) {
            reset();
        }
    } else if (guessed < number) {
        showMessage("برو بالاتر!");
        decreaseHealth();
    } else if (guessed > number) {
        showMessage("چه خبره؟ بیا پاین تر!");
        decreaseHealth();
    }
}

function decreaseHealth() {
    if (health <= 0) {
        if (confirm("جونی واسه ادامه دادن نمونده یرات! یه بار دیگه بازی میکنی؟")) {
            reset();
        }
        return;
    }
    const healthEle = document.getElementById("heart" + health);
    healthEle.src = "src/heart-off.png";
    health--;
}

function updateHistory() {
    historyElement.innerHTML = ''; // حذف تمامی تاریخچه‌ها
    history.forEach(guess => {
        const li = document.createElement("li");
        li.textContent = "حدس: " + guess;
        historyElement.appendChild(li);
    });
}

function reset() {
    generateRandomNumber();
    health = 5;
    history = [];  // پاک کردن تاریخچه حدس‌ها
    for (let index = 1; index <= 5; index++) {
        const healthEle = document.getElementById("heart" + index);
        healthEle.src = "src/heart.png";
    }
    document.getElementById("guess-number").value = "";
    showMessage("");
    updateHistory();  // به‌روزرسانی تاریخچه پس از ریست بازی
}
