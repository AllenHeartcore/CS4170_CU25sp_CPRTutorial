// if new BPM is outside +-20% of the previous value, reset algorithm
const RESET_THRES_BPMPCT = 0.2;

// if the next tap doesn't arrive within 1.5 seconds, reset algorithm
const RESET_THRES_TIMEOUT = 1500;

// and the lower bound counterpart, together restricting BPM to 40-240 (metronome range)
const RESET_THRES_TIMEIN = 250; // strange naming, bruh

const QUEUE_SIZE = 16; // larger = smoother; taken from FL Studio
const ANIMATION_DUR = 100; // ms

let taps = Array(QUEUE_SIZE).fill(null);
let lastBPM = null;
let fillAngle = 0;

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
    let targetAngle = (validTaps.length / QUEUE_SIZE) * 360;
    fillAngle = lerp(
        fillAngle,
        targetAngle,
        Math.min(1, deltaTime / ANIMATION_DUR)
    );

    let colorBg, colorFg;
    // the color scheme should turn green
    // when the last gap is **starting** to close
    if (fillAngle > ((QUEUE_SIZE - 1) / QUEUE_SIZE) * 360) {
        colorBg = "hsl(120, 80%, 25%)"; // dark green
        colorFg = "hsl(120, 80%, 50%)"; // bright green
    } else {
        colorBg = "hsl(0, 100%, 30%)"; // dark red
        colorFg = "hsl(0, 100%, 65%)"; // bright red
    }

    fill(colorBg);
    arc(0, 0, width, height, -90, 270, PIE);
    fill(colorFg);
    arc(0, 0, width, height, -90, -90 + fillAngle, PIE);
}

function resetBPMAlgorithm() {
    lastBPM = null;
    taps.fill(null);
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
