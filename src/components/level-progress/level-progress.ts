import { el, mount } from "../../helpers/dom";
import { state } from "../../systems/state";
import { getDifficultyConfig } from "../../game/game";
import { ProgressBar } from "../progress-bar/progress-bar";
import "./level-progress.css";

export function createLevelProgressContainer(parent: HTMLElement): void {
	const progressContainer = el("div.level-progress-container");
	const progressText = el("div.level-progress-text", "");

	// Create progress bar with initial values
	const progressBar = new ProgressBar(progressContainer, 0, 100, 0);
	mount(progressContainer, progressText);

	let currentDisplayScore = 0;
	let isAnimating = false;

	// Get all difficulty thresholds
	const DIFFICULTY_THRESHOLDS = [
		{ score: 0, level: 1 },
		{ score: 50, level: 2 },
		{ score: 100, level: 3 },
		{ score: 200, level: 4 },
		{ score: 350, level: 5 },
		{ score: 500, level: 6 },
		{ score: 750, level: 7 },
		{ score: 1000, level: 8 },
	];

	const updateProgress = () => {
		const currentScore = state.score.value;
		const currentLevel = state.level.value;
		const maxLevel = DIFFICULTY_THRESHOLDS[DIFFICULTY_THRESHOLDS.length - 1].level;

		if (currentLevel >= maxLevel) {
			// At max level - animate score counting
			progressBar.setValue(100);

			// Animate score counting if not already animating
			if (!isAnimating && currentDisplayScore !== currentScore) {
				isAnimating = true;
				const startScore = currentDisplayScore;
				const scoreDiff = currentScore - startScore;
				const duration = Math.min(500, Math.abs(scoreDiff) * 30);
				const startTime = Date.now();

				const animateScore = () => {
					const elapsed = Date.now() - startTime;
					const progress = Math.min(elapsed / duration, 1);

					// Ease out quad function
					const easedProgress = 1 - Math.pow(1 - progress, 2);

					currentDisplayScore = Math.round(startScore + scoreDiff * easedProgress);
					progressText.textContent = currentDisplayScore.toString();

					if (progress < 1) {
						requestAnimationFrame(animateScore);
					} else {
						currentDisplayScore = currentScore;
						progressText.textContent = currentScore.toString();
						isAnimating = false;
					}
				};

				requestAnimationFrame(animateScore);
			} else if (currentDisplayScore === currentScore) {
				progressText.textContent = currentScore.toString();
			}
			return;
		}

		// Find current and next level thresholds
		const currentThreshold = DIFFICULTY_THRESHOLDS.find((t) => t.level === currentLevel);
		const nextThreshold = DIFFICULTY_THRESHOLDS.find((t) => t.level === currentLevel + 1);

		if (!currentThreshold || !nextThreshold) return;

		// Calculate progress to next level
		const scoreInCurrentLevel = currentScore - currentThreshold.score;
		const scoreNeededForNextLevel = nextThreshold.score - currentThreshold.score;
		const progress = Math.min((scoreInCurrentLevel / scoreNeededForNextLevel) * 100, 100);

		// Update progress bar
		progressBar.setValue(progress);

		// Get current level config for color
		const currentLevelConfig = getDifficultyConfig(currentLevel);
		progressBar.progress.style.backgroundColor = currentLevelConfig.color;

		// Update text
		const scoreNeeded = nextThreshold.score - currentScore;
		const nextLevelConfig = getDifficultyConfig(currentLevel + 1);
		progressText.textContent = scoreNeeded > 0 ? `${scoreNeeded} to ${nextLevelConfig.name}` : "Level Up!";
	};

	state.score.subscribe(updateProgress);
	state.level.subscribe(updateProgress);
	updateProgress();

	mount(parent, progressContainer);
}
