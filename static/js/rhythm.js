// if new BPM is outside +-25% of the previous value, reset algorithm
const RESET_THRES = 0.25;
const QUEUE_SIZE = 16; // larger = smoother

let lastBPM = null;
let taps = Array(QUEUE_SIZE).fill(null);

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

        if (Math.abs(BPM - lastBPM) > lastBPM * RESET_THRES) {
            BPM = 0;
            resetBPMAlgorithm();
        }
    }

    console.log(taps);
    return BPM;
}

$(document).ready(function () {
    const tapButton = document.getElementById("tapButton");
    const bpmDisplay = document.getElementById("bpmDisplay");

    tapButton.addEventListener("click", () => {
        bpmDisplay.textContent = updateAndGetBPM().toFixed(3);
    });
});
