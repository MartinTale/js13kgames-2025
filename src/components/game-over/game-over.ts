import { el, mount } from "../../helpers/dom";
import { state, addScoreToLeaderboard } from "../../systems/state";
import { createButton } from "../button/button";
import { formatNumber } from "../../helpers/format";
import "./game-over.css";

let gameOverTrigger: (() => void) | null = null;

export function createGameOverScreen(parent: HTMLElement): void {
	const gameOverContainer = el("div.game-over-container");
	const gameOverText = el("h1", "Game Over");
	const scoreElement = el("p.final-score");
	const subtitleElement = el("p.subtitle", "points");
	const restartButton = createButton(
		"Back",
		() => {
			window.location.reload();
		},
		"primary",
	);

	mount(gameOverContainer, gameOverText);
	mount(gameOverContainer, scoreElement);
	mount(gameOverContainer, subtitleElement);
	mount(gameOverContainer, restartButton);

	gameOverTrigger = () => {
		// Add score to leaderboard
		addScoreToLeaderboard(state.score.value);

		scoreElement.innerHTML = `<span style='font-weight: bold; color: #ffd700;'>${formatNumber(
			state.score.value,
		)}</span>`;

		// Hide the in-game UI elements
		const scoreDisplay = parent.querySelector(".score-container") as HTMLElement;
		const livesDisplay = parent.querySelector(".lives-container") as HTMLElement;
		const levelDisplay = parent.querySelector(".level-container") as HTMLElement;
		const progressDisplay = parent.querySelector(".level-progress-container") as HTMLElement;
		if (scoreDisplay) scoreDisplay.style.display = "none";
		if (livesDisplay) livesDisplay.style.display = "none";
		if (levelDisplay) levelDisplay.style.display = "none";
		if (progressDisplay) progressDisplay.style.display = "none";

		gameOverContainer.classList.add("active");
	};

	mount(parent, gameOverContainer);
}

export function triggerGameOver(): void {
	if (gameOverTrigger) {
		gameOverTrigger();
	}
}
