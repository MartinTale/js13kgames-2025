import { gameContainer } from "..";
import { easings, tween, tweens } from "../systems/animation";
import { el, mount, svgEl } from "../helpers/dom";
import { clamp, mathRandomInteger } from "../helpers/numbers";
import { state } from "../systems/state";
import { SVGs } from "../systems/svgs";
import "./game.css";

let spawnInterval = 2000;
let lastSpawn = 0;

export function initGame(): void {
	//
}

export function startGameLoop(): void {
	processGameState();
}

function spawnCatEyes(): void {
	const catEyes = el("div.eyes");
	const catEyesSvg = svgEl(SVGs.evilEyes, "#fff");
	mount(catEyes, catEyesSvg);

	const { clientWidth, clientHeight } = gameContainer;
	const x = mathRandomInteger(0, clientWidth);
	const y = mathRandomInteger(0, clientHeight);
	const rotation = mathRandomInteger(-30, 30);

	const clampedX = clamp(x, x - 100, clientWidth - 100);
	const clampedY = clamp(y, y - 100, clientHeight - 100);

	console.log(clientWidth, clientHeight, x, y, clampedX, clampedY);

	catEyes.style.transform = `translate(${clampedX}px, ${clampedY}px) rotate(${rotation}deg)`;

	mount(gameContainer, catEyes);

	const disappearTimeout = setTimeout(() => {
		state.lives.value = state.lives.value - 1;
		tween(catEyes, {
			to: { scale: 0, opacity: 0 },
			duration: 500,
			easing: easings.easeInBack,
			onComplete: () => {
				catEyes.remove();
			},
		});
	}, 2000);

	catEyes.addEventListener("click", () => {
		clearTimeout(disappearTimeout);

		catEyesSvg.style.fill = "#f00";

		tween(catEyes, {
			to: { scale: 1.2, opacity: 0 },
			duration: 300,
			easing: easings.easeOutExpo,
			onComplete: () => {
				catEyes.remove();
			},
		});
	});
}

function processGameState(): void {
	if (state.lives.value <= 0) {
		return;
	}

	const newProcessingTime = Date.now();
	const secondsPassed = (newProcessingTime - state.lastProcessedAt.value) / 1000;

	Object.values(tweens).forEach((updateTween) => updateTween(newProcessingTime));

	if (newProcessingTime - lastSpawn > spawnInterval) {
		spawnCatEyes();
		lastSpawn = newProcessingTime;
		spawnInterval = mathRandomInteger(500, 2000);
	}

	state.level.value += secondsPassed;

	state.lastProcessedAt.value = newProcessingTime;
	requestAnimationFrame(processGameState);
}
