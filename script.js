const result = document.getElementById("result");
const mainNumber = document.getElementById("main-number");
const timerDisplay = document.getElementById("timer");
let number = 0;
let health = 5;
let timer;
let timeLimit = 30;
let maxRange = 100;

function generateRandomNumber() {
  number = Math.floor(Math.random() * maxRange);
}

function setDifficulty() {
  const difficulty = document.getElementById("difficulty").value;
  if (difficulty === "easy") {
    maxRange = 10;
    timeLimit = 15;
  } else if (difficulty === "medium") {
    maxRange = 100;
    timeLimit = 30;
  } else if (difficulty === "hard") {
    maxRange = 500;
    timeLimit = 60;
  }
  reset();
}

function startTimer() {
  clearInterval(timer);
  let timeLeft = timeLimit;
  timerDisplay.textContent = `⏳ زمان باقی‌مانده: ${timeLeft} ثانیه`;

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏳ زمان باقی‌مانده: ${timeLeft} ثانیه`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("⏰ وایسادی، زمان تموم شد! بازی رو از نو شروع کن! 😅");
      reset();
    }
  }, 1000);
}

function showMessage(message) {
  result.textContent = message;
}

function guessNumber() {
  const guessed = document.getElementById("guess-number").value;
  if (guessed === "") {
    showMessage("لطفاً یک عدد وارد کن عزیزم! 😅");
    return;
  }
  if (parseInt(guessed) === number && health > 0) {
    showMessage("🎉 دمت گرم! خود خودشه! 🔥");
    mainNumber.textContent = number; // نمایش عدد صحیح
    clearInterval(timer);
    setTimeout(() => reset(), 3000);
  } else if (parseInt(guessed) < number) {
    showMessage("📉 داداش برو بالاتر! 😆");
    decreaseHealth();
  } else if (parseInt(guessed) > number) {
    showMessage("📈 چه خبره؟ بیا پایین‌تر! 😜");
    decreaseHealth();
  }
}

function decreaseHealth() {
  if (health <= 0) {
    alert("💔 متاسفم! بازی رو باختی! 😢");
    reset();
    return;
  }
  const healthEle = document.getElementById("heart" + health);
  healthEle.src = "src/heart-off.png";
  health--;
}

function reset() {
  generateRandomNumber();
  health = 5;
  for (let i = 1; i <= 5; i++) {
    const healthEle = document.getElementById("heart" + i);
    healthEle.src = "src/heart.png";
  }
  mainNumber.textContent = "?"; // بازگشت علامت سوال
  document.getElementById("guess-number").value = "";
  showMessage("");
  startTimer();
}

// شروع بازی در بارگذاری صفحه
window.onload = function () {
  setDifficulty(); // تنظیم سطح پیش‌فرض
  startTimer(); // شروع تایمر
};
// شمارش تعداد بازی‌ها
let playCount = localStorage.getItem('playCount') ? parseInt(localStorage.getItem('playCount')) : 0;
let canPlay = true; // مشخص می‌کند که کاربر می‌تواند بازی کند
let extraRounds = 0; // تعداد دورهای اضافی که به کاربر داده شده است
let health = 5; // مقدار اولیه سلامت

// تعداد دفعات بازی را چک می‌کنیم
if (playCount >= 10) {  // اگر تعداد بازی‌ها به 10 رسید
    activateWheel(); // فعال کردن گردونه شانس
} else {
    // اجازه بازی کردن
    canPlay = true;
}

// وقتی که کاربر بازی می‌کند
function playGame() {
    if (canPlay) {
        // بازی انجام می‌شود
        playCount++;
        localStorage.setItem('playCount', playCount);
        
        if (extraRounds > 0) {
            extraRounds--;
        } else {
            canPlay = false;
            alert('شما دیگر نمی‌توانید بازی کنید! گردونه شانس را بچرخانید.');
        }
    } else {
        alert('شما به حد مجاز بازی رسیده‌اید! لطفا گردونه شانس را بچرخانید.');
    }
}

// فعال کردن گردونه شانس
function activateWheel() {
    // نمایش گردونه شانس
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-wheel');
    
    wheel.style.display = 'block'; // گردونه فعال است
    spinButton.disabled = false; // فعال کردن دکمه بعد از 10 بازی
    spinButton.classList.add('active'); // اضافه کردن کلاس فعال به دکمه
}

// چرخاندن گردونه شانس
function spinWheel() {
    // چرخاندن گردونه
    const options = ['پوچ', 'پوچ', 'پوچ', '4 دور دیگر', '10 دور دیگر', '4 دور دیگر + 2 قلب اضافی'];
    const randomOption = options[Math.floor(Math.random() * options.length)];
    handleWheelResult(randomOption);
}

// نتیجه گردونه شانس
function handleWheelResult(result) {
    const wheelResult = document.getElementById('wheel-result');
    wheelResult.innerHTML = `نتیجه: ${result}`;

    if (result === '4 دور دیگر') {
        alert('شما 4 دور دیگر بازی می‌کنید!');
        extraRounds = 4; // دادن 4 دور اضافی
        localStorage.setItem('extraRounds', extraRounds);
    } else if (result === '10 دور دیگر') {
        alert('شما 10 دور دیگر بازی می‌کنید!');
        extraRounds = 10; // دادن 10 دور اضافی
        localStorage.setItem('extraRounds', extraRounds);
    } else if (result === '4 دور دیگر + 2 قلب اضافی') {
        alert('شما 4 دور دیگر و 2 قلب اضافی دریافت می‌کنید!');
        extraRounds = 4; // دادن 4 دور اضافی
        health += 2; // افزایش سلامت کاربر به اندازه 2
        localStorage.setItem('extraRounds', extraRounds);
        localStorage.setItem('health', health); // ذخیره سلامت
    } else if (result === 'پوچ') {
        alert('هیچ شانسی ندارید! از شانس بیشتر استفاده کنید.');
        applyBlockTime(); // اعمال محدودیت 10 دقیقه‌ای بعد از پوچ
    } else {
        alert('بازی ادامه دارد.');
    }
}

// اعمال محدودیت 10 دقیقه‌ای
function applyBlockTime() {
    alert('شما به 10 دقیقه محدود شدید. نمی‌توانید تا 10 دقیقه دیگر بازی کنید!');
    localStorage.setItem('blockTime', new Date().getTime());
}

// چک کردن محدودیت 10 دقیقه‌ای
function checkBlockTime() {
    const blockTime = localStorage.getItem('blockTime');
    if (blockTime) {
        const currentTime = new Date().getTime();
        if (currentTime - blockTime < 10 * 60 * 1000) { // محدودیت به 10 دقیقه تغییر یافت
            canPlay = false; // کاربر نمی‌تواند بازی کند
            alert('شما هنوز 10 دقیقه از بازی منع شده‌اید. لطفا منتظر بمانید.');
        } else {
            localStorage.removeItem('blockTime'); // زمان محدودیت پایان یافته
            canPlay = true;
            alert('محدودیت زمانی تمام شد. می‌توانید دوباره بازی کنید.');
        }
    }
}

// زمان چک کردن هر بار بازی
setInterval(checkBlockTime, 1000);
