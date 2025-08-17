import { el, mount } from "../../helpers/dom";
import { state } from "../../systems/state";
import { createButton } from "../button/button";
import "./game-over.css";

export function createGameOverScreen(parent: HTMLElement): void {
	const gameOverContainer = el("div.game-over-container");
	const gameOverText = el("h1", "Game Over");
	const restartButton = createButton("Restart", () => {
		window.location.reload();
	});

	mount(gameOverContainer, gameOverText);
	mount(gameOverContainer, restartButton);

	const showGameOver = (lives: number) => {
		if (lives <= 0) {
			gameOverContainer.classList.add("active");
		}
	};

	state.lives.subscribe(showGameOver);

	mount(parent, gameOverContainer);
}
