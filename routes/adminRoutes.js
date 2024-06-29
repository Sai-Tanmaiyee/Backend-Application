const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const User = require('../models/User')
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middlewares/auth');
const JWT_SECRET = 'BackendAPI';

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        const admin = new Admin({ username, email, password: hashedPassword, otp });
        const newAdmin = await admin.save();
        
        res.status(201).json(newAdmin);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Email already exists' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (admin && await bcrypt.compare(password, admin.password)) {
            const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/users', verifyToken, async(req, res) => {
    try {
        const user = await User.find(); //returns an array of user objects
        const usernames = user.map(user => user.username)
        res.status(200).json(usernames);
    } catch (error) {
            res.status(500).json({ message: error.message });
        }
})

router.get('/:username', verifyToken, async(req, res) => {
    const { username } = req.params;
    try {
        const user = await User.find({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
            res.status(500).json({ message: error.message });
        }
})

router.delete('/:username', verifyToken, async(req, res) =>{
    const { username } = req.params;
    try {
        const result = await User.deleteOne({ username });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch(error){
        res.status(500).json({ message: error.message });
    }
})

module.exports = router;