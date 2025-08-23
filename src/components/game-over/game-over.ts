import { el, mount } from "../../helpers/dom";
import { state, addScoreToLeaderboard } from "../../systems/state";
import { createButton } from "../button/button";
import { formatNumber } from "../../helpers/format";
import { getDifficultyConfig } from "../../game/game";
import "./game-over.css";

let gameOverTrigger: (() => void) | null = null;

function getCongratulationMessage(score: number): string {
	if (score >= 1000) return "LEGENDARY!";
	if (score >= 750) return "INCREDIBLE!";
	if (score >= 500) return "AMAZING!";
	if (score >= 350) return "FANTASTIC!";
	if (score >= 200) return "AWESOME!";
	if (score >= 100) return "GREAT JOB!";
	if (score >= 50) return "WELL DONE!";
	if (score >= 25) return "NICE!";
	return "GOOD TRY!";
}

export function createGameOverScreen(parent: HTMLElement): void {
	const gameOverContainer = el("div.game-over-container");
	const scoreElement = el("p.final-score");
	const subtitleElement = el("p.subtitle", "points");
	const restartButton = createButton(
		"PLAY AGAIN",
		() => {
			window.location.reload();
		},
		"primary",
	);

	mount(gameOverContainer, scoreElement);
	mount(gameOverContainer, subtitleElement);
	mount(gameOverContainer, restartButton);

	gameOverTrigger = () => {
		const finalScore = state.score.value;
		const currentLevel = state.level.value;
		const difficultyConfig = getDifficultyConfig(currentLevel);

		// Add score to leaderboard
		addScoreToLeaderboard(finalScore);

		// Set score display
		scoreElement.innerHTML = `<span style='font-weight: bold; color: ${difficultyConfig.color};'>${formatNumber(
			finalScore,
		)}</span>`;

		// Update subtitle to show difficulty name
		subtitleElement.innerHTML = `<span style="color: ${difficultyConfig.color};">${difficultyConfig.name} Points</span>`;

		// Update button text to show congratulation message
		restartButton.textContent = getCongratulationMessage(finalScore);

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
