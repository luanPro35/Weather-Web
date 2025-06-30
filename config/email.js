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
        if (process.env.NODE_ENV !== 'production') {
            console.log('Kết nối email thành công. Sẵn sàng gửi thông báo.');
        }
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

        // Tạo lời khuyên dựa trên điều kiện thời tiết
        let weatherAdvice = '';
        let weatherIcon = '☀️';
        
        if (weatherData.condition.includes('mưa') || weatherData.condition.includes('rain')) {
            weatherAdvice = 'Hôm nay có mưa, bạn nên mang theo ô hoặc áo mưa khi ra ngoài.';
            weatherIcon = '🌧️';
        } else if (weatherData.temperature > 32) {
            weatherAdvice = 'Nhiệt độ hôm nay khá cao, hãy uống nhiều nước và tránh ra ngoài vào giờ trưa nắng gắt.';
            weatherIcon = '🔥';
        } else if (weatherData.temperature < 15) {
            weatherAdvice = 'Thời tiết hôm nay khá lạnh, hãy mặc ấm khi ra ngoài.';
            weatherIcon = '❄️';
        } else if (weatherData.humidity > 80) {
            weatherAdvice = 'Độ ẩm cao hôm nay, có thể gây cảm giác nóng bức, hãy mặc trang phục thoáng mát.';
            weatherIcon = '💧';
        } else if (weatherData.wind > 30) {
            weatherAdvice = 'Gió mạnh hôm nay, hãy cẩn thận khi di chuyển ngoài trời.';
            weatherIcon = '💨';
        } else {
            weatherAdvice = 'Thời tiết hôm nay khá lý tưởng, thích hợp cho các hoạt động ngoài trời.';
        }
        
        // Tạo gợi ý trang phục
        let clothingTip = '';
        if (weatherData.temperature > 30) {
            clothingTip = 'Nên mặc quần áo nhẹ, thoáng mát và mang theo nước uống.';
        } else if (weatherData.temperature > 25) {
            clothingTip = 'Thời tiết dễ chịu, trang phục nhẹ nhàng là phù hợp.';
        } else if (weatherData.temperature > 20) {
            clothingTip = 'Có thể mát vào buổi sáng/tối, nên mang theo áo khoác mỏng.';
        } else if (weatherData.temperature > 15) {
            clothingTip = 'Thời tiết mát mẻ, nên mặc áo dài tay hoặc áo khoác nhẹ.';
        } else {
            clothingTip = 'Thời tiết lạnh, nên mặc áo ấm khi ra ngoài.';
        }

        const mailOptions = {
            from: `"Weathery App" <${process.env.EMAIL_USER || 'quangluan03052000@gmail.com'}>`,
            to: emailNotification.email || user.email,
            subject: `${weatherIcon} Thời tiết hôm nay: ${weatherData.condition} | ${weatherData.temperature}°C`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #4ecdc4; margin: 0;">Dự báo thời tiết hôm nay</h2>
                        <p style="color: #888; font-size: 14px;">${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #4ecdc4, #45b7d1); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                        <div style="font-size: 36px; margin-bottom: 10px;">${weatherIcon}</div>
                        <div style="font-size: 28px; font-weight: bold;">${weatherData.temperature}°C</div>
                        <div style="font-size: 18px; margin-top: 5px;">${weatherData.condition}</div>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Chi tiết thời tiết</h3>
                        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 120px; margin: 5px; text-align: center;">
                                <div style="font-size: 14px; color: #888;">Độ ẩm</div>
                                <div style="font-size: 16px; font-weight: bold;">${weatherData.humidity}%</div>
                            </div>
                            <div style="flex: 1; min-width: 120px; margin: 5px; text-align: center;">
                                <div style="font-size: 14px; color: #888;">Gió</div>
                                <div style="font-size: 16px; font-weight: bold;">${weatherData.wind} km/h</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background-color: #fff8e1; padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #ffd54f;">
                        <h3 style="margin-top: 0; color: #333;">Lời khuyên hôm nay</h3>
                        <p>${weatherAdvice}</p>
                        <p><strong>Gợi ý trang phục:</strong> ${clothingTip}</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${config.app.baseUrl}/dubao.html" style="background-color: #4ecdc4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Xem dự báo chi tiết</a>
                    </div>
                    
                    <p style="font-size: 12px; color: #888; margin-top: 30px; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        Đây là email tự động từ ứng dụng Weathery. 
                        <a href="${config.app.baseUrl}/thongbao.html" style="color: #4ecdc4;">Thay đổi cài đặt thông báo</a>
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
            'storm': 'CẢNH BÁO BÃO',
            'heavy-rain': 'CẢNH BÁO MƯA LỚN',
            'extreme-heat': 'CẢNH BÁO NẮNG NÓNG',
            'fog': 'CẢNH BÁO SƯƠNG MÙ'
        };

        const alertIcons = {
            'storm': '⛈️',
            'heavy-rain': '🌧️',
            'extreme-heat': '🔥',
            'fog': '🌫️'
        };

        // Tạo hướng dẫn an toàn dựa trên loại cảnh báo
        let safetyInstructions = '';
        let emergencyContacts = '';
        
        switch(alertType) {
            case 'storm':
                safetyInstructions = `
                    <li>Ở trong nhà và tránh xa cửa sổ</li>
                    <li>Chuẩn bị đèn pin, radio chạy pin và các vật dụng khẩn cấp</li>
                    <li>Sạc đầy điện thoại và các thiết bị điện tử</li>
                    <li>Chuẩn bị nước uống và thực phẩm dự trữ</li>
                    <li>Nếu ở ngoài, tìm nơi trú ẩn an toàn và tránh các khu vực có cây cao, cột điện</li>
                `;
                emergencyContacts = 'Cứu hộ: 114 | Cứu hỏa: 114 | Cảnh sát: 113';
                break;
            case 'heavy-rain':
                safetyInstructions = `
                    <li>Tránh di chuyển qua các khu vực ngập lụt</li>
                    <li>Không lái xe qua đường ngập nước</li>
                    <li>Giữ khoảng cách an toàn khi lái xe trên đường trơn trượt</li>
                    <li>Chuẩn bị các vật dụng chống thấm nước</li>
                    <li>Theo dõi cập nhật về tình trạng ngập lụt trong khu vực</li>
                `;
                emergencyContacts = 'Cứu hộ: 114 | Cứu hỏa: 114 | Cảnh sát: 113';
                break;
            case 'extreme-heat':
                safetyInstructions = `
                    <li>Uống nhiều nước, tránh đồ uống có cồn và caffeine</li>
                    <li>Tránh ra ngoài trong khoảng thời gian từ 11h đến 15h</li>
                    <li>Mặc quần áo nhẹ, rộng rãi và màu sáng</li>
                    <li>Sử dụng kem chống nắng khi ra ngoài</li>
                    <li>Tìm nơi có điều hòa nhiệt độ nếu có thể</li>
                    <li>Chú ý các dấu hiệu say nắng: chóng mặt, buồn nôn, đau đầu</li>
                `;
                emergencyContacts = 'Cấp cứu: 115 | Bệnh viện gần nhất';
                break;
            case 'fog':
                safetyInstructions = `
                    <li>Giảm tốc độ và giữ khoảng cách an toàn khi lái xe</li>
                    <li>Sử dụng đèn sương mù hoặc đèn cốt, không dùng đèn pha</li>
                    <li>Tránh vượt xe trong điều kiện tầm nhìn hạn chế</li>
                    <li>Sử dụng vạch kẻ đường làm hướng dẫn</li>
                    <li>Nếu tầm nhìn quá kém, hãy tấp xe vào lề đường an toàn</li>
                `;
                emergencyContacts = 'Cảnh sát giao thông: 113 | Cứu hộ: 114';
                break;
            default:
                safetyInstructions = `
                    <li>Theo dõi các cập nhật thời tiết mới nhất</li>
                    <li>Chuẩn bị sẵn sàng cho các tình huống khẩn cấp</li>
                    <li>Lưu trữ các số điện thoại khẩn cấp</li>
                `;
                emergencyContacts = 'Cứu hộ: 114 | Cấp cứu: 115 | Cảnh sát: 113';
        }

        const mailOptions = {
            from: `"Weathery App" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
            to: emailNotification.email || user.email,
            subject: `⚠️ ${alertIcons[alertType]} ${alertTitles[alertType]}: ${alertData.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                    <div style="text-align: center; background-color: #ff6b6b; color: white; padding: 15px; border-radius: 10px 10px 0 0;">
                        <div style="font-size: 36px; margin-bottom: 10px;">${alertIcons[alertType]}</div>
                        <h1 style="margin: 0; font-size: 24px;">${alertTitles[alertType]}</h1>
                    </div>
                    
                    <div style="padding: 20px;">
                        <p style="font-size: 16px;"><strong>Xin chào ${user.displayName},</strong></p>
                        <p style="font-size: 16px;">Chúng tôi phát hiện có điều kiện thời tiết khắc nghiệt sắp xảy ra tại khu vực của bạn:</p>
                        
                        <div style="background-color: #fff8e1; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #ff6b6b;">
                            <h2 style="margin-top: 0; color: #e74c3c;">${alertData.title}</h2>
                            <p style="font-size: 16px; line-height: 1.5;">${alertData.description}</p>
                            <div style="display: flex; flex-wrap: wrap; margin-top: 15px;">
                                <div style="flex: 1; min-width: 150px; margin-bottom: 10px;">
                                    <p style="margin: 0; font-size: 14px; color: #888;">Thời gian:</p>
                                    <p style="margin: 5px 0 0; font-weight: bold;">${alertData.time}</p>
                                </div>
                                <div style="flex: 1; min-width: 150px; margin-bottom: 10px;">
                                    <p style="margin: 0; font-size: 14px; color: #888;">Khu vực:</p>
                                    <p style="margin: 5px 0 0; font-weight: bold;">${alertData.location}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="color: #2c3e50; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Hướng dẫn an toàn</h3>
                            <ul style="padding-left: 20px; line-height: 1.6;">
                                ${safetyInstructions}
                            </ul>
                        </div>
                        
                        <div style="background-color: #e74c3c; color: white; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Số điện thoại khẩn cấp</h3>
                            <p style="font-size: 16px; margin-bottom: 0;">${emergencyContacts}</p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${config.app.baseUrl}/dubao.html" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Xem dự báo chi tiết</a>
                        </div>
                    </div>
                    
                    <p style="font-size: 12px; color: #888; margin-top: 30px; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        Đây là email tự động từ ứng dụng Weathery. 
                        <a href="${config.app.baseUrl}/thongbao.html" style="color: #3498db;">Thay đổi cài đặt thông báo</a>
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

        // Phân tích xu hướng thời tiết trong tuần
        const tempAvg = weeklyData.reduce((sum, day) => sum + ((day.tempMin + day.tempMax) / 2), 0) / weeklyData.length;
        const rainDays = weeklyData.filter(day => day.condition.toLowerCase().includes('mưa')).length;
        const sunnyDays = weeklyData.filter(day => day.condition.toLowerCase().includes('nắng') || day.condition.toLowerCase().includes('quang')).length;
        const hotDays = weeklyData.filter(day => day.tempMax > 35).length;
        const coldDays = weeklyData.filter(day => day.tempMin < 15).length;

        // Tạo tóm tắt tuần
        let weeklySummary = '';
        if (rainDays >= 4) {
            weeklySummary = 'Tuần này có nhiều mưa, hãy chuẩn bị ô và áo mưa khi ra ngoài.';
        } else if (sunnyDays >= 4) {
            weeklySummary = 'Tuần này chủ yếu là nắng đẹp, thích hợp cho các hoạt động ngoài trời.';
        } else if (hotDays >= 3) {
            weeklySummary = 'Tuần này có nhiều ngày nắng nóng, hãy uống đủ nước và tránh ra ngoài vào giờ cao điểm.';
        } else if (coldDays >= 3) {
            weeklySummary = 'Tuần này có nhiều ngày lạnh, nhớ mặc đủ ấm khi ra ngoài.';
        } else {
            weeklySummary = 'Tuần này thời tiết khá đa dạng, hãy theo dõi dự báo hàng ngày để chuẩn bị tốt nhất.';
        }

        // Tạo gợi ý hoạt động cho tuần
        let activitySuggestions = '';
        if (rainDays <= 2 && sunnyDays >= 3) {
            activitySuggestions = `
                <li>Đi dã ngoại hoặc picnic vào cuối tuần</li>
                <li>Tổ chức các hoạt động ngoài trời như đạp xe, chạy bộ</li>
                <li>Thăm các công viên hoặc khu du lịch sinh thái</li>
            `;
        } else if (rainDays >= 4) {
            activitySuggestions = `
                <li>Tham quan bảo tàng hoặc trung tâm mua sắm</li>
                <li>Thưởng thức phim tại rạp hoặc tại nhà</li>
                <li>Ghé thăm các quán cà phê, nhà hàng có không gian ấm cúng</li>
            `;
        } else if (hotDays >= 3) {
            activitySuggestions = `
                <li>Đi bơi hoặc tham quan các khu vui chơi có hồ bơi</li>
                <li>Thưởng thức kem hoặc đồ uống mát lạnh tại các quán cà phê</li>
                <li>Tham quan các trung tâm thương mại có điều hòa</li>
            `;
        } else if (coldDays >= 3) {
            activitySuggestions = `
                <li>Thưởng thức đồ uống nóng tại các quán cà phê</li>
                <li>Tham quan các nhà hàng với món ăn nóng hổi</li>
                <li>Tổ chức họp mặt gia đình hoặc bạn bè trong nhà</li>
            `;
        } else {
            activitySuggestions = `
                <li>Cân nhắc các hoạt động linh hoạt có thể điều chỉnh theo thời tiết</li>
                <li>Chuẩn bị cả phương án trong nhà và ngoài trời</li>
                <li>Theo dõi dự báo thời tiết hàng ngày để lên kế hoạch phù hợp</li>
            `;
        }

        // Tạo biểu tượng thời tiết cho mỗi ngày
        const getWeatherIcon = (condition) => {
            const conditionLower = condition.toLowerCase();
            if (conditionLower.includes('mưa')) return '🌧️';
            if (conditionLower.includes('nắng')) return '☀️';
            if (conditionLower.includes('mây') || conditionLower.includes('râm')) return '⛅';
            if (conditionLower.includes('giông') || conditionLower.includes('sấm')) return '⛈️';
            if (conditionLower.includes('tuyết')) return '❄️';
            if (conditionLower.includes('sương mù')) return '🌫️';
            return '🌤️'; // Mặc định
        };

        // Tạo màu sắc dựa trên nhiệt độ
        const getTempColor = (temp) => {
            if (temp >= 35) return '#FF5733'; // Đỏ nóng
            if (temp >= 30) return '#FF9933'; // Cam nóng
            if (temp >= 25) return '#FFCC33'; // Vàng ấm
            if (temp >= 20) return '#33CC33'; // Xanh lá dễ chịu
            if (temp >= 15) return '#33CCCC'; // Xanh dương mát
            if (temp >= 10) return '#3399FF'; // Xanh dương lạnh
            return '#3366FF'; // Xanh dương rất lạnh
        };

        const mailOptions = {
            from: `"Weathery App" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
            to: emailNotification.email || user.email,
            subject: `📊 Báo cáo thời tiết tuần này - Weathery`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                    <div style="text-align: center; background-color: #4a90e2; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">📊 BÁO CÁO THỜI TIẾT TUẦN NÀY</h1>
                        <p style="margin: 10px 0 0;">Dự báo 7 ngày tới cho khu vực của bạn</p>
                    </div>
                    
                    <div style="padding: 20px;">
                        <p style="font-size: 16px;"><strong>Xin chào ${user.displayName},</strong></p>
                        
                        <div style="background-color: #f0f7ff; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #4a90e2;">
                            <h3 style="margin-top: 0; color: #2c3e50;">Tóm tắt tuần</h3>
                            <p style="font-size: 16px; line-height: 1.5;">${weeklySummary}</p>
                        </div>
                        
                        <h3 style="color: #2c3e50; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Dự báo 7 ngày tới</h3>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 10px; margin: 15px 0;">
                            ${weeklyData.map(day => `
                                <div style="margin-bottom: 15px; padding: 15px; border-radius: 8px; background-color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <h3 style="margin: 0; color: #2c3e50;">${day.date}</h3>
                                        <div style="font-size: 24px;">${getWeatherIcon(day.condition)}</div>
                                    </div>
                                    <p style="margin: 10px 0; font-size: 15px;">${day.condition}</p>
                                    <div style="display: flex; align-items: center; margin-top: 10px;">
                                        <span style="color: ${getTempColor(day.tempMin)}; font-weight: bold;">${day.tempMin}°C</span>
                                        <div style="flex-grow: 1; height: 4px; background: linear-gradient(to right, ${getTempColor(day.tempMin)}, ${getTempColor(day.tempMax)}); margin: 0 10px; border-radius: 2px;"></div>
                                        <span style="color: ${getTempColor(day.tempMax)}; font-weight: bold;">${day.tempMax}°C</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="color: #2c3e50; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Gợi ý hoạt động cho tuần này</h3>
                            <ul style="padding-left: 20px; line-height: 1.6;">
                                ${activitySuggestions}
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${config.app.baseUrl}/dubao.html" style="background-color: #4a90e2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Xem dự báo chi tiết</a>
                        </div>
                    </div>
                    
                    <p style="font-size: 12px; color: #888; margin-top: 30px; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        Đây là email tự động từ ứng dụng Weathery. 
                        <a href="${config.app.baseUrl}/thongbao.html" style="color: #4a90e2;">Thay đổi cài đặt thông báo</a>
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Đã gửi email báo cáo hàng tuần cho ${user.email}`);
    } catch (error) {
        console.error(`Lỗi khi gửi email báo cáo hàng tuần cho ${user.email}:`, error);
    }
};

// Lên lịch gửi thông báo email
const scheduleDailyNotifications = async () => {
    try {
        // Kiểm tra kết nối email trước
        const isEmailConnected = await verifyEmailConnection();
        if (!isEmailConnected) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Không thể lên lịch thông báo email hàng ngày do lỗi kết nối.');
            }
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

        if (process.env.NODE_ENV !== 'production') {
            console.log(`Đã lên lịch ${notifications.length} thông báo email hàng ngày.`);
        }
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

        if (process.env.NODE_ENV !== 'production') {
            console.log(`Đã lên lịch ${notifications.length} báo cáo email hàng tuần.`);
        }
    } catch (error) {
        console.error('Lỗi khi lên lịch báo cáo email hàng tuần:', error);
    }
};

// Lên lịch tất cả các thông báo email
const scheduleEmailNotifications = async () => {
    try {
        await scheduleDailyNotifications();
        await scheduleWeeklyReports();
        if (process.env.NODE_ENV !== 'production') {
            console.log('Đã lên lịch tất cả các thông báo email thành công.');
        }
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
        
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Đã gửi cảnh báo ${randomAlertType} cho ${sentCount} người dùng.`);
        }
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
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Không tìm thấy cài đặt thông báo email cho người dùng ${userId}`);
            }
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
            
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Đã cập nhật lịch thông báo hàng ngày cho người dùng ${userId} vào lúc ${notification.dailyTime} (${notification.dailyFrequency})`);
            }
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
            
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Đã cập nhật lịch báo cáo hàng tuần cho người dùng ${userId} vào thứ ${notification.weeklyDay + 1} lúc ${notification.weeklyTime}`);
            }
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