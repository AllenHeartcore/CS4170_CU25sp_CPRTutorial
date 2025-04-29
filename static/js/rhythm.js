/* ------------------------------ Constants for BPM algorithm */

// if new BPM is outside +-20% of the previous value, reset algorithm
const RESET_THRES_BPMPCT = 0.2;

// if the next tap doesn't arrive within 1.5 seconds, reset algorithm
const RESET_THRES_TIMEOUT = 1500;

// and the lower bound counterpart, together restricting BPM to 40-240 (metronome range)
const RESET_THRES_TIMEIN = 250; // strange naming, bruh

const QUEUE_SIZE = 16; // larger = smoother; taken from FL Studio

/* ------------------------------ Constants for p5.js animation */

const DARK_GREEN = "hsl(120, 80%, 25%)";
const BRIGHT_GREEN = "hsl(120, 80%, 50%)";
const DARK_RED = "hsl(0, 100%, 30%)";
const BRIGHT_RED = "hsl(0, 100%, 65%)";

// 240*240px ≈ 15rem @16px
const CANVAS_SIZE = 16 * 15;
const BUTTON_SIZE_IDLE = 12.8 * 15;
const BUTTON_SIZE_ACTIVE = 14.4 * 15;

const ANIM_DUR_PIE = 100; // ms
const ANIM_DUR_BOUNCE = 100;

/* ------------------------------ Bookkeeping variables */

let taps = Array(QUEUE_SIZE).fill(null);
let lastBPM = null;
let fillAngle = 0;

/* ------------------------------ p5.js functions */

function setup() {
    const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent("p5Canvas");
    angleMode(DEGREES);
    noStroke();
}

function draw() {
    clear();
    translate(width / 2, height / 2);
    const now = Date.now();

    let validTaps = taps.filter((time) => time !== null);
    let targetAngle = (validTaps.length / QUEUE_SIZE) * 360;
    fillAngle = lerp(
        fillAngle, // implies exponential curve
        targetAngle,
        Math.min(1, deltaTime / ANIM_DUR_PIE)
    );

    let colorBg, colorFg;
    // the color scheme should turn green
    // when the last gap is **starting** to close
    if (fillAngle > ((QUEUE_SIZE - 1) / QUEUE_SIZE) * 360) {
        colorBg = DARK_GREEN;
        colorFg = BRIGHT_GREEN;
    } else {
        colorBg = DARK_RED;
        colorFg = BRIGHT_RED;
    }

    let buttonSize = BUTTON_SIZE_IDLE;
    let lastTap = validTaps[validTaps.length - 1];
    let progress = (now - lastTap) / ANIM_DUR_BOUNCE;
    if (progress < 1) {
        buttonSize = lerp(
            BUTTON_SIZE_ACTIVE,
            BUTTON_SIZE_IDLE,
            abs(progress - 0.5) * 2
        );
    }

    fill(colorBg);
    arc(0, 0, buttonSize, buttonSize, -90, 270, PIE);
    fill(colorFg);
    arc(0, 0, buttonSize, buttonSize, -90, -90 + fillAngle, PIE);
}

/* ------------------------------ BPM functions */

function resetBPMAlgorithm() {
    lastBPM = null;
    taps.fill(null);
    taps.shift();
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

/* ------------------------------ Main */

$(document).ready(function () {
    const tapButton = document.getElementById("tapButton");
    const bpmDisplay = document.getElementById("bpmDisplay");

    tapButton.addEventListener("click", () => {
        bpmDisplay.textContent = updateAndGetBPM().toFixed(2);
    });
});
