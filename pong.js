// این فایل مخصوص سطح سخت است که شامل آیتم قرمز است.

// اینجا کل کد اصلی بازی را قرار بده و فقط این تغییر را اضافه کن:

let redItem = {
    x: Math.random() * 500 + 50,
    y: Math.random() * 300 + 50,
    width: 20,
    height: 20,
    color: "red",
    isActive: true
};

function drawRedItem() {
    if (redItem.isActive) {
        ctx.fillStyle = redItem.color;
        ctx.fillRect(redItem.x, redItem.y, redItem.width, redItem.height);
    }
}

function checkRedItemCollision() {
    if (redItem.isActive &&
        ball.x - ball.radius < redItem.x + redItem.width &&
        ball.x + ball.radius > redItem.x &&
        ball.y - ball.radius < redItem.y + redItem.height &&
        ball.y + ball.radius > redItem.y) {

        redItem.isActive = false;
        let originalControl = user.y;
        
        let interval = setInterval(() => {
            user.y += (Math.random() * 20 - 10); // حرکات تصادفی
        }, 50);

        setTimeout(() => {
            clearInterval(interval);
            user.y = originalControl;
        }, 3000); // کنترل ۳ ثانیه مختل شود
    }
}

// در داخل حلقه `update()`
checkRedItemCollision();

// در داخل حلقه `render()`
drawRedItem();
