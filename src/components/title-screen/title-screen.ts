import { createButton } from "../button/button";
import { el } from "../../helpers/dom";
import { state, addScoreToLeaderboard } from "../../systems/state";
import { formatNumber } from "../../helpers/format";
import "./title-screen.css";

export const titleScreen = (startGameCallback: () => void) => {
	const screen = el("div.title-screen");

	const gameTitle = el("div.game-title", "Shadow Cats");
	screen.appendChild(gameTitle);

	// Create leaderboard only if there are scores
	const scores = state.leaderboard.value;

	if (scores.length > 0) {
		const leaderboardContainer = el("div.leaderboard");
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
		screen.appendChild(leaderboardContainer);
	}

	const startGameButton = createButton("Play", startGameCallback, "primary");
	screen.appendChild(startGameButton);

	return screen;
};
