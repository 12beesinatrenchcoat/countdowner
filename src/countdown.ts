const countdownsDiv = document.getElementById("countdowns");
const currentTimeElement = document.getElementById("current-time")!;

import {formatAsDate, formatAsDuration} from "./formatting";

// Updating time
setInterval(() => {
	const now = Date.now();
	currentTimeElement.textContent = formatAsDate(now);
	const timeLeftSpans = document.querySelectorAll("span[data-end]") as NodeListOf<HTMLSpanElement>;
	timeLeftSpans.forEach(timeLeftSpan => {
		timeLeftSpan.textContent = formatAsDuration(
			Number(timeLeftSpan.dataset.end) - now);
	});
}, 100);

// Adding a timer
document.getElementById("new-timer")!.addEventListener("click", () => {
	const currentTime = Date.now();

	// Get inputs
	const titleInput = document.getElementById("timer-title") as HTMLInputElement;
	const hoursInput = document.getElementById("timer-hours") as HTMLInputElement;
	const minutesInput = document.getElementById("timer-minutes") as HTMLInputElement;
	const secondsInput = document.getElementById("timer-seconds") as HTMLInputElement;

	const title = titleInput.value;
	const hours = hoursInput.valueAsNumber || 0;
	const minutes = minutesInput.valueAsNumber || 0;
	const seconds = secondsInput.valueAsNumber || 0;

	const finalTime = currentTime + (((hours * 3600) + (minutes * 60) + seconds) * 1000);

	const timer = new Countdown(title, currentTime, finalTime, "timer");

	addCountdown(timer);
});

// Adding an event
document.getElementById("new-event")!.addEventListener("click", () => {
	const currentTime = Date.now();

	// Get inputs
	const titleInput = document.getElementById("event-title") as HTMLInputElement;
	const dateInput = document.getElementById("event-date") as HTMLInputElement;

	const date = new Date(dateInput.value);

	const event = new Countdown(titleInput.value, currentTime, date.getTime(), "event");

	addCountdown(event);
});

// Countdown class
class Countdown {
	title: string;
	startTime: number;
	endTime: number;
	type: "timer" | "event";

	constructor(title: string, startTime: number, endTime: number, type: "timer" | "event") {
		this.title = title;
		this.startTime = startTime;
		this.endTime = endTime;
		this.type = type;
	}
}

// Adding a countdown to the page
function addCountdown(countdown: Countdown) {
	// Outer div, contains everything
	const outerDiv = document.createElement("div");
	outerDiv.classList.add("countdown", countdown.type);

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
		}

		// Deletion confirmation
		if (deleteButton.textContent === "delete") {
			deleteButton.textContent = "you sure?";
			setTimeout(() => {
				deleteButton.textContent = "delete";
			}, 5000);
		}
	});

	buttonsSpan.append(editButton, deleteButton);

	headerSpan.append(titleSpan, buttonsSpan);

	// Time left. The countdown.
	const timeLeft = document.createElement("span");
	timeLeft.dataset.start = String(countdown.startTime);
	timeLeft.dataset.end = String(countdown.endTime);
	timeLeft.textContent = String(countdown.endTime - Date.now());

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
		const endTimeAsDate = new Date(Number(timeLeft.dataset.end));
		// For converting Local <-> UTC
		let offset = new Date().getTimezoneOffset() * 60000;
		// Because daylight savings
		offset -= (offset - (endTimeAsDate.getTimezoneOffset() * 60000));

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
			const newEnd = new Date(dateEdit.valueAsNumber);
			// Local -> UTC
			timeLeft.dataset.end = String(newEnd.getTime() + offset);
			// Also need to update the "Ends at"
			timeEnd.textContent = formatAsDate(newEnd.getTime() + offset);
		}
	});

	footer.append("Ends at ", dateEdit, timeEnd);

	outerDiv.append(headerSpan, timeLeft, footer);

	countdownsDiv?.appendChild(outerDiv);
}
