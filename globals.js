const defaults = {
    bgImage: 'url("images/Background.png")',
    primaryColor: '#352130',
    secondaryColor: '#d95b7e',
    font: 'Arial',
};

const googleFontsLink = document.createElement('link');
googleFontsLink.rel = 'stylesheet';
googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap';
document.head.appendChild(googleFontsLink);

const availableFonts = [
    'Arial',
    'Georgia',
    'Courier New',
    'Verdana',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
    'Palatino',
    'Fredoka One',
    'monospace',
    'fantasy',
];

function playSound(src) {
    const audio = new Audio(src);
    audio.volume = (localStorage.getItem('sfxVolume') ?? 100) / 100;
    audio.play();
}

function applySettings() {
    const root = document.documentElement;
    root.style.setProperty('--bg-image', localStorage.getItem('bgImage') || defaults.bgImage);
    root.style.setProperty('--primary-color', localStorage.getItem('primaryColor') || defaults.primaryColor);
    root.style.setProperty('--secondary-color', localStorage.getItem('secondaryColor') || defaults.secondaryColor);
    root.style.setProperty('--font', localStorage.getItem('font') || defaults.font);
}

applySettings();

function startRainbowTrail() {
    let hue = 0;
    document.addEventListener('mousemove', (e) => {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: hsl(${hue}, 100%, 60%);
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
            transition: opacity 0.6s, transform 0.6s;
        `;
        document.body.appendChild(dot);
        hue = (hue + 10) % 360;
        requestAnimationFrame(() => {
            dot.style.opacity = '0';
            dot.style.transform = 'translate(-50%, -50%) scale(2)';
        });
        setTimeout(() => dot.remove(), 600);
    });
}

if (localStorage.getItem('nyanUnlocked') === 'true') {
    startRainbowTrail();
}
