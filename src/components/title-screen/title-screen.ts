import { createButton } from "../button/button";
import { el, mount, svgEl } from "../../helpers/dom";
import { state } from "../../systems/state";
import { formatNumber } from "../../helpers/format";
import { SVGs } from "../../systems/svgs";
import "./title-screen.css";

export const titleScreen = (startGameCallback: () => void) => {
	const screen = el("div.title-screen");

	const gameTitleContainer = el("div.game-title-container");

	const gameTitle = el("div.game-title", "Kitty Chaos");
	gameTitleContainer.appendChild(gameTitle);

	const gameSubtitle = el("div.game-subtitle", "cuteness with consequences");
	gameTitleContainer.appendChild(gameSubtitle);

	const startGameButton = createButton("Play", startGameCallback, "primary");
	gameTitleContainer.appendChild(startGameButton);

	screen.appendChild(gameTitleContainer);

	// Create leaderboard only if there are scores
	const scores = state.leaderboard.value;

	const leaderboardContainer = el("div.leaderboard");
	if (scores.length > 0) {
		const leaderboardTitle = el("h3.leaderboard-title", "Top Scores");
		leaderboardContainer.appendChild(leaderboardTitle);

		const leaderboardList = el("div.leaderboard-list");

		scores.forEach((score, index) => {
			const scoreItem = el("div.leaderboard-item");
			const rank = index + 1;

			// Add rank-specific classes
			if (rank === 1) {
				scoreItem.classList.add("rank-1");
			} else if (rank === 2) {
				scoreItem.classList.add("rank-2");
			} else if (rank === 3) {
				scoreItem.classList.add("rank-3");
			} else {
				scoreItem.classList.add("rank-lower");
			}

			scoreItem.innerHTML = `<span class="score">${formatNumber(score)}</span>`;
			leaderboardList.appendChild(scoreItem);
		});

		leaderboardContainer.appendChild(leaderboardList);
	}
	screen.appendChild(leaderboardContainer);

	// Add decorative eyes around the screen
	const eyePositions = [
		{ x: 50, y: 100, rotation: -15 },
		{ x: 280, y: 150, rotation: 25 },
		{ x: 30, y: 400, rotation: 45 },
		{ x: 300, y: 500, rotation: -30 },
	];

	eyePositions.forEach((pos) => {
		const eyeContainer = el("div.eyes.title-eyes");
		const eyeSvg = svgEl(SVGs.evilEyes, "#e67b7b");
		
		eyeContainer.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotation}deg)`;
		eyeContainer.style.opacity = "0.3";
		eyeContainer.style.pointerEvents = "none";
		
		mount(eyeContainer, eyeSvg);
		mount(screen, eyeContainer);
	});

	return screen;
};
