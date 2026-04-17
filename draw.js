const canvasSize = Math.min(window.innerWidth * 0.92, 500);

const stage = new Konva.Stage({
    container: 'konva-container',
    width: canvasSize,
    height: canvasSize,
});

const layer = new Konva.Layer();
stage.add(layer);

const bg = new Konva.Rect({
    x: 0, y: 0,
    width: canvasSize,
    height: canvasSize,
    fill: 'white',
    listening: false,
});
layer.add(bg);

let isDrawing = false;
let currentLine = null;
let strokes = [];
let flatImage = null; // baked state after fills
let mode = 'brush';   // 'brush' | 'eraser' | 'fill'

const cursors = { brush: 'crosshair', eraser: 'cell', fill: 'copy' };

function setMode(m) {
    mode = m;
    document.getElementById('konva-container').style.cursor = cursors[m];
    document.getElementById('eraserBtn').style.opacity = m === 'eraser' ? '1' : '';
    document.getElementById('fillBtn').style.opacity   = m === 'fill'   ? '1' : '';
}

// ── Drawing ────────────────────────────────────────────────────────────────

stage.on('mousedown touchstart', () => {
    const pos = stage.getPointerPosition();
    if (mode === 'fill') {
        applyFill(Math.floor(pos.x), Math.floor(pos.y));
        return;
    }
    isDrawing = true;
    currentLine = new Konva.Line({
        stroke: mode === 'eraser' ? 'white' : document.getElementById('brushColor').value,
        strokeWidth: parseInt(document.getElementById('brushSize').value),
        lineCap: 'round',
        lineJoin: 'round',
        points: [pos.x, pos.y, pos.x, pos.y],
    });
    layer.add(currentLine);
    strokes.push(currentLine);
});

stage.on('mousemove touchmove', (e) => {
    if (!isDrawing) return;
    e.evt.preventDefault();
    const pos = stage.getPointerPosition();
    currentLine.points(currentLine.points().concat([pos.x, pos.y]));
    layer.batchDraw();
});

stage.on('mouseup touchend', () => {
    isDrawing = false;
    currentLine = null;
});

// ── Flood fill ─────────────────────────────────────────────────────────────

function hexToRgba(hex) {
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
        255,
    ];
}

function floodFill(ctx, startX, startY, fillRgba) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    const si = (startY * w + startX) * 4;
    const [tr, tg, tb, ta] = [data[si], data[si + 1], data[si + 2], data[si + 3]];
    const [fr, fg, fb, fa] = fillRgba;

    if (tr === fr && tg === fg && tb === fb && ta === fa) return;

    const tolerance = 32;
    function matches(i) {
        return Math.abs(data[i]     - tr) <= tolerance &&
               Math.abs(data[i + 1] - tg) <= tolerance &&
               Math.abs(data[i + 2] - tb) <= tolerance &&
               Math.abs(data[i + 3] - ta) <= tolerance;
    }

    const visited = new Uint8Array(w * h);
    const stack = [startX + startY * w];

    while (stack.length) {
        const pos = stack.pop();
        if (visited[pos]) continue;
        visited[pos] = 1;

        const i = pos * 4;
        if (!matches(i)) continue;

        data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = fa;

        const x = pos % w;
        const y = Math.floor(pos / w);
        if (x > 0)     stack.push(pos - 1);
        if (x < w - 1) stack.push(pos + 1);
        if (y > 0)     stack.push(pos - w);
        if (y < h - 1) stack.push(pos + w);
    }

    ctx.putImageData(imageData, 0, 0);
}

function applyFill(x, y) {
    const dataUrl = stage.toDataURL({ pixelRatio: 1 });
    const img = new Image();
    img.onload = () => {
        const tmp = document.createElement('canvas');
        tmp.width = canvasSize;
        tmp.height = canvasSize;
        const ctx = tmp.getContext('2d');
        ctx.drawImage(img, 0, 0);

        floodFill(ctx, x, y, hexToRgba(document.getElementById('brushColor').value));

        const filled = new Image();
        filled.onload = () => {
            if (flatImage) flatImage.destroy();
            strokes.forEach(s => s.destroy());
            strokes = [];

            flatImage = new Konva.Image({
                x: 0, y: 0,
                image: filled,
                width: canvasSize,
                height: canvasSize,
                listening: false,
            });
            layer.add(flatImage);
            flatImage.moveToBottom();
            bg.moveToBottom(); // keep white bg under flatImage
            layer.batchDraw();
        };
        filled.src = tmp.toDataURL();
    };
    img.src = dataUrl;
}

// ── Controls ───────────────────────────────────────────────────────────────

function undoStroke() {
    if (strokes.length === 0) return;
    strokes.pop().destroy();
    layer.batchDraw();
}

function clearCanvas() {
    strokes.forEach(s => s.destroy());
    strokes = [];
    if (flatImage) { flatImage.destroy(); flatImage = null; }
    layer.batchDraw();
}

function makePuzzle() {
    const dataUrl = stage.toDataURL({ pixelRatio: 1 });
    const name = document.getElementById('puzzleName').value.trim() || 'My Drawing';
    const entry = { img: dataUrl, name };
    localStorage.setItem('activePuzzle', JSON.stringify(entry));

    const saved = JSON.parse(localStorage.getItem('customImages') || '[]');
    saved.push(entry);
    localStorage.setItem('customImages', JSON.stringify(saved));

    window.location.href = 'puzzle.html?custom=1';
}

document.getElementById('brushSize').addEventListener('input', function () {
    document.getElementById('sizeLabel').textContent = this.value;
});
