const result = document.getElementById("result");
const mainNumber = document.getElementById("main-number");
const timerDisplay = document.getElementById("timer");
const wheelContainer = document.getElementById("wheel-container");
const spinButton = document.getElementById("spin-button");
const wheel = document.getElementById("wheel");
let number = 0;
let health = 5;
let timer;
let timeLimit = 30;
let maxRange = 100;
let roundsPlayed = 0; // تعداد دفعات بازی
let gameStarted = true; // برای بررسی وضعیت بازی
let wheelResult = null; // ذخیره نتیجه گردونه
let additionalGames = 0; // تعداد بازی‌های اضافه از گردونه

// تابع تولید عدد تصادفی
function generateRandomNumber() {
  number = Math.floor(Math.random() * maxRange);
}

// تنظیم سطح دشواری
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

// شروع تایمر
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

// نمایش پیام
function showMessage(message) {
  result.textContent = message;
}

// تابع حدس زدن عدد
function guessNumber() {
  if (roundsPlayed >= 10 && additionalGames <= 0) {
    alert("شما نمی‌توانید بازی کنید. ابتدا گردونه را بچرخانید!");
    return;
  }

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

// کاهش جان
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

// بازنشانی بازی
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

  // بررسی تعداد بازی‌ها
  if (roundsPlayed < 10 || additionalGames > 0) {
    roundsPlayed++; // افزایش تعداد دفعات بازی
    if (additionalGames > 0) {
      additionalGames--; // کاهش تعداد بازی‌های اضافه
    }
    enableWheel(); // فعال‌سازی گردونه بعد از هر دور
  } else {
    gameStarted = false; // توقف بازی
    enableWheel(); // فعال‌سازی گردونه
  }
}

// فعال سازی گردونه بعد از 10 دور بازی
function enableWheel() {
  if (roundsPlayed >= 10 && additionalGames <= 0) {
    wheelContainer.classList.remove("inactive");
    spinButton.disabled = false; // فعال‌سازی دکمه چرخش گردونه
  } else {
    wheelContainer.classList.add("inactive");
    spinButton.disabled = true; // غیرفعال کردن دکمه چرخش گردونه
  }
}

// چرخاندن گردونه
function spinWheel() {
  if (roundsPlayed < 10) {
    alert("گردونه فقط بعد از 10 دور بازی قابل استفاده است.");
    return;
  }

  // چرخاندن گردونه با چرخش تصادفی
  let randomDegree = Math.floor(Math.random() * 360);
  wheel.style.transition = "transform 3s ease-out";
  wheel.style.transform = `rotate(${randomDegree}deg)`;

  // محتوای گردونه
  setTimeout(() => {
    const resultText = getWheelResult(randomDegree);
    wheelResult = resultText; // ذخیره نتیجه گردونه
    alert(resultText); // نمایش نتیجه گردونه
    handleWheelResult(resultText); // انجام اقدامات بر اساس نتیجه گردونه
  }, 3000); // زمان انتظار تا چرخش گردونه تمام شود
}

// انتخاب نتیجه از گردونه
function getWheelResult(degree) {
  if (degree >= 0 && degree < 90) {
    return "پوچ!";
  } else if (degree >= 90 && degree < 180) {
    return "10 بازی اضافه!";
  } else if (degree >= 180 && degree < 270) {
    return "4 بازی اضافه!";
  } else {
    return "4 بازی + 2 جان!";
  }
}

// مدیریت نتیجه گردونه
function handleWheelResult(resultText) {
  if (resultText === "پوچ!") {
    alert("متاسفیم، شما پوچ شدید! ⏳");
  } else if (resultText === "10 بازی اضافه!") {
    additionalGames += 10;
    alert("شما 10 بازی اضافه دریافت کردید!");
  } else if (resultText === "4 بازی اضافه!") {
    additionalGames += 4;
    alert("شما 4 بازی اضافه دریافت کردید!");
  } else {
    additionalGames += 4;
    health += 2; // اضافه کردن دو جان
    alert("شما 4 بازی اضافه به همراه 2 جان اضافی دریافت کردید!");
    updateHealthDisplay(); // به‌روزرسانی نمایش جان‌ها
  }
  gameStarted = true;
  enableWheel(); // غیرفعال کردن دوباره گردونه
}

// به‌روزرسانی نمایش جان‌ها
function updateHealthDisplay() {
  for (let i = 1; i <= 5; i++) {
    const healthEle = document.getElementById("heart" + i);
    healthEle.src = i <= health ? "src/heart.png" : "src/heart-off.png";
  }
}

// شروع بازی در بارگذاری صفحه
window.onload = function () {
  setDifficulty(); // تنظیم سطح پیش‌فرض
  startTimer(); // شروع تایمر
  enableWheel(); // فعال‌سازی گردونه
};
