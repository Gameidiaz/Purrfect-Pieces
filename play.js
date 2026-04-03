const container = document.querySelector('.puzzle-container');

// Built-in cat levels — auto-detect how many exist
function loadCatLevel(i) {
    const btn = document.createElement('button');
    const img = document.createElement('img');
    img.src = `images/Cat_${i}.png`;
    img.alt = `Cat ${i}`;
    img.onload = () => {
        loadCatLevel(i + 1);
    };
    img.onerror = () => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('levelCount').textContent = `${i - 1} Puzzle Levels`;
    };
    btn.appendChild(img);
    btn.addEventListener('click', () => {
        window.location.href = `puzzle.html?level=${i}`;
    });
    container.appendChild(btn);
}

loadCatLevel(1);

