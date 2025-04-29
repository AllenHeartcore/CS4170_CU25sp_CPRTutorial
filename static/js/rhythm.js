$(document).ready(function () {
    const tapButton = document.getElementById("tapButton");
    const bpmDisplay = document.getElementById("bpmDisplay");

    // if new BPM is outside +-25% of the previous value, reset algorithm
    const RESET_THRES = 0.25;
    const QUEUE_SIZE = 16; // larger = smoother
    let lastBPM = null;
    let taps = Array(QUEUE_SIZE).fill(null);

    tapButton.addEventListener("click", () => {
        const now = Date.now();
        taps.shift();
        taps.push(now);

        let validTaps = taps.filter((time) => time !== null);
        let validLength = validTaps.length;
        let BPM = 0;

        if (validTaps.length > 1) {
            BPM =
                ((validLength - 1) * 60000) /
                (validTaps[validLength - 1] - validTaps[0]);
            lastBPM = lastBPM || BPM;

            if (
                lastBPM !== null &&
                Math.abs(BPM - lastBPM) > lastBPM * RESET_THRES
            ) {
                // reset algorithm
                BPM = 0;
                lastBPM = null;
                taps.fill(null);
                taps[QUEUE_SIZE - 1] = now;
            }
        }

        bpmDisplay.textContent = BPM.toFixed(3);
    });
});
