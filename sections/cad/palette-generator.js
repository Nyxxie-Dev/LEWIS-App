// Palette Generator from Image

const dropArea = document.getElementById('drop-area');
const imageInput = document.getElementById('image-input');
const clickHere = document.getElementById('click-here');
const uploadedPreview = document.getElementById('uploaded-preview');
const paletteControls = document.getElementById('palette-controls');
const colorCountInput = document.getElementById('color-count');
const colorCountValue = document.getElementById('color-count-value');
const generateBtn = document.getElementById('generate-palette');
const paletteResult = document.getElementById('palette-result');

let currentImage = null;

// Click to upload
clickHere.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        loadImage(e.target.files[0]);
    }
});

// Drag & drop
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = '#3498db';
    dropArea.style.background = '#f0f8ff';
});

dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = '#ccc';
    dropArea.style.background = '#f9f9f9';
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = '#ccc';
    dropArea.style.background = '#f9f9f9';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadImage(e.dataTransfer.files[0]);
    }
});

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedPreview.src = e.target.result;
        uploadedPreview.classList.remove('hidden');
        paletteControls.classList.remove('hidden');
        
        const img = new Image();
        img.onload = () => {
            currentImage = img;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Update count display
colorCountInput.addEventListener('input', () => {
    colorCountValue.textContent = colorCountInput.value;
});

// Generate palette
generateBtn.addEventListener('click', () => {
    if (!currentImage) return;
    
    const numColors = parseInt(colorCountInput.value);
    const colors = extractColors(currentImage, numColors);
    
    displayPalette(colors);
});

// Simple color extraction using canvas + quantization
function extractColors(img, count) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const pixels = [];
    
    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        if (r + g + b > 30) { // skip near-black
            pixels.push([r, g, b]);
        }
    }
    
    // Simple k-means like clustering
    const centroids = [];
    for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * pixels.length);
        centroids.push(pixels[idx]);
    }
    
    for (let iter = 0; iter < 10; iter++) {
        const clusters = Array(count).fill().map(() => []);
        pixels.forEach(pixel => {
            let minDist = Infinity;
            let cluster = 0;
            centroids.forEach((c, i) => {
                const dist = Math.sqrt(
                    Math.pow(pixel[0] - c[0], 2) +
                    Math.pow(pixel[1] - c[1], 2) +
                    Math.pow(pixel[2] - c[2], 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    cluster = i;
                }
            });
            clusters[cluster].push(pixel);
        });
        
        centroids.forEach((c, i) => {
            if (clusters[i].length > 0) {
                const sum = clusters[i].reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], [0,0,0]);
                c[0] = Math.round(sum[0] / clusters[i].length);
                c[1] = Math.round(sum[1] / clusters[i].length);
                c[2] = Math.round(sum[2] / clusters[i].length);
            }
        });
    }
    
    return centroids.map(c => ({
        r: c[0],
        g: c[1],
        b: c[2],
        hex: '#' + c.map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()
    }));
}

// HSL conversion
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function displayPalette(colors) {
    paletteResult.innerHTML = '';
    paletteResult.classList.remove('hidden');
    
    colors.forEach(color => {
        const hsl = rgbToHsl(color.r, color.g, color.b);
        
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        
        swatch.innerHTML = `
            <div class="color-block" style="background: ${color.hex};"></div>
            <div class="color-info">HEX: ${color.hex}</div>
            <button class="copy-btn" data-value="${color.hex}">Copy HEX</button>
            <div class="color-info">RGB: rgb(${color.r}, ${color.g}, ${color.b})</div>
            <button class="copy-btn" data-value="rgb(${color.r}, ${color.g}, ${color.b})">Copy RGB</button>
            <div class="color-info">HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</div>
            <button class="copy-btn" data-value="hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)">Copy HSL</button>
        `;
        
        paletteResult.appendChild(swatch);
    });
    
    // Copy functionality
    paletteResult.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(btn.dataset.value);
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = btn.dataset.value.includes('rgb') ? 'Copy RGB' : btn.dataset.value.includes('hsl') ? 'Copy HSL' : 'Copy HEX', 1500);
        });
    });
}