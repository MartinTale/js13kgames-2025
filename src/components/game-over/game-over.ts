import { el, mount } from "../../helpers/dom";
import { state } from "../../systems/state";
import { createButton } from "../button/button";
import "./game-over.css";

let gameOverTrigger: (() => void) | null = null;

export function createGameOverScreen(parent: HTMLElement): void {
	const gameOverContainer = el("div.game-over-container");
	const gameOverText = el("h1", "Game Over");
	const survivalTimeElement = el("p.survival-time");
	const restartButton = createButton(
		"Restart",
		() => {
			window.location.reload();
		},
		"primary",
	);

	mount(gameOverContainer, gameOverText);
	mount(gameOverContainer, survivalTimeElement);
	mount(gameOverContainer, restartButton);

	gameOverTrigger = () => {
		const survivalTime = (Date.now() - state.gameStartedAt.value) / 1000;
		survivalTimeElement.innerHTML = `You survived for&nbsp;<span style='font-weight: bold;'>${survivalTime.toFixed(
			2,
		)} seconds.</span>`;
		gameOverContainer.classList.add("active");
	};

	mount(parent, gameOverContainer);
}

export function triggerGameOver(): void {
	if (gameOverTrigger) {
		gameOverTrigger();
	}
}
