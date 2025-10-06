// FRONT-END (CLIENT) JAVASCRIPT HERE

const submit_sign_up = async function(event) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()

  // get form fields
  const email = document.querySelector("#inputEmail")
  const first_name = document.querySelector("#inputFirstName")
  const last_name = document.querySelector("#inputLastName")
  const password = document.querySelector("#inputPassword")
  // parse into json
  json = { 
    email: email.value,
    first_name: first_name.value,
    last_name: last_name.value,
    password: password.value
  }

  body = JSON.stringify(json)
  // request POST to server
  const response = await fetch( "/signup", {
    method:"POST",
    headers: { "Content-Type": "application/json" },
    body 
  })

  // handle response
  const text = await response.text()
  if(await response.ok) {
    // good registration; say so
    signUpMsg = document.getElementById("signUpMessage")
    signUpMsg.innerHTML = `<p style="color: green">${text}<\p>`
  } else {
    // failed to register
    signUpMsg = document.getElementById("signUpMessage")
    signUpMsg.innerHTML = `<p style="color: red">${text}<\p>`
  }
}

const submit_sign_in = async function(event) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()

  // get form fields
  const email = document.querySelector("#inputEmail")
  const password = document.querySelector("#inputPassword")
  // parse into json
  json = { 
    email: email.value,
    password: password.value
  }  

  body = JSON.stringify(json)
  // request POST to server
  const response = await fetch( "/signin", {
    method:"POST",
    headers: { "Content-Type": "application/json" },
    body 
  })

  // handle response
  const status = await response.status

  if(status === 400) {
    const signInMsg = document.getElementById("signInMessage")
    const res_text = await response.text()
    signInMsg.innerHTML = `<p style="color: red">${res_text}</p>`
  }
  // login successful; redirect to account page
  else if(response.ok) {
    const user_credentials = await response.json()
    const key = user_credentials.key
    window.location.href = `/dashboard-${key}`
  }
}