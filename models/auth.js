const express = require('express')
const router = express.Router()
const User = require("../models/User")
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
    const data = req.body;

    // Check if all required fields are provided
    if (!data.username || !data.email || !data.password || !data.age || !data.gender) {
        return res.status(400).json({ error: 'Username, email, password, age, and gender are required' });
    }

    try {
        // Check if the email is already in use
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        //check password length
        if (data.password.length < 6) {
            return res.status(400).json({ error: 'password should be at least 6 character long' });
        }

        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        // Create new user
        const newUser = new User({
            username: data.username,
            email: data.email,
            password: hashedPassword,
            age: data.age,
            gender: data.gender
        });

        // Save the new user to the database
        const savedUser = await newUser.save();
        console.log('User registered:', savedUser);
        res.status(200).json(savedUser);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// For User Login
router.post('/login', async (req, res) => {
    try {

        //If email does not exist 
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(404).json({ error: "Email does not exist" })

        //If Password does not match
        const validPassword = await bcrypt.compare(req.body.password, user.password );
        !validPassword && res.status(400).json({ error: "Password is incorrect" })

        res.status(200).json(user)


    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }

})

module.exports = router