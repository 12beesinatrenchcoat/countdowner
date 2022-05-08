const countdownsDiv = document.querySelector("#countdowns");
const currentTimeElement = document.querySelector("#current-time")!;

interface CountdownsObject {
	[index: string]: Countdown;
}

// Loading saved countdowns from localStorage.
const saved = localStorage.getItem("countdowns");
const countdowns = saved ? JSON.parse(saved) as CountdownsObject : {};

if (countdowns) {
	for (const key of Object.keys(countdowns)) {
		addCountdown(countdowns[key], false);
	}
}

import {formatAsDate, formatAsDuration} from "./formatting";
import "./notifications";

// Updating the page
function updatePage() {
	const now = Date.now();

	// Current time at the top.
	currentTimeElement.textContent = formatAsDate(now);

	// Updating each countdown.
	const timeLeftSpans = document.querySelectorAll("span.time-left") as NodeListOf<HTMLSpanElement>;
	for (const timeLeftSpan of timeLeftSpans) {
		const countdown: Countdown = countdowns[timeLeftSpan.id];

		// Has thing started yet? (Time until started if yes)
		const comparisonTime = countdown.started ? countdown.endTime : countdown.startTime;
		const timeLeft = comparisonTime - now;

		// Setting the prefix ("starting in", "ending in", "ended")
		let prefix;

		if (countdown.started) {
			// done && started
			prefix = countdown.done ? "ended " : "ending in ";
		} else {
			prefix = "starting in ";
		}

		timeLeftSpan.textContent = prefix + formatAsDuration(timeLeft);

		// Adding a nice gradient border
		const percent = countdown.done ? "100%" // Limit to 100% if done
			: ((
				(now - countdown.startTime) / (countdown.endTime - countdown.startTime)
			) * 100) + "%";

		const {parentElement} = timeLeftSpan;
		parentElement!.style.setProperty("--progress", percent);

		// When the countdown starts
		countdown.started = countdown.started || now > countdown.startTime;

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

	setTimeout(updatePage, Number(window.settings["update-rate"]));
}

setTimeout(updatePage, Number(window.settings["update-rate"]));

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
	const newEventButton = document.querySelector("#new-event")! as HTMLButtonElement;

	if (!newEventButton.dataset.warning || newEventButton.textContent === newEventButton.dataset.warning) {
		const titleInput = document.querySelector("#event-title") as HTMLInputElement;
		const startInput = document.querySelector("#event-start") as HTMLInputElement;
		const endInput = document.querySelector("#event-end") as HTMLInputElement;

		const startDate = new Date(startInput.value);
		const endDate = new Date(endInput.value);

		const event = new Countdown(titleInput.value, startDate.getTime(), endDate.getTime(), "event");

		addCountdown(event);

		newEventButton.textContent = "add event";
	}

	if (newEventButton.dataset.warning) {
		newEventButton.textContent = newEventButton.dataset.warning;
		setTimeout(() => {
			newEventButton.textContent = "add event";
		}, 5000);
	}
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

	const startDateEdit = document.createElement("input");
	startDateEdit.type = "datetime-local";
	startDateEdit.className = "start-date-edit";
	startDateEdit.hidden = true;

	const timeStart = document.createElement("time");
	timeStart.className = "start";
	timeStart.textContent = `${countdown.started ? "started" : "starts"} ${formatAsDate(countdown.startTime)}`;

	const endDateEdit = document.createElement("input");
	endDateEdit.type = "datetime-local";
	endDateEdit.className = "end-date-edit";
	endDateEdit.hidden = true;

	const timeEnd = document.createElement("time");
	timeEnd.className = "end";
	timeEnd.textContent = `${countdown.done ? "ended" : "ends"} ${formatAsDate(countdown.endTime)}`;

	const startTimeDiv = document.createElement("div");
	startTimeDiv.append(timeStart, startDateEdit);

	const endTimeDiv = document.createElement("div");
	endTimeDiv.append(timeEnd, endDateEdit);

	footer.append(startTimeDiv, endTimeDiv);

	outerDiv.append(headerSpan, timeLeft, footer);

	countdownsDiv?.appendChild(outerDiv);

	editButton.addEventListener("click", () => {
		const startTimeAsDate = new Date(countdown.startTime);
		const endTimeAsDate = new Date(countdown.endTime);
		// For converting Local <-> UTC
		let offset = new Date().getTimezoneOffset() * 6e4;
		// Because daylight savings
		offset -= (offset - (endTimeAsDate.getTimezoneOffset() * 6e4));

		endDateEdit.hidden = !endDateEdit.hidden;
		timeEnd.hidden = !timeEnd.hidden;
		title.hidden = !title.hidden;
		titleEdit.hidden = !titleEdit.hidden;

		if (editButton.textContent === "edit") { // -> Edit mode
			editButton.textContent = "save";
			titleEdit.value = title.textContent || "";
			// UTC -> Local
			startDateEdit.valueAsNumber = startTimeAsDate.getTime() - offset;
			endDateEdit.valueAsNumber = endTimeAsDate.getTime() - offset;
		} else { // Saving
			editButton.textContent = "edit";
			title.textContent = titleEdit.value;
			// Local -> UTC
			const newStart = new Date(startDateEdit.valueAsNumber).getTime() + offset;
			const newEnd = new Date(endDateEdit.valueAsNumber).getTime() + offset;
			countdown.startTime = newStart;
			countdown.endTime = newEnd;
			// Also need to update the "Ends"
			timeStart.textContent = `${countdown.started ? "started" : "starts"} ${formatAsDate(newStart)}`;
			timeEnd.textContent = `${countdown.done ? "ended" : "ends"} ${formatAsDate(newEnd)}`;

			// No longer done if the new end date is later
			if (newEnd > Date.now()) {
				countdown.done = false;
			}

			saveCountdowns();
		}
	});
}

// Saving countdowns to localStorage.
function saveCountdowns() {
	const countdownsString = JSON.stringify(countdowns);
	localStorage.setItem("countdowns", countdownsString);
	console.groupCollapsed("saved countdowns!");
	console.debug(countdownsString);
	console.groupEnd();
}

// Countdown class
class Countdown {
	title: string;
	createTime: number;
	startTime: number;
	endTime: number;
	type: "timer" | "event";
	started: boolean;
	done: boolean;

	constructor(title: string, startTime: number, endTime: number, type: "timer" | "event") {
		const now = Date.now();

		this.title = title;
		this.createTime = now;
		this.startTime = startTime;
		this.endTime = endTime;
		this.type = type;
		this.started = now >= startTime;
		this.done = now >= endTime;
	}
}

export {addCountdown, Countdown, CountdownsObject};
