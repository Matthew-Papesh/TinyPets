// global user data
let username = "no-name"
let key = ""
let egg = {}
let pets = []
let credits = 0

// loading user dashboard page.
document.addEventListener("DOMContentLoaded", async () => {
    // Check for both dashboard and store URL patterns
    let match = window.location.pathname.match(/\/dashboard\/(.+)/)
    if (!match) {
        match = window.location.pathname.match(/\/store\/(.+)/)
    } if (!match) {
        match = window.location.pathname.match(/\/mypets\/(.+)/)
    } if (!match) {
        match = window.location.pathname.match(/\/hatcher\/(.+)/)
    }

    // check url validity
    if (!match) {
        return console.error("Invalid page URL - no user key found")
    }
    // good match; parse user key from url
    key = match[1]

    // try to get user info and user task info by api
    try {
        const response = await fetch(`/api/dashboard/${key}/users`)
        if (!response) {
            throw new Error("Failed to fetch user")
        }

        data = await response.json()
        
        username = data.id
    } catch (err) {
        console.error(err.message)
    }
    // try to get user data info by api
    try {
        const response = await fetch(`/api/dashboard/${key}/egg`)
        egg = await response.json()
        if (!response) {
            throw new Error("Failed to fetch user data")
        }
    } catch (err) {
        console.error(err.message)
    }
    try {
        const response = await fetch(`/api/dashboard/${key}/pets`)
        pets = await response.json()
        if (!response) {
            throw new Error("Failed to fetch user data")
        }
    } catch (err) {
        console.error(err.message)
    }

    // fetch and display credits
    await loadCredits()

    // add test button functionality
    const testCreditsBtn = document.getElementById("test-credits-btn")
    if (testCreditsBtn) {
        testCreditsBtn.addEventListener("click", addTestCredits)
    }

    // add logout button functionality
    const logoutBtn = document.getElementById("logout-btn")
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout)
    }

    play_audio()
    const hatcher_panel_dom = document.getElementById("hatching-link-id")
    if(JSON.stringify(egg) === "{}" && hatcher_panel_dom !== null) {
        hatcher_panel_dom.innerHTML = "<p>Must Buy Egg</p>"
        hatcher_panel_dom.style = "background-color: grey; font-size: 5em; color: red;"
    }
})

// handles redirecting user to dashboard 
const redirect_dashboard = async function (event) { window.location.href = `/dashboard/${key}` }
// handles redirecting user to their mypets page 
const redirect_mypets = async function (event) { window.location.href = `/mypets/${key}` }
// handles redirecting user to their store page 
const redirect_store = async function (event) { window.location.href = `/store/${key}` }
// handles redirecting user to their hatcher page 
const redirect_hatching = async function (event) {
    if(JSON.stringify(egg) !== "{}") {
        window.location.href = `/hatcher/${key}` 
    }
}

// handles redirecting user to home page and flagging log out to server
const logout = async function (event) {
    try {
        // parse json
        const json = {
            key: key,
        }
        // parse json to body and push to server
        const body = JSON.stringify(json)
        // request POST to server
        const response = await fetch("/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body
        })

        // handle response
        if (response.ok) {
            console.log("Successfully logged out")
            // redirect to login page
            window.location.href = "/"
        } else {
            console.error("Logout failed:", response.statusText)
            // Still redirect to login page even if server request fails
            window.location.href = "/"
        }
    } catch (err) {
        console.error("Error during logout:", err.message)
        // Still redirect to login page even if there's an error
        window.location.href = "/"
    }
}

const play_audio = async function (event) {
    const panel_select = new Audio("../assets/menu-hover.mp3")
    panel_select.loop = false
    panel_select.playbackRate = 1.0
    panel_select.volume = 1.0
    const music = new Audio("../assets/popcorn-and-videogames-audio.mp3")
    music.loop = true
    music.playbackRate = 0.95
    music.volume = 0.1
    music.autoplay = true

    document.addEventListener('click', () => { music.play() })
    document.getElementsByClassName("panel-button-petstore").item(0).addEventListener('mouseenter', () => { panel_select.play() })
    document.getElementsByClassName("panel-button-hatching").item(0).addEventListener('mouseenter', () => { panel_select.play() })
    document.getElementsByClassName("panel-button-mypets").item(0).addEventListener('mouseenter', () => { panel_select.play() })
}

// function to load and display user credits
const loadCredits = async function () {
    try {
        const response = await fetch(`/api/dashboard/${key}/credits`)
        if (!response.ok) {
            throw new Error("Failed to fetch credits")
        }

        const data = await response.json()
        credits = data.credits || 0  // Set global credits variable
        const creditsAmount = document.getElementById("credits-amount")
        if (creditsAmount) {
            creditsAmount.textContent = credits
        }
    } catch (err) {
        console.error("Error loading credits:", err.message)
        credits = 0  // Set global credits to 0 on error
        const creditsAmount = document.getElementById("credits-amount")
        if (creditsAmount) {
            creditsAmount.textContent = "0"
        }
    }
}

// function to refresh credits from server (useful after purchases/earnings)
const refreshCredits = async function () {
    await loadCredits()
}

// test function to add credits (you can remove this later)
const addTestCredits = async function () {
    try {
        const response = await fetch(`/api/dashboard/${key}/credits`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 10 })
        })

        if (!response.ok) {
            throw new Error("Failed to add credits")
        }

        const data = await response.json()
        updateCreditsDisplay(data.credits)

        // Optional: Show a brief notification
        console.log("Added 10 credits! New total:", data.credits)
    } catch (err) {
        console.error("Error adding credits:", err.message)
    }
}

//function that takes string and returns egg picture file name
const getEggImageFileName = function (eggType) {
    switch (eggType) {
        case "Egg":
            return "egg.png";
        case "Uncommon Egg":
            return "uncommon-egg.png";
        case "Rare Egg":
            return "rare-egg.png";
        case "Legendary Egg":
            return "legendary-egg.png";
    }
}
