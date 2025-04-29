// if new BPM is outside +-20% of the previous value, reset algorithm
const RESET_THRES_BPMPCT = 0.2;

// if the next tap doesn't arrive within 1.5 seconds, reset algorithm
const RESET_THRES_TIMEOUT = 1500;

// and the lower bound counterpart, together restricting BPM to 40-240 (metronome range)
const RESET_THRES_TIMEIN = 250; // strange naming, bruh

const QUEUE_SIZE = 16; // larger = smoother; taken from FL Studio

let lastBPM = null;
let taps = Array(QUEUE_SIZE).fill(null);

let fillAngle = 0;
let targetAngle = 0;
let startAngle = 0;
let animStart = 0;
const animDur = 200; // ms

function setup() {
    // 240×240px ≈ 15rem @16px
    const canvas = createCanvas(240, 240);
    canvas.parent("physicsCanvas");
    angleMode(DEGREES);
    noStroke();

    // hook your button exactly as before
    select("#tapButton").mousePressed(() => {
        const bpm = updateAndGetBPM();
        select("#bpmDisplay").html(bpm.toFixed(2));
    });
}

function draw() {
    clear();
    translate(width / 2, height / 2);

    // compute new raw fill angle from taps[]
    const now = Date.now();
    const validTaps = taps.filter((t) => t !== null);
    if (validTaps.length > 1) {
        const last = validTaps[validTaps.length - 1];
        const prev = validTaps[validTaps.length - 2];
        const msPerBeat = last - prev;
        const elapsed = now - last;
        const rawAngle = constrain((elapsed / msPerBeat) * 360, 0, 360);

        if (rawAngle !== targetAngle) {
            startAngle = fillAngle;
            targetAngle = rawAngle;
            animStart = millis();
        }
    }

    // animate fillAngle → targetAngle in animDur ms
    if (fillAngle !== targetAngle) {
        const t = constrain((millis() - animStart) / animDur, 0, 1);
        fillAngle = lerp(startAngle, targetAngle, t);
    }

    // draw the two sectors
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
