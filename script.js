const result = document.getElementById("result");
let number = 0;
let health = 5;
let difficulty = "easy"; // مقدار پیش‌فرض سطح سختی

function generateRandomNumber() {
    if (difficulty === "easy") {
        number = Math.floor(Math.random() * 100); // عدد در محدوده 1 تا 100
    } else if (difficulty === "medium") {
        number = Math.floor(Math.random() * 500); // عدد در محدوده 1 تا 500
    } else if (difficulty === "hard") {
        number = Math.floor(Math.random() * 1000); // عدد در محدوده 1 تا 1000
    }
}

window.onload = function () {
    generateRandomNumber();
    // اضافه کردن رویداد برای تغییر سطح سختی
    document.getElementById("difficulty").addEventListener("change", function () {
        difficulty = this.value;
        reset();  // بازنشانی بازی پس از تغییر سطح سختی
    });
}

function showMessage(message) {
    result.innerHTML = message;
    result.style.opacity = 1;  // نمایش پیام
    setTimeout(() => {
        result.style.opacity = 0;  // محو شدن پیام بعد از 2 ثانیه
    }, 2000); // زمان نمایش 2 ثانیه
}

function guessNumber() {
    const guessed = document.getElementById("guess-number").value;
    if (guessed === "") {
        showMessage("داداش هنوز عددی حدس نزدی که!");
        return;
    }
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
        if (confirm("جونی واسه ادامه دادن نمون
