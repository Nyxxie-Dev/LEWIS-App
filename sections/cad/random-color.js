// Random Color Generator Logic
document.getElementById('random-color-btn').addEventListener('click', () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    
    const hex = '#' + 
        r.toString(16).padStart(2, '0') + 
        g.toString(16).padStart(2, '0') + 
        b.toString(16).padStart(2, '0');

    document.getElementById('color-preview').style.backgroundColor = hex;
    document.getElementById('color-hex').value = hex.toUpperCase();
});