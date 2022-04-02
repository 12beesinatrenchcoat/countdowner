for (const tab of document.querySelectorAll(".tab")) {
	tab.addEventListener("click", () => {
		const tabName = String(tab.getAttribute("href"));

		const tabContents = tab.parentElement?.parentElement?.querySelectorAll<HTMLElement>(".tab-content") || [];

		// Hiding all tab contents first
		for (const tabContent of tabContents) {
			tabContent.style.display = "none";
		}

		// Unhiding the corresponding tab content
		const tabContent = document.querySelector<HTMLElement>(tabName);
		if (tabContent) {
			tabContent.style.display = "flex";
		} else {
			console.error("missing tabContent for " + tabName);
		}

		// Removing "selected" class
		const otherTabs = tab.parentElement?.children;
		for (let index = 0; index < otherTabs!.length; index++) {
			otherTabs![index].classList.remove("selected");
		}

		// And adding it again
		tab.classList.add("selected");
	});
}
