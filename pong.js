// این فایل مخصوص سطح آسان است که شامل آیتم طلایی است.

// اینجا کل کد اصلی بازی را قرار بده و فقط این تغییر را اضافه کن:

let goldenItem = {
    x: Math.random() * 500 + 50,
    y: Math.random() * 300 + 50,
    width: 20,
    height: 20,
    color: "gold",
    isActive: true
};

function drawGoldenItem() {
    if (goldenItem.isActive) {
        ctx.fillStyle = goldenItem.color;
        ctx.fillRect(goldenItem.x, goldenItem.y, goldenItem.width, goldenItem.height);
    }
}

function checkGoldenItemCollision() {
    if (goldenItem.isActive &&
        ball.x - ball.radius < goldenItem.x + goldenItem.width &&
        ball.x + ball.radius > goldenItem.x &&
        ball.y - ball.radius < goldenItem.y + goldenItem.height &&
        ball.y + ball.radius > goldenItem.y) {

        user.score++; // یک امتیاز اضافه شود
        goldenItem.isActive = false;
    }
}

// در داخل حلقه `update()`
checkGoldenItemCollision();

// در داخل حلقه `render()`
drawGoldenItem();
