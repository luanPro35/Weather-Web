/**
 * Main Routes
 * 
 * This file defines the main routes for the application.
 */

const express = require('express');
const path = require('path');
const router = express.Router();

// Middleware xác thực
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // Nếu không xác thực, vẫn cho phép truy cập nhưng không có thông tin người dùng
    return next();
};

// Home page route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../loading.html'));
});

// Routes for other pages
router.get('/trangchu', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/trangchu.html'));
});

router.get('/dubao', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/dubao.html'));
});

router.get('/thanhpho', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/thanhpho.html'));
});

router.get('/thongbao', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/thongbao.html'));
});

router.get('/thanhpho', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/thanhpho.html'));
});

// API endpoint để lấy thông tin người dùng
router.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({
            isAuthenticated: true,
            user: {
                id: req.user.id,
                displayName: req.user.displayName,
                email: req.user.email,
                image: req.user.image
            }
        });
    }
    return res.json({ isAuthenticated: false });
});

module.exports = router;