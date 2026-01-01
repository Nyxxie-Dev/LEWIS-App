// Color Harmony Generator - Clean version with color wheel + dots only

const baseInput = document.getElementById('base-color-input');
const harmonyGrid = document.getElementById('harmony-grid');

let baseColor = '#3498db';

function hexToHsl(hex) {
    let r = parseInt(hex.slice(1,3),16) / 255;
    let g = parseInt(hex.slice(3,5),16) / 255;
    let b = parseInt(hex.slice(5,7),16) / 255;
    let max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }
    return {h: Math.round(h), s: Math.round(s*100), l: Math.round(l*100)};
}

function hslToHex(h, s, l) {
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
    return '#' + [r,g,b].map(x => Math.round(x*255).toString(16).padStart(2,'0')).join('').toUpperCase();
}

// Check if color is dark → white text
function isDark(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
}

function generateHarmonies(baseHex) {
    const {h, s, l} = hexToHsl(baseHex);

    return {
        'Complementary': [baseHex, hslToHex((h + 180) % 360, s, l)],
        'Analogous': [hslToHex((h - 30 + 360) % 360, s, l), baseHex, hslToHex((h + 30) % 360, s, l)],
        'Triadic': [baseHex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)],
        'Tetradic': [baseHex, hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)],
        'Split-Complementary': [baseHex, hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)],
        'Monochromatic': [
            hslToHex(h, s, Math.min(100, l + 40)),
            hslToHex(h, s, Math.min(100, l + 20)),
            baseHex,
            hslToHex(h, s, Math.max(0, l - 20)),
            hslToHex(h, s, Math.max(0, l - 40))
        ]
    };
}

function renderHarmonies() {
    harmonyGrid.innerHTML = '';
    const harmonies = generateHarmonies(baseColor);

    Object.entries(harmonies).forEach(([name, colors]) => {
        const div = document.createElement('div');
        div.className = 'harmony-type';
        div.innerHTML = `
            <h4>${name}</h4>
            <div class="harmony-diagram">
                <div class="color-wheel"></div>
                <div class="harmony-dots"></div>
            </div>
            <div class="swatches-row"></div>
        `;

        const dotsContainer = div.querySelector('.harmony-dots');
        const swatchesRow = div.querySelector('.swatches-row');

        const centerX = 125;
        const centerY = 125;
        const radius = 105;

        colors.forEach((color) => {
            const {h: hue} = hexToHsl(color);
            const angleDeg = hue - 90;
            const angleRad = angleDeg * Math.PI / 180;

            const x = centerX + radius * Math.cos(angleRad);
            const y = centerY + radius * Math.sin(angleRad);

            // Dot on wheel
            const dot = document.createElement('div');
            dot.className = 'harmony-dot';
            dot.style.backgroundColor = color;
            dot.style.left = `${x}px`;
            dot.style.top = `${y}px`;
            dotsContainer.appendChild(dot);

            // Swatch below
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            swatch.style.backgroundColor = color;
            const textColor = isDark(color) ? 'white' : '#555';
            swatch.innerHTML = `<div class="swatch-hex" style="color:${textColor};">${color}</div>`;
            swatch.title = 'Click to copy HEX';
            swatch.addEventListener('click', () => {
                navigator.clipboard.writeText(color);
                const hexDiv = swatch.querySelector('.swatch-hex');
                hexDiv.textContent = 'Copied!';
                setTimeout(() => hexDiv.textContent = color, 1000);
            });
            swatchesRow.appendChild(swatch);
        });

        harmonyGrid.appendChild(div);
    });
}

baseInput.value = baseColor;
baseInput.addEventListener('input', (e) => {
    baseColor = e.target.value;
    renderHarmonies();
});

renderHarmonies();