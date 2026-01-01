// Gradient Generator - Clean version without Remove Stop button

const preview = document.getElementById('gradient-preview');
const stopsBar = document.getElementById('stops-bar');
const typeSelect = document.getElementById('gradient-type');
const angleInput = document.getElementById('gradient-angle');
const angleValue = document.getElementById('angle-value');
const presetAngles = document.querySelector('.preset-angles');
const colorPicker = document.getElementById('stop-color-picker');
const addStopBtn = document.getElementById('add-stop');
const copyCssBtn = document.getElementById('copy-css');
const cssOutput = document.getElementById('gradient-css');

let stops = [
    { pos: 0, color: '#ff0000' },
    { pos: 100, color: '#0000ff' }
];

let selectedStop = null;

// Render stops
function renderStops() {
    stopsBar.innerHTML = '';
    stops.sort((a, b) => a.pos - b.pos).forEach((stop, i) => {
        const marker = document.createElement('div');
        marker.className = 'stop-marker' + (i === selectedStop ? ' active' : '');
        marker.style.left = `${stop.pos}%`;
        marker.style.backgroundColor = stop.color;
        marker.dataset.index = i;

        // Click to select
        marker.addEventListener('click', (e) => {
            selectedStop = i;
            colorPicker.value = stop.color;
            renderStops();
            e.stopPropagation();
        });

        // Double-click to delete (only if >2 stops)
        marker.addEventListener('dblclick', (e) => {
            if (stops.length > 2) {
                stops.splice(i, 1);
                if (selectedStop === i) selectedStop = null;
                else if (selectedStop > i) selectedStop--;
                renderStops();
                updateGradient();
            }
            e.stopPropagation();
        });

        // Drag start
        marker.addEventListener('mousedown', (e) => {
            selectedStop = i;
            colorPicker.value = stop.color;
            renderStops();
            e.stopPropagation();
        });

        stopsBar.appendChild(marker);
    });
}

// Update gradient preview and CSS
function updateGradient() {
    const type = typeSelect.value;
    const angle = angleInput.value;

    let gradientStr;
    if (type === 'linear') {
        gradientStr = `linear-gradient(${angle}deg`;
    } else {
        gradientStr = `radial-gradient(circle`;
    }

    stops.forEach(stop => {
        gradientStr += `, ${stop.color} ${stop.pos}%`;
    });
    gradientStr += ')';

    preview.style.background = gradientStr;

    let css = `background: ${gradientStr};`;
    if (type === 'linear') {
        css = `-webkit-${css}\n${css}`;
    }

    cssOutput.value = css;

    // Disable angle controls for radial
    const isRadial = type === 'radial';
    angleInput.classList.toggle('disabled', isRadial);
    angleValue.classList.toggle('disabled', isRadial);
    presetAngles.classList.toggle('disabled', isRadial);
}

// Click empty bar to add stop
stopsBar.addEventListener('click', (e) => {
    if (e.target !== stopsBar) return;
    const rect = stopsBar.getBoundingClientRect();
    const pos = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    stops.push({ pos, color: colorPicker.value });
    renderStops();
    updateGradient();
});

// Drag to move stop
document.addEventListener('mousemove', (e) => {
    if (selectedStop === null) return;
    const rect = stopsBar.getBoundingClientRect();
    let pos = ((e.clientX - rect.left) / rect.width) * 100;
    pos = Math.max(0, Math.min(100, pos));
    stops[selectedStop].pos = Math.round(pos);
    renderStops();
    updateGradient();
});

document.addEventListener('mouseup', () => {
    selectedStop = null;
});

// Live color update for selected stop
colorPicker.addEventListener('input', () => {
    if (selectedStop !== null) {
        stops[selectedStop].color = colorPicker.value;
        renderStops();
        updateGradient();
    }
});

// Add stop button
addStopBtn.addEventListener('click', () => {
    stops.push({ pos: 50, color: colorPicker.value });
    renderStops();
    updateGradient();
});

// Type and angle controls
typeSelect.addEventListener('change', updateGradient);

angleInput.addEventListener('input', () => {
    angleValue.textContent = angleInput.value + '°';
    updateGradient();
});

document.querySelectorAll('.preset-angles button').forEach(btn => {
    btn.addEventListener('click', () => {
        if (typeSelect.value === 'radial') return;
        angleInput.value = btn.dataset.angle;
        angleValue.textContent = btn.dataset.angle + '°';
        updateGradient();
    });
});

// Copy CSS
copyCssBtn.addEventListener('click', () => {
    cssOutput.select();
    document.execCommand('copy');
    alert('CSS copied to clipboard!');
});

// Initialize
renderStops();
updateGradient();