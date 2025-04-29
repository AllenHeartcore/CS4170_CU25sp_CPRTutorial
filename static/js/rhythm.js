// if new BPM is outside +-20% of the previous value, reset algorithm
const RESET_THRES_BPMPCT = 0.2;

// if the next tap doesn't arrive within 1.5 seconds, reset algorithm
const RESET_THRES_TIMEOUT = 1500;

// and the lower bound counterpart, together restricting BPM to 40-240 (metronome range)
const RESET_THRES_TIMEIN = 250; // strange naming, bruh

const QUEUE_SIZE = 16; // larger = smoother; taken from FL Studio
const ANIMATION_DUR = 200; // ms

let lastBPM = null;
let taps = Array(QUEUE_SIZE).fill(null);

function setup() {
    // 240×240px ≈ 15rem @16px
    const canvas = createCanvas(240, 240);
    canvas.parent("p5Canvas");
    angleMode(DEGREES);
    noStroke();
}

function draw() {
    clear();
    translate(width / 2, height / 2);

    let validTaps = taps.filter((time) => time !== null);
    let fillAngle = (validTaps.length / QUEUE_SIZE) * 360;

    fill("hsl(0, 100%, 65%)");
    arc(0, 0, width, height, -90, -90 + fillAngle, PIE);

    fill("hsl(0, 100%, 30%)");
    arc(0, 0, width, height, -90 + fillAngle, 270, PIE);
}

function resetBPMAlgorithm() {
    lastBPM = null;
    taps.fill(null);
    taps.push(Date.now()); // warm restart;
    // otherwise counter zeros out for 2 taps
}

function updateAndGetBPM() {
    const now = Date.now();
    taps.shift();
    taps.push(now);

    let validTaps = taps.filter((time) => time !== null);
    let BPM = 0;

    if (validTaps.length > 1) {
        BPM =
            ((validTaps.length - 1) * 60000) /
            (validTaps[validTaps.length - 1] - validTaps[0]);

        lastBPM = lastBPM || BPM; // edge case

        if (
            Math.abs(BPM - lastBPM) > lastBPM * RESET_THRES_BPMPCT ||
            now - validTaps[validTaps.length - 2] > RESET_THRES_TIMEOUT ||
            now - validTaps[validTaps.length - 2] < RESET_THRES_TIMEIN
        ) {
            BPM = 0;
            resetBPMAlgorithm();
        }
    }

    return BPM;
}

$(document).ready(function () {
    const tapButton = document.getElementById("tapButton");
    const bpmDisplay = document.getElementById("bpmDisplay");

    tapButton.addEventListener("click", () => {
        bpmDisplay.textContent = updateAndGetBPM().toFixed(2);
    });
});
