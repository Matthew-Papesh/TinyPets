document.addEventListener("DOMContentLoaded", async () => {
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
		"stingray",
		"fireguy",
		"bunny-bloody",
		"flame",
		"rock",
		"patrick",
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

			saveNewPet(randomAnimal);
		}

		async function saveNewPet(animalName) {
			try {
				// Extract key from URL (same as in client_dashboard.js)
				const match = window.location.pathname.match(/\/hatcher\/(.+)/);
				if (!match) throw new Error("Invalid hatcher URL");
				const key = match[1];

				// Create pet JSON data (you can expand fields as your API supports)
				const petData = {
					name: animalName,
					type: animalName,
					hatched_at: new Date().toISOString(),
				};

				const response = await fetch(`/api/dashboard/${key}/pets`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(petData),
				});

				if (!response.ok) {
					throw new Error(`Failed to save pet: ${response.statusText}`);
				}

				const data = await response.json();
				console.log("Pet saved successfully:", data);

				// Optional visual feedback
				progressText.textContent = `You hatched a ${animalName}!`;
			} catch (err) {
				console.error("Error saving pet:", err.message);
			}
		}



		// Remove shake after animation
		setTimeout(() => egg.classList.remove("shake"), 400);
	});
});