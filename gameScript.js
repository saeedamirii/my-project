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
    const musicToggleButton = $('#music-toggle-button');
    const bodyElement = $('body');
    const gameBoardElement = $('#game-board');
    const toastNotification = $('#toast-notification');
    const modalContent = $('#modal-content');
    const overlay = $('#overlay');
    const backgroundMusic = document.getElementById('background-music');

    // --- Music Toggle Logic ---
    if (musicToggleButton.length && backgroundMusic) {
        musicToggleButton.on('click', function() {
            if (backgroundMusic.paused) {
                backgroundMusic.play()
                    .then(() => {
                        musicToggleButton.text('⏸️');
                        musicToggleButton.attr('title', 'قطع موزیک');
                        musicToggleButton.addClass('pulsating-music');
                    })
                    .catch(error => console.error("Error playing music:", error));
            } else {
                backgroundMusic.pause();
                musicToggleButton.text('🎵');
                musicToggleButton.attr('title', 'پخش موزیک');
                musicToggleButton.removeClass('pulsating-music');
            }
        });
    }

    // --- Achievements Logic ---
    let achievements = {
        'first_win':    { id: 'first_win',    name: 'اولین پیروزی',      description: 'اولین بازی خود در هر حالتی را با موفقیت به پایان برسانید.', icon: '🥇', unlocked: false, check: () => totalGamesWon === 1 },
        'explorer_4x4': { id: 'explorer_4x4', name: 'کاشف باتجربه',     description: 'حالت بازی 4x4 را کامل کنید.',                              icon: '🗺️', unlocked: false, check: (mode) => mode === '4x4' },
        'master_6x6':   { id: 'master_6x6',   name: 'استاد بزرگ حافظه',  description: 'حالت بازی 6x6 را کامل کنید.',                              icon: '🏆', unlocked: false, check: (mode) => mode === '6x6' },
        'combo_3':      { id: 'combo_3',      name: 'ضربات متوالی',      description: '۳ جفت کارت را پشت سر هم و بدون اشتباه پیدا کنید.',        icon: '⚡', unlocked: false, check: () => consecutiveMatches >= 3 },
        'loyal_player': { id: 'loyal_player', name: 'بازیکن وفادار',      description: 'در مجموع ۵ بازی کامل انجام دهید (برنده شوید).',             icon: '💪', unlocked: false, check: () => totalGamesWon >= 5 },
        'collector_50': { id: 'collector_50', name: 'کلکسیونر کارت',     description: 'در تمام بازی‌های خود مجموعاً ۵۰ جفت کارت صحیح پیدا کنید.', icon: '🃏', unlocked: false, check: () => totalPairsEverFound >= 50 },
        'flawless_3x4': { id: 'flawless_3x4', name: 'بازی بی‌نقص (کوچک)', description: 'حالت 3x4 را با حداکثر ۶ حرکت (بدون خطا) کامل کنید.', icon: '💎', unlocked: false, check: (mode, mvs) => mode === '3x4' && mvs <= 6 },
        'golden_4x4':   { id: 'golden_4x4',   name: 'حرکات طلایی (متوسط)',description: 'حالت 4x4 را با حداکثر ۹ حرکت (تا ۱ خطا) کامل کنید.', icon: '🌟', unlocked: false, check: (mode, mvs) => mode === '4x4' && mvs <= 9 },
        'strategist_5x6':{ id: 'strategist_5x6',name: 'استراتژیست برتر (بزرگ)', description: 'حالت 5x6 را با حداکثر ۱۸ حرکت (تا ۳ خطا) کامل کنید.', icon: '🧭', unlocked: false, check: (mode, mvs) => mode === '5x6' && mvs <= 18 },
        'precision_6x6':{ id: 'precision_6x6', name: 'چالش دقت (حرفه‌ای)',description: 'حالت 6x6 را با حداکثر ۲۲ حرکت (تا ۴ خطا) کامل کنید.', icon: '🎯', unlocked: false, check: (mode, mvs) => mode === '6x6' && mvs <= 22 }
    };

    let consecutiveMatches = 0;
    let totalGamesWon = 0;
    let totalPairsEverFound = 0;

    function loadStatsAndAchievements() {
        const savedAchievements = JSON.parse(localStorage.getItem('memoryGameAchievementsStatus'));
        if (savedAchievements) {
            for (const id in achievements) {
                if (achievements.hasOwnProperty(id) && savedAchievements[id] !== undefined) {
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
            if (achievements.hasOwnProperty(id)) {
                statuses[id] = achievements[id].unlocked;
            }
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
            if (overlay.is(':visible') && $('#achievements-list-container').length) {
                 displayAchievements();
            }
        }
    }

    function checkAllAchievements(checkTime, param1, param2) { // param1 is mode, param2 is moves for 'gameEnd'
        for (const id in achievements) {
            if (achievements.hasOwnProperty(id) && !achievements[id].unlocked) {
                let conditionMet = false;
                try { 
                    if (checkTime === 'gameEnd') { 
                        conditionMet = achievements[id].check(param1, param2); 
                    } else if (checkTime === 'pairFound') { 
                        conditionMet = achievements[id].check(); 
                    }
                } catch (e) {
                    console.error("Error checking achievement:", id, e, "Check function:", achievements[id].check);
                }
                if (conditionMet) {
                    unlockAchievement(id);
                }
            }
        }
    }
    
    function displayAchievements() {
        let listHTML = '<div id="achievements-list-container"><ul id="achievements-list">';
        for (const id in achievements) {
            if (achievements.hasOwnProperty(id)) {
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
        }
        listHTML += '</ul></div>';
        
        modalContent.html(`<h2>مدال‌ها و دستاوردها</h2>` + listHTML + '<button id="close-modal-button" class="general-modal-button" style="margin-top:20px; flex-shrink: 0;">بستن</button>');
        overlay.fadeIn(300);
    }
    
    achievementsButton.on('click', displayAchievements);
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
    const initialTheme = localStorage.getItem('memoryGameTheme') || 'night'; 
    applyTheme(initialTheme); 

    themeToggleButton.on('click', function() {
        let currentTheme = bodyElement.hasClass('day-mode') ? 'day' : 'night';
        const newTheme = (currentTheme === 'day' ? 'night' : 'day');
        applyTheme(newTheme);
        localStorage.setItem('memoryGameTheme', newTheme);
    });

    // --- Game Logic ---
    function showInitialModal() {
        const modalHTML = `
            <div id="inst">
                <h3>راهنمای بازی:</h3>
                <ul>
                    <li>با برگرداندن بلوک‌ها، جفت‌های مشابه را پیدا کنید.</li>
                    <li>برای برگرداندن یک بلوک، روی آن کلیک کنید.</li>
                    <li>انتخاب درست ۱ حرکت و انتخاب اشتباه ۲ حرکت برای شما ثبت می‌کند.</li>
                </ul>
                <p style="font-size:1.1em; margin-top: 20px; margin-bottom: 15px;">برای شروع، یکی از حالت‌های زیر را انتخاب کنید:</p>
            </div>
            <div id="mode-selection">
                <button data-mode="3x4">3 x 4</button> <button data-mode="4x4">4 x 4</button>
                <button data-mode="4x5">4 x 5</button> <button data-mode="5x6">5 x 6</button>
                <button data-mode="6x6">6 x 6</button>
            </div>`;
        modalContent.html(modalHTML); 
        overlay.fadeIn(300);
    }
    modalContent.on('click', '#mode-selection button', function() { 
        const modeParts = $(this).data('mode').split('x');
        const r = parseInt(modeParts[0]);
        const l = parseInt(modeParts[1]);
        gameMode = $(this).data('mode');
        startGame(r, l);
    });

    function resetGameStats() {
        moves = 0; matchesFound = 0; seconds = 0; minutes = 0; currentGameTimeInSeconds = 0;
        consecutiveMatches = 0; 
        $('#moves-display').text("حرکت‌ها: ۰");
        $('#time-display').text("زمان: ۰۰:۰۰");
        if (timerInterval) clearInterval(timerInterval);
        lockBoard = false; firstCard = null; secondCard = null;
    }

    function startTimer() {
        timerInterval = setInterval(function() {
            seconds++; currentGameTimeInSeconds++;
            if (seconds === 60) { minutes++; seconds = 0; }
            $('#time-display').text(`زمان: ${formatTime(currentGameTimeInSeconds)}`);
        }, 1000);
    }

    function createBoard(rows, cols) {
        gameBoardElement.html(''); 
        gameBoardElement.attr('data-cols', cols); 
        let itemIndex = 0;
        let cardElements = []; 

        for (let i = 0; i < rows; i++) {
            const tr = $('<tr></tr>');
            for (let j = 0; j < cols; j++) {
                const cardEmoji = currentEmojis[itemIndex];
                const cardInner = $(`<div class="card-inner" data-emoji="${cardEmoji}"><div class="card-front"></div><div class="card-back"><p>${cardEmoji}</p></div></div>`);
                const td = $('<td></td>').append(cardInner);
                tr.append(td);
                cardElements.push(cardInner); 
                itemIndex++;
            }
            gameBoardElement.append(tr);
        }

        cardElements.forEach((card, index) => {
            setTimeout(() => {
                card.addClass('card-visible'); 
            }, index * 60); 
        });

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
            console.warn("Emoji کم است، برخی تکرار می‌شوند.");
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
    
    function incrementMoves(count = 1) { 
        moves += count;
        $('#moves-display').text(`حرکت‌ها: ${String(moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}`);
    }

    function handleCardClick() {
        const clickedCard = $(this); // Store this to avoid issues with 'this' in setTimeout
        if (lockBoard || clickedCard.hasClass('is-flipped') || clickedCard.hasClass('is-matched')) return;
        
        // Add 'is-flipped' for visual flip, actual transform in CSS
        // The transform style is on .card-inner itself, so the .is-flipped should be there too.
        // My previous CSS for .card-inner.is-flipped was just transform: rotateY(180deg)
        // The base .card-inner has the dealing animation (opacity, scale, translate)
        // Need to ensure .is-flipped correctly overrides or combines with .card-visible
        // Best to put the flip transform directly on .is-flipped and remove the transition from base .card-inner,
        // or ensure the flip animation uses its own specific transition.
        // Let's ensure the flip has its own transition by moving the general 'transition' off the base .card-inner
        // and onto .card-inner.is-flipped for the 'transform' property,
        // and keep the opacity/transform transition on the base for the dealing.
        // The current setup adds 'is-flipped', and CSS has a transition for transform on .card-inner.
        // Let's simplify: the current CSS on .card-inner for transition includes transform 0.7s.
        // .card-inner.is-flipped then changes the transform. This should be okay.

        clickedCard.addClass('is-flipped');

        if (!firstCard) {
            firstCard = clickedCard;
            return;
        }
        secondCard = clickedCard;
        lockBoard = true;
        checkForMatch();
    }

    function checkForMatch() {
        const emojisMatch = firstCard.data('emoji') === secondCard.data('emoji');
        if (emojisMatch) {
            incrementMoves(1); 
            disableCards();
        } else {
            incrementMoves(2); 
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.addClass('is-matched');
        secondCard.addClass('is-matched');
        matchesFound++;
        consecutiveMatches++;
        totalPairsEverFound++;
        saveStatsAndAchievements(); 
        checkAllAchievements('pairFound');
        resetTurn();
        if (matchesFound === totalPairs) {
            endGame();
        }
    }

    function unflipCards() {
        consecutiveMatches = 0; 
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
        totalGamesWon++; 
        saveStatsAndAchievements(); 

        const timeTakenDisplayString = formatTime(currentGameTimeInSeconds);
        const newRecordMessage = updateHighScore(gameMode, moves, currentGameTimeInSeconds);
        const highScores = getHighScores();
        const bestScoreForMode = highScores[gameMode];
        let bestScoreDisplayString = "هنوز رکوردی برای این حالت ثبت نشده.";
        if (bestScoreForMode) {
            bestScoreDisplayString = `بهترین رکورد: ${String(bestScoreForMode.moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])} حرکت در ${formatTime(bestScoreForMode.timeInSeconds)}`;
        }
        const movesDisplayString = String(moves).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

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
    applyTheme(initialTheme); 
    showInitialModal();
});
        
