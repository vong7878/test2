// ຟັງຊັນສະຫຼັບ Tabs
function switchGame(gameType) {
    const snakeSection = document.getElementById('section-snake');
    const matchSection = document.getElementById('section-match');
    const tabSnake = document.getElementById('tab-snake');
    const tabMatch = document.getElementById('tab-match');

    if (gameType === 'snake') {
        snakeSection.classList.remove('hidden');
        matchSection.classList.add('hidden');
        tabSnake.className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all';
        tabMatch.className = 'flex-1 py-2 rounded-lg transition-all hover:text-white text-slate-400 font-bold';
    } else {
        matchSection.classList.remove('hidden');
        snakeSection.classList.add('hidden');
        tabMatch.className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all';
        tabSnake.className = 'flex-1 py-2 rounded-lg transition-all hover:text-white text-slate-400 font-bold';
        initMatchGame();
    }
}

// --------------------------------------------------
// 🐍 1. LOGIC ເກມງູກິນຂຽດ (15 ດ່ານ)
// --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const gridSize = 15;
    const tileCount = canvas.width / gridSize;

    let snake = [], frog = { x: 5, y: 5 }, obstacles = [];
    let dx = 1, dy = 0;
    let snakeLevel = 1;
    let eatenInLevel = 0;
    let gameInterval = null;
    let isPlaying = false;

    // ຕາຕະລາງຄວາມຍາກ 15 ດ່ານ
    function getLevelConfig(lvl) {
        // ຄວາມໄວ (ms): ດ່ານ 1=160ms (ຊ້າ) -> ດ່ານ 15=45ms (ໄວຫຼາຍ)
        const speed = Math.max(45, 170 - (lvl * 8)); 
        const target = 3 + Math.floor(lvl * 1.5); // ດ່ານສູງຕ້ອງກິນຫຼາຍໂຕ
        const obsCount = lvl >= 11 ? (lvl - 10) * 2 : 0; // ດ່ານ 11-15 ມີກຳແພງ
        return { speed, target, obsCount };
    }

    function initSnakeLevel() {
        const config = getLevelConfig(snakeLevel);
        snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        dx = 1; dy = 0;
        eatenInLevel = 0;

        document.getElementById('snake-level-badge').innerText = `ດ່ານ ${snakeLevel}/15`;
        document.getElementById('snake-target').innerText = `0/${config.target}`;
        
        let diffText = "ງ່າຍ";
        if (snakeLevel > 5) diffText = "ປານກາງ";
        if (snakeLevel > 10) diffText = "🔥 ຍາກ";
        document.getElementById('snake-speed').innerText = diffText;

        // ສ້າງກຳແພງສິ່ງກີດຂວາງ (ຖ້າມີ)
        obstacles = [];
        for (let i = 0; i < config.obsCount; i++) {
            obstacles.push({
                x: Math.floor(Math.random() * (tileCount - 4)) + 2,
                y: Math.floor(Math.random() * (tileCount - 4)) + 2
            });
        }
        spawnFrog();
    }

    function spawnFrog() {
        frog.x = Math.floor(Math.random() * tileCount);
        frog.y = Math.floor(Math.random() * tileCount);
        
        // ປ້ອງກັນເກີດທັບງູ ຫຼື ທັບກຳແພງ
        const onSnake = snake.some(p => p.x === frog.x && p.y === frog.y);
        const onObs = obstacles.some(o => o.x === frog.x && o.y === frog.y);
        if (onSnake || onObs) spawnFrog();
    }

    function gameLoop() {
        const config = getLevelConfig(snakeLevel);
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // ກວດສອບ Game Over (ຊົນຂອບ, ຊົນໂຕເອງ, ຊົນກຳແພງ)
        const hitWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
        const hitSelf = snake.some(p => p.x === head.x && p.y === head.y);
        const hitObs = obstacles.some(o => o.x === head.x && o.y === head.y);

        if (hitWall || hitSelf || hitObs) {
            clearInterval(gameInterval);
            isPlaying = false;
            alert(`😢 ຕົກດ່ານ! ທ່ານເສຍໃນດ່ານ ${snakeLevel}`);
            document.getElementById('snake-start-btn').innerText = "🎮 ຫຼິ້ນດ່ານນີ້ໃໝ່";
            return;
        }

        snake.unshift(head);

        // ກິນຂຽດ
        if (head.x === frog.x && head.y === frog.y) {
            eatenInLevel++;
            document.getElementById('snake-target').innerText = `${eatenInLevel}/${config.target}`;

            // ຜ່ານດ່ານ!
            if (eatenInLevel >= config.target) {
                clearInterval(gameInterval);
                isPlaying = false;
                if (snakeLevel < 15) {
                    alert(`🎉 ສຸດຍອດ! ທ່ານຜ່ານດ່ານ ${snakeLevel} ແລ້ວ! ໄປດ່ານຕໍ່ໄປ...`);
                    snakeLevel++;
                    initSnakeLevel();
                    document.getElementById('snake-start-btn').innerText = `🚀 ເລີ່ມດ່ານ ${snakeLevel}`;
                } else {
                    alert(`🏆 ຍິນດີດ້ວຍ! ທ່ານພິຊິດຄົບທັງ 15 ດ່ານຂອງເກມງູກິນຂຽດແລ້ວ!`);
                    snakeLevel = 1;
                    initSnakeLevel();
                }
                return;
            }
            spawnFrog();
        } else {
            snake.pop();
        }

        draw();
    }

    function draw() {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ວາດຂຽດ 🐸
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐸', (frog.x * gridSize) + gridSize / 2, (frog.y * gridSize) + gridSize / 2);

        // ວາດກຳແພງ 🧱
        obstacles.forEach(o => {
            ctx.fillText('🧱', (o.x * gridSize) + gridSize / 2, (o.y * gridSize) + gridSize / 2);
        });

        // ວາດງູ 🐍
        snake.forEach((part, index) => {
            ctx.fillStyle = index === 0 ? '#10b981' : '#34d399';
            ctx.beginPath();
            ctx.roundRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2, 4);
            ctx.fill();
        });
    }

    function changeDirection(newDx, newDy) {
        if (newDx !== 0 && dx !== 0) return;
        if (newDy !== 0 && dy !== 0) return;
        dx = newDx; dy = newDy;
    }

    document.getElementById('btn-up')?.addEventListener('click', () => changeDirection(0, -1));
    document.getElementById('btn-down')?.addEventListener('click', () => changeDirection(0, 1));
    document.getElementById('btn-left')?.addEventListener('click', () => changeDirection(-1, 0));
    document.getElementById('btn-right')?.addEventListener('click', () => changeDirection(1, 0));

    window.addEventListener('keydown', e => {
        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
        if (e.key === 'ArrowUp') changeDirection(0, -1);
        if (e.key === 'ArrowDown') changeDirection(0, 1);
        if (e.key === 'ArrowLeft') changeDirection(-1, 0);
        if (e.key === 'ArrowRight') changeDirection(1, 0);
    });

    const startBtn = document.getElementById('snake-start-btn');
    startBtn?.addEventListener('click', () => {
        if (isPlaying) clearInterval(gameInterval);
        isPlaying = true;
        startBtn.innerText = "🔄 ກຳລັງຫຼິ້ນ...";
        const config = getLevelConfig(snakeLevel);
        gameInterval = setInterval(gameLoop, config.speed);
    });

    initSnakeLevel();
    draw();
});

// --------------------------------------------------
// 🍓 2. LOGIC ເກມຈັບຄູ່ໝາກໄມ້ (15 ດ່ານ)
// --------------------------------------------------
const allFruits = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🥑', '🍍', '🥝', '🫐'];
let matchLevel = 1;
let movesLeft = 0;
let matchCards = [];
let flippedCards = [];
let matchedPairs = 0;
let isMatchLocked = false;

function getMatchConfig(lvl) {
    // ດ່ານ 1-5 (6 ຄູ່ / 4x3), ດ່ານ 6-10 (8 ຄູ່ / 4x4), ດ່ານ 11-15 (10 ຄູ່ / 5x4)
    let pairCount = 6;
    let gridCols = 'grid-cols-4';
    if (lvl > 5) { pairCount = 8; gridCols = 'grid-cols-4'; }
    if (lvl > 10) { pairCount = 10; gridCols = 'grid-cols-5'; }

    // ຈຳກັດຈຳນວນຄັ້ງກົດໃນດ່ານສູງໆ
    let maxMoves = 999;
    if (lvl >= 6) maxMoves = pairCount * 3; 
    if (lvl >= 11) maxMoves = Math.floor(pairCount * 2.2); 

    const hideDelay = lvl >= 11 ? 500 : 800; // ດ່ານ 11-15 ປິດບັດໄວ

    return { pairCount, gridCols, maxMoves, hideDelay };
}

function initMatchGame() {
    const board = document.getElementById('match-board');
    if (!board) return;

    const config = getMatchConfig(matchLevel);
    board.className = `grid ${config.gridCols} gap-2 mb-4`;
    board.innerHTML = '';

    document.getElementById('match-level-badge').innerText = `ດ່ານ ${matchLevel}/15`;
    
    movesLeft = config.maxMoves;
    document.getElementById('match-moves-left').innerText = movesLeft === 999 ? 'ບໍ່ຈຳກັດ' : movesLeft;
    document.getElementById('match-pairs').innerText = config.pairCount;

    const selectedFruits = allFruits.slice(0, config.pairCount);
    matchCards = [...selectedFruits, ...selectedFruits].sort(() => Math.random() - 0.5);
    flippedCards = [];
    matchedPairs = 0;
    isMatchLocked = false;

    matchCards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'fruit-card';
        card.dataset.emoji = emoji;
        card.innerText = '❓';
        card.addEventListener('click', flipFruitCard);
        board.appendChild(card);
    });
}

function flipFruitCard() {
    if (isMatchLocked) return;
    const clickedCard = this;

    if (clickedCard.classList.contains('matched') || clickedCard.classList.contains('flipped')) return;

    clickedCard.innerText = clickedCard.dataset.emoji;
    clickedCard.classList.add('flipped');
    flippedCards.push(clickedCard);

    if (flippedCards.length === 2) {
        const config = getMatchConfig(matchLevel);
        if (config.maxMoves !== 999) {
            movesLeft--;
            document.getElementById('match-moves-left').innerText = movesLeft;
        }

        checkFruitMatch();
    }
}

function checkFruitMatch() {
    const config = getMatchConfig(matchLevel);
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.emoji === card2.dataset.emoji;

    if (isMatch) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        document.getElementById('match-pairs').innerText = config.pairCount - matchedPairs;
        flippedCards = [];

        // ຜ່ານດ່ານ!
        if (matchedPairs === config.pairCount) {
            setTimeout(() => {
                if (matchLevel < 15) {
                    alert(`🎉 ສຸດຍອດ! ທ່ານຜ່ານດ່ານ ${matchLevel} ແລ້ວ! ໄປດ່ານຕໍ່ໄປ...`);
                    matchLevel++;
                    initMatchGame();
                } else {
                    alert(`🏆 ຍິນດີດ້ວຍ! ທ່ານພິຊິດຄົບ 15 ດ່ານ ເກມຈັບຄູ່ໝາກໄມ້ແລ້ວ!`);
                    matchLevel = 1;
                    initMatchGame();
                }
            }, 300);
        }
    } else {
        // ຖ້າກົດຄົບໂຄຕ້າແລ້ວຍັງບໍ່ຜ່ານ = ຕົກດ່ານ
        if (movesLeft <= 0 && config.maxMoves !== 999) {
            setTimeout(() => {
                alert(`😢 ໂຄຕ້າກົດໝົດແລ້ວ! ທ່ານຕົກດ່ານ ${matchLevel}`);
                initMatchGame();
            }, 400);
            return;
        }

        isMatchLocked = true;
        setTimeout(() => {
            card1.innerText = '❓';
            card2.innerText = '❓';
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            isMatchLocked = false;
        }, config.hideDelay);
    }
}

document.getElementById('match-reset-btn')?.addEventListener('click', initMatchGame);
// ອັບເດດຟັງຊັນສະຫຼັບ Tabs ທັງ 3 ເກມ
function switchGame(gameType) {
    const sections = {
        snake: document.getElementById('section-snake'),
        match: document.getElementById('section-match'),
        mole: document.getElementById('section-mole')
    };
    const tabs = {
        snake: document.getElementById('tab-snake'),
        match: document.getElementById('tab-match'),
        mole: document.getElementById('tab-mole')
    };

    Object.keys(sections).forEach(type => {
        if (type === gameType) {
            sections[type].classList.remove('hidden');
            tabs[type].className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all';
        } else {
            sections[type].classList.add('hidden');
            tabs[type].className = 'flex-1 py-2 rounded-lg transition-all hover:text-white text-slate-400 font-bold';
        }
    });

    if (gameType === 'match') initMatchGame();
    if (gameType === 'mole') initMoleGame();
}

// --------------------------------------------------
// 🐹 3. LOGIC ເກມຕີຕຸ່ນ (15 ດ່ານ)
// --------------------------------------------------
let moleLevel = 1;
let moleScore = 0;
let moleTimeLeft = 20;
let moleTimer = null;
let molePopTimer = null;
let currentHole = null;
let isMolePlaying = false;

function getMoleConfig(lvl) {
    // ຄວາມໄວໂຜ່ (ms): ດ່ານ 1=900ms -> ດ່ານ 15=300ms
    const speed = Math.max(300, 950 - (lvl * 45)); 
    const targetScore = 4 + Math.floor(lvl * 1.5); // ຄະແນນເປົ້າໝາຍ
    const hasBomb = lvl >= 11; // ດ່ານ 11-15 ມີລະເບີດ
    return { speed, targetScore, hasBomb };
}

function initMoleGame() {
    clearInterval(moleTimer);
    clearInterval(molePopTimer);
    isMolePlaying = false;
    moleScore = 0;
    moleTimeLeft = 20;

    const config = getMoleConfig(moleLevel);
    document.getElementById('mole-level-badge').innerText = `ດ່ານ ${moleLevel}/15`;
    document.getElementById('mole-score').innerText = `0/${config.targetScore}`;
    document.getElementById('mole-time').innerText = `${moleTimeLeft}s`;
    
    const startBtn = document.getElementById('mole-start-btn');
    if (startBtn) startBtn.innerText = `🎮 ເລີ່ມດ່ານ ${moleLevel}`;

    clearHoles();
}

function clearHoles() {
    document.querySelectorAll('.mole-hole').forEach(hole => {
        hole.className = 'mole-hole';
    });
}

function showRandomMole() {
    clearHoles();
    if (!isMolePlaying) return;

    const holes = document.querySelectorAll('.mole-hole');
    const randomIndex = Math.floor(Math.random() * holes.length);
    currentHole = holes[randomIndex];

    const config = getMoleConfig(moleLevel);
    // ດ່ານ 11-15 ມີໂອກາດ 25% ສະແດງລະເບີດ
    const isBomb = config.hasBomb && Math.random() < 0.25;

    if (isBomb) {
        currentHole.classList.add('has-bomb');
    } else {
        currentHole.classList.add('has-mole');
    }
}

document.querySelectorAll('.mole-hole').forEach(hole => {
    hole.addEventListener('click', function() {
        if (!isMolePlaying) return;

        if (this.classList.contains('has-mole')) {
            moleScore++;
            this.className = 'mole-hole whacked';
            const config = getMoleConfig(moleLevel);
            document.getElementById('mole-score').innerText = `${moleScore}/${config.targetScore}`;
        } else if (this.classList.contains('has-bomb')) {
            moleScore = Math.max(0, moleScore - 2);
            this.className = 'mole-hole whacked';
            const config = getMoleConfig(moleLevel);
            document.getElementById('mole-score').innerText = `${moleScore}/${config.targetScore}`;
            alert('💥 ຖືກລະເບີດ! ເສຍ 2 ຄະແນນ');
        }
    });
});

document.getElementById('mole-start-btn')?.addEventListener('click', () => {
    if (isMolePlaying) return;

    initMoleGame();
    isMolePlaying = true;
    const config = getMoleConfig(moleLevel);
    document.getElementById('mole-start-btn').innerText = "🔨 ຕີເລີຍ!";

    // ໃຫ້ຕຸ່ນໂຜ່ຕາມຄວາມໄວ
    molePopTimer = setInterval(showRandomMole, config.speed);

    // ຕັກເວລາ countdown
    moleTimer = setInterval(() => {
        moleTimeLeft--;
        document.getElementById('mole-time').innerText = `${moleTimeLeft}s`;

        if (moleTimeLeft <= 0) {
            clearInterval(moleTimer);
            clearInterval(molePopTimer);
            isMolePlaying = false;
            clearHoles();

            if (moleScore >= config.targetScore) {
                if (moleLevel < 15) {
                    alert(`🎉 ສຸດຍອດ! ທ່ານຜ່ານດ່ານ ${moleLevel} ແລ້ວ (ໄດ້ ${moleScore} ໂຕ)!`);
                    moleLevel++;
                    initMoleGame();
                } else {
                    alert(`🏆 ຍິນດີດ້ວຍ! ທ່ານພິຊິດຄົບ 15 ດ່ານ ເກມຕີຕຸ່ນແລ້ວ!`);
                    moleLevel = 1;
                    initMoleGame();
                }
            } else {
                alert(`😢 ຕົກດ່ານ ${moleLevel}! ໄດ້ພຽງ ${moleScore}/${config.targetScore} ໂຕ`);
                initMoleGame();
            }
        }
    }, 1000);
});
// 🌐 ຟັງຊັນປ່ຽນພາສາທົ່ວເວັບ (ຊິ້ງກັບ localStorage)
window.changeLanguage = function(lang) {
    localStorage.setItem('selected_lang', lang);
    
    if (typeof translations === 'undefined') return;
    const texts = translations[lang];
    if (!texts) return;

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (texts[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = texts[key];
            } else {
                element.innerText = texts[key];
            }
        }
    });
};

// 🔄 ດຶງຄ່າພາສາທີ່ເຄີຍເລືອກໄວ້ເມື່ອເປີດໜ້າເກມ
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selected_lang') || 'lo';
    const langSwitcher = document.getElementById('langSwitcher');
    if (langSwitcher) {
        langSwitcher.value = savedLang;
    }
    window.changeLanguage(savedLang);
});

// ... (ໂຄ້ດ Logic ເກມຕ່າງໆທີ່ມີຢູ່ແລ້ວໃນ game.js ປະໄວ້ຄືເກົ່າ)