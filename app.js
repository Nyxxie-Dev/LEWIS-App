// Switch between sections and update active button
function showSection(id) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.add('hidden');
    });
    // Show selected
    document.getElementById(id).classList.remove('hidden');

    // Update active nav button
    document.querySelectorAll('.sidebar nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`button[onclick="showSection('${id}')"]`).classList.add('active');
}

// Copy to clipboard (used by multiple tools)
function copyToClipboard(inputId) {
    const input = document.getElementById(inputId);
    input.select();
    input.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');
    alert('Copied: ' + input.value);
}

// Show CAD by default on load
window.onload = () => {
    showSection('cad');
};