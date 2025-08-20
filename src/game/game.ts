import { gameContainer } from "..";
import { easings, tween, tweens } from "../systems/animation";
import { el, mount, svgEl } from "../helpers/dom";
import { clamp, mathRandomInteger, randomInteger } from "../helpers/numbers";
import { state } from "../systems/state";
import { SVGs } from "../systems/svgs";
import "./game.css";

let spawnInterval = 2000;
let lastSpawn = 0;

const catEyePositions: { x: number; y: number; id: string }[] = [];
const MIN_DISTANCE = 150; // Minimum distance between centers of cat eyes
const CAT_EYE_SIZE = 100; // Assumed size of the cat eye for collision detection
const Y_OFFSET = 70;

export function initGame(): void {}

export function startGameLoop(): void {
	state.gameStartedAt.value = Date.now();
	processGameState();
}

function spawnCatEyes(): void {
	const { clientWidth, clientHeight } = gameContainer;
	let x: number;
	let y: number;
	let rotation: number;
	let clampedX: number;
	let clampedY: number;
	let attempts = 0;
	const MAX_ATTEMPTS = 10; // Max attempts to find a clear spot

	const catEyeId = `cat-eye-${Date.now()}-${Math.random().toString(36).substring(7)}`; // Unique ID for tracking

	do {
		x = mathRandomInteger(0, clientWidth);
		y = mathRandomInteger(0, clientHeight);
		rotation = mathRandomInteger(-30, 30);

		clampedX = clamp(x, CAT_EYE_SIZE / 2, clientWidth - CAT_EYE_SIZE / 2);
		clampedY = clamp(y, Y_OFFSET + CAT_EYE_SIZE / 2, clientHeight - CAT_EYE_SIZE / 2 - Y_OFFSET);

		let collision = false;
		for (const existingCatEye of catEyePositions) {
			const distance = Math.sqrt(
				Math.pow(clampedX - existingCatEye.x, 2) + Math.pow(clampedY - existingCatEye.y, 2),
			);
			if (distance < MIN_DISTANCE) {
				collision = true;
				break;
			}
		}

		if (!collision) {
			// No collision, add to positions and break loop
			catEyePositions.push({
				x: clampedX,
				y: clampedY,
				id: catEyeId,
			});
			break;
		}

		attempts++;
		if (attempts >= MAX_ATTEMPTS) {
			console.warn("Could not find a suitable spot for cat eye after multiple attempts.");
			return; // Give up after max attempts
		}
	} while (true);

	const catEyes = el("div.eyes");
	const catEyesSvg = svgEl(SVGs.evilEyes, "#fff");
	mount(catEyes, catEyesSvg);

	catEyes.style.transform = `translate(${clampedX}px, ${clampedY}px) rotate(${rotation}deg)`;

	mount(gameContainer, catEyes);

	const removeCatEyeFromTracking = (id: string) => {
		const index = catEyePositions.findIndex((ce) => ce.id === id);
		if (index > -1) {
			catEyePositions.splice(index, 1);
		}
	};

	const disappearTimeout = setTimeout(() => {
		if (state.lives.value > 0) {
			state.lives.value = state.lives.value - 1;
		}

		catEyes.style.pointerEvents = "none";
		catEyesSvg.style.fill = "#f00";

		tween(catEyes, {
			to: { scale: 2 },
			duration: 300,
			easing: easings.easeOutBack,
			onComplete: () => {
				tween(catEyes, {
					to: { opacity: 0 },
					duration: 300,
					easing: easings.easeInExpo,
					onComplete: () => {
						catEyes.remove();
						removeCatEyeFromTracking(catEyeId); // Remove from tracking
					},
				});
			},
		});
	}, 2000);

	catEyes.addEventListener("click", () => {
		clearTimeout(disappearTimeout);

		tween(catEyes, {
			to: {
				opacity: 0,
				scale: 0,
			},
			duration: 300,
			easing: easings.easeInBack,
			onComplete: () => {
				catEyes.remove();
				removeCatEyeFromTracking(catEyeId); // Remove from tracking
			},
		});
	});
}

function endGame(): void {
	const allEyes = document.querySelectorAll(".eyes");
	allEyes.forEach((eye) => eye.remove());
	catEyePositions.length = 0;
}

function processGameState(): void {
	if (state.lives.value <= 0) {
		endGame();
		return;
	}

	const newProcessingTime = Date.now();
	// const secondsPassed = (newProcessingTime - state.lastProcessedAt.value) / 1000;

	Object.values(tweens).forEach((updateTween) => updateTween(newProcessingTime));

	if (newProcessingTime - lastSpawn > spawnInterval) {
		spawnCatEyes();
		lastSpawn = newProcessingTime;
		spawnInterval = mathRandomInteger(500, 2000);
	}

	state.lastProcessedAt.value = newProcessingTime;
	requestAnimationFrame(processGameState);
}
