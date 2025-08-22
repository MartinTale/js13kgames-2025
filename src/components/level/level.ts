import { el, mount } from "../../helpers/dom";
import { state } from "../../systems/state";
import { tween, easings } from "../../systems/animation";
import "./level.css";

export function createLevelContainer(parent: HTMLElement): void {
	const levelContainer = el("div.level-container");
	const difficultyValue = el("span.difficulty-value", "Kitten");

	mount(levelContainer, difficultyValue);

	let previousLevel = 1;

	const updateDifficulty = (difficultyName: string) => {
		difficultyValue.textContent = difficultyName;
	};

	const updateLevel = (level: number) => {
		// Add level up animation when level increases
		if (level > previousLevel) {
			tween(levelContainer, {
				to: { scale: 1.2 },
				duration: 150,
				easing: easings.easeOutBack,
				onComplete: () => {
					tween(levelContainer, {
						to: { scale: 1 },
						duration: 150,
						easing: easings.easeOutBack
					});
				}
			});
		}
		previousLevel = level;
	};

	state.difficultyName.subscribe(updateDifficulty);
	state.level.subscribe(updateLevel);
	updateDifficulty(state.difficultyName.value);

	mount(parent, levelContainer);
}