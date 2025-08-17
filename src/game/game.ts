import { gameContainer } from "..";
import { easings, tween, tweens } from "../systems/animation";
import { el, mount, svgEl } from "../helpers/dom";
import { mathRandomInteger } from "../helpers/numbers";
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

	const x = mathRandomInteger(0, gameContainer.clientWidth - 50);
	const y = mathRandomInteger(0, gameContainer.clientHeight - 50);
	const rotation = mathRandomInteger(-30, 30);

	catEyes.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

	mount(gameContainer, catEyes);

	const disappearTimeout = setTimeout(() => {
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
