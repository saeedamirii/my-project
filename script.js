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

// نمایش پیام‌ها
function showMessage(message) {
  result.textContent = message;
}

// حدس عدد
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

// کاهش سلامت
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

// تنظیم مجدد بازی
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
  roundsPlayed++; // افزایش تعداد دورهای بازی
  if (roundsPlayed >= 10) {
    // بعد از ۱۰ دور بازی گردونه غیر قابل استفاده می‌شود
    wheelContainer.classList.remove("active");
    spinButton.disabled = true;
    alert("🎉 بازی تمام شد! شما ۱۰ دور بازی کردید.");
  } else {
    // گردونه قابل استفاده است تا دور دهم
    if (roundsPlayed >= 1) {
      wheelContainer.classList.add("active");
      spinButton.disabled = false;
    }
  }
}

// چرخاندن گردونه
function spinWheel() {
  if (roundsPlayed >= 10) {
    alert("😞 شما ۱۰ دور بازی کرده‌اید و نمی‌توانید بیشتر بازی کنید.");
    return;
  }
  const randomAngle = Math.floor(Math.random() * 360);
  wheel.style.transition = "transform 3s ease-out";
  wheel.style.transform = `rotate(${randomAngle}deg)`;

  setTimeout(() => {
    const segments = ["پوچ!", "10 بازی اضافه!", "4 بازی اضافه!", "4 بازی + 2 جان!"];
    const randomSegment = segments[Math.floor(Math.random() * segments.length)];
    alert(`نتیجه گردونه: ${randomSegment}`);

    if (randomSegment === "پوچ!") {
      alert("😞 شما نمی‌توانید بازی کنید تا ۱۰ دقیقه دیگر.");
      setTimeout(() => {
        alert("⏱️ ۱۰ دقیقه تمام شد! می‌توانید دوباره بازی کنید.");
      }, 600000); // ۱۰ دقیقه تاخیر
    } else if (randomSegment === "10 بازی اضافه!") {
      alert("🎉 10 بازی اضافه دارید!");
    } else if (randomSegment === "4 بازی اضافه!") {
      alert("🎉 4 بازی اضافه دارید!");
    } else if (randomSegment === "4 بازی + 2 جان!") {
      alert("🎉 4 بازی اضافه دارید و 2 جان اضافه شد!");
    }
  }, 3000); // مدت زمان چرخش
}

// شروع بازی در بارگذاری صفحه
window.onload = function () {
  setDifficulty(); // تنظیم سطح پیش‌فرض
  startTimer(); // شروع تایمر
};
