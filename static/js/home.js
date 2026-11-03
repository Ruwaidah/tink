let count = 0;

// Letter Bounce Animation
function bounceLetter(el, freq) {
    sound.playTink(freq);
    el.classList.add('animate-bounce');
    incrementCounter();
    setTimeout(() => {
        el.classList.remove('animate-bounce');
    }, 800);
}

// Toggle Lightbulb Glow
function toggleBulb() {
    sound.playTink(1600);
    const bulb = document.getElementById('bulbIcon');
    if (bulb.classList.contains('bulb-lit')) {
        bulb.classList.remove('bulb-lit', 'text-amber-300');
        bulb.classList.add('text-slate-400');
    } else {
        bulb.classList.remove('text-slate-400');
        bulb.classList.add('bulb-lit', 'text-amber-300');
    }
    incrementCounter();
}

// Increment Tink Interaction Counter
function incrementCounter() {
    count++;
    document.getElementById('tinkCountText').innerText = `${count} Tinks`;
}

// Mascot Dialogue Interaction
const phrases = [
    "\"Keep tinkering! Great ideas start on graph paper.\"",
    "\"Did you know? Tic-Tac-Toe dates back over 3,000 years!\"",
    "\"Click my gear to hear a soft tink sound!\"",
    "\"Minesweeper is pure logical deduction.\"",
    "\"Need a brief break? Pick a puzzle above!\""
];

function interactMascot() {
    sound.playTink(1400);
    incrementCounter();
    const text = document.getElementById('mascotText');
    const next = phrases[Math.floor(Math.random() * phrases.length)];
    text.innerText = next;
}

// Mascot Eyes Tracking Cursor Movement
document.addEventListener('mousemove', (e) => {
    const eyeL = document.getElementById('eyeLeft');
    const eyeR = document.getElementById('eyeRight');
    if (!eyeL || !eyeR) return;

    const rect = eyeL.getBoundingClientRect();
    const anchorX = rect.left + rect.width / 2;
    const anchorY = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - anchorY, e.clientX - anchorX);
    const distance = Math.min(2, Math.hypot(e.clientX - anchorX, e.clientY - anchorY) / 50);

    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;

    eyeL.style.transform = `translate(${moveX}px, ${moveY}px)`;
    eyeR.style.transform = `translate(${moveX}px, ${moveY}px)`;
});