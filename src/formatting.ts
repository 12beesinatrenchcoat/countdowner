const locale: Intl.DateTimeFormat = new Intl.DateTimeFormat(undefined, {
	year: "numeric",
	month: "long",
	day: "numeric",
	hour: "numeric",
	minute: "2-digit",
	second: "2-digit",
});

const {format} = locale;

const MS_IN_DAY = 86_400_000;
const MS_IN_HOUR = 3_600_000;
const MS_IN_MIN = 60_000;
const MS_IN_SEC = 1000;
function formatAsDuration(duration: number) {
	const negative = duration < 0;

	// Making sure formatting isn't weird.
	duration = Math.abs(duration);
	const days = Math.floor(duration / MS_IN_DAY);
	const hours = Math.floor((duration % MS_IN_DAY) / MS_IN_HOUR);
	const minutes = Math.floor((duration % MS_IN_HOUR) / MS_IN_MIN);
	const seconds = (Math.floor((duration % MS_IN_MIN) / MS_IN_SEC * 100) / 100)
		.toFixed(2);

	let formatted = days ? days + "d " : "";
	formatted += formatted || hours ? hours + "h " : "";
	formatted += formatted || minutes ? minutes + "m " : "";
	formatted += formatted || seconds ? seconds + "s " : "";
	formatted += negative ? " ago" : "";

	return formatted;
}

export {format as formatAsDate, formatAsDuration};
