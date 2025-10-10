document.addEventListener("DOMContentLoaded", () => {
	const egg = document.getElementById("eggImg");
	const progressBar = document.getElementById("progressBar");
	const progressText = document.getElementById("progressText");

	let clicks = 0;
	const maxClicks = 100;
	let hatched = false;

	// Randomly choose between egg.png and egg2.png sets
	const eggSet = Math.random() < 0.5 ? "egg" : "egg2";
	egg.src = `../assets/${eggSet}.png`;

	// Animal image options
	const animals = [
		"bear",
		"bubblebuddy",
		"bunny",
		"panda",
		"fish",
		"stingray"
	];

	egg.addEventListener("click", () => {
		if (hatched) return; // stop if already hatched

		// Shake animation
		egg.classList.add("shake");

		// Increment click counter
		clicks++;
		if (clicks > maxClicks) clicks = maxClicks;

		// Update progress bar and text
		const progressPercent = (clicks / maxClicks) * 100;
		progressBar.style.width = `${progressPercent}%`;
		progressText.textContent = `${clicks} / ${maxClicks}`;

		// Hatch when done
		if (clicks === 50) {
			// Change to cracked egg first
			egg.src = `../assets/${eggSet}-cracked.png`;
			progressText.textContent = "It's starting to crack...";
		}

		if (clicks === 100 && !hatched) {
			// Hatch into random animal
			const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
			egg.src = `../assets/${randomAnimal}.png`;
			hatched = true;
			progressText.textContent = "It hatched!";
		}

		// Remove shake after animation
		setTimeout(() => egg.classList.remove("shake"), 400);


	});
});