/**
 * Main Routes
 * 
 * This file defines the main routes for the application.
 */

const express = require('express');
const path = require('path');
const router = express.Router();
const db = require('../models/sequelize');
const { User } = db;
const emailService = require('../config/email');

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

router.get('/giothegioi', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/giothegioi.html'));
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

// API endpoint để lấy thành phố yêu thích của người dùng
router.get('/api/favorite-cities', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để sử dụng tính năng này' });
    }
    
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }
        
        return res.json({ success: true, favoriteCities: user.favoriteCities || [] });
    } catch (error) {
        console.error('Lỗi khi lấy thành phố yêu thích:', error);
        return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy thành phố yêu thích' });
    }
});

// API endpoint để lưu thành phố yêu thích của người dùng
router.post('/api/favorite-cities', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để sử dụng tính năng này' });
    }
    
    try {
        const { favoriteCities } = req.body;
        
        if (!Array.isArray(favoriteCities)) {
            return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
        }
        
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }
        
        user.favoriteCities = favoriteCities;
        await user.save();
        
        return res.json({ success: true, message: 'Đã lưu thành phố yêu thích thành công' });
    } catch (error) {
        console.error('Lỗi khi lưu thành phố yêu thích:', error);
        return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lưu thành phố yêu thích' });
    }
});

// API endpoint để lưu cài đặt thông báo email
router.post('/api/email-notifications', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để sử dụng tính năng này' });
    }
    
    try {
        const { email, dailyEnabled, dailyTime, dailyFrequency, weeklyEnabled, weeklyDay, weeklyTime, severeWeatherEnabled, severeWeatherTypes } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email không được để trống' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Định dạng email không hợp lệ' });
        }
        
        // Find existing notification settings or create new one
        const [notification, created] = await db.EmailNotification.findOrCreate({
            where: { userId: req.user.id },
            defaults: {
                userId: req.user.id,
                email,
                dailyEnabled: dailyEnabled || false,
                dailyTime: dailyTime || '08:00:00',
                dailyFrequency: dailyFrequency || 'daily',
                weeklyEnabled: weeklyEnabled || false,
                weeklyDay: weeklyDay || 1,
                weeklyTime: weeklyTime || '08:00:00',
                severeWeatherEnabled: severeWeatherEnabled || false,
                severeWeatherTypes: severeWeatherTypes || []
            }
        });
        
        if (!created) {
            // Update existing notification settings
            notification.email = email;
            notification.dailyEnabled = dailyEnabled !== undefined ? dailyEnabled : notification.dailyEnabled;
            notification.dailyTime = dailyTime || notification.dailyTime;
            notification.dailyFrequency = dailyFrequency || notification.dailyFrequency;
            notification.weeklyEnabled = weeklyEnabled !== undefined ? weeklyEnabled : notification.weeklyEnabled;
            notification.weeklyDay = weeklyDay !== undefined ? weeklyDay : notification.weeklyDay;
            notification.weeklyTime = weeklyTime || notification.weeklyTime;
            notification.severeWeatherEnabled = severeWeatherEnabled !== undefined ? severeWeatherEnabled : notification.severeWeatherEnabled;
            notification.severeWeatherTypes = severeWeatherTypes || notification.severeWeatherTypes;
            
            await notification.save();
        }
        
        // Update email notification schedules
        await emailService.updateUserEmailSchedule(req.user.id);
        
        return res.json({ success: true, message: 'Đã lưu cài đặt thông báo email thành công' });
    } catch (error) {
        console.error('Lỗi khi lưu cài đặt thông báo email:', error);
        return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lưu cài đặt thông báo email' });
    }
});

// API endpoint để lấy cài đặt thông báo email
router.get('/api/email-notifications', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để sử dụng tính năng này' });
    }
    
    try {
        const notification = await db.EmailNotification.findOne({
            where: { userId: req.user.id }
        });
        
        if (!notification) {
            // Return default settings if no notification settings found
            return res.json({
                success: true,
                emailSettings: {
                    email: req.user.email,
                    dailyEnabled: false,
                    dailyTime: '08:00:00',
                    dailyFrequency: 'daily',
                    weeklyEnabled: false,
                    weeklyDay: 1,
                    weeklyTime: '08:00:00',
                    severeWeatherEnabled: false,
                    severeWeatherTypes: []
                }
            });
        }
        
        return res.json({
            success: true,
            emailSettings: {
                email: notification.email,
                dailyEnabled: notification.dailyEnabled,
                dailyTime: notification.dailyTime,
                dailyFrequency: notification.dailyFrequency,
                weeklyEnabled: notification.weeklyEnabled,
                weeklyDay: notification.weeklyDay,
                weeklyTime: notification.weeklyTime,
                severeWeatherEnabled: notification.severeWeatherEnabled,
                severeWeatherTypes: notification.severeWeatherTypes
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy cài đặt thông báo email:', error);
        return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy cài đặt thông báo email' });
    }
});

module.exports = router;