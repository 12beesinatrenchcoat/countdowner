document.getElementById("enable-notifications")?.addEventListener("click", event => {
	if (!("Notification" in window)) {
		const target = event.target as HTMLButtonElement;
		target.disabled = true;
		target.textContent = "this browser does not support desktop notifications.";
	}

	Notification.requestPermission().then(result => {
		if (result === "granted") {
			// eslint-disable-next-line no-new
			new Notification("test notification", {
				body: "if you're seeing this, notifications are now enabled!",
			});
		}
	});
});
