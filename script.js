const result = document.getElementById("result");
let number = 0;
let health = 5;
let difficulty = 'easy';

document.getElementById("difficulty-select").addEventListener("change", function () {
    difficulty = this.value;
    reset(); // وقتی سطح تغییر کرد، بازی از اول شروع بشه
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
        result.innerHTML = ''; // پاک کردن پیام بعد از 3 ثانیه
    }, 3000);
}

function guessNumber() {
    const guessed = document.getElementById("guess-number").value;
    if (guessed == "") {
        showMessage("داداش هنوز عددی حدس نزدی که!");
        return;
    }

    if (guessed == number && health > 0) {
        if (confirm("به به دمت گرم. خود خودشه ! خیلی حال داد. یه بار دیگه بازی میکنی؟")) {
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

function reset() {
    generateRandomNumber();
    health = 5;
    for
