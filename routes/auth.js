/**
 * Authentication Routes
 * 
 * This file defines routes for authentication using Google OAuth and local email/password.
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const { User } = require('../models/sequelize');

// Google OAuth login route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/trangchu');
    }
);

// Local login route
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return res.status(401).json({ success: false, message: info.message }); }
        
        req.login(user, (err) => {
            if (err) { return next(err); }
            return res.json({ 
                success: true, 
                user: {
                    id: user.id,
                    displayName: user.displayName,
                    email: user.email,
                    image: user.image
                }
            });
        });
    })(req, res, next);
});

// Register route
router.post('/register', async (req, res) => {
    try {
        const { email, password, displayName } = req.body;
        
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
        }
        
        // Tạo người dùng mới
        const newUser = await User.create({
            email,
            password,
            displayName: displayName || email.split('@')[0] // Sử dụng phần trước @ trong email làm tên hiển thị nếu không cung cấp
        });
        
        // Đăng nhập người dùng mới
        req.login(newUser, (err) => {
            if (err) { return next(err); }
            return res.json({ 
                success: true, 
                user: {
                    id: newUser.id,
                    displayName: newUser.displayName,
                    email: newUser.email
                }
            });
        });
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ success: false, message: 'Lỗi đăng ký tài khoản' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;