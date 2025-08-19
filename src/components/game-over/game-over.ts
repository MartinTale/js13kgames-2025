import { el, mount } from "../../helpers/dom";
import { state } from "../../systems/state";
import { createButton } from "../button/button";
import "./game-over.css";

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

	const showGameOver = (lives: number) => {
		if (lives <= 0) {
			const survivalTime = (Date.now() - state.gameStartedAt.value) / 1000;
			survivalTimeElement.innerHTML = `You survived for&nbsp;<span style='font-weight: bold;'>${survivalTime.toFixed(
				2,
			)} seconds.</span>`;
			gameOverContainer.classList.add("active");
		}
	};

	state.lives.subscribe(showGameOver);

	mount(parent, gameOverContainer);
}
