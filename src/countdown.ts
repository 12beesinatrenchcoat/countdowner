const countdownsDiv = document.querySelector("#countdowns");
const currentTimeElement = document.querySelector("#current-time")!;

interface CountdownsObject {
	[index: string]: Countdown;
}

// Loading saved countdowns from localStorage.
const countdowns = JSON.parse(localStorage.getItem("countdowns") || "") as CountdownsObject || {};

if (countdowns) {
	for (const key of Object.keys(countdowns)) {
		addCountdown(countdowns[key], false);
	}
}

import {formatAsDate, formatAsDuration} from "./formatting";
import "./notifications";

// Updating time
setInterval(() => {
	const now = Date.now();

	// Current time at the top.
	currentTimeElement.textContent = formatAsDate(now);

	// Updating each countdown.
	const timeLeftSpans = document.querySelectorAll("span.time-left") as NodeListOf<HTMLSpanElement>;
	for (const timeLeftSpan of timeLeftSpans) {
		const countdown: Countdown = countdowns[timeLeftSpan.id];
		const timeLeft = countdown.endTime - now;
		timeLeftSpan.textContent = formatAsDuration(timeLeft);

		// Adding a nice gradient border
		const percent = countdown.done ? "100%" // Limit to one if done
			: ((
				(now - countdown.startTime) / (countdown.endTime - countdown.startTime)
			) * 100) + "%";

		const {parentElement} = timeLeftSpan;
		parentElement!.style.setProperty("--progress", percent);

		// When the countdown finishes
		if (timeLeft <= 0 && !countdown.done) {
			console.log(`Countdown ${countdown.title} done! (ID ${countdown.startTime})`);
			// This boolean exists to ensure the notification doesn't send more than once
			countdown.done = true;

			// eslint-disable-next-line no-unused-vars
			const notification = new Notification(countdown.title, {
				body: "countdown finished!",
				timestamp: countdown.endTime,
			});

			saveCountdowns();
		}
	}
}, 20);

// Adding a timer
document.querySelector("#new-timer")!.addEventListener("click", () => {
	const currentTime = Date.now();

	// Get inputs
	const titleInput = document.querySelector("#timer-title") as HTMLInputElement;
	const hoursInput = document.querySelector("#timer-hours") as HTMLInputElement;
	const minutesInput = document.querySelector("#timer-minutes") as HTMLInputElement;
	const secondsInput = document.querySelector("#timer-seconds") as HTMLInputElement;

	const title = titleInput.value;
	const hours = hoursInput.valueAsNumber || 0;
	const minutes = minutesInput.valueAsNumber || 0;
	const seconds = secondsInput.valueAsNumber || 0;

	const finalTime = currentTime + (((hours * 3600) + (minutes * 60) + seconds) * 1000);

	const timer = new Countdown(title, currentTime, finalTime, "timer");

	addCountdown(timer);
});

// Adding an event
document.querySelector("#new-event")!.addEventListener("click", () => {
	const currentTime = Date.now();

	// Get inputs
	const titleInput = document.querySelector("#event-title") as HTMLInputElement;
	const dateInput = document.querySelector("#event-date") as HTMLInputElement;

	const date = new Date(dateInput.value);

	const event = new Countdown(titleInput.value, currentTime, date.getTime(), "event");

	addCountdown(event);
});

// Adding a countdown to the page
// Used by both timers and events.
function addCountdown(countdown: Countdown, save = true) {
	// Adding to the countdowns object for future reference
	if (save) {
		countdowns[countdown.startTime] = countdown;
		saveCountdowns();
	}

	// Outer div, contains everything
	const outerDiv = document.createElement("div");
	outerDiv.classList.add("countdown", countdown.type);
	outerDiv.id = String(countdown.startTime);

	// The header
	const headerSpan = document.createElement("span");
	headerSpan.className = "countdown-header";

	const titleSpan = document.createElement("span");
	titleSpan.className = "title-span";

	const title = document.createElement("h2");
	title.textContent = countdown.title;
	title.className = "title";

	const titleEdit = document.createElement("input");
	titleEdit.type = "text";
	titleEdit.value = countdown.title;
	titleEdit.hidden = true;
	titleEdit.className = "title-edit";

	titleSpan.append(title, titleEdit);

	const buttonsSpan = document.createElement("span");
	buttonsSpan.className = "buttons";

	const editButton = document.createElement("button");
	editButton.textContent = "edit";
	editButton.className = "edit";

	const deleteButton = document.createElement("button");
	deleteButton.textContent = "delete";
	deleteButton.className = "delete";
	deleteButton.addEventListener("click", () => {
		if (deleteButton.textContent === "you sure?") {
			outerDiv.remove();
			delete countdowns[countdown.startTime];
			saveCountdowns();
		}

		// Deletion confirmation
		if (deleteButton.textContent === "delete") {
			deleteButton.textContent = "you sure?";
			deleteButton.classList.add("danger");
			setTimeout(() => {
				deleteButton.textContent = "delete";
				deleteButton.classList.remove("danger");
			}, 5000);
		}
	});

	buttonsSpan.append(editButton, deleteButton);

	headerSpan.append(titleSpan, buttonsSpan);

	// Time left. The countdown.
	const timeLeft = document.createElement("span");
	timeLeft.id = String(countdown.startTime);
	timeLeft.className = "time-left";
	timeLeft.textContent = formatAsDuration(countdown.endTime - Date.now());

	const footer = document.createElement("div");
	footer.className = "footer";

	// Editing!
	const dateEdit = document.createElement("input");
	dateEdit.type = "datetime-local";
	dateEdit.className = "date-edit";
	dateEdit.hidden = true;

	const timeEnd = document.createElement("time");
	timeEnd.className = "start";
	timeEnd.textContent = formatAsDate(countdown.endTime);

	editButton.addEventListener("click", () => {
		const endTimeAsDate = new Date(countdown.endTime);
		// For converting Local <-> UTC
		let offset = new Date().getTimezoneOffset() * 6e4;
		// Because daylight savings
		offset -= (offset - (endTimeAsDate.getTimezoneOffset() * 6e4));

		dateEdit.hidden = !dateEdit.hidden;
		timeEnd.hidden = !timeEnd.hidden;
		title.hidden = !title.hidden;
		titleEdit.hidden = !titleEdit.hidden;

		if (editButton.textContent === "edit") { // -> Edit mode
			editButton.textContent = "save";
			titleEdit.value = title.textContent || "";
			// UTC -> Local
			dateEdit.valueAsNumber = endTimeAsDate.getTime() - offset;
		} else { // Saving
			editButton.textContent = "edit";
			title.textContent = titleEdit.value;
			const newEnd = new Date(dateEdit.valueAsNumber).getTime() + offset;
			// Local -> UTC
			countdown.endTime = newEnd;
			// Also need to update the "Ends at"
			timeEnd.textContent = formatAsDate(newEnd);

			// No longer done if the new end date is later
			if (newEnd > Date.now()) {
				countdown.done = false;
			}
		}
	});

	footer.append("Ends at ", dateEdit, timeEnd);

	outerDiv.append(headerSpan, timeLeft, footer);

	countdownsDiv?.appendChild(outerDiv);
}

// Saving countdowns to localStorage.
function saveCountdowns() {
	localStorage.setItem("countdowns", JSON.stringify(countdowns));
	console.debug("saved!");
}

// Countdown class
class Countdown {
	title: string;
	startTime: number;
	endTime: number;
	type: "timer" | "event";
	done: boolean;

	constructor(title: string, startTime: number, endTime: number, type: "timer" | "event") {
		this.title = title;
		this.startTime = startTime;
		this.endTime = endTime;
		this.type = type;
		this.done = Date.now() >= endTime;
	}
}

export {addCountdown, Countdown, CountdownsObject};
