const countdownsDiv = document.getElementById("countdowns");
const countdowns: Array<Object> = [];
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

	console.log(countdowns);
});

// Adding an event
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
	// Add to array
	countdowns.push(countdown);

	// Add element to page
	const outerDiv = document.createElement("div");
	outerDiv.classList.add("countdown", countdown.type);

	// The header
	const headerSpan = document.createElement("span");
	headerSpan.className = "countdown-header";

	const title = document.createElement("h2");
	title.textContent = countdown.title;
	title.className = "title";

	const titleEdit = document.createElement("input");
	titleEdit.type = "text";
	titleEdit.value = countdown.title;
	titleEdit.hidden = true;
	titleEdit.className = "title-edit";

	const buttonsSpan = document.createElement("span");

	const editButton = document.createElement("button");
	editButton.textContent = "edit";
	editButton.className = "edit";

	const deleteButton = document.createElement("button");
	deleteButton.textContent = "delete";
	deleteButton.className = "delete";
	deleteButton.addEventListener("click", () => {
		outerDiv.remove();
	});

	buttonsSpan.append(editButton, deleteButton);

	headerSpan.append(title, titleEdit, buttonsSpan);
	outerDiv.append(headerSpan);

	// Time left. The countdown.
	const timeLeft = document.createElement("span");
	timeLeft.dataset.start = String(countdown.startTime);
	timeLeft.dataset.end = String(countdown.endTime);
	timeLeft.textContent = String(countdown.endTime - Date.now());
	outerDiv.appendChild(timeLeft);

	const footer = document.createElement("div");
	footer.className = "footer";
	outerDiv.appendChild(footer);

	// Editing!

	const dateEdit = document.createElement("input");
	dateEdit.type = "datetime-local";
	dateEdit.className = "edit-date";
	dateEdit.hidden = true;

	const timeStart = document.createElement("time");
	timeStart.className = "start";
	timeStart.textContent = formatAsDate(countdown.endTime);

	editButton.addEventListener("click", () => {
		const endTimeAsDate = new Date(countdown.endTime);
		const offset = new Date().getTimezoneOffset();
		endTimeAsDate.setMinutes(endTimeAsDate.getMinutes() - offset);

		dateEdit.hidden = !dateEdit.hidden;
		timeStart.hidden = !timeStart.hidden;
		title.hidden = !title.hidden;
		titleEdit.hidden = !titleEdit.hidden;

		if (editButton.textContent === "edit") {
			// Entering edit mode
			editButton.textContent = "save";
			titleEdit.value = title.textContent || "";
			dateEdit.valueAsNumber = endTimeAsDate.getTime();
		} else {
			// Saving changes
			editButton.textContent = "edit";
			title.textContent = titleEdit.value;
			timeLeft.dataset.end = String(dateEdit.valueAsNumber);
		}
	});

	footer.append("Ends at ", dateEdit, timeStart);

	countdownsDiv?.appendChild(outerDiv);
}
