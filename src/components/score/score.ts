import { el, mount } from "../../helpers/dom";
import { state } from "../../systems/state";
import { tween, easings } from "../../systems/animation";
import "./score.css";

export function createScoreContainer(parent: HTMLElement): void {
	const scoreContainer = el("div.score-container");
	const scoreValue = el("span.score-value", "0");

	mount(scoreContainer, scoreValue);

	let currentDisplayScore = 0;
	let isAnimating = false;

	const updateScore = (targetScore: number) => {
		if (isAnimating) return;

		if (currentDisplayScore === targetScore) {
			scoreValue.textContent = targetScore.toString();
			return;
		}

		// Don't animate when resetting score to 0
		if (targetScore === 0) {
			currentDisplayScore = 0;
			scoreValue.textContent = "0";
			return;
		}

		isAnimating = true;
		const startScore = currentDisplayScore;
		const scoreDiff = targetScore - startScore;

		// Add bounce effect to score container
		tween(scoreContainer, {
			to: { scale: 1.1 },
			duration: 100,
			easing: easings.easeOutBack,
			onComplete: () => {
				tween(scoreContainer, {
					to: { scale: 1 },
					duration: 100,
					easing: easings.easeOutBack,
				});
			},
		});

		// Animate the score counting up using requestAnimationFrame
		const duration = Math.min(500, Math.abs(scoreDiff) * 30);
		const startTime = Date.now();

		const animateScore = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Ease out quad function
			const easedProgress = 1 - Math.pow(1 - progress, 2);

			currentDisplayScore = Math.round(startScore + scoreDiff * easedProgress);
			scoreValue.textContent = currentDisplayScore.toString();

			if (progress < 1) {
				requestAnimationFrame(animateScore);
			} else {
				currentDisplayScore = targetScore;
				scoreValue.textContent = targetScore.toString();
				isAnimating = false;
			}
		};

		requestAnimationFrame(animateScore);
	};

	state.score.subscribe(updateScore);
	updateScore(state.score.value);

	mount(parent, scoreContainer);
}
