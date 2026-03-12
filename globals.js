const defaults = {
    bgImage: 'url("images/Background.png")',
    primaryColor: '#352130',
    secondaryColor: '#d95b7e',
};

function applySettings() {
    const root = document.documentElement;
    root.style.setProperty('--bg-image', localStorage.getItem('bgImage') || defaults.bgImage);
    root.style.setProperty('--primary-color', localStorage.getItem('primaryColor') || defaults.primaryColor);
    root.style.setProperty('--secondary-color', localStorage.getItem('secondaryColor') || defaults.secondaryColor);
}

applySettings();
