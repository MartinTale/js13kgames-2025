// @ts-ignore
// import PartySocket from "https://js13kgames.com/2025/online/partysocket.js";
import PartySocket from "partysocket";
import { state, addActionToLog } from "./state";

export function initOnline() {
	const ws = new PartySocket({
		host: "wss://relay.js13kgames.com/pet-a-cat",
		room: "pet-a-cat",
		id: state.id.value,
	});

	ws.onopen = () => {
		console.log("WebSocket connection opened");
	};

	ws.onmessage = (event) => {
		const msg = event.data;

		switch (msg[0]) {
			case "@":
				console.log("My ID is:", msg.slice(1));
				break;

			case "+":
				const connectedUserId = msg.slice(1);
				console.log("A client connected, ID:", connectedUserId);
				addActionToLog("connect", connectedUserId);
				break;

			case "-":
				const disconnectedUserId = msg.slice(1);
				console.log("A client disconnected, ID:", disconnectedUserId);
				addActionToLog("disconnect", disconnectedUserId);
				break;

			default:
				console.log("Message:", msg);
		}
	};
}
