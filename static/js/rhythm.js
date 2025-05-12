/* ------------------------------ Constants for BPM algorithm */

// if new BPM is outside +-20% of the previous value, reset algorithm
const RESET_THRES_BPMPCT = 0.2;

// if the next tap doesn't arrive within 1.5 seconds, reset algorithm
const RESET_THRES_TIMEOUT = 1500;

// and the lower bound counterpart, together restricting BPM to 40-240 (metronome range)
const RESET_THRES_TIMEIN = 250; // strange naming, bruh

const QUEUE_SIZE = 16; // larger = smoother; taken from FL Studio

/* ------------------------------ Constants for p5.js layout */

// M stands for Meter
// (have to keep this short; otherwise Prettier break lines)
const M_CANVAS_W = 360;
const M_CANVAS_H = 60;
const M_VALID_MIN = 100;
const M_VALID_MAX = 120;
const M_SCALE_PAD = 40;
const M_FULL_PAD = 10;
const M_TICK_SEP = 20;
const M_SCALE_MIN = M_VALID_MIN - M_SCALE_PAD;
const M_SCALE_MAX = M_VALID_MAX + M_SCALE_PAD;
const M_FULL_MIN = M_SCALE_MIN - M_FULL_PAD;
const M_FULL_MAX = M_SCALE_MAX + M_FULL_PAD;

const DARK_RED = "hsl(0, 100%, 30%)";
const BRIGHT_RED = "hsl(0, 100%, 65%)";
const BRIGHT_YELLOW = "hsl(60, 90%, 65%)";
const DARK_GREEN = "hsl(120, 80%, 25%)";
const BRIGHT_GREEN = "hsl(120, 80%, 50%)";
const DARK_BLUE = "hsl(240, 70%, 35%)";
const BRIGHT_GRAY = "hsl(0, 0%, 90%)";
const BLACK = "hsl(0, 0%, 0%)";

// 240*240px ≈ 15rem @16px
const CANVAS_SIZE = 16 * 15;
const TIMER_SIZE_INNER = 15.2 * 15; // outer = canvas size
const BUTTON_SIZE_IDLE = 12.8 * 15;
const BUTTON_SIZE_ACTIVE = 14.4 * 15;

const TIMER_DUR = 18000; // 100 BPM * 30 times
const ANIM_DUR_PIE = 100; // ms
const ANIM_DUR_BOUNCE = 100;
const ANIM_DUR_NEEDLE = 150;

/* ------------------------------ Bookkeeping variables */

let taps = Array(QUEUE_SIZE).fill(null);
let ntaps = 0; // counts all taps, for display, may exceed QUEUE_SIZE
let firstTap = null;
let lastBPM = null;
let fillAngle = 0;

/* ------------------------------ p5.js button */

function setup() {
    const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent("p5ButtonCanvas");
    angleMode(DEGREES);
    noStroke();
}

function draw() {
    clear();
    translate(width / 2, height / 2);
    const now = Date.now();

    /* target & animation progress */
    let validTaps = taps.filter((time) => time !== null);
    let targetAngle = (validTaps.length / QUEUE_SIZE) * 360;
    fillAngle = lerp(
        fillAngle, // implies exponential curve
        targetAngle,
        Math.min(1, deltaTime / ANIM_DUR_PIE)
    );

    /* color scheme */
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

    /* button bounce state */
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

    /* draw progress arcs */
    fill(colorBg);
    arc(0, 0, buttonSize, buttonSize, -90, 270, PIE);
    fill(colorFg);
    arc(0, 0, buttonSize, buttonSize, -90, -90 + fillAngle, PIE);

    /* timer */
    let R = CANVAS_SIZE / 2;
    let r = TIMER_SIZE_INNER / 2;
    let timeLeft = Math.max(0, TIMER_DUR - (now - firstTap));
    let sTimeLeft = (timeLeft / 1000).toFixed(1).split(".");
    $("#timeDisplayMajor").text(sTimeLeft[0]);
    $("#timeDisplayMinor").text("." + sTimeLeft[1]);

    /* draw timer stroke */
    let timerAngle = (timeLeft / TIMER_DUR) * 360;
    push();
    // strokes are sticky, so instead of scattering noStroke()
    // all over the place, we put this special case in "brackets"
    noFill();
    stroke(DARK_BLUE);
    strokeWeight(R - r);
    arc(0, 0, R + r, R + r, -90, -90 + timerAngle);
    pop();
}

/* ------------------------------ p5.js meter */

const meter = new p5((p) => {
    p.targetNeedle = 0; // desired BPM
    p.displayedNeedle = 0; // smoothed needle

    p.setup = () => {
        const c = p.createCanvas(M_CANVAS_W, M_CANVAS_H);
        c.parent("p5MeterCanvas");
        p.textSize(12);
        p.textAlign(p.CENTER, p.TOP);
    };

    p.draw = () => {
        p.clear();

        p.noStroke();
        p.fill(BRIGHT_GRAY);
        p.rect(0, 0, p.width, p.height); // full range

        const sMinX = p.map(M_SCALE_MIN, M_FULL_MIN, M_FULL_MAX, 0, p.width);
        const sMaxX = p.map(M_SCALE_MAX, M_FULL_MIN, M_FULL_MAX, 0, p.width);
        p.fill(BRIGHT_YELLOW);
        p.rect(sMinX, 0, sMaxX - sMinX, p.height); // scale range

        const vMinX = p.map(M_VALID_MIN, M_FULL_MIN, M_FULL_MAX, 0, p.width);
        const vMaxX = p.map(M_VALID_MAX, M_FULL_MIN, M_FULL_MAX, 0, p.width);
        p.fill(BRIGHT_GREEN);
        p.rect(vMinX, 0, vMaxX - vMinX, p.height); // valid range

        p.stroke(BLACK);
        p.fill(BLACK);
        for (let v = M_SCALE_MIN; v <= M_SCALE_MAX; v += M_TICK_SEP) {
            const x = p.map(v, M_FULL_MIN, M_FULL_MAX, 0, p.width);
            p.line(x, p.height * 0.8, x, p.height); // ticks
            p.text(v, x, p.height * 0.55);
        }

        p.displayedNeedle = p.lerp(
            p.displayedNeedle, // a similar smooth algorithm
            p.targetNeedle,
            Math.min(1, p.deltaTime / ANIM_DUR_NEEDLE)
        );

        p.push(); // strokeWeight is sticky
        const nx = p.map(p.displayedNeedle, M_FULL_MIN, M_FULL_MAX, 0, p.width);
        p.stroke(BRIGHT_RED);
        p.strokeWeight(3);
        p.line(nx, 0, nx, p.height); // needle
        p.pop();
    };
});

/* ------------------------------ BPM functions */

function resetBPMAlgorithm() {
    const now = Date.now();
    taps.fill(null);
    taps.shift();
    taps.push(now); // warm restart;
    // otherwise counter zeros out for 2 taps

    ntaps = 1;
    firstTap = now;
    lastBPM = null;
}

function updateBPMDisplay(BPM, reset) {
    meter.targetNeedle = BPM;
    sBPM = BPM.toFixed(2).split("."); // avoid confusion with multiple conversions
    $("#bpmDisplayMajor").text(sBPM[0]);
    $("#bpmDisplayMinor").text("." + sBPM[1]);
    $("#tapsDisplay").text(ntaps.toString());

    $("#rhythmStatus").removeClass("text-red text-yellow text-green");
    $("#bpmDisplayMajor").removeClass("text-red text-yellow text-green");
    $("#bpmDisplayMinor").removeClass("text-red text-yellow text-green");

    if (ntaps < QUEUE_SIZE) {
        if (reset) {
            $("#rhythmStatus").text("Algorithm reset");
            $("#rhythmStatus").addClass("text-red");
        } else {
            $("#rhythmStatus").text("Keep going...");
            $("#rhythmStatus").addClass("text-yellow");
        }
    } else {
        $("#rhythmStatus").text("Stabilized!");
        $("#rhythmStatus").addClass("text-green");
        if (BPM > M_VALID_MIN && BPM < M_VALID_MAX) {
            $("#bpmDisplayMajor").addClass("text-green");
            $("#bpmDisplayMinor").addClass("text-green");
        } else if (BPM > M_FULL_MIN && BPM < M_FULL_MAX) {
            $("#bpmDisplayMajor").addClass("text-yellow");
            $("#bpmDisplayMinor").addClass("text-yellow");
        } else {
            $("#bpmDisplayMajor").addClass("text-red");
            $("#bpmDisplayMinor").addClass("text-red");
        }
    }
}

function updateBPM() {
    const now = Date.now();
    taps.shift();
    taps.push(now);
    ntaps += 1;

    let validTaps = taps.filter((time) => time !== null);
    let BPM = 0;
    let reset = false; // for updateBPMDisplay to tell apart initial and consequent 0 BPM

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
            reset = true;
            resetBPMAlgorithm();
        }
    } else {
        firstTap = now;
        // this may very well get pushed out of the queue,
        // which is perfectly fine, since both the timer
        // and the "overall average" feedback depend on it
    }

    updateBPMDisplay(BPM, reset);
}

/* Standalone peripheral: YouTube audio-only playback */

const STAY_ALIVE_YOUTUBE_ID = "fNFzfwLM72c";

let player;
let playing = false;

function onYouTubeIframeAPIReady() {
    player = new YT.Player("ytPlayer", {
        height: "0",
        width: "0",
        videoId: STAY_ALIVE_YOUTUBE_ID,
        playerVars: { autoplay: 0, controls: 0 },
        events: { onReady: (e) => player.setVolume(100) },
    });
}

/* ------------------------------ Main */

$(document).ready(function () {
    $("#tapButton").click(updateBPM);

    $("#rhythmHomeBtn").click(function () {
        window.location.href = "/";
    });

    $("#rhythmAssistToggle").click(function () {
        if (!player) return;
        let state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            player.pauseVideo();
            this.innerHTML = 'Music Assist <i class="bi bi-play-fill"></i>';
        } else {
            player.playVideo();
            this.innerHTML = 'Music Assist <i class="bi bi-pause-fill"></i>';
        }
    });
});
