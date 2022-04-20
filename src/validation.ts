// Check if event start is before the end.
document.querySelector("#event-start")!.addEventListener("input", () => eventStartBeforeEnd());

document.querySelector("#event-end")!.addEventListener("input", () => eventStartBeforeEnd());

const newEventButton = document.querySelector("#new-event") as HTMLButtonElement;

function eventStartBeforeEnd() {
	const start = document.querySelector("#event-start") as HTMLInputElement;
	const end = document.querySelector("#event-end") as HTMLInputElement;

	if (start.valueAsNumber > end.valueAsNumber) {
		start.classList.add("invalid");
		end.classList.add("invalid");
		newEventButton.dataset.warning = "end date is before start date. you sure?";
	} else {
		start.classList.remove("invalid");
		end.classList.remove("invalid");
		delete newEventButton.dataset.warning;
	}
}
