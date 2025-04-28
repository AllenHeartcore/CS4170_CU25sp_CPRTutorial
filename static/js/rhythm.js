$(document).ready(function () {
    const tapButton = document.getElementById("tapButton");
    const bpmDisplay = document.getElementById("bpmDisplay");
    let taps = [];

    tapButton.addEventListener("click", () => {
        const now = Date.now();
        taps.push(now);
        taps = taps.filter((time) => now - time <= 10000);

        if (taps.length > 1) {
            const interval = (taps[taps.length - 1] - taps[0]) / 1000;
            const bpm = ((taps.length - 1) / interval) * 60;
            bpmDisplay.textContent = Math.round(bpm) + " BPM";
        } else {
            bpmDisplay.textContent = "Tap more!";
        }
    });
});
