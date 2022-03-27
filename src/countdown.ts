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
}, 10);

// Adding a timer
document.getElementById("new-timer")!.addEventListener("click", () => {
	const currentTime = Date.now();

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

function addCountdown(countdown: Countdown) {
	// Add to array
	countdowns.push(countdown);

	// Add element to page
	const outerDiv = document.createElement("div");
	outerDiv.classList.add("countdown", countdown.type);

	const title = document.createElement("h2");
	title.textContent = countdown.title;
	outerDiv.appendChild(title);

	const timeLeft = document.createElement("span");
	timeLeft.dataset.start = String(countdown.startTime);
	timeLeft.dataset.end = String(countdown.endTime);
	timeLeft.textContent = String(countdown.endTime - Date.now());
	outerDiv.appendChild(timeLeft);

	const detailsDiv = document.createElement("div");
	outerDiv.appendChild(detailsDiv);

	const timeStart = document.createElement("time");
	timeStart.textContent = formatAsDate(countdown.startTime);
	detailsDiv.appendChild(timeStart);

	countdownsDiv?.appendChild(outerDiv);
}
