/**
 * Email Configuration
 * 
 * This file handles email notifications using Nodemailer.
 */

const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const db = require('../models/sequelize');
const config = require('./index');
const sequelize = db.sequelize;

// Cấu hình transporter cho Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Sử dụng SSL/TLS cho port 465
    auth: {
        user: process.env.EMAIL_USER || 'quangluan03052000@gmail.com', // Cần cấu hình trong .env
        pass: process.env.EMAIL_PASSWORD // PHẢI sử dụng App Password cho Gmail
    },
    tls: {
        // Không yêu cầu xác thực chứng chỉ - chỉ dùng trong môi trường phát triển
        rejectUnauthorized: false
    }
});

// Kiểm tra kết nối email
const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('Kết nối email thành công. Sẵn sàng gửi thông báo.');
        return true;
    } catch (error) {
        console.error('Lỗi kết nối email:', error);
        return false;
    }
};

// Gửi email thông báo thời tiết hàng ngày
const sendDailyWeatherEmail = async (user, weatherData) => {
    try {
        // Tìm cài đặt thông báo email của người dùng
        const emailNotification = await db.EmailNotification.findOne({
            where: { userId: user.id, dailyEnabled: true }
        });
        
        if (!emailNotification) {
            return;
        }

        const mailOptions = {
            from: `"Weathery App" <${process.env.EMAIL_USER || 'quangluan03052000@gmail.com'}>`,
            to: emailNotification.email || user.email,
            subject: 'Báo cáo thời tiết hàng ngày từ Weathery',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #4ecdc4;">Báo cáo thời tiết hàng ngày</h2>
                    <p>Xin chào ${user.displayName},</p>
                    <p>Đây là báo cáo thời tiết hàng ngày của bạn:</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3 style="margin-top: 0; color: #333;">Thời tiết hôm nay</h3>
                        <p><strong>Nhiệt độ:</strong> ${weatherData.temperature}°C</p>
                        <p><strong>Điều kiện:</strong> ${weatherData.condition}</p>
                        <p><strong>Độ ẩm:</strong> ${weatherData.humidity}%</p>
                        <p><strong>Gió:</strong> ${weatherData.wind} km/h</p>
                    </div>
                    
                    <p>Chúc bạn có một ngày tốt lành!</p>
                    <p style="font-size: 12px; color: #888; margin-top: 30px;">
                        Đây là email tự động từ ứng dụng Weathery. Để thay đổi cài đặt thông báo, vui lòng truy cập 
                        <a href="${config.app.baseUrl}/thongbao.html">trang Thông báo</a> của chúng tôi.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Đã gửi email thời tiết hàng ngày cho ${user.email}`);
    } catch (error) {
        console.error(`Lỗi khi gửi email thời tiết hàng ngày cho ${user.email}:`, error);
    }
};

// Gửi email cảnh báo thời tiết khắc nghiệt
const sendSevereWeatherAlert = async (user, alertData) => {
    try {
        // Tìm cài đặt thông báo email của người dùng
        const emailNotification = await db.EmailNotification.findOne({
            where: { userId: user.id, severeWeatherEnabled: true }
        });
        
        if (!emailNotification) {
            return;
        }

        // Kiểm tra xem loại cảnh báo có được bật không
        const alertType = alertData.type; // 'storm', 'heavy-rain', 'extreme-heat', 'fog'
        if (!emailNotification.severeWeatherTypes.includes(alertType)) {
            return;
        }

        const alertTitles = {
            'storm': 'Cảnh báo bão',
            'heavy-rain': 'Cảnh báo mưa lớn',
            'extreme-heat': 'Cảnh báo nắng nóng',
            'fog': 'Cảnh báo sương mù'
        };

        const mailOptions = {
            from: `"Weathery App" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
            to: emailNotification.email || user.email,
            subject: `${alertTitles[alertType]} từ Weathery`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #ff6b6b;">${alertTitles[alertType]}</h2>
                    <p>Xin chào ${user.displayName},</p>
                    <p>Chúng tôi phát hiện có điều kiện thời tiết khắc nghiệt sắp xảy ra tại khu vực của bạn:</p>
                    
                    <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ff6b6b;">
                        <h3 style="margin-top: 0; color: #333;">${alertData.title}</h3>
                        <p>${alertData.description}</p>
                        <p><strong>Thời gian:</strong> ${alertData.time}</p>
                        <p><strong>Khu vực:</strong> ${alertData.location}</p>
                    </div>
                    
                    <p>Vui lòng theo dõi cập nhật và thực hiện các biện pháp phòng ngừa cần thiết.</p>
                    <p style="font-size: 12px; color: #888; margin-top: 30px;">
                        Đây là email tự động từ ứng dụng Weathery. Để thay đổi cài đặt thông báo, vui lòng truy cập 
                        <a href="${config.app.baseUrl}/thongbao.html">trang Thông báo</a> của chúng tôi.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Đã gửi email cảnh báo ${alertType} cho ${user.email}`);
    } catch (error) {
        console.error(`Lỗi khi gửi email cảnh báo thời tiết cho ${user.email}:`, error);
    }
};

// Gửi báo cáo thời tiết hàng tuần
const sendWeeklyWeatherReport = async (user, weeklyData) => {
    try {
        // Tìm cài đặt thông báo email của người dùng
        const emailNotification = await db.EmailNotification.findOne({
            where: { userId: user.id, weeklyEnabled: true }
        });
        
        if (!emailNotification) {
            return;
        }

        const mailOptions = {
            from: `"Weathery App" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
            to: emailNotification.email || user.email,
            subject: 'Báo cáo thời tiết hàng tuần từ Weathery',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #45b7d1;">Báo cáo thời tiết hàng tuần</h2>
                    <p>Xin chào ${user.displayName},</p>
                    <p>Đây là báo cáo thời tiết hàng tuần của bạn:</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3 style="margin-top: 0; color: #333;">Dự báo 7 ngày tới</h3>
                        ${weeklyData.map(day => `
                            <div style="border-bottom: 1px solid #e0e0e0; padding: 10px 0;">
                                <p><strong>${day.date}:</strong> ${day.condition}, ${day.tempMin}°C - ${day.tempMax}°C</p>
                            </div>
                        `).join('')}
                    </div>
                    
                    <p>Chúc bạn có một tuần tốt lành!</p>
                    <p style="font-size: 12px; color: #888; margin-top: 30px;">
                        Đây là email tự động từ ứng dụng Weathery. Để thay đổi cài đặt thông báo, vui lòng truy cập 
                        <a href="${config.app.baseUrl}/thongbao.html">trang Thông báo</a> của chúng tôi.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Đã gửi email báo cáo thời tiết hàng tuần cho ${user.email}`);
    } catch (error) {
        console.error(`Lỗi khi gửi email báo cáo thời tiết hàng tuần cho ${user.email}:`, error);
    }
};

// Lên lịch gửi thông báo email
const scheduleDailyNotifications = async () => {
    try {
        // Kiểm tra kết nối email trước
        const isEmailConnected = await verifyEmailConnection();
        if (!isEmailConnected) {
            console.error('Không thể lên lịch thông báo email hàng ngày do lỗi kết nối.');
            return;
        }

        // Hủy tất cả các lịch hiện tại
        Object.keys(schedule.scheduledJobs).forEach(jobName => {
            if (jobName.startsWith('email-notification-daily-')) {
                schedule.cancelJob(jobName);
            }
        });

        // Lấy tất cả cài đặt thông báo email hàng ngày đã bật
        const notifications = await db.EmailNotification.findAll({
            where: { dailyEnabled: true },
            include: [{ model: db.User, as: 'user' }]
        });
        
        notifications.forEach(notification => {
            const userId = notification.userId;
            const [hour, minute] = notification.dailyTime.split(':');
            const rule = new schedule.RecurrenceRule();
            rule.hour = parseInt(hour);
            rule.minute = parseInt(minute);
            
            // Xác định ngày trong tuần dựa trên frequency
            if (notification.dailyFrequency === 'weekdays') {
                rule.dayOfWeek = [1, 2, 3, 4, 5]; // Thứ 2 đến thứ 6
            } else if (notification.dailyFrequency === 'weekends') {
                rule.dayOfWeek = [0, 6]; // Chủ nhật và thứ 7
            }
            // Nếu frequency là 'daily' thì không cần thiết lập dayOfWeek

            schedule.scheduleJob(`email-notification-daily-${userId}`, rule, async () => {
                // Giả lập dữ liệu thời tiết (trong thực tế sẽ lấy từ API)
                const weatherData = {
                    temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
                    condition: ['Nắng', 'Mây rải rác', 'Có mây', 'Mưa nhẹ'][Math.floor(Math.random() * 4)],
                    humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
                    wind: Math.floor(Math.random() * 20) + 5 // 5-25 km/h
                };
                await sendDailyWeatherEmail(notification.user, weatherData);
            });
            
            console.log(`Đã lên lịch thông báo hàng ngày cho người dùng ${userId} vào lúc ${notification.dailyTime} (${notification.dailyFrequency})`);
        });

        console.log(`Đã lên lịch ${notifications.length} thông báo email hàng ngày.`);
    } catch (error) {
        console.error('Lỗi khi lên lịch thông báo email hàng ngày:', error);
    }
};

// Lên lịch báo cáo hàng tuần
const scheduleWeeklyReports = async () => {
    try {
        // Kiểm tra kết nối email trước
        const isEmailConnected = await verifyEmailConnection();
        if (!isEmailConnected) {
            console.error('Không thể lên lịch báo cáo hàng tuần do lỗi kết nối.');
            return;
        }

        // Hủy tất cả các lịch hiện tại
        Object.keys(schedule.scheduledJobs).forEach(jobName => {
            if (jobName.startsWith('email-notification-weekly-')) {
                schedule.cancelJob(jobName);
            }
        });

        // Lấy tất cả cài đặt báo cáo hàng tuần đã bật
        const notifications = await db.EmailNotification.findAll({
            where: { weeklyEnabled: true },
            include: [{ model: db.User, as: 'user' }]
        });
        
        notifications.forEach(notification => {
            const userId = notification.userId;
            const [hour, minute] = notification.weeklyTime.split(':');
            const rule = new schedule.RecurrenceRule();
            rule.hour = parseInt(hour);
            rule.minute = parseInt(minute);
            rule.dayOfWeek = notification.weeklyDay;

            schedule.scheduleJob(`email-notification-weekly-${userId}`, rule, async () => {
                // Giả lập dữ liệu thời tiết hàng tuần (trong thực tế sẽ lấy từ API)
                const weeklyData = [];
                const today = new Date();
                
                for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    
                    weeklyData.push({
                        date: date.toLocaleDateString('vi-VN', { weekday: 'long', month: 'numeric', day: 'numeric' }),
                        condition: ['Nắng', 'Mây rải rác', 'Có mây', 'Mưa nhẹ', 'Mưa vừa'][Math.floor(Math.random() * 5)],
                        tempMin: Math.floor(Math.random() * 10) + 18, // 18-28°C
                        tempMax: Math.floor(Math.random() * 10) + 25 // 25-35°C
                    });
                }
                
                await sendWeeklyWeatherReport(notification.user, weeklyData);
            });
            
            console.log(`Đã lên lịch báo cáo hàng tuần cho người dùng ${userId} vào thứ ${notification.weeklyDay + 1} lúc ${notification.weeklyTime}`);
        });

        console.log(`Đã lên lịch ${notifications.length} báo cáo email hàng tuần.`);
    } catch (error) {
        console.error('Lỗi khi lên lịch báo cáo email hàng tuần:', error);
    }
};

// Lên lịch tất cả các thông báo email
const scheduleEmailNotifications = async () => {
    try {
        await scheduleDailyNotifications();
        await scheduleWeeklyReports();
        console.log('Đã lên lịch tất cả các thông báo email thành công.');
    } catch (error) {
        console.error('Lỗi khi lên lịch thông báo email:', error);
    }
};

// Giả lập gửi cảnh báo thời tiết khắc nghiệt (cho mục đích demo)
const simulateSevereWeatherAlert = async () => {
    try {
        // Lấy tất cả cài đặt thông báo đã bật cảnh báo thời tiết khắc nghiệt
        const notifications = await db.EmailNotification.findAll({
            where: { severeWeatherEnabled: true },
            include: [{ model: db.User, as: 'user' }]
        });
        
        const alertTypes = ['storm', 'heavy-rain', 'extreme-heat', 'fog'];
        const randomAlertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const alertData = {
            type: randomAlertType,
            title: `Cảnh báo ${randomAlertType === 'storm' ? 'bão' : 
                              randomAlertType === 'heavy-rain' ? 'mưa lớn' : 
                              randomAlertType === 'extreme-heat' ? 'nắng nóng' : 'sương mù'}`,
            description: `Dự báo có ${randomAlertType === 'storm' ? 'bão mạnh' : 
                                    randomAlertType === 'heavy-rain' ? 'mưa lớn kéo dài' : 
                                    randomAlertType === 'extreme-heat' ? 'nắng nóng gay gắt' : 'sương mù dày đặc'} trong khu vực của bạn.`,
            time: new Date().toLocaleString('vi-VN'),
            location: 'Khu vực của bạn'
        };
        
        let sentCount = 0;
        for (const notification of notifications) {
            // Kiểm tra xem loại cảnh báo có được bật không
            const alertTypes = notification.severeWeatherTypes || [];
            if (alertTypes.includes(randomAlertType)) {
                await sendSevereWeatherAlert(notification.user, alertData);
                sentCount++;
            }
        }
        
        console.log(`Đã gửi cảnh báo ${randomAlertType} cho ${sentCount} người dùng.`);
    } catch (error) {
        console.error('Lỗi khi gửi cảnh báo thời tiết khắc nghiệt:', error);
    }
};

// Cập nhật lịch thông báo email cho một người dùng cụ thể
const updateUserEmailSchedule = async (userId) => {
    try {
        // Hủy các lịch hiện tại của người dùng
        Object.keys(schedule.scheduledJobs).forEach(jobName => {
            if (jobName === `email-notification-daily-${userId}` || jobName === `email-notification-weekly-${userId}`) {
                schedule.cancelJob(jobName);
            }
        });

        // Lấy cài đặt thông báo email của người dùng
        const notification = await db.EmailNotification.findOne({
            where: { userId },
            include: [{ model: db.User, as: 'user' }]
        });

        if (!notification) {
            console.log(`Không tìm thấy cài đặt thông báo email cho người dùng ${userId}`);
            return;
        }

        // Lên lịch thông báo hàng ngày nếu được bật
        if (notification.dailyEnabled) {
            const [hour, minute] = notification.dailyTime.split(':');
            const rule = new schedule.RecurrenceRule();
            rule.hour = parseInt(hour);
            rule.minute = parseInt(minute);
            
            // Xác định ngày trong tuần dựa trên frequency
            if (notification.dailyFrequency === 'weekdays') {
                rule.dayOfWeek = [1, 2, 3, 4, 5]; // Thứ 2 đến thứ 6
            } else if (notification.dailyFrequency === 'weekends') {
                rule.dayOfWeek = [0, 6]; // Chủ nhật và thứ 7
            }

            schedule.scheduleJob(`email-notification-daily-${userId}`, rule, async () => {
                // Giả lập dữ liệu thời tiết (trong thực tế sẽ lấy từ API)
                const weatherData = {
                    temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
                    condition: ['Nắng', 'Mây rải rác', 'Có mây', 'Mưa nhẹ'][Math.floor(Math.random() * 4)],
                    humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
                    wind: Math.floor(Math.random() * 20) + 5 // 5-25 km/h
                };
                await sendDailyWeatherEmail(notification.user, weatherData);
            });
            
            console.log(`Đã cập nhật lịch thông báo hàng ngày cho người dùng ${userId} vào lúc ${notification.dailyTime} (${notification.dailyFrequency})`);
        }

        // Lên lịch báo cáo hàng tuần nếu được bật
        if (notification.weeklyEnabled) {
            const [hour, minute] = notification.weeklyTime.split(':');
            const rule = new schedule.RecurrenceRule();
            rule.hour = parseInt(hour);
            rule.minute = parseInt(minute);
            rule.dayOfWeek = notification.weeklyDay;

            schedule.scheduleJob(`email-notification-weekly-${userId}`, rule, async () => {
                // Giả lập dữ liệu thời tiết hàng tuần (trong thực tế sẽ lấy từ API)
                const weeklyData = [];
                const today = new Date();
                
                for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    
                    weeklyData.push({
                        date: date.toLocaleDateString('vi-VN', { weekday: 'long', month: 'numeric', day: 'numeric' }),
                        condition: ['Nắng', 'Mây rải rác', 'Có mây', 'Mưa nhẹ', 'Mưa vừa'][Math.floor(Math.random() * 5)],
                        tempMin: Math.floor(Math.random() * 10) + 18, // 18-28°C
                        tempMax: Math.floor(Math.random() * 10) + 25 // 25-35°C
                    });
                }
                
                await sendWeeklyWeatherReport(notification.user, weeklyData);
            });
            
            console.log(`Đã cập nhật lịch báo cáo hàng tuần cho người dùng ${userId} vào thứ ${notification.weeklyDay + 1} lúc ${notification.weeklyTime}`);
        }

        return true;
    } catch (error) {
        console.error(`Lỗi khi cập nhật lịch thông báo email cho người dùng ${userId}:`, error);
        return false;
    }
};

module.exports = {
    verifyEmailConnection,
    sendDailyWeatherEmail,
    sendSevereWeatherAlert,
    sendWeeklyWeatherReport,
    scheduleEmailNotifications,
    simulateSevereWeatherAlert,
    updateUserEmailSchedule
};