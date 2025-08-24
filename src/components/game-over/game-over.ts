import { el, mount } from "../../helpers/dom";
import { state, addScoreToLeaderboard } from "../../systems/state";
import { formatNumber } from "../../helpers/format";
import { getDifficultyConfig } from "../../game/game";
import "./game-over.css";

let gameOverTrigger: (() => void) | null = null;

function adjustColorBrightness(color: string, amount: number): string {
	const hex = color.replace("#", "");
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	const newR = Math.max(0, Math.min(255, r + amount));
	const newG = Math.max(0, Math.min(255, g + amount));
	const newB = Math.max(0, Math.min(255, b + amount));

	return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB
		.toString(16)
		.padStart(2, "0")}`;
}

function getCongratulationMessage(score: number): string {
	if (score >= 1000) return "LEGENDARY!";
	if (score >= 750) return "INCREDIBLE!";
	if (score >= 500) return "AMAZING!";
	if (score >= 350) return "FANTASTIC!";
	if (score >= 200) return "AWESOME!";
	if (score >= 100) return "GREAT JOB!";
	if (score >= 50) return "WELL DONE!";
	if (score >= 25) return "NICE!";
	if (score > 0) return "GOOD TRY!";
	return "TRY AGAIN!";
}

export function createGameOverScreen(parent: HTMLElement): void {
	const gameOverContainer = el("div.game-over-container");
	const scoreElement = el("p.final-score");
	const subtitleElement = el("p.subtitle", "points");
	const instructionElement = el("p.instruction", "");
	const restartButton = el("button.difficulty-button", "PLAY AGAIN") as HTMLButtonElement;
	restartButton.onclick = () => {
		window.location.reload();
	};

	mount(gameOverContainer, scoreElement);
	mount(gameOverContainer, subtitleElement);
	mount(gameOverContainer, instructionElement);
	mount(gameOverContainer, restartButton);

	gameOverTrigger = () => {
		const finalScore = state.score.value;
		const currentLevel = state.level.value;
		const difficultyConfig = getDifficultyConfig(currentLevel);

		// Add score to leaderboard
		addScoreToLeaderboard(finalScore);

		// Update subtitle to show difficulty name or instructional text
		if (finalScore === 0) {
			// Set score display
			scoreElement.innerHTML = ``;
			subtitleElement.innerHTML = ``;
			instructionElement.innerHTML = `<span style="color: #ccc; font-size: 1rem;">Tap the cat eyes to score points!</span>`;
			instructionElement.style.display = "block";
		} else {
			// Set score display
			scoreElement.innerHTML = `<span style='font-weight: bold; color: ${difficultyConfig.color};'>${formatNumber(
				finalScore,
			)}</span>`;
			subtitleElement.innerHTML = `<span style="color: ${difficultyConfig.color};">points</span>`;
			instructionElement.style.display = "none";
		}

		// Update button text to show congratulation message and style with difficulty color
		restartButton.textContent = getCongratulationMessage(finalScore);

		// Apply difficulty-based color scheme to the button
		restartButton.style.setProperty("--difficulty-color", difficultyConfig.color);
		const darkerColor = adjustColorBrightness(difficultyConfig.color, -20);
		restartButton.style.setProperty("--difficulty-color-dark", darkerColor);

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
