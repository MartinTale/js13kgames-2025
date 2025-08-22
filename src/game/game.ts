import { gameContainer } from "..";
import { easings, tween, tweens } from "../systems/animation";
import { el, mount, svgEl } from "../helpers/dom";
import { clamp, mathRandomInteger } from "../helpers/numbers";
import { state } from "../systems/state";
import { SVGs } from "../systems/svgs";
import { triggerGameOver } from "../components/game-over/game-over";
import { playSound, sounds } from "../systems/music";
import "./game.css";

let spawnInterval = 2000;
let lastSpawn = 0;
let gameInteractionsDisabled = false;
let lastLifeTriggeringTime = 0;

// Difficulty progression thresholds
const DIFFICULTY_THRESHOLDS = [
	{ score: 0, spawnMin: 1500, spawnMax: 2500, visibilityDuration: 3000, level: 1, name: "Kitten", color: "#87CEEB" }, // Sky Blue
	{ score: 50, spawnMin: 1200, spawnMax: 2000, visibilityDuration: 2500, level: 2, name: "House Cat", color: "#98FB98" }, // Pale Green
	{ score: 100, spawnMin: 900, spawnMax: 1500, visibilityDuration: 2000, level: 3, name: "Alley Cat", color: "#F0E68C" }, // Khaki
	{ score: 200, spawnMin: 700, spawnMax: 1200, visibilityDuration: 1800, level: 4, name: "Wild Cat", color: "#DDA0DD" }, // Plum
	{ score: 350, spawnMin: 500, spawnMax: 1000, visibilityDuration: 1500, level: 5, name: "Hunter", color: "#FFA500" }, // Orange
	{ score: 500, spawnMin: 400, spawnMax: 800, visibilityDuration: 1300, level: 6, name: "Predator", color: "#FF6347" }, // Tomato
	{ score: 750, spawnMin: 300, spawnMax: 600, visibilityDuration: 1000, level: 7, name: "Nightmare", color: "#DC143C" }, // Crimson
	{ score: 1000, spawnMin: 200, spawnMax: 400, visibilityDuration: 750, level: 8, name: "Shadow", color: "#8B0000" }, // Dark Red
];

function getDifficultySettings() {
	const currentScore = state.score.value;
	let difficulty = DIFFICULTY_THRESHOLDS[0];

	for (const threshold of DIFFICULTY_THRESHOLDS) {
		if (currentScore >= threshold.score) {
			difficulty = threshold;
		} else {
			break;
		}
	}

	// Update level, difficulty name, and color in state
	if (state.level.value !== difficulty.level) {
		state.level.value = difficulty.level;
	}
	if (state.difficultyName.value !== difficulty.name) {
		state.difficultyName.value = difficulty.name;
	}
	if (state.difficultyColor.value !== difficulty.color) {
		state.difficultyColor.value = difficulty.color;
	}

	return difficulty;
}

const catEyePositions: { x: number; y: number; id: string; spawnTime: number; type: "evil" | "heart" | "dead" }[] = [];
const MIN_DISTANCE = 150; // Minimum distance between centers of cat eyes
const CAT_EYE_SIZE = 100; // Assumed size of the cat eye for collision detection
const Y_OFFSET = 70;

export function initGame(): void {}

export function startGameLoop(): void {
	state.gameStartedAt.value = Date.now();
	processGameState();
}

const removeCatEyeFromTracking = (id: string) => {
	const index = catEyePositions.findIndex((ce) => ce.id === id);
	if (index > -1) {
		catEyePositions.splice(index, 1);
	}
};

function spawnCatEyes(): void {
	// Determine cat eye type based on game state and randomness
	let catEyeType: "evil" | "heart" | "dead";

	const random = Math.random();

	if (random < 0.7) {
		catEyeType = "evil";
	} else if (random < 0.85) {
		catEyeType = "heart";
	} else {
		catEyeType = "dead";
	}

	const { clientWidth, clientHeight } = gameContainer;
	let x: number;
	let y: number;
	let rotation: number;
	let clampedX: number;
	let clampedY: number;
	let attempts = 0;
	const MAX_ATTEMPTS = 10; // Max attempts to find a clear spot

	const spawnTime = Date.now();
	const catEyeId = `cat-eye-${spawnTime}-${Math.random().toString(36).substring(7)}`; // Unique ID for tracking

	do {
		x = mathRandomInteger(0, clientWidth);
		y = mathRandomInteger(0, clientHeight);
		rotation = mathRandomInteger(-30, 30);

		if (rotation > -10 && rotation < 0) {
			rotation = mathRandomInteger(-30, -10);
		} else if (rotation >= 0 && rotation < 10) {
			rotation = mathRandomInteger(10, 30);
		}

		clampedX = clamp(x, CAT_EYE_SIZE / 2, clientWidth - CAT_EYE_SIZE / 2);
		clampedY = clamp(y, Y_OFFSET * 2 + CAT_EYE_SIZE / 2, clientHeight - CAT_EYE_SIZE / 2 - Y_OFFSET);

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
				spawnTime: spawnTime,
				type: catEyeType,
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

	if (catEyeType === "heart") {
		// Create two heart-shaped eyes
		const leftHeart = svgEl(SVGs.hearts, "transparent");
		const rightHeart = svgEl(SVGs.hearts, "transparent");

		leftHeart.querySelector("path")!.setAttribute("fill", "none");
		leftHeart.querySelector("path")!.setAttribute("stroke", "#fff"); // "#ff69b4");
		leftHeart.querySelector("path")!.setAttribute("stroke-width", "32");

		rightHeart.querySelector("path")!.setAttribute("fill", "none");
		rightHeart.querySelector("path")!.setAttribute("stroke", "#fff"); // "#ff69b4");
		rightHeart.querySelector("path")!.setAttribute("stroke-width", "32");

		leftHeart.style.position = "absolute";
		leftHeart.style.width = "30px";
		leftHeart.style.height = "30px";
		leftHeart.style.left = "15px";
		leftHeart.style.top = "35px";

		rightHeart.style.position = "absolute";
		rightHeart.style.width = "30px";
		rightHeart.style.height = "30px";
		rightHeart.style.right = "15px";
		rightHeart.style.top = "35px";

		mount(catEyes, leftHeart);
		mount(catEyes, rightHeart);
	} else if (catEyeType === "dead") {
		// Create two X-shaped dead eyes
		const leftX = svgEl(SVGs.x, "#fff"); // "#999");
		const rightX = svgEl(SVGs.x, "#fff"); // "#999");

		leftX.style.position = "absolute";
		leftX.style.width = "20px";
		leftX.style.height = "20px";
		leftX.style.left = "20px";
		leftX.style.top = "40px";

		rightX.style.position = "absolute";
		rightX.style.width = "20px";
		rightX.style.height = "20px";
		rightX.style.right = "20px";
		rightX.style.top = "40px";

		mount(catEyes, leftX);
		mount(catEyes, rightX);
	} else {
		const catEyesSvg = svgEl(SVGs.evilEyes, "#fff");

		mount(catEyes, catEyesSvg);
	}

	catEyes.setAttribute("data-id", catEyeId);
	catEyes.setAttribute("data-type", catEyeType);
	catEyes.style.transform = `translate(${clampedX}px, ${clampedY}px) rotate(${rotation}deg)`;

	mount(gameContainer, catEyes);

	// Use dynamic visibility duration based on difficulty
	const difficulty = getDifficultySettings();
	const disappearTimeout = setTimeout(() => {
		if (catEyeType === "heart") {
			// Heart eyes do nothing when they timeout (not tapped)
		} else if (catEyeType === "dead") {
			// Dead eyes do nothing when they timeout (not tapped)
		} else {
			// Evil eyes take a life when they disappear untapped
			if (state.lives.value > 0) {
				state.lastDamageType.value = "evil";
				state.lives.value = state.lives.value - 1;
				lastLifeTriggeringTime = spawnTime; // Track when this life-triggering cat eye was spawned
			}
		}

		catEyes.style.zIndex = "11";
		catEyes.style.pointerEvents = "none";
		catEyes.style.backgroundColor = "transparent";
		catEyes.style.boxShadow = "none";

		if (catEyeType === "heart") {
			const heartEyes = catEyes.querySelectorAll("svg");
			heartEyes.forEach((heart) => {
				heart.querySelector("path")!.setAttribute("stroke", "#ffffff66");
			});

			tween(catEyes, {
				to: {
					opacity: 0,
					scale: 0,
				},
				duration: 300,
				easing: easings.easeInBack,
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
		} else if (catEyeType === "dead") {
			// Dead eyes just fade out when they timeout
			const deadEyes = catEyes.querySelectorAll("svg");
			deadEyes.forEach((x) => {
				x.querySelector("path")!.setAttribute("fill", "#ffffff66");
			});

			tween(catEyes, {
				to: {
					opacity: 0,
					scale: 0,
				},
				duration: 300,
				easing: easings.easeInBack,
				onComplete: () => {
					catEyes.remove();
					removeCatEyeFromTracking(catEyeId);
				},
			});
		} else {
			const catEyesSvg = catEyes.querySelector("svg");
			if (catEyesSvg) {
				catEyesSvg.style.fill = "#f00";
			}

			tween(catEyes, {
				to: {
					scale: 2,
					rotate: rotation > 0 ? mathRandomInteger(-15, -5) : mathRandomInteger(5, 15),
					x: clamp(clampedX, CAT_EYE_SIZE / 2, clientWidth - CAT_EYE_SIZE / 2),
					y: clamp(clampedY, Y_OFFSET * 2 + CAT_EYE_SIZE / 2, clientHeight - CAT_EYE_SIZE / 2 - Y_OFFSET),
				},
				duration: 300,
				easing: easings.swingTo,
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
		}
	}, difficulty.visibilityDuration);

	catEyes.addEventListener("click", () => {
		if (gameInteractionsDisabled) return;

		clearTimeout(disappearTimeout);

		catEyes.style.zIndex = "11";
		catEyes.style.pointerEvents = "none";
		catEyes.style.backgroundColor = "transparent";
		catEyes.style.boxShadow = "none";

		if (catEyeType !== "dead") {
			playSound(sounds.meow);
		}

		if (catEyeType === "heart") {
			const heartEyes = catEyes.querySelectorAll("svg");

			if (state.lives.value < state.maxLives.value) {
				// Heart eyes restore a life when tapped and player has lost lives
				state.lives.value = state.lives.value + 1;

				// Change color to normal pink
				heartEyes.forEach((heart) => {
					// heart.querySelector("path")!.setAttribute("stroke", "#ff69b4");
					heart.querySelector("path")!.setAttribute("fill", "#ff69b4");
				});
			} else {
				// Heart eyes give bonus points when tapped and player has max lives
				state.score.value += 25;

				// Change color to gold for bonus points
				heartEyes.forEach((heart) => {
					// heart.querySelector("path")!.setAttribute("stroke", "#ffd700");
					heart.querySelector("path")!.setAttribute("fill", "#ffd700");
				});
			}

			tween(catEyes, {
				to: {
					scale: 1.5,
					rotate: rotation > 0 ? mathRandomInteger(-10, -5) : mathRandomInteger(5, 10),
					x: clamp(clampedX, CAT_EYE_SIZE / 2, clientWidth - CAT_EYE_SIZE / 2),
					y: clamp(clampedY, Y_OFFSET * 2 + CAT_EYE_SIZE / 2, clientHeight - CAT_EYE_SIZE / 2 - Y_OFFSET),
				},
				duration: 1000,
				easing: easings.elastic,
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
		} else if (catEyeType === "dead") {
			// Dead eyes lose a life when tapped
			if (state.lives.value > 0) {
				state.lastDamageType.value = "dead";
				state.lives.value = state.lives.value - 1;
				lastLifeTriggeringTime = spawnTime; // Track when this life-triggering cat eye was spawned
			}

			// Change color of both X eyes to red when tapped
			const deadEyes = catEyes.querySelectorAll("svg");
			deadEyes.forEach((x) => {
				x.querySelector("path")!.setAttribute("fill", "#ff0000");
			});

			tween(catEyes, {
				to: {
					scale: 2,
					rotate: rotation > 0 ? mathRandomInteger(-15, -5) : mathRandomInteger(5, 15),
					x: clamp(clampedX, CAT_EYE_SIZE / 2, clientWidth - CAT_EYE_SIZE / 2),
					y: clamp(clampedY, Y_OFFSET * 2 + CAT_EYE_SIZE / 2, clientHeight - CAT_EYE_SIZE / 2 - Y_OFFSET),
				},
				duration: 300,
				easing: easings.swingTo,
				onComplete: () => {
					tween(catEyes, {
						to: { opacity: 0 },
						duration: 200,
						easing: easings.easeInExpo,
						onComplete: () => {
							catEyes.remove();
							removeCatEyeFromTracking(catEyeId);
						},
					});
				},
			});
		} else {
			// Evil eyes give points when tapped
			state.score.value += 10;

			const evilEyes = catEyes.querySelectorAll("svg");
			evilEyes.forEach((evil) => {
				evil.querySelector("path")!.setAttribute("fill", "#ffffff66");
			});

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
		}
	});
}

function endGame(): void {
	gameInteractionsDisabled = true;

	// Instantly hide cat eyes spawned after the last life-triggering one
	const allEyes = document.querySelectorAll(".eyes");
	allEyes.forEach((eye) => {
		const eyeId = eye.getAttribute("data-id");
		if (eyeId) {
			const catEyeData = catEyePositions.find((ce) => ce.id === eyeId);
			if (catEyeData && (catEyeData.spawnTime > lastLifeTriggeringTime || catEyeData.type === "heart")) {
				tween(eye as HTMLElement, {
					to: {
						opacity: 0,
						scale: 0,
					},
					duration: 200,
					easing: easings.easeInBack,
					onComplete: () => {
						eye.remove();
						removeCatEyeFromTracking(eyeId); // Remove from tracking
					},
				});
			}
		}
	});

	setTimeout(() => {
		playSound(sounds.loss);
	}, 600);

	setTimeout(
		() => {
			allEyes.forEach((eye) => eye.remove());
			catEyePositions.length = 0;
			triggerGameOver();
		},
		state.lastDamageType.value === "dead" ? 1500 : 1000,
	);
}

function processGameState(): void {
	if (state.lives.value <= 0 && !gameInteractionsDisabled) {
		endGame();
	}

	const newProcessingTime = Date.now();
	// const secondsPassed = (newProcessingTime - state.lastProcessedAt.value) / 1000;

	Object.values(tweens).forEach((updateTween) => updateTween(newProcessingTime));

	if (newProcessingTime - lastSpawn > spawnInterval && !gameInteractionsDisabled) {
		spawnCatEyes();
		lastSpawn = newProcessingTime;

		// Use dynamic spawn intervals based on difficulty
		const difficulty = getDifficultySettings();
		spawnInterval = mathRandomInteger(difficulty.spawnMin, difficulty.spawnMax);
	}

	state.lastProcessedAt.value = newProcessingTime;
	requestAnimationFrame(processGameState);
}
