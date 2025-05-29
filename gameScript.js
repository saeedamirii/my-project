$(document).ready(function() { // اجرای کد پس از بارگذاری کامل DOM

    const em = ["💐","🌹","🌻","🏵️","🌺","🌴","🌈","🍓","🍒","🍎","🍉","🍊","🥭","🍍","🍋","🍏","🍐","🥝","🍇","🥥","🍅","🌶️","🍄","🧅","🥦","🥑","🍔","🍕","🧁","🎂","🍬","🍩","🍫","🎈"];
    let currentEmojis = [];
    let firstCard = null, secondCard = null;
    let lockBoard = false; // برای جلوگیری از کلیک‌های متعدد در حین انیمیشن
    let moves = 0;
    let matchesFound = 0;
    let totalPairs = 0;
    let timerInterval;
    let seconds = 0, minutes = 0;
    let gameMode = "";

    // تابع اولیه برای تنظیم اندازه صفحه (اگر هنوز لازم است)
    // window.onresize = initScreen;
    // function initScreen() {
    //     $('body').height(innerHeight + "px");
    //     $('#overlay').height(innerHeight + "px");
    // }
    // initScreen(); // Call once on load

    // نمایش دستورالعمل‌ها و انتخاب حالت بازی در ابتدا
    showInitialModal();

    function showInitialModal() {
        const modalHTML = `
            <div id="inst">
                <h2>خوش آمدید!</h2>
                <h3>راهنمای بازی:</h3>
                <ul>
                    <li>با برگرداندن بلوک‌ها، جفت‌های مشابه را پیدا کنید.</li>
                    <li>برای برگرداندن یک بلوک، روی آن کلیک کنید.</li>
                    <li>اگر دو بلوک انتخاب شده مشابه نباشند، به حالت اول برمی‌گردند.</li>
                </ul>
                <p style="font-size:1.1em; margin-top: 20px;">برای شروع، یکی از حالت‌های زیر را انتخاب کنید:</p>
            </div>
            <div id="mode-selection">
                <button data-mode="3x4">3 x 4</button>
                <button data-mode="4x4">4 x 4</button>
                <button data-mode="4x5">4 x 5</button>
                <button data-mode="5x6">5 x 6</button>
                <button data-mode="6x6">6 x 6</button>
            </div>
        `;
        $('#modal-content').html(modalHTML);
        $('#overlay').fadeIn(300);

        $('#mode-selection button').on('click', function() {
            const mode = $(this).data('mode').split('x');
            const r = parseInt(mode[0]);
            const l = parseInt(mode[1]);
            gameMode = $(this).data('mode');
            startGame(r, l);
        });
    }

    function startGame(r, l) {
        resetGameStats();
        totalPairs = (r * l) / 2;
        
        currentEmojis = [];
        const selectedBaseEmojis = em.slice(0, totalPairs); // انتخاب اموجی به تعداد جفت‌ها
        currentEmojis = [...selectedBaseEmojis, ...selectedBaseEmojis]; // ایجاد جفت از هر اموجی
        
        // شافل کردن آرایه اموجی‌ها (Fisher-Yates shuffle)
        for (let i = currentEmojis.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentEmojis[i], currentEmojis[j]] = [currentEmojis[j], currentEmojis[i]];
        }
        
        createBoard(r, l);
        startTimer();
        $('#overlay').fadeOut(300);
    }

    function resetGameStats() {
        moves = 0;
        matchesFound = 0;
        seconds = 0;
        minutes = 0;
        $('#moves-display').text("حرکت‌ها: ۰");
        $('#time-display').text("زمان: ۰۰:۰۰");
        if (timerInterval) clearInterval(timerInterval);
        lockBoard = false;
        firstCard = null;
        secondCard = null;
    }

    function startTimer() {
        timerInterval = setInterval(function() {
            seconds++;
            if (seconds === 60) {
                minutes++;
                seconds = 0;
            }
            const timeString = `زمان: ${minutes < 10 ? '۰' : ''}${minutes}:${seconds < 10 ? '۰' : ''}${seconds}`;
            $('#time-display').text(timeString);
        }, 1000);
    }

    function createBoard(rows, cols) {
        const gameBoard = $('#game-board');
        gameBoard.html(''); // پاک کردن برد قبلی
        let itemIndex = 0;
        for (let i = 0; i < rows; i++) {
            const tr = $('<tr></tr>');
            for (let j = 0; j < cols; j++) {
                const td = $('<td></td>');
                // ساختار کارت با کلاس‌های جدید
                td.html(`
                    <div class="card-inner" data-emoji="${currentEmojis[itemIndex]}">
                        <div class="card-front"></div>
                        <div class="card-back"><p>${currentEmojis[itemIndex]}</p></div>
                    </div>
                `);
                tr.append(td);
                itemIndex++;
            }
            gameBoard.append(tr);
        }
        // اضافه کردن event listener به کارت‌های جدید
        $('.card-inner').on('click', handleCardClick);
    }

    function handleCardClick() {
        if (lockBoard || $(this).hasClass('is-flipped') || $(this).hasClass('is-matched')) {
            return; // اگر برد قفل است یا کارت قبلا برگردانده شده یا جفت شده، کاری نکن
        }

        $(this).addClass('is-flipped');

        if (!firstCard) {
            firstCard = $(this);
            return;
        }

        secondCard = $(this);
        lockBoard = true; // قفل کردن برد برای جلوگیری از کلیک‌های بیشتر
        incrementMoves();
        checkForMatch();
    }

    function incrementMoves() {
        moves++;
        $('#moves-display').text(`حرکت‌ها: ${moves}`);
    }

    function checkForMatch() {
        const emojisMatch = firstCard.data('emoji') === secondCard.data('emoji');

        if (emojisMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.addClass('is-matched');
        secondCard.addClass('is-matched');
        // دیگر نیازی به برداشتن event listener نیست چون is-matched از کلیک مجدد جلوگیری می‌کند
        
        matchesFound++;
        resetTurn();
        
        if (matchesFound === totalPairs) {
            endGame();
        }
    }

    function unflipCards() {
        setTimeout(() => {
            firstCard.removeClass('is-flipped');
            secondCard.removeClass('is-flipped');
            resetTurn();
        }, 1200); // زمان تاخیر برای دیدن کارت دوم قبل از برگرداندن
    }

    function resetTurn() {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
    }

    function endGame() {
        clearInterval(timerInterval);
        let timeTakenString = "";
        if (minutes === 0) {
            timeTakenString = `${seconds} ثانیه`;
        } else {
            timeTakenString = `${minutes} دقیقه و ${seconds} ثانیه`;
        }

        const modalHTML = `
            <h2>تبریک! شما برنده شدید!</h2>
            <p>شما حالت ${gameMode} را با ${moves} حرکت به پایان رساندید.</p>
            <p>زمان شما: ${timeTakenString}</p>
            <p style="font-size:1.1em; margin-top: 20px;">دوباره بازی می‌کنید؟</p>
            <div id="mode-selection">
                <button data-mode="3x4">3 x 4</button>
                <button data-mode="4x4">4 x 4</button>
                <button data-mode="4x5">4 x 5</button>
                <button data-mode="5x6">5 x 6</button>
                <button data-mode="6x6">6 x 6</button>
            </div>
        `;
        setTimeout(() => {
            $('#modal-content').html(modalHTML);
            $('#overlay').fadeIn(500);
            $('#mode-selection button').on('click', function() {
                const mode = $(this).data('mode').split('x');
                startGame(parseInt(mode[0]), parseInt(mode[1]));
            });
        }, 700); // کمی تاخیر برای نمایش پیروزی قبل از مودال
    }
});
              
