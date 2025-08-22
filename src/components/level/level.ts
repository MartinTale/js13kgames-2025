import { el, mount } from "../../helpers/dom";
import { state } from "../../systems/state";
import { tween, easings } from "../../systems/animation";
import { getDifficultyConfig } from "../../game/game";
import "./level.css";

export function createLevelContainer(parent: HTMLElement): void {
	const levelContainer = el("div.level-container");
	const difficultyValue = el("span.difficulty-value", "Kitten");

	mount(levelContainer, difficultyValue);

	let previousLevel = 1;

	const updateLevel = (level: number) => {
		const config = getDifficultyConfig(level);
		
		// Update text and color
		difficultyValue.textContent = config.name;
		difficultyValue.style.color = config.color;
		
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

	state.level.subscribe(updateLevel);
	updateLevel(state.level.value);

	mount(parent, levelContainer);
}