const params = new URLSearchParams(window.location.search);
const isCustom = params.get('custom') === '1';
const customPuzzle = isCustom ? JSON.parse(localStorage.getItem('activePuzzle')) : null;

let GRID = 3;
const level = parseInt(params.get('level')) || 1;
const imgSrc = customPuzzle ? customPuzzle.img : `images/Cat_${level}.png`;

document.getElementById('levelTitle').textContent = customPuzzle ? customPuzzle.name : `Level ${level}`;
document.getElementById('refImage').src = imgSrc;

let tiles = [];
let selected = null;
let moves = 0;
let boardW = 450;
let boardH = 450;
let history = [];
let initialTiles = [];
let timerInterval = null;
let seconds = 0;

function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimerDisplay() {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    document.getElementById('timerDisplay').textContent = `Time: ${m}:${s.toString().padStart(2, '0')}`;
}

function tileW() { return Math.floor(boardW / GRID); }
function tileH() { return Math.floor(boardH / GRID); }

// Load image to get natural dimensions, then scale to fit screen
const img = new Image();
img.onload = () => {
    const maxSize = Math.min(window.innerWidth * 0.95, 600);
    const ratio = img.naturalWidth / img.naturalHeight;
    if (ratio >= 1) {
        boardW = maxSize;
        boardH = Math.floor(maxSize / ratio);
    } else {
        boardH = maxSize;
        boardW = Math.floor(maxSize * ratio);
    }
    shuffle();
};
img.src = imgSrc;

function buildBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    board.style.position = 'relative';
    board.style.width = `${boardW}px`;
    board.style.height = `${boardH}px`;
    board.style.border = '4px solid var(--primary-color)';

    for (let i = 0; i < GRID * GRID; i++) {
        const piece = tiles[i];
        const col = i % GRID;
        const row = Math.floor(i / GRID);
        const srcCol = (piece - 1) % GRID;
        const srcRow = Math.floor((piece - 1) / GRID);

        const tile = document.createElement('div');
        tile.id = `tile-${i}`;
        tile.style.position = 'absolute';
        tile.style.width = `${tileW()}px`;
        tile.style.height = `${tileH()}px`;
        tile.style.left = `${col * tileW()}px`;
        tile.style.top = `${row * tileH()}px`;
        tile.style.backgroundImage = `url("${imgSrc}")`;
        tile.style.backgroundSize = `${boardW}px ${boardH}px`;
        tile.style.backgroundPosition = `-${srcCol * tileW()}px -${srcRow * tileH()}px`;
        tile.style.boxSizing = 'border-box';
        tile.style.border = '2px solid rgba(0,0,0,0.2)';
        tile.style.cursor = 'pointer';

        tile.addEventListener('click', () => clickTile(i));
        board.appendChild(tile);
    }
}

function updateBoard() {
    for (let i = 0; i < GRID * GRID; i++) {
        const piece = tiles[i];
        const tile = document.getElementById(`tile-${i}`);
        const srcCol = (piece - 1) % GRID;
        const srcRow = Math.floor((piece - 1) / GRID);
        tile.style.backgroundPosition = `-${srcCol * tileW()}px -${srcRow * tileH()}px`;
        tile.style.outline = i === selected ? '3px solid var(--secondary-color)' : 'none';
    }
}

function undo() {
    if (history.length === 0) return;
    const [a, b] = history.pop();
    const tmp = tiles[a];
    tiles[a] = tiles[b];
    tiles[b] = tmp;
    moves = Math.max(0, moves - 1);
    document.getElementById('moveCount').textContent = `Moves: ${moves}`;
    selected = null;
    updateBoard();
}

function clickTile(index) {
    if (selected === null) {
        selected = index;
        updateBoard();
        return;
    }
    if (selected === index) {
        selected = null;
        updateBoard();
        return;
    }

    const tmp = tiles[selected];
    tiles[selected] = tiles[index];
    tiles[index] = tmp;
    history.push([selected, index]);
    moves++;
    document.getElementById('moveCount').textContent = `Moves: ${moves}`;
    selected = null;
    updateBoard();

    if (isSolved()) {
        stopTimer();
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        const timeStr = `${m}:${s.toString().padStart(2, '0')}`;
        if (!isCustom) localStorage.setItem(`completed_${level}`, '1');
        setTimeout(() => alert(`Solved in ${moves} moves and ${timeStr}!`), 100);
    }
}

function isSolved() {
    for (let i = 0; i < GRID * GRID; i++) {
        if (tiles[i] !== i + 1) return false;
    }
    return true;
}

function shuffle() {
    moves = 0;
    selected = null;
    document.getElementById('moveCount').textContent = 'Moves: 0';

    tiles = [...Array(GRID * GRID).keys()].map(i => i + 1);
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    initialTiles = [...tiles];
    history = [];

    buildBoard();
    startTimer();
}

function changeGrid(value) {
    GRID = parseInt(value);
    document.getElementById('gridLabel').textContent = `${GRID}×${GRID}`;
    shuffle();
}

if (!isCustom) {
    // Show prev if level > 1
    if (level > 1) document.getElementById('prevBtn').style.display = '';

    // Show next if the next image exists
    const testImg = new Image();
    testImg.onload = () => document.getElementById('nextBtn').style.display = '';
    testImg.src = `images/Cat_${level + 1}.png`;
}

function prevLevel() {
    window.location.href = `puzzle.html?level=${level - 1}`;
}

function nextLevel() {
    window.location.href = `puzzle.html?level=${level + 1}`;
}

function replay() {
    if (history.length === 0) return;
    const saved = [...history];
    tiles = [...initialTiles];
    history = [];
    moves = 0;
    seconds = 0;
    selected = null;
    document.getElementById('moveCount').textContent = 'Moves: 0';
    updateTimerDisplay();
    buildBoard();

    saved.forEach(([a, b], i) => {
        setTimeout(() => {
            const tmp = tiles[a];
            tiles[a] = tiles[b];
            tiles[b] = tmp;
            moves++;
            document.getElementById('moveCount').textContent = `Moves: ${moves}`;
            updateBoard();
        }, (i + 1) * 400);
    });
}