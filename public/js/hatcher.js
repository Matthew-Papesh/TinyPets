document.addEventListener("DOMContentLoaded", async () => {
	const egg_dom = document.getElementById("eggImg");
	const progressBar = document.getElementById("progressBar");
	const progressText = document.getElementById("progressText");

	let clicks = 0;
	const maxClicks = 100;
	let hatched = false;


	const res_egg = await fetch(`/api/dashboard/${key}/egg`)
	const egg_json = await res_egg.json()
	const eggSet = egg_json.src_img
	egg_dom.src = `../assets/${eggSet}.png`;

	// Animal image options
	const animals = [
		"bear",
		"bubblebuddy",
		"bunny",
		"panda",
		"fish",
		"stringray", 
		"rock"
	];

	const legends = [
		"patrick", 
		"fireguy",
		"flame",
		"bunny-bloody" 
	];

	egg_dom.addEventListener("click", () => {
		if (hatched) return; // stop if already hatched

		// Shake animation
		egg_dom.classList.add("shake");

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
			egg_dom.src = `../assets/${eggSet}-cracked.png`;
			progressText.textContent = "It's starting to crack...";
		}

		if (clicks >= 100 && !hatched) {
			// Hatch into random animal
			let randomAnimal = animals[Math.floor(Math.random() * animals.length)];
			if(eggSet === 'rare-egg') { // hatch legendary animal
				randomAnimal = legends[Math.floor(Math.random() * legends.length)];
			}

			egg_dom.src = `../assets/${randomAnimal}.png`;
			hatched = true;
			progressText.textContent = "It hatched!";
			setTimeout( async () => {			
				try {
				        const response = await fetch(`/api/dashboard/${key}/credits`, {
				            method: "POST",
				            headers: { "Content-Type": "application/json" },
				            body: JSON.stringify({ amount: 200 })
				        })
					
				        if (!response.ok) {
				            throw new Error("Failed to add credits")
				        }
					
				        const data = await response.json()
				        updateCreditsDisplay(data.credits)
					
				        console.log("Added 10 credits! New total:", data.credits)
				    } catch (err) {
				        console.error("Error adding credits:", err.message)
				}
				try {
					const json = {key: key, src_img: randomAnimal, id: pets.length}
					const body = JSON.stringify(json)
					const response = await fetch( "/pushpet", {
  						method:"POST",
  						headers: { "Content-Type": "application/json" },
  						body 
  					})
				} catch(err) {
					console.error("Error adding pet", err.message)
				}

				try {
					const json = {key: key}
					const body = JSON.stringify(json)
					const response = await fetch("/rmegg", {
						method: "POST",
						headers: {"Content-Type": "application/json"},
						body
					})
				} catch(err) {
					console.error("Error removing egg", err.message)
				}

				window.location.href=`/dashboard/${key}`
			}, 1000)
		}

		// Remove shake after animation
		setTimeout(() => egg_dom.classList.remove("shake"), 400);
	});
});