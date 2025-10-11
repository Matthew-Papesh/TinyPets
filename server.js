const express = require("express")
const mongoose = require("mongoose")
const path = require("path") // module for file paths
const app = express()

// establish mongodb database (db) connection
const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mydatabase"
const PORT = 3333

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
    password: { type: String, required: true },
    key: { type: Number, unique: true },
    signed_in: { type: Boolean, required: true },
    first_name: String,
    last_name: String,
    credits: Number,
    egg: {name: String, src_img: String, id: Number},
    pets: [{src_img: String, id: Number}]
}, { timestamps: true })

//hello world: HEY EMMA

const User = mongoose.model("User", user_schema)

// send home page html
app.get("/", (req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")) })
// send signup page html
app.get("/signup", (req, res) => { res.sendFile(path.join(__dirname, "public", "sign_up.html")) })
// send signin page html
app.get("/signin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "sign_in.html"))})
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"))})
app.get("/store", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "store.html"))})
app.get("/mypets", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "mypets.html"))})
app.get("/store", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "store.html"))})
app.get("/hatcher", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "hatcher.html"))})

// send account page for each user page html (UNIQUE PAGE BY ACCOUNT)
app.get("/dashboard/:key", async (req, res) => {
    const key = req.params.key
    if (key !== "0") {
        // handle finding user
        try {
            // find user by key
            const user = await User.findOne({ key })
            // handle if user not found
            if (!user) {
                return res.status(404).send("User not found")
            }

            // only send html if signed in from sign in page
            if (user.signed_in) {
                res.sendFile(path.join(__dirname, "public", "dashboard.html"))
            } else {
                res.status(401).send("Not authorized")
            }
        } catch (err) {
            res.status(500).send(`Server error: ${err.message}`)
        }
    } else {
        console.log(key)
        res.sendFile(path.join(__dirname, "public", "dashboard.html"))
    }
})
// send account page for each user page html (UNIQUE PAGE BY ACCOUNT)
app.get("/hatcher/:key", async (req, res) => {
    const key = req.params.key
    if(key !== "0") {
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
                res.sendFile(path.join(__dirname, "public", "hatcher.html"))
            } else {
                res.status(401).send("Not authorized")
            }
        } catch(err) {
            res.status(500).send(`Server error: ${err.message}`)
        }
    }

    console.log(key)
    res.sendFile(path.join(__dirname, "public", "hatcher.html"))
})
// send account page for each user page html (UNIQUE PAGE BY ACCOUNT)
// send store page for each user
app.get("/store/:key", async (req, res) => {
    const key = req.params.key
    if (key !== "0") {
        // handle finding user
        try {
            // find user by key
            const user = await User.findOne({ key })
            // handle if user not found
            if (!user) {
                return res.status(404).send("User not found")
            }

            // only send html if signed in from sign in page
            if (user.signed_in) {
                res.sendFile(path.join(__dirname, "public", "store.html"))
            } else {
                res.status(401).send("Not authorized")
            }
        } catch (err) {
            res.status(500).send(`Server error: ${err.message}`)
        }
    } else {
        console.log(key)
        res.sendFile(path.join(__dirname, "public", "store.html"))
    }
})
// send mypets page for each user
app.get("/mypets/:key", async (req, res) => {
    const key = req.params.key
    if (key !== "0") {
        // handle finding user
        try {
            // find user by key
            const user = await User.findOne({ key })
            // handle if user not found
            if (!user) {
                return res.status(404).send("User not found")
            }

            // only send html if signed in from sign in page
            if (user.signed_in) {
                res.sendFile(path.join(__dirname, "public", "mypets.html"))
            } else {
                res.status(401).send("Not authorized")
            }
        } catch (err) {
            res.status(500).send(`Server error: ${err.message}`)
        }
    } else {
        console.log(key)
        res.sendFile(path.join(__dirname, "public", "mypets.html"))
    }
})
// send user account info
app.get("/api/dashboard/:key/users", async (req, res) => {
    const key = req.params.key
    // handle finding user
    try {
        // find user by key
        const user = await User.findOne({ key })
        // handle if user not found
        if (!user) {
            return res.status(404).send("User not found")
        }

        const name = `${user.first_name} ${user.last_name}`
        // user found; send tasks data back
        res.json({ id: name || user.email })
    } catch (err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})
// send user account eggs owned
app.get("/api/dashboard/:key/egg", async (req, res) => {
    const key = req.params.key
    // handle finding user
    try {
        // find user by key
        const user = await User.findOne({ key })
        // handle if user not found
        if (!user) {
            return res.status(404).send("User not found")
        }

        res.send(user.egg)
    } catch (err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})
// send user account pets owned
app.get("/api/dashboard/:key/pets", async (req, res) => {
    const key = req.params.key
    // handle finding user
    try {
        // find user by key
        const user = await User.findOne(({ key }))
        if (!user) {
            return res.status(404).send("User not found")
        }

        res.send(user.pets)
    } catch (err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})

// send user account credits
app.get("/api/dashboard/:key/credits", async (req, res) => {
    const key = req.params.key
    try {
        // find user by key
        let user = await User.findOne({ key })
        if (!user) {
            return res.status(404).send("User not found")
        }

        // Initialize credits if not set
        if (user.credits === undefined || user.credits === null) {
            user.credits = 100
            await user.save()
        }

        res.json({ credits: user.credits || 0 })
    } catch (err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})

// update user account credits
app.post("/api/dashboard/:key/credits", async (req, res) => {
    const key = req.params.key
    const { amount } = req.body

    try {
        // find user by key and update credits
        const user = await User.findOneAndUpdate(
            { key },
            { $inc: { credits: amount } },
            { new: true, upsert: false }
        )

        if (!user) {
            return res.status(404).send("User not found")
        }

        res.json({ credits: user.credits })
    } catch (err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})

// receive request to remove egg from user account
app.post("/rmegg", async (req, res) => {
    // get args from request 
    const key = req.body.key

    // try to update user account 
    try {
        // find user by key and remove egg (set to null)
        const result = await User.updateOne(
            { key },
            { $unset: { egg: "" } }
        )
        // send error if this fails
        if (result.matchedCount === 0) {
            return res.status(404).send("User not found")
        }
        // respond to client
        res.status(200).send("Egg removed successfully")
    } catch (err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})
// receive request to remove owned pet from user account
app.post("/rmpet", async (req, res) => {
    // get args from request 
    const key = req.body.key
    const src_img = req.body.src_img
    const id = req.body.id


    // try to update user account 
    try {
        // find user by key and pull owned pet 
        const result = await User.updateOne(
            { key },
            { $pull: { pets: { src_img, id } } }
        )
        // send error if this fails
        if (result.matchedCount === 0) {
            return res.status(404).send("User not found")
        }
        // respond to client
        res.status(200).send("User updated successfully")
    } catch (err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})

// sell pet endpoint - removes pet and adds 100 credits
app.post("/sellpet", async (req, res) => {
    // get args from request 
    const key = req.body.key
    const src_img = req.body.src_img
    const id = req.body.id
    const sellPrice = 100  // all pets worth 100 credits

    // try to update user account 
    try {
        // first check if user exists and has the pet
        const user = await User.findOne({ key })
        if (!user) {
            return res.status(404).send("User not found")
        }

        // check if user actually has this pet
        const hasPet = user.pets.some(pet => pet.src_img === src_img && pet.id === id)
        if (!hasPet) {
            return res.status(400).send("Pet not found in user's collection")
        }

        // remove pet and add credits in one atomic operation
        const result = await User.updateOne(
            { key },
            { 
                $pull: { pets: { src_img, id } },
                $inc: { credits: sellPrice }
            }
        )
        
        // send error if this fails
        if (result.matchedCount === 0) {
            return res.status(404).send("User not found")
        }
        
        // get updated user data to return new credit amount
        const updatedUser = await User.findOne({ key })
        
        // respond to client
        res.status(200).json({ 
            message: "Pet sold successfully", 
            credits: updatedUser.credits,
            earnedCredits: sellPrice
        })
    } catch (err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})

// add request to add an egg to user account from user key
app.post("/pushegg", async (req, res) => {
    const key = req.body.key
    const name = req.body.name 
    const src_img = req.body.src_img
    const id = req.body.id
    const cost = req.body.cost || 100  // default cost of 100 credits

    // try to update user account egg and deduct credits
    try {
        // first check if user has enough credits
        const user = await User.findOne({ key })
        if (!user) {
            return res.status(404).send("User not found")
        }
        if (user.credits < cost) {
            return res.status(400).json({ error: "Insufficient credits" })
        }

        // update user with new egg and deduct credits
        const result = await User.updateOne(
            { key },
            {
                $set: { egg: {name, src_img, id } },
                $inc: { credits: -cost }
            }
        )

        // send error if this fails
        if (result.matchedCount === 0) {
            return res.status(404).send("User not found")
        }

        // get updated user data
        const updatedUser = await User.findOne({ key })

        // respond to client with updated data
        res.status(200).json({
            message: "Egg purchased successfully",
            egg: updatedUser.egg,
            credits: updatedUser.credits
        })
    } catch (err) {
        res.status(500).send(`Server error: ${err.message}`)
    }
})
// add request to add a pet to user account from user key
app.post("/pushpet", async (req, res) => {
    // get args from request 
    const key = req.body.key
    const src_img = req.body.src_img
    const id = parseInt(req.body.id)

    console.log(req.body)

    // try to update user account task list
    try {
        // find user by key and push pet to account
        const result = await User.updateOne(
            { key },
            { $push: { pets: { src_img, id } } }
        )
        // send error if this fails
        if (result.matchedCount === 0) {
            return res.status(404).send("User not found")
        }
        // respond to client
        res.status(200).send("User updated successfully")
    } catch (err) {
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
    for (let i = 0; i < email.length; i++) {
        let character = email[i] // "encryption" key
        let values = parseInt(character.charCodeAt(0) / (i + 1)).toString()
        let digit = values.at(parseInt(values.length / 2))
        key = key + digit
    }

    try {
        // create a new user instance from req data
        const signed_in = false // mark as not signed in yet
        const credits = 100 // give new users 100 starting credits
        const new_user = new User({ email, password, key, signed_in, first_name, last_name, credits })
        // attempt to save on mongo db
        await new_user.save()
        // succeeded; tell the client in res
        res.status(201).send("Account registered!")
    } catch (err) {
        // failed to register
        res.status(400).send(`Failed to register; The email may already have an account.`)
    }
})
// receive sign in info; handle account signin
app.post("/signin", async (req, res) => {
    // get signin info 
    const email = req.body.email
    const password = req.body.password

    try {
        // get user with specified email
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).send("User not found. Register with the link above.")
        } // check email password with one specified 
        else if (user.password !== password) {
            return res.status(400).send("Incorrect password")
        }

        // sign in must've been successful; continue
        user.signed_in = true // flag logged in
        user.save()
        // send successful response
        res.send({
            key: user.key
        })

    } catch (err) {
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
    } catch (err) {
        res.status(500).send(`Error signing in: ${err.message}`)
    }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))