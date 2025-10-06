// global user data
let username = "no-name"
let tasks = []
let key = ""

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
        const response = await fetch(`/api/dashboard/${key}/users`)
        if(!response) {
            throw new Error("Failed to fetch user")
        }
        
        data = await response.json()
        username = data.id
    } catch(err) {
        console.error(err.message)
    }
    // try to get user tasks info by api
    try {
        const response = await fetch(`./api/dashboard/${key}/tasks`)
        tasks = await response.json()
        if(!response) {
            throw new Error("Failed to fetch user's tasks")
        }
    } catch(err) {
        console.error(err.message)
    }

    // use info to setup page
    const username_div = document.getElementById("user_name")
    username_div.innerHTML = `<h1>Hello ${username}, </h1><p>Here are your current tasks:</p>`
    // create task row (first row is the col headers)
    create_task_row("Task Priority", "Task Description", true)
    for(let i=0; i<tasks.length; i++) {
        task = tasks[i] // loop through user tasks items and load into divs in task box
        create_task_row(task["priority"], task["text"], false)
    }
})

// handle submitting task to server database
const submit_task = async function(event) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
    // get inputted task info
    const task_priority = document.querySelector("#inputPriority").value
    const task_text = document.querySelector("#inputText").value
    // parse to json
    json = { 
        key: key,
        priority: task_priority, 
        text: task_text
    }  
    // parse json to body and push to server
    body = JSON.stringify(json)
    // request POST to server
    const response = await fetch( "/pushtasks", {
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body 
    })

    // add task visibly to task box after pushing to server
    create_task_row(task_priority, task_text, false)
}

// create a task in the task box in the user dashboard from a page form; handle removing as well
const create_task_row = async function(priority, text, header) {
    const task_box = document.getElementById("task-box") 
    if (!task_box) return console.error("Task container not found")

    // create row div
    const row = document.createElement("div")
    row.className = "row" // use className, not class
    row.style.margin = "0"

    // create priority column
    const priority_col = document.createElement("div")
    priority_col.className = "col-sm-4"
    if(header) {
        priority_col.innerHTML = `<h3 style="padding: 0; margin-bottom:0.3em;">${priority}</h3>`
    } else {
        priority_col.innerHTML = `<p>${priority}</p>`
    }

    // create text column
    const text_col = document.createElement("div")
    text_col.className = "col-sm-4" 
    if(header) { 
        text_col.innerHTML = `<h3 style="padding: 0; margin-bottom:0.3em;">${text}</h3>`
    } else {
        text_col.innerHTML = `<p>${text}</p>`
    }

    // create delete button column
    const button_col = document.createElement("div")
    button_col.className = "col-sm-4"
    if(header) {
        button_col.innerHTML = "<h3>Remove</h3>"
    } else {
        // button for column
        const button = document.createElement("button")
        button.className = "btn btn-lg btn-primary btn-block"
        button.style.height = "2em"
        button.innerHTML = "Delete"
        button_col.appendChild(button)

        // handle removing selected task from server database and remove locally from task box
        button.onclick = async function() {
            // parse to json
            json = { 
                key: key,
                priority: priority, 
                text: text
            }  
            // parse json to body and push to server
            body = JSON.stringify(json)
            // request POST to server
            const response = await fetch( "/rmtasks", {
                method:"POST",
                headers: { "Content-Type": "application/json" },
                body 
            })

            // remove task from task box
            task_box.removeChild(row)
            // handle response
            console.log(response)
        }
    }

    // append columns to row
    row.appendChild(priority_col)
    row.appendChild(text_col)
    row.appendChild(button_col)

    // append row to task box
    task_box.appendChild(row)
};

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