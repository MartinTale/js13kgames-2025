import { el, mount, svgEl } from "../../helpers/dom";
import { state } from "../../systems/state";
import { SVGs } from "../../systems/svgs";
import "./lives.css";

export function createLivesContainer(parent: HTMLElement): void {
	const livesContainer = el("div.lives-container");
	const hearts: HTMLElement[] = [];

	for (let i = 0; i < state.maxLives.value; i++) {
		const heartIcon = svgEl(SVGs.hearts, "#a81f1fff");
		hearts.push(heartIcon);
		mount(livesContainer, heartIcon);
	}

	const updateLives = (lives: number) => {
		for (let i = 0; i < state.maxLives.value; i++) {
			if (i < lives) {
				hearts[i].classList.remove("used");
			} else {
				hearts[i].classList.add("used");
			}
		}
	};

	state.lives.subscribe(updateLives);

	updateLives(state.lives.value);

	mount(parent, livesContainer);
}
