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
  if (!gameStarted) {
    alert("برای بازی کردن ابتدا باید نتیجه گردونه مشخص شود.");
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
  roundsPlayed++; // هر بار که بازی مجدداً شروع می‌شود، تعداد دورها افزایش می‌یابد.
  gameStarted = true; // بازی فعال است
  enableWheel(); // فعال‌سازی گردونه بعد از هر دور
}

// فعال سازی گردونه بعد از 10 دور بازی
function enableWheel() {
  if (roundsPlayed >= 10) {
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
    gameStarted = false; // توقف بازی
    alert("شما 10 دقیقه نمی‌توانید بازی کنید.");
    setTimeout(() => {
      alert("10 دقیقه گذشته! حالا می‌توانید بازی کنید.");
      gameStarted = true; // فعال شدن دوباره بازی بعد از 10 دقیقه
    }, 600000); // 10 دقیقه = 600000 میلی‌ثانیه
  } else if (resultText === "10 بازی اضافه!") {
    maxRange = 1000; // اجازه 10 بازی دیگر
    alert("شما 10 بازی اضافه دریافت کردید!");
  } else if (resultText === "4 بازی اضافه!") {
    maxRange = 1000; // اجازه 4 بازی دیگر
    alert("شما 4 بازی اضافه دریافت کردید!");
  } else {
    health += 2; // اضافه کردن دو جان
    alert("شما 4 بازی اضافه به همراه 2 جان اضافی دریافت کردید!");
  }
}

// شروع بازی در بارگذاری صفحه
window.onload = function () {
  setDifficulty(); // تنظیم سطح پیش‌فرض
  startTimer(); // شروع تایمر
  enableWheel(); // فعال‌سازی گردونه
};
