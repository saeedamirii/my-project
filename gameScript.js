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
    let gameMode = "";

    const themeToggleButton = $('#theme-toggle-button');
    const achievementsButton = $('#achievements-button');
    const bodyElement = $('body');
    const gameBoardElement = $('#game-board');
    const toastNotification = $('#toast-notification');
    const modalContent = $('#modal-content');
    const overlay = $('#overlay');

    // --- Achievements Logic ---
    let achievements = {
        'first_win':    { id: 'first_win',    name: 'اولین پیروزی',      description: 'اولین بازی خود در هر حالتی را با موفقیت به پایان برسانید.', icon: '🥇', unlocked: false, check: () => totalGamesWon === 1 },
        'explorer_4x4': { id: 'explorer_4x4', name: 'کاشف باتجربه',     description: 'حالت بازی 4x4 را کامل کنید.',                              icon: '🗺️', unlocked: false, check: (mode) => mode === '4x4' },
        'master_6x6':   { id: 'master_6x6',   name: 'استاد بزرگ حافظه',  description: 'حالت بازی 6x6 را کامل کنید.',                              icon: '🏆', unlocked: false, check: (mode) => mode === '6x6' },
        'combo_3':      { id: 'combo_3',      name: 'ضربات متوالی',      description: '۳ جفت کارت را پشت سر هم و بدون اشتباه پیدا کنید.',        icon: '⚡', unlocked: false, check: () => consecutiveMatches >= 3 },
        'efficient_4x4':{ id: 'efficient_4x4',name: 'حرکات حساب‌شده',   description: 'حالت بازی 4x4 را با حداکثر ۱۰ حرکت کامل کنید.',          icon: '✨', unlocked: false, check: (mode, mvs) => mode === '4x4' && mvs <= 10 },
        'loyal_player': { id: 'loyal_player', name: 'بازیکن وفادار',      description: 'در مجموع ۵ بازی کامل انجام دهید (برنده شوید).',             icon: '💪', unlocked: false, check: () => totalGamesWon >= 5 },
        'collector_50': { id: 'collector_50', name: 'کلکسیونر کارت',     description: 'در تمام بازی‌های خود مجموعاً ۵۰ جفت کارت صحیح پیدا کنید.', icon: '🃏', unlocked: false, check: () => totalPairsEverFound >= 50 }
    };

    let consecutiveMatches = 0;
    let totalGamesWon = 0;
    let totalPairsEverFound = 0;

    function loadStatsAndAchievements() {
        const savedAchievements = JSON.parse(localStorage.getItem('memoryGameAchievementsStatus'));
        if (savedAchievements) {
            for (const id in achievements) {
                if (savedAchievements[id] !== undefined) {
                    achievements[id].unlocked = savedAchievements[id];
                }
            }
        }
        totalGamesWon = parseInt(localStorage.getItem('memoryGameTotalGamesWon')) || 0;
        totalPairsEverFound = parseInt(localStorage.getItem('memoryGameTotalPairsEverFound')) || 0;
    }

    function saveStatsAndAchievements() {
        let statuses = {};
        for (const id in achievements) {
            statuses[id] = achievements[id].unlocked;
        }
        localStorage.setItem('memoryGameAchievementsStatus', JSON.stringify(statuses));
        localStorage.setItem('memoryGameTotalGamesWon', totalGamesWon);
        localStorage.setItem('memoryGameTotalPairsEverFound', totalPairsEverFound);
    }
    
    function showToast(message) {
        toastNotification.text(message);
        toastNotification.addClass('show');
        setTimeout(() => {
            toastNotification.removeClass('show');
        }, 3500);
    }

    function unlockAchievement(id) {
        if (achievements[id] && !achievements[id].unlocked) {
            achievements[id].unlocked = true;
            showToast(`مدال "${achievements[id].name}" کسب شد! ${achievements[id].icon}`);
            saveStatsAndAchievements(); 
            // If achievements modal is open, refresh it
            if (overlay.is(':visible') && $('#achievements-list-container').length) {
                 displayAchievements();
            }
        }
    }

    function checkAllAchievements(checkTime, param1, param2) {
        // checkTime can be 'gameEnd', 'pairFound', 'gameStart'
        for (const id in achievements) {
            if (!achievements[id].unlocked) {
                let conditionMet = false;
                if (checkTime === 'gameEnd' && (id === 'first_win' || id === 'explorer_4x4' || id === 'master_6x6' || id === 'efficient_4x4' || id === 'loyal_player')) {
                    // param1 is mode, param2 is moves
                    conditionMet = achievements[id].check(param1, param2);
                } else if (checkTime === 'pairFound' && (id === 'combo_3' || id === 'collector_50')) {
                    conditionMet = achievements[id].check();
                }
                // Add other checkTimes if needed

                if (conditionMet) {
                    unlockAchievement(id);
                }
            }
        }
    }
    
    function displayAchievements() {
        let listHTML = '<div id="achievements-list-container"><ul id="achievements-list">';
        for (const id in achievements) {
            const ach = achievements[id];
            listHTML += `
                <li class="achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}">
                    <span class="icon">${ach.icon}</span>
                    <div class="details">
                        <h4>${ach.name}</h4>
                        <p>${ach.description}</p>
                    </div>
                </li>`;
        }
        listHTML += '</ul></div>';
        
        modalContent.html(`<h2>مدال‌ها و دستاوردها</h2>` + listHTML + '<button id="close-modal-button" style="margin-top:20px; flex-shrink: 0;">بستن</button>');
        overlay.fadeIn(300);
    }
    
    achievementsButton.on('click', displayAchievements);
    // Use event delegation for close button inside modal, as content is dynamic
    modalContent.on('click', '#close-modal-button', function() {
        overlay.fadeOut(300);
    });

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
        } else {
            bodyElement.removeClass('day-mode');
            themeToggleButton.text('🌙');
            themeToggleButton.attr('title', 'تغییر به تم روز');
        }
    }
    const savedTheme = localStorage.getItem('memoryGameTheme');
    applyTheme(savedTheme || 'night'); // Apply saved theme or default to night

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
        modalContent.html(modalHTML); // Set content
        overlay.fadeIn(300);
    }
    // Use event delegation for mode selection buttons as they are added dynamically
    modalContent.on('click', '#mode-selection button', function() {
        const modeParts = $(this).data('mode').split('x');
        const r = parseInt(modeParts[0]);
        const l = parseInt(modeParts[1]);
        gameMode = $(this).data('mode');
        startGame(r, l);
    });


    function resetGameStats() {
        moves = 0;
        matchesFound = 0;
        seconds = 0;
        minutes = 0;
        currentGameTimeInSeconds = 0;
        consecutiveMatches = 0; // Reset for new game
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
        gameBoardElement.attr('data-cols', cols);
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
        let availableEmojis = [...em]; 
        for (let i = availableEmojis.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableEmojis[i], availableEmojis[j]] = [availableEmojis[j], availableEmojis[i]];
        }
        const selectedBaseEmojis = availableEmojis.slice(0, totalPairs);
        if (selectedBaseEmojis.length < totalPairs) {
            console.error("Not enough unique emojis!");
            let tempEmojis = [];
            for(let i = 0; i < totalPairs; i++) tempEmojis.push(availableEmojis[i % availableEmojis.length]);
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
        overlay.fadeOut(300);
    }

    function handleCardClick() {
        if (lockBoard || $(this).hasClass('is-flipped') || $(this).hasClass('is-matched')) return;
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
        $('#moves-display').text(`حرکت‌ها: ${String(moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}`);
    }

    function checkForMatch() {
        emojisMatch = firstCard.data('emoji') === secondCard.data('emoji');
        if (emojisMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.addClass('is-matched');
        secondCard.addClass('is-matched');
        matchesFound++;
        consecutiveMatches++;
        totalPairsEverFound++;
        saveStatsAndAchievements(); // Save progress for achievements like collector
        checkAllAchievements('pairFound'); // Check for combo or collector achievements
        resetTurn();
        if (matchesFound === totalPairs) {
            endGame();
        }
    }

    function unflipCards() {
        consecutiveMatches = 0; // Reset combo
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
        totalGamesWon++; // Increment games won
        saveStatsAndAchievements(); // Save this stat before checking achievements

        const timeTakenDisplayString = formatTime(currentGameTimeInSeconds);
        const newRecordMessage = updateHighScore(gameMode, moves, currentGameTimeInSeconds);
        const highScores = getHighScores();
        const bestScoreForMode = highScores[gameMode];
        let bestScoreDisplayString = "هنوز رکوردی برای این حالت ثبت نشده.";
        if (bestScoreForMode) {
            bestScoreDisplayString = `بهترین رکورد: ${String(bestScoreForMode.moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])} حرکت در ${formatTime(bestScoreForMode.timeInSeconds)}`;
        }
        const movesDisplayString = String(moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

        // Check achievements related to game end
        checkAllAchievements('gameEnd', gameMode, moves); 

        const modalHTML = `
            <h2 class="${newRecordMessage ? 'record-message' : ''}">${newRecordMessage ? newRecordMessage : "تبریک! شما برنده شدید!"}</h2>
            <p>شما حالت ${gameMode.replace('x', ' در ')} را با ${movesDisplayString} حرکت به پایان رساندید.</p>
            <p>زمان شما: ${timeTakenDisplayString}</p>
            <p class="best-score-text">${bestScoreDisplayString}</p>
            <p style="font-size:1.1em; margin-top: 25px; margin-bottom: 15px;">دوباره بازی می‌کنید؟</p>
            <div id="mode-selection">
                <button data-mode="3x4">3 x 4</button> <button data-mode="4x4">4 x 4</button>
                <button data-mode="4x5">4 x 5</button> <button data-mode="5x6">5 x 6</button>
                <button data-mode="6x6">6 x 6</button>
            </div>`;
        setTimeout(() => {
            modalContent.html(modalHTML);
            overlay.fadeIn(500);
        }, 700);
    }

    // --- Initial Load ---
    loadStatsAndAchievements();
    showInitialModal();
});
            
