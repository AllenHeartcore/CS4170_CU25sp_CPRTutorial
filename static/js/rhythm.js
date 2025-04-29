// if new BPM is outside +-20% of the previous value, reset algorithm
const RESET_THRES_BPMPCT = 0.2;

// if the next tap doesn't arrive within 1.5 seconds, reset algorithm
const RESET_THRES_TIMEOUT = 1500;

// and the lower bound counterpart, together restricting BPM to 40-240 (metronome range)
const RESET_THRES_TIMEIN = 250; // strange naming, bruh

const QUEUE_SIZE = 16; // larger = smoother; taken from FL Studio

let lastBPM = null;
let taps = Array(QUEUE_SIZE).fill(null);
let tapCount = 0;

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

    // physics setup
    const Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Constraint = Matter.Constraint;

    const engine = Engine.create();
    const canvas = document.getElementById("physics-canvas");
    canvas.width = tapButton.offsetWidth;
    canvas.height = tapButton.offsetHeight;

    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: canvas.width,
            height: canvas.height,
            wireframes: false,
            background: "transparent",
        },
    });

    // static circle body behind the scenes (invisible)
    const circle = Bodies.circle(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2 - 5,
        { isStatic: true, render: { visible: false } }
    );
    World.add(engine.world, circle);

    // run Matter.js
    Engine.run(engine);
    Render.run(render);

    // on each tap: increment fill, animate a little physics dot dropping into place
    tapButton.addEventListener("click", () => {
        tapCount = Math.min(tapCount + 1, QUEUE_SIZE);
        const angle = (tapCount / QUEUE_SIZE) * 360;
        tapButton.style.setProperty("--fill-angle", angle + "deg");

        // if we reached full circle, turn green
        if (tapCount === QUEUE_SIZE) {
            tapButton.classList.add("full");
        }

        // spawn a small physics particle at the top edge of the button
        const r = 5;
        const x0 =
            canvas.width / 2 +
            Math.cos(-Math.PI / 2 + (angle / 180) * Math.PI) *
                (canvas.width / 2 - r);
        const y0 =
            canvas.height / 2 +
            Math.sin(-Math.PI / 2 + (angle / 180) * Math.PI) *
                (canvas.height / 2 - r);
        const particle = Bodies.circle(x0, y0, r, {
            restitution: 0.9,
            friction: 0.05,
            render: { fillStyle: "#ff4d4d" },
        });
        World.add(engine.world, particle);

        // attach it to the center with a spring so it “snaps” into place
        const spring = Constraint.create({
            bodyA: circle,
            pointA: { x: 0, y: 0 },
            bodyB: particle,
            stiffness: 0.02,
            damping: 0.1,
        });
        World.add(engine.world, spring);

        // after a few seconds, remove the particle & spring
        setTimeout(() => {
            World.remove(engine.world, particle);
            World.remove(engine.world, spring);
        }, 2500);

        // update BPM display as before
        bpmDisplay.textContent = updateAndGetBPM().toFixed(2);
    });
});
