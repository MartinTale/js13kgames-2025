import { el, mount } from "../../helpers/dom";
import { state } from "../../systems/state";
import { createButton } from "../button/button";
import "./game-over.css";

let gameOverTrigger: (() => void) | null = null;

export function createGameOverScreen(parent: HTMLElement): void {
	const gameOverContainer = el("div.game-over-container");
	const gameOverText = el("h1", "Game Over");
	const scoreElement = el("p.final-score");
	const survivalTimeElement = el("p.survival-time");
	const restartButton = createButton(
		"Restart",
		() => {
			window.location.reload();
		},
		"primary",
	);

	mount(gameOverContainer, gameOverText);
	mount(gameOverContainer, scoreElement);
	mount(gameOverContainer, survivalTimeElement);
	mount(gameOverContainer, restartButton);

	gameOverTrigger = () => {
		const survivalTime = (Date.now() - state.gameStartedAt.value) / 1000;
		scoreElement.innerHTML = `🏆&nbsp;<span style='font-weight: bold; color: #ffd700;'>${state.score.value}</span>`;
		survivalTimeElement.innerHTML = `⏱️&nbsp;<span style='font-weight: bold;'>${survivalTime.toFixed(2)}s</span>`;

		// Hide the in-game UI elements
		const scoreDisplay = parent.querySelector(".score-container") as HTMLElement;
		const livesDisplay = parent.querySelector(".lives-container") as HTMLElement;
		const levelDisplay = parent.querySelector(".level-container") as HTMLElement;
		if (scoreDisplay) scoreDisplay.style.display = "none";
		if (livesDisplay) livesDisplay.style.display = "none";
		if (levelDisplay) levelDisplay.style.display = "none";

		gameOverContainer.classList.add("active");
	};

	mount(parent, gameOverContainer);
}

export function triggerGameOver(): void {
	if (gameOverTrigger) {
		gameOverTrigger();
	}
}
