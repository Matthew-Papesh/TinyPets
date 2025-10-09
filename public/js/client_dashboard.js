// global user data
let username = "no-name"
let key = ""
let egg = {}
let pets = []

// handle parsing for user key to talk to server and server database for 
// loading user dashboard page.
document.addEventListener("DOMContentLoaded", async () => {
    const match = window.location.pathname.match(/\/dashboard-(.+)/)
    // check url validity
    if(!match) {
        return console.error("Invalid dashboard URL")
    }
    // good match; parse user key from url
    key = match[1]
    // try to get user info and user task info by api
    try {
        const response = await fetch(`./api/dashboard/${key}/users`)
        if(!response) {
            throw new Error("Failed to fetch user")
        }
        
        data = await response.json()
        username = data.id
    } catch(err) {
        console.error(err.message)
    }
    // try to get user data info by api
    try {
        const res_eggs = await fetch(`./api/dashboard/${key}/eggs`)
        const res_pets = await fetch(`./api/dashboard/${key}/pets`)
        eggs = await res_eggs.json()
        pets = await res_pets.json()
        if(!res_eggs || !res_pets) {
            throw new Error("Failed to fetch user data")
        }
    } catch(err) {
        console.error(err.message)
    }

    // use info to setup page
    const username_div = document.getElementById("username")
    username_div.innerHTML = `<h1>Hello ${username}, </h1>`
})

// handles redirecting user to dashboard 
const redirect_dashboard = async function(event) {
    
}

// handles redirecting user to their mypets page 
const redirect_mypets = async function(event) {
    window.location.href = `/mypets/${key}`
}

// handles redirecting user to home page and flagging log out to server
const logout = async function(event) {
    // parse json
    json = {
        key: key,
    }
    // parse json to body and push to server
    body = JSON.stringify(json)
    // request POST to server
    const response = await fetch( "/logout", {
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body 
    })

    // handle response
    console.log(response)
}

const play_audio = async function(event) {
    const panel_select = new Audio("../assets/menu-hover.mp3")
    panel_select.loop = false
    panel_select.playbackRate = 1.0
    panel_select.volume = 1.0
    const music = new Audio("../assets/popcorn-and-videogames-audio.mp3")
    music.loop = true
    music.playbackRate = 0.95
    music.volume = 0.1
    music.autoplay = true

    document.addEventListener('click', () => {music.play()})
    document.getElementsByClassName("panel-button-petstore").item(0).addEventListener('mouseenter', () => {panel_select.play()})
    document.getElementsByClassName("panel-button-hatching").item(0).addEventListener('mouseenter', () => {panel_select.play()})
    document.getElementsByClassName("panel-button-mypets").item(0).addEventListener('mouseenter', () => {panel_select.play()})
}

play_audio()