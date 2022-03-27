document.querySelectorAll(".tab").forEach(tab => {
	tab.addEventListener("click", () => {
		const tabName = String(tab.getAttribute("href"));

		// Hiding other tabs first
		tab.parentElement?.parentElement?.querySelectorAll<HTMLElement>(".tab-content").forEach(tabContent => {
			tabContent.style.display = "none";
		});

		// Unhiding the corresponding tab content
		const tabContent = document.querySelector<HTMLElement>(tabName);
		if (tabContent) {
			tabContent.style.display = "flex";
		} else {
			console.error("missing tabContent for " + tabName);
		}

		// Removing "selected" class
		const otherTabs = tab.parentElement?.children;
		for (let i = 0; i < otherTabs!.length; i++) {
			otherTabs![i].classList.remove("selected");
		}

		// And adding it again
		tab.classList.add("selected");
	});
});
