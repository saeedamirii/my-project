const result = document.getElementById("result");
const mainNumber = document.getElementById("main-number");
const timerDisplay = document.getElementById("timer");
const spinButton = document.getElementById("spin-button");
const wheelContainer = document.getElementById("wheel-container");

let number = 0;
let health = 5;
let timer;
let maxRange = 100;
let timeLimit = 30;

let roundsPlayed = 0; // تعداد دورهای انجام‌شده
let allowedRounds = 10; // حداکثر دور مجاز
let gameActive = true; // وضعیت فعال بودن بازی
let wheelResult = null; // نتیجه گردونه

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

// تولید عدد تصادفی
function generateRandomNumber() {
  number = Math.floor(Math.random() * maxRange) + 1;
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
      alert("⏰ وایسادی، زمان تموم شد! 😅");
      reset();
    }
  }, 1000);
}

// حدس عدد
function guessNumber() {
  if (!gameActive) {
    alert("🚫 داداش/خواهر! بازی فعلاً غیرفعاله! لطفاً گردونه رو بچرخون. 🎡");
    return;
  }

  const guessed = document.getElementById("guess-number").value;
  if (guessed === "") {
    result.textContent = "✋ لطفاً یه عدد وارد کن عزیزم! 😅";
    return;
  }

  if (parseInt(guessed) === number) {
    result.textContent = "🎉 دم شما گرم! عددو درست حدس زدی! 🔥";
    reset();
  } else {
    health--;
    if (health === 0) {
      alert("💔 متاسفم! بازی رو باختی! 😢");
      reset();
    } else {
      result.textContent =
        parseInt(guessed) < number
          ? "📉 برو بالاتر عزیز! 😆"
          : "📈 داداش بیا پایین‌تر! 😜";
    }
  }

  roundsPlayed++;
  if (roundsPlayed >= allowedRounds) {
    gameActive = false; // بازی غیرفعال شود
    spinButton.disabled = false; // دکمه گردونه فعال شود
    wheelContainer.classList.remove("inactive");
  }
}

// گردونه را بچرخانید
function spinWheel() {
  const outcomes = ["پوچ! 😢", "🎁 2 دور اضافه!", "🎁 5 دور اضافه!", "🎁 10 دور اضافه!"];
  const randomIndex = Math.floor(Math.random() * outcomes.length);
  wheelResult = outcomes[randomIndex];
  alert(`🎡 نتیجه گردونه: ${wheelResult}`);

  if (wheelResult.includes("پوچ")) {
    alert("🚫 بازی متوقف شد! شانس بعدی! 🙃");
    gameActive = false; // بازی متوقف شود
  } else {
    const extraRounds = parseInt(wheelResult.match(/\d+/)) || 0;
    allowedRounds += extraRounds; // دورهای اضافی اضافه شود
    gameActive = true; // بازی فعال شود
    alert(`✅ تبریک! ${extraRounds} دور اضافه شد. 🎉`);
  }

  spinButton.disabled = true;
  wheelContainer.classList.add("inactive");
}

// ریست کردن بازی
function reset() {
  generateRandomNumber();
  health = 5;
  roundsPlayed = 0;
  allowedRounds = 10;
  gameActive = true;
  spinButton.disabled = true;
  wheelContainer.classList.add("inactive");
  result.textContent = "";
  document.getElementById("guess-number").value = "";
  mainNumber.textContent = "?"; // بازگشت علامت سؤال
  startTimer();
}

// شروع بازی
window.onload = function () {
  setDifficulty();
  reset();
};
