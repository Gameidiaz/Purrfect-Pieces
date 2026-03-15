const container = document.querySelector('.puzzle-container');

function isProgression() {
    return localStorage.getItem('progressionMode') === '1';
}

function isUnlocked(level) {
    if (!isProgression()) return true;
    if (level === 1) return true;
    return localStorage.getItem(`completed_${level - 1}`) === '1';
}

function toggleMode() {
    const next = isProgression() ? '0' : '1';
    localStorage.setItem('progressionMode', next);
    document.getElementById('modeBtn').textContent = next === '1' ? 'Mode: Progression' : 'Mode: Free';
    location.reload();
}

// Built-in cat levels — auto-detect how many exist
function loadCatLevel(i) {
    const btn = document.createElement('button');
    const img = document.createElement('img');
    img.src = `images/Cat_${i}.png`;
    img.alt = `Cat ${i}`;
    img.onload = () => {
        if (!isUnlocked(i)) {
            btn.disabled = true;
            btn.style.opacity = '0.35';
            btn.style.position = 'relative';
            btn.title = 'Complete the previous level to unlock';
        }
        loadCatLevel(i + 1);
    };
    btn.appendChild(img);
    btn.addEventListener('click', () => {
        if (!isUnlocked(i)) return;
        window.location.href = `puzzle.html?level=${i}`;
    });
    container.appendChild(btn);
}

document.getElementById('modeBtn').textContent = isProgression() ? 'Mode: Progression' : 'Mode: Free';
loadCatLevel(1);

// Load saved custom images
const customImages = JSON.parse(localStorage.getItem('customImages') || '[]');
customImages.forEach((dataUrl, index) => addCustomButton(dataUrl, index));

// Upload handler
document.getElementById('uploadImage').addEventListener('change', () => {
    const file = document.getElementById('uploadImage').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        const customImages = JSON.parse(localStorage.getItem('customImages') || '[]');
        customImages.push(dataUrl);
        localStorage.setItem('customImages', JSON.stringify(customImages));
        addCustomButton(dataUrl, customImages.length - 1);
        document.getElementById('uploadImage').value = '';
    };
    reader.readAsDataURL(file);
});

function clearUploads() {
    localStorage.removeItem('customImages');
    location.reload();
}

function addCustomButton(dataUrl, index) {
    const btn = document.createElement('button');
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = `Custom ${index + 1}`;
    btn.appendChild(img);
    btn.addEventListener('click', () => {
        localStorage.setItem('activePuzzle', JSON.stringify({ img: dataUrl, name: `Custom ${index + 1}` }));
        window.location.href = `puzzle.html?custom=1`;
    });
    container.appendChild(btn);
}
