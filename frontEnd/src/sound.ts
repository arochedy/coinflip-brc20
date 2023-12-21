import buttonAudio from '../public/static/audio/button.mp3';
import winAudio from '../public/static/audio/win.mp3';
import loseAudio from '../public/static/audio/lose.mp3';
import leverDownAudio from '../public/static/audio/lever_down.mp3';
import leverUpAudio from '../public/static/audio/lever_up.mp3';
import coinAudio from '../public/static/audio/coin.mp3';
import flipingSideLongAudio from '../public/static/audio/fliping_side_long.mp3';

export function playWinAudio() {
    const winSound = new Audio(winAudio);
    winSound.play();
}

export function playLoseAudio() {
    const loseSound = new Audio(loseAudio);
    loseSound.play();
}


let buttonSound: HTMLAudioElement;
export function loadButtonAudio() {
    buttonSound = new Audio(buttonAudio);
}
export function playButtonAudio() {
    buttonSound.play();
}


let leverDownSound: HTMLAudioElement;
export function loadLeverDownAudio() {
    leverDownSound = new Audio(leverDownAudio);
}
export function playLeverDownAudio() {
    leverDownSound.play();
}

let leverUpSound: HTMLAudioElement;
export function loadLeverUpAudio() {
    leverUpSound = new Audio(leverUpAudio);
}
export function playLeverUpAudio() {
    leverUpSound.play();
}

export function playCoinAudio() {
    const coinSound = new Audio(coinAudio);
    coinSound.play();
}

export function playFlipingSideLongAudio() {
    const flipingSideLongSound = new Audio(flipingSideLongAudio);
    flipingSideLongSound.play();
    flipingSideLongSound.addEventListener('ended', function () {
        this.play();
    })
}