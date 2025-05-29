$(document).ready(function() {
    const em = ["💐","🌹","🌻","🏵️","🌺","🌴","🌈","🍓","🍒","🍎","🍉","🍊","🥭","🍍","🍋","🍏","🍐","🥝","🍇","🥥","🍅","🌶️","🍄","🧅","🥦","🥑","🍔","🍕","🧁","🎂","🍬","🍩","🍫","🎈"];
    let currentEmojis = [];
    let firstCard = null, secondCard = null;
    let lockBoard = false;
    let moves = 0;
    let matchesFound = 0;
    let totalPairs = 0;
    let timerInterval;
    let seconds = 0, minutes = 0;
    let currentGameTimeInSeconds = 0;
    let gameMode = ""; // مثال: "3x4"

    const themeToggleButton = $('#theme-toggle-button');
    const bodyElement = $('body');
    const gameBoardElement = $('#game-board'); // برای data-cols

    // --- High Score Logic ---
    function getHighScores() {
        const scores = localStorage.getItem('memoryGameHighScores');
        return scores ? JSON.parse(scores) : {};
    }

    function saveHighScores(scores) {
        localStorage.setItem('memoryGameHighScores', JSON.stringify(scores));
    }

    function updateHighScore(mode, currentMoves, currentTimeInSeconds) {
        const highScores = getHighScores();
        const currentBest = highScores[mode];
        let newRecordString = "";

        if (!currentBest || currentMoves < currentBest.moves || (currentMoves === currentBest.moves && currentTimeInSeconds < currentBest.timeInSeconds)) {
            highScores[mode] = { moves: currentMoves, timeInSeconds: currentTimeInSeconds };
            saveHighScores(highScores);
            newRecordString = "🎉 رکورد جدید! 🎉";
        }
        return newRecordString;
    }

    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        const displayM = String(m).padStart(2, '۰').replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        const displayS = String(s).padStart(2, '۰').replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        return `${displayM}:${displayS}`;
    }

    // --- Theme Toggle Logic ---
    function applyTheme(theme) {
        if (theme === 'day') {
            bodyElement.addClass('day-mode');
            themeToggleButton.text('☀️');
            themeToggleButton.attr('title', 'تغییر به تم شب');
        } else { // 'night' or default
            bodyElement.removeClass('day-mode');
            themeToggleButton.text('🌙');
            themeToggleButton.attr('title', 'تغییر به تم روز');
        }
    }

    const savedTheme = localStorage.getItem('memoryGameTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('night'); // Default to night theme
    }

    themeToggleButton.on('click', function() {
        let currentTheme = bodyElement.hasClass('day-mode') ? 'day' : 'night';
        if (currentTheme === 'day') {
            applyTheme('night');
            localStorage.setItem('memoryGameTheme', 'night');
        } else {
            applyTheme('day');
            localStorage.setItem('memoryGameTheme', 'day');
        }
    });

    // --- Game Logic ---
    function showInitialModal() {
        const modalHTML = `
            <div id="inst">
                <h3>راهنمای بازی:</h3>
                <ul>
                    <li>با برگرداندن بلوک‌ها، جفت‌های مشابه را پیدا کنید.</li>
                    <li>برای برگرداندن یک بلوک، روی آن کلیک کنید.</li>
                    <li>اگر دو بلوک انتخاب شده مشابه نباشند، به حالت اول برمی‌گردند.</li>
                </ul>
                <p style="font-size:1.1em; margin-top: 20px; margin-bottom: 15px;">برای شروع، یکی از حالت‌های زیر را انتخاب کنید:</p>
            </div>
            <div id="mode-selection">
                <button data-mode="3x4">3 x 4</button>
                <button data-mode="4x4">4 x 4</button>
                <button data-mode="4x5">4 x 5</button>
                <button data-mode="5x6">5 x 6</button>
                <button data-mode="6x6">6 x 6</button>
            </div>`;
        $('#modal-content').html(modalHTML);
        $('#overlay').fadeIn(300);

        $('#mode-selection button').on('click', function() {
            const modeParts = $(this).data('mode').split('x');
            const r = parseInt(modeParts[0]);
            const l = parseInt(modeParts[1]);
            gameMode = $(this).data('mode');
            startGame(r, l);
        });
    }

    function resetGameStats() {
        moves = 0;
        matchesFound = 0;
        seconds = 0;
        minutes = 0;
        currentGameTimeInSeconds = 0;
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
            currentGameTimeInSeconds++;
            if (seconds === 60) {
                minutes++;
                seconds = 0;
            }
            $('#time-display').text(`زمان: ${formatTime(currentGameTimeInSeconds)}`);
        }, 1000);
    }

    function createBoard(rows, cols) {
        gameBoardElement.html('');
        gameBoardElement.attr('data-cols', cols); // برای استایل دهی ریسپانسیو اختیاری
        let itemIndex = 0;
        for (let i = 0; i < rows; i++) {
            const tr = $('<tr></tr>');
            for (let j = 0; j < cols; j++) {
                const td = $('<td></td>');
                td.html(`
                    <div class="card-inner" data-emoji="${currentEmojis[itemIndex]}">
                        <div class="card-front"></div>
                        <div class="card-back"><p>${currentEmojis[itemIndex]}</p></div>
                    </div>`);
                tr.append(td);
                itemIndex++;
            }
            gameBoardElement.append(tr);
        }
        $('.card-inner').on('click', handleCardClick);
    }
    
    function startGame(r, l) {
        resetGameStats();
        totalPairs = (r * l) / 2;
        
        currentEmojis = [];
        // اطمینان از اینکه به اندازه کافی اموجی داریم
        let availableEmojis = [...em]; 
        // شافل کردن اموجی های موجود برای تنوع بیشتر در هر بازی
        for (let i = availableEmojis.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableEmojis[i], availableEmojis[j]] = [availableEmojis[j], availableEmojis[i]];
        }

        const selectedBaseEmojis = availableEmojis.slice(0, totalPairs);
        if (selectedBaseEmojis.length < totalPairs) {
            // اگر تعداد اموجی های منحصر به فرد کمتر از جفت های مورد نیاز بود
            console.error("Not enough unique emojis for the selected grid size!");
            // اینجا می‌توان یک پیام خطا به کاربر نشان داد یا به حالت کوچک‌تر بازگشت
            // برای سادگی، فعلا بازی با اموجی‌های تکراری (اگر لازم باشد) ادامه پیدا می‌کند
            // یا می‌توانید از همه اموجی‌ها استفاده کنید و اجازه دهید تکرار شوند
            let tempEmojis = [];
            for(let i = 0; i < totalPairs; i++) {
                tempEmojis.push(availableEmojis[i % availableEmojis.length]);
            }
            currentEmojis = [...tempEmojis, ...tempEmojis];
        } else {
            currentEmojis = [...selectedBaseEmojis, ...selectedBaseEmojis];
        }
        
        for (let i = currentEmojis.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentEmojis[i], currentEmojis[j]] = [currentEmojis[j], currentEmojis[i]];
        }
        
        createBoard(r, l);
        startTimer();
        $('#overlay').fadeOut(300);
    }

    function handleCardClick() {
        if (lockBoard || $(this).hasClass('is-flipped') || $(this).hasClass('is-matched')) {
            return;
        }
        $(this).addClass('is-flipped');
        if (!firstCard) {
            firstCard = $(this);
            return;
        }
        secondCard = $(this);
        lockBoard = true;
        incrementMoves();
        checkForMatch();
    }

    function incrementMoves() {
        moves++;
        // نمایش تعداد حرکت با اعداد فارسی
        $('#moves-display').text(`حرکت‌ها: ${String(moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}`);
    }

    function checkForMatch() {
        const emojisMatch = firstCard.data('emoji') === secondCard.data('emoji');
        emojisMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.addClass('is-matched');
        secondCard.addClass('is-matched');
        matchesFound++;
        resetTurn();
        if (matchesFound === totalPairs) {
            endGame();
        }
    }

    function unflipCards() {
        setTimeout(() => {
            if (firstCard) firstCard.removeClass('is-flipped');
            if (secondCard) secondCard.removeClass('is-flipped');
            resetTurn();
        }, 1200);
    }

    function resetTurn() {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
    }

    function endGame() {
        clearInterval(timerInterval);
        const timeTakenDisplayString = formatTime(currentGameTimeInSeconds);
        const newRecordMessage = updateHighScore(gameMode, moves, currentGameTimeInSeconds);

        const highScores = getHighScores();
        const bestScoreForMode = highScores[gameMode];
        let bestScoreDisplayString = "هنوز رکوردی برای این حالت ثبت نشده.";
        if (bestScoreForMode) {
            bestScoreDisplayString = `بهترین رکورد: ${String(bestScoreForMode.moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])} حرکت در ${formatTime(bestScoreForMode.timeInSeconds)}`;
        }

        const movesDisplayString = String(moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

        const modalHTML = `
            <h2 class="${newRecordMessage ? 'record-message' : ''}">${newRecordMessage ? newRecordMessage : "تبریک! شما برنده شدید!"}</h2>
            <p>شما حالت ${gameMode.replace('x', ' در ')} را با ${movesDisplayString} حرکت به پایان رساندید.</p>
            <p>زمان شما: ${timeTakenDisplayString}</p>
            <p class="best-score-text">${bestScoreDisplayString}</p>
            <p style="font-size:1.1em; margin-top: 25px; margin-bottom: 15px;">دوباره بازی می‌کنید؟</p>
            <div id="mode-selection">
                <button data-mode="3x4">3 x 4</button>
                <button data-mode="4x4">4 x 4</button>
                <button data-mode="4x5">4 x 5</button>
                <button data-mode="5x6">5 x 6</button>
                <button data-mode="6x6">6 x 6</button>
            </div>`;

        setTimeout(() => {
            $('#modal-content').html(modalHTML);
            $('#overlay').fadeIn(500);
            // اطمینان از اینکه event listener فقط یکبار به دکمه‌های جدید اضافه می‌شود
            $('#modal-content').off('click', '#mode-selection button').on('click', '#mode-selection button', function() {
                const modeParts = $(this).data('mode').split('x');
                const r = parseInt(modeParts[0]);
                const l = parseInt(modeParts[1]);
                gameMode = $(this).data('mode');
                startGame(r, l);
            });
        }, 700);
    }

    // Start
    showInitialModal();
});
