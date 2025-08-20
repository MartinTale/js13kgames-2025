import { el, mount } from "../../helpers/dom";
import { sounds, playSound } from "../../systems/music";
import "./debug-sound-panel.css";

export function createDebugSoundPanel(parent: HTMLElement): void {
	const panel = el("div.debug-sound-panel");
	const title = el("div.debug-title", "Debug Sounds");
	
	mount(panel, title);
	
	// Create buttons for each sound
	Object.entries(sounds).forEach(([soundName, soundData]) => {
		const button = el("button.debug-sound-btn", soundName);
		
		button.addEventListener("click", () => {
			playSound(soundData);
		});
		
		mount(panel, button);
	});
	
	mount(parent, panel);
}