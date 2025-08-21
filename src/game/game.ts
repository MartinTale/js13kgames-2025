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
	const canSpawnHeart = state.lives.value < state.maxLives.value;

	if (random < 0.3) {
		catEyeType = "evil";
	} else if (canSpawnHeart && random < 0.5) {
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
		leftHeart.querySelector("path")!.setAttribute("stroke", "#ff69b4");
		leftHeart.querySelector("path")!.setAttribute("stroke-width", "32");

		rightHeart.querySelector("path")!.setAttribute("fill", "none");
		rightHeart.querySelector("path")!.setAttribute("stroke", "#ff69b4");
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
		const leftX = svgEl(SVGs.x, "#999");
		const rightX = svgEl(SVGs.x, "#999");

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
					y: clamp(clampedY, Y_OFFSET + CAT_EYE_SIZE / 2, clientHeight - CAT_EYE_SIZE / 2 - Y_OFFSET),
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
	}, 2000);

	catEyes.addEventListener("click", () => {
		if (gameInteractionsDisabled) return;

		clearTimeout(disappearTimeout);

		catEyes.style.zIndex = "11";
		catEyes.style.pointerEvents = "none";
		catEyes.style.backgroundColor = "transparent";
		catEyes.style.boxShadow = "none";

		playSound(sounds.meow);

		if (catEyeType === "heart") {
			// Heart eyes restore a life when tapped
			if (state.lives.value < state.maxLives.value) {
				state.lives.value = state.lives.value + 1;
			}

			// Change color of both heart eyes when disappearing
			const heartEyes = catEyes.querySelectorAll("svg");
			heartEyes.forEach((heart) => {
				heart.querySelector("path")!.setAttribute("fill", "#ff69b4");
			});

			tween(catEyes, {
				to: {
					scale: 1.5,
					rotate: rotation > 0 ? mathRandomInteger(-10, -5) : mathRandomInteger(5, 10),
					x: clamp(clampedX, CAT_EYE_SIZE / 2, clientWidth - CAT_EYE_SIZE / 2),
					y: clamp(clampedY, Y_OFFSET + CAT_EYE_SIZE / 2, clientHeight - CAT_EYE_SIZE / 2 - Y_OFFSET),
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
					y: clamp(clampedY, Y_OFFSET + CAT_EYE_SIZE / 2, clientHeight - CAT_EYE_SIZE / 2 - Y_OFFSET),
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
		spawnInterval = mathRandomInteger(500, 2000);
	}

	state.lastProcessedAt.value = newProcessingTime;
	requestAnimationFrame(processGameState);
}
