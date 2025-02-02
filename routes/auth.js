const router = require('express').Router();
const path = require('path');
const bcrypt = require('bcryptjs');
const { isRef } = require('joi');
const jwt = require('jsonwebtoken');
const pdf = require('html-pdf');
const ejs = require('ejs');
const pdfMake = require('pdfMake');
const rateLimit = require('express-rate-limit');

const { create } = require('../models/User');
const User = require('../models/User');

const auth = require('./verifyToken').auth;
const {registrationValidation, loginValidation} = require('../modules/validation');
const {createTokens, deleteTokens} = require('./tokens');
const pdfTemplate = require('../documents/pdfTemplate');
const { send } = require('process');
const sendMail = require('../modules/mailer').sendMail;

// middleware
const minuteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1,
    skipFailedRequests: true
})

// Fonts
var fonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
  };

const frontendUrl = 'http://localhost:3000/';

// Dummy Data
const students = [
  {name: "Joy",
   email: "joy@example.com",
   city: "New York",
   country: "USA"},
  {name: "John",
   email: "John@example.com",
   city: "San Francisco",
   country: "USA"},
  {name: "Clark",
   email: "Clark@example.com",
   city: "Seattle",
   country: "USA"},
  {name: "Watson",
   email: "Watson@example.com",
   city: "Boston",
   country: "USA"},
  {name: "Tony",
   email: "Tony@example.com",
   city: "Los Angels",
   country: "USA"
}];

// Route: /user
// Debug Function.
router.get('/', async (req, res) => {
    try{
        send.status(404).send("Not Found");
        // sendMail(
        //     to='saminyaser.24csedu.016@gmail.com',
        //     subject='Nilkhetian Order Mail'
        // );
        // res.send("Working");
    } catch(err) {
        console.log(err)
        return res.status(400).send(err);
    }
})

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

router.post('/resendconfirmation', minuteLimiter, auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    const token = jwt.sign({ id: req.user.id },
        process.env.EMAIL_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
    sendMail(
        to=user.email,
        subject='Nilkhetian Confirmation Mail',
        html='Hello,<br> Please Click on the link to verify your email.<br><a href='+ frontendUrl + 'response/' + token + '>Click here to verify</a>'
    );
    res.send('Email successfully sent');    
})

router.post('/resetpassword', minuteLimiter, async (req, res) => {
    if(!req.body.email) return res.status(401).send("Invalid Email");
    const email = req.body.email;

    const user = await User.findOne({email: email});
    if(!user) return res.status(401).send('Invalid Email');

    const payload = {
        id: user._id
    };
    const secret = user.password + '-' + user.date;

    // Generate token from payload and secret
    const token = jwt.sign(payload, secret);

    console.log(secret);
    console.log(token);

    // send userId and token
    sendMail(
        to=req.body.email,
        subject='Nilkhtian Password Recovery Mail',
        html='Hello,<br> Please Click to reset your password.<br><a href='+ frontendUrl + 'recoverpassword/' + token + '>Click here to reset password</a>'
    );
    res.send("Recovery mail sent");
})

router.post('/resetpassword/:token', async (req, res) => {
    try{
        const token = req.params.token;
        const newPassword = req.body.newPassword;
        const email = req.body.email;
        if((token === undefined || token === null) || (newPassword === undefined || newPassword === null) || (email === undefined || email === null)){
            res.status(400).send("Bad Request");
        }

        const user = await User.findOne({email: email});
        if(!user) return res.status(404).send("User Not Found");

        const secret = user.password + '-' + user.date;
        const verification = jwt.verify(token, secret);
        if(!verification) res.status(404).send("Page Not Found");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await User.findByIdAndUpdate(verification.id, {'password': hashedPassword}, (err, result) => {
            if(err)
                res.status(404).send("Page Not Found");
            else if(result)
                res.send("Password updated successfully");
        })
    } catch (err) {
        console.log(err);
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
        const token = jwt.sign({ id: savedUser._id },
            process.env.EMAIL_TOKEN_SECRET,
            { expiresIn: '7d' }
        );
        sendMail(
            to=savedUser.email,
            subject='Nilkhetian Confirmation Mail',
            html='Hello,<br> Please Click on the link to verify your email.<br><a href='+ frontendUrl + 'response/' + token + '>Click here to verify</a>'
        );
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

router.patch('/', auth, async (req, res) => {
    var setObject = {};
    
    // Fill default fields
    setObject.phone = req.body.phone;
    setObject.address = req.body.address;
    
    // Get user from database
    const user = await User.findById(req.user.id);

    // Password matching
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send('Invalid Password');

    // Hash new password if required
    if(req.body.newPassword != null && req.body.newPassword != "")
        setObject.password = await bcrypt.hash(req.body.newPassword, 10);
    else
        req.body.newPassword = null;
    
    // Update Profile
    User.findByIdAndUpdate(req.user.id, { $set: setObject }, (err, result) => {
        if(err) return res.status(502).send("Error occured");
        res.send("Profile updated");
    });
})

module.exports = router;