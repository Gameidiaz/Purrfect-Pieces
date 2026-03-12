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
        tile.style.outline = 'none';
    }
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
    moves++;
    document.getElementById('moveCount').textContent = `Moves: ${moves}`;
    selected = null;
    updateBoard();

    if (isSolved()) {
        setTimeout(() => alert(`Solved in ${moves} moves!`), 100);
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

    buildBoard();
}

function changeGrid(value) {
    GRID = parseInt(value);
    document.getElementById('gridLabel').textContent = `${GRID}×${GRID}`;
    shuffle();
}