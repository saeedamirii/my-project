const result = document.getElementById("result");
let number = 0;
let health = 5;
function generateRandomNumber(){
    number = Math.floor(Math.random() * 100);
    
}
window.onload = function () {
    generateRandomNumber();
    
}

function showMessage(messeage) {
    result.innerHTML = messeage;
}

function guessNumber() {
 
    const guessed = document.getElementById("guess-number").value ;
    if (guessed == ""){
showMessage("داداش هنوز عددی حدس نزدی که!");
return;
    }
    if (guessed == number && health > 0){
       
        // barane
        if(confirm("به به دمت گرم. خود خودشه ! خیلی حال داد. یه بار دیگه بازی میکنی؟")) {
reset();
        }
    }
    else if(guessed < number){
        showMessage("برو بالاتر!");
        decreaseHealth();
        
        // bozorgtar
    
    }else if(guessed > number){
        showMessage("چه خبره؟ بیا پاین تر!");
        decreaseHealth();
       
        // kochek
    }
}

function decreaseHealth() {
    if (health <= 0) {
       if(confirm("جونی واسه ادامه دادن نمونده یرات!  یه بار دیگه بازی میکنی؟")) {
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
for(let index = 1; index <= 5;index++){
    const healthEle = document.getElementById("heart" + index);
    healthEle.src = "src/heart.png";
    document.getElementById("guess-number").value = "";
    showMessage("");
}
}
