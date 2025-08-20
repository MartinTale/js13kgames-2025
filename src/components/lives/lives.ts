import { el, mount, svgEl } from "../../helpers/dom";
import { state } from "../../systems/state";
import { SVGs } from "../../systems/svgs";
import { tween, easings } from "../../systems/animation";
import { playSound, sounds } from "../../systems/music";
import "./lives.css";

export function createLivesContainer(parent: HTMLElement): void {
	const livesContainer = el("div.lives-container");
	const hearts: HTMLElement[] = [];

	for (let i = 0; i < state.maxLives.value; i++) {
		const heartContainer = el("div");
		heartContainer.style.position = "relative";
		heartContainer.style.display = "inline-block";

		const heartIcon = svgEl(SVGs.hearts, "#a81f1fff");
		mount(heartContainer, heartIcon);
		hearts.push(heartIcon);
		mount(livesContainer, heartContainer);
	}

	let previousLives = state.lives.value;

	const updateLives = (lives: number) => {
		for (let i = 0; i < state.maxLives.value; i++) {
			if (i < lives) {
				hearts[i].classList.remove("used");
			} else if (i >= lives && i < previousLives) {
				// This heart was just lost - show scratch effect
				showScratchEffect(hearts[i]);
				hearts[i].classList.add("used");
			} else {
				hearts[i].classList.add("used");
			}
		}
		previousLives = lives;
	};

	const showScratchEffect = (heart: HTMLElement) => {
		// Play scratch sound
		playSound(sounds.scratch);

		// Create scratch overlay
		const scratchOverlay = svgEl(SVGs.tripleScratches, "#ff0000");
		scratchOverlay.style.position = "absolute";
		scratchOverlay.style.top = "0";
		scratchOverlay.style.left = "0";
		scratchOverlay.style.width = "100%";
		scratchOverlay.style.height = "100%";
		scratchOverlay.style.zIndex = "10";
		scratchOverlay.style.pointerEvents = "none";

		// Add scratch overlay to heart's container
		const heartContainer = heart.parentElement!;
		mount(heartContainer, scratchOverlay);

		// Animate scratch effect
		tween(scratchOverlay, {
			to: { opacity: 0 },
			duration: 800,
			easing: easings.easeOutQuad,
			onComplete: () => {
				scratchOverlay.remove();
			},
		});
	};

	state.lives.subscribe(updateLives);

	updateLives(state.lives.value);

	mount(parent, livesContainer);
}
