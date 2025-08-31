import { el, mount } from "../../helpers/dom";
import { state } from "../../systems/state";
import { tween, easings } from "../../systems/animation";
import { getDifficultyConfig } from "../../game/game";
import { ProgressBar } from "../progress-bar/progress-bar";
import { formatNumber } from "../../helpers/format";
import "./level-progress.css";

export function createLevelProgressContainer(parent: HTMLElement): void {
	const progressContainer = el("div.level-progress-container");
	const progressText = el("div.level-progress-text", "");

	// Create progress bar with initial values
	const progressBar = new ProgressBar(progressContainer, 0, 100, 0);
	mount(progressContainer, progressText);

	let currentDisplayScore = 0;
	let hasShownMaxLevelScore = false;
	let previousLevel = 1;

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

		// Add level up animation when level increases
		if (currentLevel > previousLevel) {
			tween(progressContainer, {
				to: { y: 4 },
				duration: 150,
				easing: easings.easeOutBounce,
				onComplete: () => {
					tween(progressContainer, {
						to: { y: 0 },
						duration: 150,
						easing: easings.easeOutBack,
					});
				},
			});
		}
		previousLevel = currentLevel;

		if (currentLevel >= maxLevel) {
			// At max level - animate score counting
			progressBar.setValue(100);

			// First time showing max level score - no animation
			if (!hasShownMaxLevelScore && currentScore >= 1000) {
				hasShownMaxLevelScore = true;
				currentDisplayScore = currentScore;
				progressText.textContent = formatNumber(currentScore);
				return;
			}

			if (hasShownMaxLevelScore === false) {
				return;
			}

			// Always update to the latest score - no animation blocking for rapid updates
			if (currentDisplayScore !== currentScore) {
				// If already animating, stop current animation and start new one with current display score as base
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
					progressText.textContent = formatNumber(currentDisplayScore);

					if (progress < 1) {
						requestAnimationFrame(animateScore);
					} else {
						currentDisplayScore = currentScore;
						progressText.textContent = formatNumber(currentScore);
					}
				};

				requestAnimationFrame(animateScore);
			} else {
				progressText.textContent = formatNumber(currentScore);
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
		if (scoreNeeded > 0) {
			const nextLevelConfig = getDifficultyConfig(currentLevel + 1);
			progressText.textContent = `${formatNumber(scoreNeeded)} to ${nextLevelConfig.name}`;
		} else {
			// Only show "Level Up!" if we're not at max level
			if (currentLevel < maxLevel) {
				progressText.textContent = "Level Up!";
			} else {
				progressText.textContent = formatNumber(currentScore);
			}
		}
	};

	state.score.subscribe(updateProgress);
	state.level.subscribe(updateProgress);
	updateProgress();

	mount(parent, progressContainer);
}
