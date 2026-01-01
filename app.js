// Core app logic - FIXED version with proper tool display

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
let currentTool = null;

function showTool(toolId) {
    const content = document.getElementById('tool-content');
    
    // Move current tool back to its hidden container if switching
    if (currentTool && currentTool !== toolId) {
        const currentCard = content.querySelector('.tool-card');
        if (currentCard) {
            const originalContainer = document.getElementById(currentTool + '-tool');
            if (originalContainer) {
                originalContainer.appendChild(currentCard);
            }
        }
    }
    
    // Clear content
    content.innerHTML = '';

    // Hide views
    document.getElementById('cad-gallery').classList.add('hidden');
    document.getElementById('cad-tool-view').classList.add('hidden');

    if (toolId === 'gallery') {
        document.getElementById('cad-gallery').classList.remove('hidden');
        document.getElementById('tool-title').textContent = '';
        currentTool = null;
    } else {
        document.getElementById('cad-tool-view').classList.remove('hidden');
        
        const titles = {
            'random-color': 'Random Color Generator',
            'color-picker': 'Advanced Color Picker',
            'gradient': 'Gradient Generator',
            'palette': 'Palette Generator from Image'
        };
        document.getElementById('tool-title').textContent = titles[toolId] || 'Tool';

        // Move the tool card from hidden container to view
        const originalContainer = document.getElementById(toolId + '-tool');
        const toolCard = originalContainer.querySelector('.tool-card');
        if (toolCard) {
            content.appendChild(toolCard);
        }

        currentTool = toolId;
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
    const input = document.querySelector(`#${inputId}`); // querySelector because ID might be in cloned/moved content
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