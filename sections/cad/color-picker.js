// Advanced Color Picker - Remade from scratch

let h = 217;    // starting blue like the example
let s = 90;
let l = 61;

const sbCanvas = document.getElementById('sb-canvas');
const sbCtx = sbCanvas.getContext('2d');
const hueCanvas = document.getElementById('hue-canvas');
const hueCtx = hueCanvas.getContext('2d');
const sbPointer = document.getElementById('sb-pointer');
const huePointer = document.getElementById('hue-pointer');
const previewBig = document.getElementById('color-preview-big');

// HSL to RGB
function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// RGB to HEX
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// RGB to CMYK
function rgbToCmyk(r, g, b) {
    if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100];
    let c = 1 - r / 255;
    let m = 1 - g / 255;
    let y = 1 - b / 255;
    let k = Math.min(c, m, y);
    c = Math.round((c - k) / (1 - k) * 100);
    m = Math.round((m - k) / (1 - k) * 100);
    y = Math.round((y - k) / (1 - k) * 100);
    k = Math.round(k * 100);
    return [c, m, y, k];
}

// HSL to HSV
function hslToHsv(h, s, l) {
    s /= 100; l /= 100;
    const v = l + s * Math.min(l, 1 - l);
    const sv = v === 0 ? 0 : 2 * (1 - l / v);
    return [h, Math.round(sv * 100), Math.round(v * 100)];
}

// Update everything
function updateColor() {
    const [r, g, b] = hslToRgb(h, s, l);
    const hex = rgbToHex(r, g, b);
    const [c, m, y, k] = rgbToCmyk(r, g, b);
    const [hv, sv, vv] = hslToHsv(h, s, l);

    previewBig.style.backgroundColor = hex;

    document.getElementById('format-hex').textContent = hex;
    document.getElementById('format-rgb').textContent = `rgb(${r}, ${g}, ${b})`;
    document.getElementById('format-hsl').textContent = `hsl(${h}, ${s}%, ${l}%)`;
    document.getElementById('format-hsv').textContent = `hsv(${hv}, ${sv}%, ${vv}%)`;
    document.getElementById('format-cmyk').textContent = `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;

    drawSbSquare();
    drawHueBar();
    updatePointers();
}

// Draw SB square
function drawSbSquare() {
    const size = sbCanvas.width;
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const sat = (x / size) * 100;
            const light = 100 - (y / size) * 100;
            const [r, g, b] = hslToRgb(h, sat, light);
            sbCtx.fillStyle = `rgb(${r},${g},${b})`;
            sbCtx.fillRect(x, y, 1, 1);
        }
    }
}

// Draw hue bar
function drawHueBar() {
    const w = hueCanvas.width;
    const h = hueCanvas.height;
    for (let x = 0; x < w; x++) {
        const hue = (x / w) * 360;
        hueCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        hueCtx.fillRect(x, 0, 1, h);
    }
}

// Pointers
function updatePointers() {
    sbPointer.style.left = (s / 100 * sbCanvas.width) + 'px';
    sbPointer.style.top = ((100 - l) / 100 * sbCanvas.height) + 'px';

    huePointer.style.left = (h / 360 * hueCanvas.width) + 'px';
}

// Mouse handlers
let sbDragging = false;
let hueDragging = false;

sbCanvas.addEventListener('mousedown', (e) => {
    sbDragging = true;
    updateFromSb(e);
});

hueCanvas.addEventListener('mousedown', (e) => {
    hueDragging = true;
    updateFromHue(e);
});

document.addEventListener('mousemove', (e) => {
    if (sbDragging) updateFromSb(e);
    if (hueDragging) updateFromHue(e);
});

document.addEventListener('mouseup', () => {
    sbDragging = false;
    hueDragging = false;
});

function updateFromSb(e) {
    const rect = sbCanvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    s = Math.round((x / rect.width) * 100);
    l = Math.round(100 - (y / rect.height) * 100);
    updateColor();
}

function updateFromHue(e) {
    const rect = hueCanvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    h = Math.round((x / rect.width) * 360);
    updateColor();
}

// Copy
function copyFormat(id) {
    const text = document.getElementById(id).textContent;
    navigator.clipboard.writeText(text);
    alert('Copied: ' + text);
}

// Init
drawHueBar();
drawSbSquare();
updatePointers();
updateColor();