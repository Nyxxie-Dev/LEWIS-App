// Core app logic

function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');

    // Update sidebar active button
    document.querySelectorAll('.sidebar nav button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`button[onclick="showSection('${id}')"]`).classList.add('active');

    // Reset to gallery when entering CAD
    if (id === 'cad') {
        showTool('gallery');
    }
}

// Tool navigation inside CAD
function showTool(toolId) {
    document.getElementById('cad-gallery').classList.add('hidden');
    document.getElementById('cad-tool-view').classList.add('hidden');

    if (toolId === 'gallery') {
        document.getElementById('cad-gallery').classList.remove('hidden');
        document.getElementById('tool-title').textContent = '';
    } else {
        document.getElementById('cad-tool-view').classList.remove('hidden');
        
        const titles = {
            'random-color': 'Random Color Generator',
            'color-picker': 'Advanced Color Picker',
            'gradient': 'Gradient Generator',
            'palette': 'Palette Generator from Image'
        };
        document.getElementById('tool-title').textContent = titles[toolId] || 'Tool';

        // Clone the hidden original tool into view
        const original = document.getElementById(toolId + '-tool');
        const content = document.getElementById('tool-content');
        content.innerHTML = '';
        if (original) {
            content.appendChild(original.cloneNode(true));
        }
    }
}

// Gallery card clicks
document.addEventListener('click', (e) => {
    const card = e.target.closest('.gallery-card');
    if (card) {
        const tool = card.dataset.tool;
        showTool(tool);
    }
});

// Back button
document.getElementById('back-to-gallery').addEventListener('click', () => {
    showTool('gallery');
});

// Shared copy functions
function copyToClipboard(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.select();
        input.setSelectionRange(0, 99999);
        document.execCommand('copy');
        alert('Copied!');
    }
}

function copyFormat(id) {
    copyToClipboard(id);
}

// Load CAD gallery on start
window.onload = () => {
    showSection('cad');
};