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
				// This heart was just lost - show damage effect
				showDamageEffect(hearts[i]);
				hearts[i].classList.add("used");
			} else {
				hearts[i].classList.add("used");
			}
		}
		previousLives = lives;
	};

	const showDamageEffect = (heart: HTMLElement) => {
		// Play scratch sound
		playSound(sounds.scratch);

		// Use X overlay for dead damage, scratch for evil damage
		const damageType = state.lastDamageType.value;
		let overlay;

		if (damageType === "dead") {
			// Create X overlay for dead cat eye damage
			overlay = svgEl(SVGs.x, "#666");
		} else {
			// Create scratch overlay for evil cat eye damage (default)
			overlay = svgEl(SVGs.tripleScratches, "#a81f1fff");
		}

		overlay.style.position = "absolute";
		overlay.style.top = damageType === "dead" ? "-2px" : "0";
		overlay.style.left = "0";
		overlay.style.width = "100%";
		overlay.style.height = "100%";
		overlay.style.zIndex = "10";
		overlay.style.pointerEvents = "none";

		if (damageType === "dead") {
			overlay.style.transform = "scale(1.5) rotate(45deg)";
		}

		// Add overlay to heart's container
		const heartContainer = heart.parentElement!;
		mount(heartContainer, overlay);

		if (damageType === "dead") {
			tween(overlay, {
				to: { rotate: 90, scale: 0.6 },
				duration: 500,
				easing: easings.easeOutBounce,
				onComplete: () => {
					tween(overlay, {
						to: { opacity: 0 },
						duration: 300,
						easing: easings.easeOutQuad,
						onComplete: () => {
							overlay.remove();
						},
					});
				},
			});
		} else {
			tween(overlay, {
				to: { opacity: 0 },
				duration: 800,
				easing: easings.easeOutQuad,
				onComplete: () => {
					overlay.remove();
				},
			});
		}
	};

	state.lives.subscribe(updateLives);

	updateLives(state.lives.value);

	mount(parent, livesContainer);
}
