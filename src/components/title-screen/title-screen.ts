import { createButton } from "../button/button";
import { el } from "../../helpers/dom";
import { state, ActionLogEntry } from "../../systems/state";
import { formatNumber } from "../../helpers/format";
import "./title-screen.css";

const formatTimestamp = (timestamp: number): string => {
	const date = new Date(timestamp);
	const now = new Date();
	const diff = now.getTime() - timestamp;
	
	if (diff < 60000) { // Less than 1 minute
		return "just now";
	} else if (diff < 3600000) { // Less than 1 hour
		const minutes = Math.floor(diff / 60000);
		return `${minutes}m ago`;
	} else {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
};

export const titleScreen = (startGameCallback: () => void) => {
	const screen = el("div.title-screen");

	const gameTitleContainer = el("div.game-title-container");

	const gameTitle = el("div.game-title", "Pet-A-Cat");
	gameTitleContainer.appendChild(gameTitle);

	const gameSubtitle = el("div.game-subtitle", "or get a scratch...");
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

	// Create action log display
	const actionLog = state.actionLog.value;
	const actionLogContainer = el("div.action-log");
	
	if (actionLog.length > 0) {
		const actionLogTitle = el("h3.action-log-title", "Recent Activity");
		actionLogContainer.appendChild(actionLogTitle);

		const actionLogList = el("div.action-log-list");
		
		// Show last 5 actions in reverse chronological order
		const recentActions = actionLog.slice(-5).reverse();
		
		recentActions.forEach((entry: ActionLogEntry) => {
			const actionItem = el("div.action-log-item");
			actionItem.classList.add(`action-${entry.type}`);
			
			const actionText = entry.type === "connect" ? "joined" : "left";
			const userIdShort = entry.userId.slice(0, 8);
			
			actionItem.innerHTML = `
				<span class="action-user">${userIdShort}</span>
				<span class="action-text">${actionText}</span>
				<span class="action-time">${formatTimestamp(entry.timestamp)}</span>
			`;
			
			actionLogList.appendChild(actionItem);
		});

		actionLogContainer.appendChild(actionLogList);
	} else {
		const emptyMessage = el("div.action-log-empty", "No recent activity");
		actionLogContainer.appendChild(emptyMessage);
	}
	
	screen.appendChild(actionLogContainer);

	return screen;
};
