import { rng, uuidv4 } from "../helpers/numbers";
import { Signal, createSignal } from "./signals";

const STATE_KEY = "pet-a-cat";

export type Path = "sound" | "screen";

export type ActionLogEntry = {
	timestamp: number;
	type: "connect" | "disconnect";
	userId: string;
};

export type State = {
	id: Signal<string>;
	seed: Signal<number>;
	lastProcessedAt: Signal<number>;
	sound: Signal<boolean | null>;
	level: Signal<number>;
	lives: Signal<number>;
	maxLives: Signal<number>;
	gameStartedAt: Signal<number>;
	lastDamageType: Signal<"evil" | "dead" | null>;
	score: Signal<number>;
	leaderboard: Signal<number[]>;
	actionLog: Signal<ActionLogEntry[]>;
};

export const emptyState: State = {
	id: createSignal(uuidv4()),
	seed: createSignal(12),
	// seed: createSignal(Date.now()),
	lastProcessedAt: createSignal(Date.now()),
	sound: createSignal(null),
	level: createSignal(1),
	lives: createSignal(3),
	maxLives: createSignal(3),
	gameStartedAt: createSignal(0),
	lastDamageType: createSignal(null),
	score: createSignal(0),
	leaderboard: createSignal([]),
	actionLog: createSignal([]),
};

export let state: State;

let stateLoaded = false;
let autoSaveInterval: number;

export function initState() {
	loadState();

	autoSaveInterval = setInterval(saveState, 15000);
	globalThis.onbeforeunload = () => {
		saveState();
	};
}

export function resetState() {
	clearInterval(autoSaveInterval);
	globalThis.onbeforeunload = null;
	localStorage.removeItem(STATE_KEY);

	setTimeout(() => {
		globalThis.location.reload();
	}, 500);
}

function loadState() {
	const encodedState = localStorage.getItem(STATE_KEY);
	const decodedState = encodedState ? atob(encodedState) : "{}";
	const jsonState = JSON.parse(decodedState) as State | undefined;

	state = Object.entries(emptyState).reduce((acc, [key, signal]) => {
		acc[key] = jsonState?.[key] !== undefined ? createSignal(jsonState[key]) : signal;
		return acc;
	}, {} as State);

	rng.setSeed(state.seed.value);

	stateLoaded = true;
}

export function addScoreToLeaderboard(score: number) {
	// Don't add scores of 0 to the leaderboard
	if (score === 0) {
		return;
	}

	const currentLeaderboard = [...state.leaderboard.value];
	currentLeaderboard.push(score);
	currentLeaderboard.sort((a, b) => b - a); // Sort descending
	state.leaderboard.value = currentLeaderboard.slice(0, 5); // Keep top 5
}

export function addActionToLog(type: "connect" | "disconnect", userId: string) {
	const currentLog = [...state.actionLog.value];
	const newEntry: ActionLogEntry = {
		timestamp: Date.now(),
		type,
		userId,
	};
	
	currentLog.push(newEntry);
	// Keep only last 50 entries to prevent unbounded growth
	state.actionLog.value = currentLog.slice(-50);
}

function saveState() {
	if (!stateLoaded) {
		return;
	}

	state.seed.value = rng.getSeed();

	const jsonState = Object.entries(state).reduce(
		(acc, [key, signal]) => {
			acc[key] = signal.value;
			return acc;
		},
		{} as Record<string, any>,
	);

	const encodedState = btoa(JSON.stringify(jsonState));
	localStorage.setItem(STATE_KEY, encodedState);
}
