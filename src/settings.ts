/* Saving settings on modification */
for (const element of document.querySelectorAll<HTMLInputElement>("#settings > label > input")) {
	element.addEventListener("input", () => {
		// window.settings should update instantly
		window.settings[element.name] = element.valueAsNumber ?? element.checked ?? element.value;
	});
	element.addEventListener("change", () => {
		const settingsString = JSON.stringify(window.settings);
		localStorage.setItem("settings", settingsString);
		console.groupCollapsed("saved settings!");
		console.debug(settingsString);
		console.groupEnd();
	});
}

/* Loading saved settings (and also setting the inputs on the page) */
window.settings = JSON.parse(localStorage.getItem("settings") || "{}");
for (const key of Object.keys(window.settings)) {
	const element = document.querySelector<HTMLInputElement>("input[name=" + key + "]");

	if (!element) {
		break;
	}

	element.value = String(window.settings[key]);
	if (element.type === "range") {
		updateRangeInputTrack(element);
	}

	updateInputOutputs(element.name, element.value);
}

/* Updating outputs of ranges on changes
Like how "update rate" has "#ms" next to the slider. */
for (const element of document.querySelectorAll<HTMLInputElement>("#settings > label > input")) {
	element.addEventListener("input", () => {
		updateInputOutputs(element.name, element.value);
	});
}

function updateInputOutputs(name: string, value: string) {
	for (const output of document.querySelectorAll<HTMLSpanElement>("." + name + "-output")) {
		output.textContent = value;
	}
}

/* Range inputs. Style stuff. */
for (const element of document.querySelectorAll<HTMLInputElement>("input[type='range']")) {
	element.addEventListener("input", () => updateRangeInputTrack(element));
	updateRangeInputTrack(element);
}

function updateRangeInputTrack(element: HTMLInputElement) {
	const min = Number(element.min);
	const max = Number(element.max);
	const value = element.valueAsNumber;

	element.style.backgroundSize = String((value - min) * 100 / (max - min)) + "% 100%";
}
