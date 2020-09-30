const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { isRef } = require('joi');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { create } = require('../models/User');
const User = require('../models/User');
const auth = require('./verifyToken').auth;
const {registrationValidation, loginValidation} = require('../validation');
const {createTokens, deleteTokens} = require('./tokens');

// middleware
const minuteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1,
    skipFailedRequests: true
})


// Route: /user
// router.get('/', async (req, res) => {
//     try{
//         const users = await User.find();
//         res.json(users);
//     } catch(err) {
//         res.status(400).send(err);
//     }
// })

router.get('/confirmation/:token', async (req, res) => {
    try{
        const token = jwt.verify(req.params.token, process.env.EMAIL_TOKEN_SECRET);
        console.log(token);
        User.findByIdAndUpdate(token.id, {'confirmed': true}, (err, result) => {
            if(err)
                res.status(404).send("Page Not Found");
            else
                res.send("Account Successfully Verified");
        })  
    } catch (err) {
        console.log(err);
        return res.status(404).send("Invalid link")
    }
    
})

router.post('/resendconfirmation', minuteLimiter, auth, (req, res) => {
    console.log('Email JWT Token: ' + 
            jwt.sign({ id: req.user.id },
                process.env.EMAIL_TOKEN_SECRET,
                { expiresIn: '7d' }
            ));
    res.send('Email successfully sent');    
})

router.post('/resetpassword', minuteLimiter, async (req, res) => {
    if(!req.body.email) return res.status(401).send("Invalid Email");
    const email = req.body.email;

    const user = await User.findOne({email: email});
    if(!user) return res.status(401).send('Invalid Email');

    const payload = {
        id: user._id,
        name: user.name
    };
    const secret = user.password + '-' + user.date;

    // Generate token from payload and secret
    const token = jwt.sign(payload, secret);

    // send userId and token
    res.send({
        token: token
    });
})

router.get('/resetpassword/:token', async (req, res) => {
    try{
        const token = req.params.token;
        const newPassword = req.body.newPassword;
        const email = req.body.email;

        const user = await User.findOne({email: email});
        if(!user) return res.status(404).send("Page Not Found");

        var secret = user.password + '-' + user.date;
        const verification = jwt.verify(token, secret);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const check = await User.findByIdAndUpdate(verification.id, {'password': hashedPassword}, (err, result) => {
            if(err)
                res.status(404).send("Page Not Found");
            else if(result)
                res.send("Password updated successfully");
        })
    } catch (err) {
        res.send(err);
    }
})

router.post('/register', async (req, res) => {
    // Validation
    const {error} = registrationValidation(req.body);
    if(error)  return res.status(401).send(error);

    // User already exists
    const emailExists = await User.findOne({email: req.body.email});
    if(emailExists) return res.status(409).send("Email already exists");

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Creating new user
    const user = User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        phone: req.body.phone,
        address: req.body.address,
        confirmed: false
    })
    try {
        const savedUser = await user.save();
        res.status(200).send("An e-mail has been sent to your e-mail address for verification\nPlease verify your e-mail to complete registration.");
        console.log('Email JWT Token: ' + 
            jwt.sign({ id: savedUser._id },
                process.env.EMAIL_TOKEN_SECRET,
                { expiresIn: '7d' }
            ));
    } catch(err) {
        res.status(400).send(err);
    }
})

router.post('/login', async (req, res) => {
    // Login Validation
    const {error} = loginValidation(req.body);
    if(error) return res.status(401).send(error.details[0].message);
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(401).send('Invalid Email');

    
    // Password is Correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send('Invalid Password');

    // Create and Assign a token
    const token = await createTokens(user);
    res.json({ accessToken: token[0], refreshToken: token[1],
        name: user.name, 
        email: user.email,
        phone: user.phone,
        address: user.address,
        confirmed: user.confirmed
    });
})

router.post('/logout', async (req, res) => {
    try{
        deleteTokens(req.body.token);
        res.send("Successfully logged out");
    } catch {
        res.send("Error occured while logging out");
    }
})

module.exports = router;