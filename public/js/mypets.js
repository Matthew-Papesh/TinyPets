// My Pets page functionality
// Load and display pets when page loads
document.addEventListener("DOMContentLoaded", async () => {
    // Check if we're on the mypets page
    if (!window.location.pathname.includes('/mypets/')) {
        return // Not on mypets page, don't run this code
    }
    
    // Try immediately, then try again after a delay in case client_dashboard.js is still loading
    await initMyPetsPage()
    
    // Also try again after a delay to catch data loaded by client_dashboard.js
    setTimeout(async () => {
        // Only reload if we still don't have pets displayed
        const petsContainer = document.getElementById("pets-container")
        if (petsContainer && petsContainer.children.length === 0) {
            console.log("Retrying My Pets initialization...")
            await initMyPetsPage()
        }
    }, 1000)
})

// Function to initialize My Pets page
const initMyPetsPage = async function() {
    // Parse user key from URL
    const match = window.location.pathname.match(/\/mypets\/(.+)/)
    if (!match) {
        console.error("Invalid mypets URL - no user key found")
        return
    }
    
    // Use global key if it's already set by client_dashboard.js, otherwise parse it
    if (!window.key) {
        window.key = match[1]
    }
    
    console.log("My Pets page loading with key:", window.key)
    
    // Check if pets data is already available (loaded by client_dashboard.js)
    if (window.pets && Array.isArray(window.pets)) {
        console.log("Using pets data from client_dashboard.js:", window.pets)
        displayPets(window.pets)
    } else {
        console.log("Loading pets data directly...")
        await loadAndDisplayPets()
    }
    
    // Also load credits if not already loaded
    if (window.credits) {
        updateCreditsDisplay(window.credits)
    } else {
        await loadUserData()
    }
}

// Function to load user data (credits, etc.)
const loadUserData = async function() {
    try {
        // Load credits
        const creditsResponse = await fetch(`/api/dashboard/${window.key}/credits`)
        if (creditsResponse.ok) {
            const creditsData = await creditsResponse.json()
            window.credits = creditsData.credits || 0
            updateCreditsDisplay(window.credits)
        }
    } catch (err) {
        console.error("Error loading user data:", err.message)
    }
}

// Function to load and display all pets
const loadAndDisplayPets = async function() {
    console.log("Loading pets for key:", window.key)
    try {
        const response = await fetch(`/api/dashboard/${window.key}/pets`)
        console.log("Pets response status:", response.status)
        if (!response.ok) {
            throw new Error("Failed to fetch pets")
        }
        
        const petsData = await response.json()
        console.log("Pets data received:", petsData)
        window.pets = petsData || []
        
        displayPets(window.pets)
    } catch (err) {
        console.error("Error loading pets:", err.message)
        // Show no pets message on error
        showNoPetsMessage()
    }
}

// Function to display pets in the grid
const displayPets = function(petsArray) {
    console.log("Displaying pets:", petsArray)
    const petsContainer = document.getElementById("pets-container")
    const noPetsMessage = document.getElementById("no-pets-message")
    
    // Clear existing content
    petsContainer.innerHTML = ""
    
    if (!petsArray || petsArray.length === 0) {
        console.log("No pets to display")
        showNoPetsMessage()
        return
    }
    
    console.log("Found", petsArray.length, "pets to display")
    // Hide no pets message
    noPetsMessage.style.display = "none"
    
    // Create pet cards
    petsArray.forEach((pet, index) => {
        console.log("Creating card for pet:", pet)
        const petCard = createPetCard(pet, index)
        petsContainer.appendChild(petCard)
    })
}

// Function to create a pet card element
const createPetCard = function(pet, index) {
    const col = document.createElement("div")
    col.className = "col-lg-3 col-md-4 col-sm-6 col-12 mb-4"
    
    // Get the pet image name (without .png extension if present)
    const petImageName = pet.src_img.replace('.png', '')
    
    col.innerHTML = `
        <div class="card h-100" style="background-color: #2c3e50; border: 2px solid #ffd700; border-radius: 10px; width: 100%; height: 100%;">
            <div class="card-body text-center">
                <img src="../assets/${petImageName}.png" alt="${petImageName}" 
                     style="width: 100%; height: 40%; object-fit: contain; margin-bottom: 15px;" 
                     onerror="this.src='../assets/bunny.png'">
                <h5 class="card-title" style="color: #ffd700; font-family: 'Courier New', monospace; text-transform: capitalize;">
                    ${petImageName.replace(/[-_]/g, ' ')}
                </h5>
                <p class="card-text" style="color: #ecf0f1; font-size: 0.9em;">
                    Pet ID: ${pet.id}
                </p>
                <div class="mt-3">
                    <p style="color: #e74c3c; font-weight: bold; margin-bottom: 10px;">
                        Sell for 100 <img src="../assets/credit.png" style="width: 20px; height: 20px;">
                    </p>
                    <button class="btn btn-danger btn-sm" 
                            onclick="sellPet('${pet.src_img}', ${pet.id}, ${index})"
                            style="font-family: 'Courier New', monospace;">
                        Sell Pet
                    </button>
                </div>
            </div>
        </div>
    `
    
    return col
}

// Function to show no pets message
const showNoPetsMessage = function() {
    const petsContainer = document.getElementById("pets-container")
    const noPetsMessage = document.getElementById("no-pets-message")
    
    petsContainer.innerHTML = ""
    noPetsMessage.style.display = "block"
}

// Function to sell a pet
const sellPet = async function(srcImg, petId, index) {
    // Confirm sale
    if (!confirm(`Are you sure you want to sell this pet for 100 credits?`)) {
        return
    }
    
    try {
        const response = await fetch("/sellpet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                key: window.key,
                src_img: srcImg,
                id: petId
            })
        })
        
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(errorText)
        }
        
        const data = await response.json()
        
        // Update credits display
        window.credits = data.credits
        updateCreditsDisplay(window.credits)
        
        // Show success message
        alert(`Pet sold for ${data.earnedCredits} credits! New balance: ${data.credits}`)
        
        // Reload pets to reflect the change
        await loadAndDisplayPets()
        
    } catch (err) {
        console.error("Error selling pet:", err.message)
        alert("Failed to sell pet. Please try again.")
    }
}

// Function to update credits display
const updateCreditsDisplay = function(newAmount) {
    const creditsAmount = document.getElementById("credits-amount")
    if (creditsAmount) {
        creditsAmount.textContent = newAmount
    }
}

// creates a div for a mypet pet to be seen on mypets page
const render_card = async (pet_name) => {  
    const mypets_cards = document.getElementById("mypets-cards-id")
    const div = document.createElement("div")
    div.innerHTML = `\
      <div class='cards-container grid-view'>\
        <div class='card'>\
          <div class='card-badge'>TINY PET</div>\
          <div class='card-inner'>\
            <img src='../assets/${pet_name}.png' class='pixel-art' alt='Mario character'>\
            <div class='card-details'>\
              <h2 class='card-name'>${pet_name}</h2>\
            </div>\
          </div>\
          <div class='card-overlay'>\
            <div class='stat'>\
              <span class='stat-label'>Value ($)</span>\
              <span class='stat-value'>100</span>\
            </div>\
            <div class='stat-bar'>\
              <div class='stat-fill' style='--fill-percent: 92%''></div>\
            </div>\
          </div>\
        </div>\
      </div>`
    mypets_cards.append(div)
}
