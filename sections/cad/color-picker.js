// Advanced Color Picker with 2D SB square + Hue slider + multiple formats

let h = 0;      // Hue: 0-360
let s = 100;    // Saturation: 0-100
let l = 50;     // Lightness: 0-100

const sbCanvas = document.getElementById('sb-canvas');
const sbCtx = sbCanvas.getContext('2d');
const hueCanvas = document.getElementById('hue-canvas');
const hueCtx = hueCanvas.getContext('2d');
const sbPointer = document.getElementById('sb-pointer');
const huePointer = document.getElementById('hue-pointer');
const previewBig = document.getElementById('color-preview-big');

// Helper: HSL to RGB
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
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// RGB to CMYK (percentages)
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

// Update all displays
function updateColor() {
    const [r, g, b] = hslToRgb(h, s, l);
    const hex = rgbToHex(r, g, b);
    const [c, m, y, k] = rgbToCmyk(r, g, b);
    const [hv, sv, vv] = hslToHsv(h, s, l);

    previewBig.style.backgroundColor = hex;

    document.getElementById('format-hex').value = hex;
    document.getElementById('format-rgb').value = `rgb(${r}, ${g}, ${b})`;
    document.getElementById('format-hsl').value = `hsl(${h}, ${s}%, ${l}%)`;
    document.getElementById('format-hsv').value = `hsv(${hv}, ${sv}%, ${vv}%)`;
    document.getElementById('format-cmyk').value = `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;

    drawSbSquare();
    drawHueBar();
}

// Draw Saturation/Lightness square
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

// Draw Hue bar
function drawHueBar() {
    const size = hueCanvas.height;
    for (let y = 0; y < size; y++) {
        const hue = (y / size) * 360;
        hueCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        hueCtx.fillRect(0, y, hueCanvas.width, 1);
    }
}

// Position pointers
function updatePointers() {
    sbPointer.style.left = (s / 100 * sbCanvas.width) + 'px';
    sbPointer.style.top = ((100 - l) / 100 * sbCanvas.height) + 'px';

    huePointer.style.top = (h / 360 * hueCanvas.height) + 'px';
}

// Copy function for formats
function copyFormat(id) {
    const input = document.getElementById(id);
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand('copy');
    alert('Copied: ' + input.value);
}

// Mouse handling for SB canvas
let sbDragging = false;
sbCanvas.addEventListener('mousedown', (e) => {
    sbDragging = true;
    updateFromSb(e);
});
document.addEventListener('mousemove', (e) => {
    if (sbDragging) updateFromSb(e);
});
document.addEventListener('mouseup', () => sbDragging = false);

function updateFromSb(e) {
    const rect = sbCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    s = Math.round(Math.max(0, Math.min(100, (x / rect.width) * 100)));
    l = Math.round(Math.max(0, Math.min(100, 100 - (y / rect.height) * 100)));
    updateColor();
    updatePointers();
}

// Mouse handling for Hue canvas
let hueDragging = false;
hueCanvas.addEventListener('mousedown', (e) => {
    hueDragging = true;
    updateFromHue(e);
});
document.addEventListener('mousemove', (e) => {
    if (hueDragging) updateFromHue(e);
});
document.addEventListener('mouseup', () => hueDragging = false);

function updateFromHue(e) {
    const rect = hueCanvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    h = Math.round(Math.max(0, Math.min(360, (y / rect.height) * 360)));
    updateColor();
    updatePointers();
}

// Initial draw
drawHueBar();
drawSbSquare();
updatePointers();
updateColor();