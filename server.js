const express = require("express")
const mongoose = require("mongoose")
const path = require("path") // module for file paths
const app = express()

// establish mongodb database (db) connection
const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mydatabase"
const PORT = 3000

// handle all static files in the /public folder
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())

// create connection to db
mongoose.connect(uri)
    .then(() => console.log("Mongoose connected to MongoDB database"))
    .catch(err => console.error("MongoDB connection error:", err))

// schema outlining the data belonging to a user account
const user_schema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: {type: String, required: true },
    key: { type: Number, unique: true },
    signed_in: { type: Boolean, required: true },
    first_name: String,
    last_name: String, 
    tasks: [{
        priority: Number,
        text: String
    }]
}, { timestamps: true })

const User = mongoose.model("User", user_schema)

// send home page html
app.get("/", (req, res) => 
    {res.sendFile(path.join(__dirname, "public", "index.html"))})
// send signup page html
app.get("/signup", (req, res) => 
    {res.sendFile(path.join(__dirname, "public", "sign_up.html"))})
// send signin page html
app.get("/signin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "sign_in.html"))
})

// send dashboard for each user page html (UNIQUE PAGE BY ACCOUNT)
app.get("/dashboard-:key", async (req, res) => {
    const key = req.params.key
    // handle finding user
    try {
        // find user by key
        const user = await User.findOne({ key })
        // handle if user not found
        if(!user) {
            return res.status(404).send("User not found")
        }

        // only send html if signed in from sign in page
        if(user.signed_in) { 
            res.sendFile(path.join(__dirname, "public", "dashboard.html"))
        } else {
            res.status(401).send("No authorized")
        }
    } catch(err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
    res.sendFile(path.join(__dirname, "public", "dashboard.html"))
})
// send user account info
app.get("/api/dashboard/:key/users", async (req, res) => {
    const key = req.params.key
    // handle finding user
    try {
        // find user by key
        const user = await User.findOne({ key })
        // handle if user not found
        if(!user) {
            return res.status(404).send("User not found")
        }

        const name = `${user.first_name} ${user.last_name}` 
        // user found; send tasks data back
        res.json({ id: name || user.email })
    } catch(err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})
// send user account tasks
app.get("/api/dashboard/:key/tasks", async (req, res) => {
    const key = req.params.key
    // handle finding user
    try {
        // find user by key
        const user = await User.findOne({ key })
        // handle if user not found
        if(!user) {
            return res.status(404).send("User not found")
        }

        res.json(user.tasks)
    } catch(err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})
// receive request to remove task from user by user key
app.post("/rmtasks", async (req, res) => {
    // get args from request 
    const key = req.body.key
    const priority = req.body.priority
    const text = req.body.text

    // try to update user account task list
    try {
        // find user by key and pull task from tasks list
        const result = await User.updateOne(
            { key },
            { $pull: { tasks: { priority, text } } }
        )
        // send error if this fails
        if (result.matchedCount === 0) {
            return res.status(404).send("User not found")
        }
        // respond to client
        res.status(200).send("User updated successfully")
    } catch(err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})
// add request to add task to user tasks from user key
app.post("/pushtasks", async (req, res) => {
    // get args from request 
    const key = req.body.key
    const priority = req.body.priority
    const text = req.body.text

    // try to update user account task list
    try {
        // find user by key and push task to tasks list
        const result = await User.updateOne(
            { key },
            { $push: { tasks: { priority, text } } }
        )
        // send error if this fails
        if (result.matchedCount === 0) {
            return res.status(404).send("User not found")
        }
        // respond to client
        res.status(200).send("User updated successfully")
    } catch(err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})

// receive sign up info; handle account registration
app.post("/signup", async (req, res) => {
    // get new sign up info
    const email = req.body.email
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const password = req.body.password
    
    // create unique key from email
    let key = "" // compute key to dashboard url
    for(let i=0; i < email.length; i++) {
        let character =email[i] // "encryption" key
        let value = parseInt(character.charCodeAt(0) / (i+1)).toString()
        key = key + value
    }
    
    try {
        // create a new user instance from req data
        const signed_in = false // mark as not signed in yet
        const new_user = new User({ email, password, key, signed_in, first_name, last_name })
        // attempt to save on mongo db
        await new_user.save()
        // succeeded; tell the client in res
        res.status(201).send("Account registered!")
    } catch(err) {
        // failed to register
        res.status(400).send(`Failed to register; The email may already have an account.`)
    }
})

app.post("/signin", async (req, res) => {
    // get signin info 
    const email = req.body.email
    const password = req.body.password

    try {
        // get user with specified email
        const user = await User.findOne({ email })
        if(!user) {
            return res.status(400).send("User not found. Register with the link above.")
        } // check email password with one specified 
        else if(user.password !== password) {
            return res.status(400).send("Incorrect password")
        }

        // sign in must've been successful; continue
        user.signed_in = true // flag logged in
        user.save()
        // send successful response
        res.send({
            key: user.key
        })

    } catch(err) {
        res.status(500).send(`Error signing in: ${err.message}`)
    }
})

// log user out of site
app.post("/logout", async (req, res) => {
    // get logout info
    const key = req.body.key

    try {
        // find user by key and push logout state
        const result = await User.updateOne(
            { key },
            { signed_in: false }
        )
        // send error if this fails
        if (result.matchedCount === 0) {
            return res.status(404).send("User not found")
        }
        // respond to client
        res.status(200).send("User updated successfully")
    } catch(err) {
        res.status(500).send(`Error signing in: ${err.message}`)
    }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))