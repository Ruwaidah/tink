/* =========================================
   MINESWEEPER AUDIO
   ========================================= */

const AudioCtx =
    window.AudioContext ||
    window.webkitAudioContext;

let audioCtx = null;


function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioCtx();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}


/* Unlock browser audio after first interaction */

document.addEventListener(
    'click',
    () => {
        initAudio();
    },
    { once: true }
);


/* Explosion sound */

function playBoomSound() {

    // Use the site's shared sound setting
    if (
        typeof sound !== 'undefined' &&
        !sound.enabled
    ) {
        return;
    }


    initAudio();

    if (!audioCtx) return;


    const duration = 1.2;

    const bufferSize =
        audioCtx.sampleRate * duration;


    const buffer =
        audioCtx.createBuffer(
            1,
            bufferSize,
            audioCtx.sampleRate
        );


    const output =
        buffer.getChannelData(0);


    for (
        let i = 0;
        i < bufferSize;
        i++
    ) {
        output[i] =
            Math.random() * 2 - 1;
    }


    const whiteNoise =
        audioCtx.createBufferSource();

    whiteNoise.buffer = buffer;


    const filter =
        audioCtx.createBiquadFilter();

    filter.type = 'lowpass';


    filter.frequency.setValueAtTime(
        800,
        audioCtx.currentTime
    );


    filter.frequency.exponentialRampToValueAtTime(
        30,
        audioCtx.currentTime + duration
    );


    const gain =
        audioCtx.createGain();


    gain.gain.setValueAtTime(
        1,
        audioCtx.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + duration
    );


    whiteNoise.connect(filter);

    filter.connect(gain);

    gain.connect(
        audioCtx.destination
    );


    whiteNoise.start();
}



/* =========================================
   PARTICLE EXPLOSION
   ========================================= */

const particleCanvas =
    document.getElementById(
        'particleCanvas'
    );


const particleCtx =
    particleCanvas
        ? particleCanvas.getContext('2d')
        : null;


let particles = [];


/* Resize canvas to match board */

function resizeParticleCanvas() {

    if (!particleCanvas) {
        return;
    }


    particleCanvas.width =
        particleCanvas
            .parentElement
            .offsetWidth;


    particleCanvas.height =
        particleCanvas
            .parentElement
            .offsetHeight;
}


/* Create explosion particles */

function createExplosion(x, y) {

    if (
        !particleCanvas ||
        !particleCtx
    ) {
        return;
    }


    resizeParticleCanvas();

    particles = [];


    for (
        let i = 0;
        i < 60;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;


        const speed =
            Math.random() * 8 + 2;


        particles.push({

            x: x,
            y: y,


            vx:
                Math.cos(angle) *
                speed,


            vy:
                Math.sin(angle) *
                speed,


            radius:
                Math.random() * 4 + 2,


            color: [
                '#ff5252',
                '#ff7043',
                '#ffd54f',
                '#ffffff'
            ][
                Math.floor(
                    Math.random() * 4
                )
            ],


            alpha: 1,


            decay:
                Math.random() *
                0.03 +
                0.01
        });
    }


    requestAnimationFrame(
        animateParticles
    );
}


/* Animate explosion particles */

function animateParticles() {

    if (
        !particleCanvas ||
        !particleCtx
    ) {
        return;
    }


    particleCtx.clearRect(
        0,
        0,
        particleCanvas.width,
        particleCanvas.height
    );


    let alive = false;


    particles.forEach(
        (particle) => {

            if (
                particle.alpha > 0
            ) {

                alive = true;


                particle.x +=
                    particle.vx;

                particle.y +=
                    particle.vy;

                particle.alpha -=
                    particle.decay;


                particleCtx.save();


                particleCtx.globalAlpha =
                    Math.max(
                        0,
                        particle.alpha
                    );


                particleCtx.fillStyle =
                    particle.color;


                particleCtx.beginPath();


                particleCtx.arc(
                    particle.x,
                    particle.y,
                    particle.radius,
                    0,
                    Math.PI * 2
                );


                particleCtx.fill();

                particleCtx.restore();
            }
        }
    );


    if (alive) {

        requestAnimationFrame(
            animateParticles
        );
    }
}