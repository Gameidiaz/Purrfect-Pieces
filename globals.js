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

let pendingBtn = null;

document.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn === pendingBtn) {
        pendingBtn = null;
        return;
    }

    e.stopPropagation();

    const audio = new Audio('audio/click.wav');
    audio.volume = (localStorage.getItem('sfxVolume') ?? 100) / 100;

    const proceed = () => {
        pendingBtn = btn;
        btn.click();
    };

    audio.addEventListener('ended', proceed);
    audio.play().catch(proceed);
}, true);
