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
    };
    btn.appendChild(img);
    btn.addEventListener('click', () => {
        window.location.href = `puzzle.html?level=${i}`;
    });
    container.appendChild(btn);
}

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
