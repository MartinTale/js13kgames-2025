import { createButton } from "../button/button";
import { el } from "../../helpers/dom";
import "./title-screen.css";

export const titleScreen = (startGameCallback: () => void) => {
	const screen = el("div.title-screen");

	const gameTitle = el("div.game-title", "Black Cat");
	screen.appendChild(gameTitle);

	const startGameButton = createButton("Start Game", startGameCallback, "primary");

	screen.appendChild(startGameButton);

	return screen;
};
