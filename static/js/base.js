/* =========================================
   TINK SHARED AUDIO
   ========================================= */

class TinkAudio {

    constructor() {
        this.ctx = null;

        const savedSound =
            localStorage.getItem('tink-sound');

        this.enabled =
            savedSound !== 'off';
    }


    init() {

        if (!this.ctx) {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {
                return;
            }

            this.ctx =
                new AudioContext();
        }


        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }


    playTink(
        frequency = 1200,
        type = 'sine'
    ) {

        if (!this.enabled) {
            return;
        }


        this.init();

        if (!this.ctx) {
            return;
        }


        const oscillator =
            this.ctx.createOscillator();

        const gain =
            this.ctx.createGain();


        oscillator.type = type;


        oscillator.frequency.setValueAtTime(
            frequency,
            this.ctx.currentTime
        );


        oscillator.frequency.exponentialRampToValueAtTime(
            frequency * 0.5,
            this.ctx.currentTime + 0.08
        );


        gain.gain.setValueAtTime(
            0.15,
            this.ctx.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            this.ctx.currentTime + 0.08
        );


        oscillator.connect(gain);

        gain.connect(
            this.ctx.destination
        );


        oscillator.start();

        oscillator.stop(
            this.ctx.currentTime + 0.08
        );
    }


    playClick() {
        this.playTink(
            750,
            'triangle'
        );
    }


    playPop() {
        this.playTink(
            800,
            'triangle'
        );
    }


    playWin() {

        if (!this.enabled) {
            return;
        }


        [
            600,
            800,
            1200
        ].forEach(
            (frequency, index) => {

                setTimeout(
                    () => {
                        this.playTink(
                            frequency
                        );
                    },
                    index * 80
                );
            }
        );
    }
}


window.sound =
    new TinkAudio();



/* =========================================
   TOOLBAR CONTROLS
   ========================================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const gridToggleButton =
            document.getElementById(
                'grid-toggle-btn'
            );


        const soundToggleButton =
            document.getElementById(
                'sound-toggle-btn'
            );


        const soundIcon =
            document.getElementById(
                'sound-status-icon'
            );


        const soundText =
            document.getElementById(
                'sound-text'
            );



        /* =========================================
           THEME
           ========================================= */

        function setTheme(theme) {

            document.body.classList.remove(
                'blueprint-mode',
                'paper-mode'
            );


            if (theme === 'paper') {

                document.body.classList.add(
                    'paper-mode'
                );


                if (gridToggleButton) {

                    gridToggleButton.innerHTML =
                        '<span>📐</span> Blueprint';
                }

            } else {

                document.body.classList.add(
                    'blueprint-mode'
                );


                if (gridToggleButton) {

                    gridToggleButton.innerHTML =
                        '<span>🛠️</span> Paper Grid';
                }
            }


            localStorage.setItem(
                'tink-theme',
                theme
            );
        }


        const savedTheme =
            localStorage.getItem(
                'tink-theme'
            ) || 'blueprint';


        setTheme(savedTheme);


        if (gridToggleButton) {

            gridToggleButton.addEventListener(
                'click',
                () => {

                    const isBlueprint =
                        document.body
                            .classList
                            .contains(
                                'blueprint-mode'
                            );


                    setTheme(
                        isBlueprint
                            ? 'paper'
                            : 'blueprint'
                    );


                    sound.playClick();
                }
            );
        }



        /* =========================================
           SOUND
           ========================================= */

        function updateSoundButton() {

            if (
                !soundIcon ||
                !soundText
            ) {
                return;
            }


            if (sound.enabled) {

                soundIcon.textContent =
                    '🔊';

                soundText.textContent =
                    'Sound On';

            } else {

                soundIcon.textContent =
                    '🔇';

                soundText.textContent =
                    'Sound Off';
            }
        }


        updateSoundButton();


        if (soundToggleButton) {

            soundToggleButton.addEventListener(
                'click',
                () => {

                    sound.enabled =
                        !sound.enabled;


                    localStorage.setItem(
                        'tink-sound',
                        sound.enabled
                            ? 'on'
                            : 'off'
                    );


                    updateSoundButton();


                    if (sound.enabled) {

                        sound.playTink(
                            1200
                        );
                    }
                }
            );
        }

    }
);