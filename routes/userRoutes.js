const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const nodemailer = require('nodemailer')

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        const user = new User({ username, email, password: hashedPassword, otp });
        const newUser = await user.save();

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Account Verification OTP',
          text: `Your OTP is ${otp}`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                res.status(500).json({ message: 'Error sending email' });
            }
            res.status(201).json({ message: 'User registered, check your email for OTP' });
          });
        
        res.status(201).json(newUser);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Email already exists' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

router.post('/verify', async(req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({email, otp});
        if(user) {
            user.isVerified = true;
            user.otp = null;
            await user.save()
            res.status(200).json({ message: 'User verified' });
        } else {
            res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch(error){
        res.status(500).json({ message: error.message });
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            if (!user.isVerified) {
                return res.status(400).json({ message: 'Account not verified' });
            }
            res.status(200).json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/add-info', async(req, res) => {
    const { email, location, age, work, dob, description } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && user.isVerified) {
            user.location = location;
            user.age = age;
            user.work = work;
            user.dob = dob;
            user.description = description;
            await user.save();
            res.status(200).json({ message: 'Information added' });
        } else {
            res.status(404).json({ message: 'User not found or not verified' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.put('/:id', async (req, res) => {
    const { email, location, age, work, dob, description } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { email, location, age, work, dob, description }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
