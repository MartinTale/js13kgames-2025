import { el, mount } from "../../helpers/dom";
import { state } from "../../systems/state";
import "./score.css";

export function createScoreContainer(parent: HTMLElement): void {
	const scoreContainer = el("div.score-container");
	const scoreLabel = el("span.score-label", "Score: ");
	const scoreValue = el("span.score-value", "0");

	mount(scoreContainer, scoreLabel);
	mount(scoreContainer, scoreValue);

	const updateScore = (score: number) => {
		scoreValue.textContent = score.toString();
	};

	state.score.subscribe(updateScore);
	updateScore(state.score.value);

	mount(parent, scoreContainer);
}