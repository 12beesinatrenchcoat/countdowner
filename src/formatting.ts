const locale: Intl.DateTimeFormat = new Intl.DateTimeFormat(undefined, {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
	hour: "numeric",
	minute: "2-digit",
	second: "2-digit",
	timeZoneName: "short",
});

const {format} = locale;

const MS_IN_DAY = 86400000;
const MS_IN_HOUR = 3600000;
const MS_IN_MIN = 60000;
const MS_IN_SEC = 1000;
function formatAsDuration(duration: number) {
	const days = Math.floor(duration / MS_IN_DAY);
	const hours = Math.floor((duration % MS_IN_DAY) / MS_IN_HOUR);
	const minutes = Math.floor((duration % MS_IN_HOUR) / MS_IN_MIN);
	const seconds = Math.floor((duration % MS_IN_MIN) / MS_IN_SEC * 100) / 100;

	let formatted = days ? days + " days " : "";
	formatted += formatted || hours ? hours + " hours " : "";
	formatted += formatted || minutes ? minutes + " minutes " : "";
	formatted += formatted || seconds ? seconds + " seconds " : "";

	return formatted;
}

export {format as formatAsDate, formatAsDuration};
