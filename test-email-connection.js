/**
 * Script kiểm tra kết nối email
 * 
 * Script này giúp kiểm tra kết nối đến dịch vụ email Gmail
 * trước khi chạy ứng dụng chính.
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Hiển thị thông tin cấu hình hiện tại
console.log('\n===== THÔNG TIN CẤU HÌNH EMAIL =====');
console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'Chưa được cấu hình'}`);
console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '******** (đã cấu hình)' : 'Chưa được cấu hình'}`);

// Tạo transporter với cấu hình giống trong ứng dụng
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Sử dụng SSL/TLS cho port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        // Không yêu cầu xác thực chứng chỉ - chỉ dùng trong môi trường phát triển
        rejectUnauthorized: false
    }
});

console.log('\n===== ĐANG KIỂM TRA KẾT NỐI EMAIL =====');

// Kiểm tra kết nối
transporter.verify()
    .then(() => {
        console.log('\n✅ KẾT NỐI THÀNH CÔNG!');
        console.log('Cấu hình email của bạn hoạt động tốt.');
        console.log('Bạn có thể chạy ứng dụng chính và sử dụng tính năng gửi email.');
        
        // Hỏi người dùng có muốn gửi email thử nghiệm không
        console.log('\n===== GỬI EMAIL THỬ NGHIỆM =====');
        console.log('Bạn có thể gửi email thử nghiệm bằng cách chạy:');
        console.log('node test-email-send.js <email-người-nhận>');
    })
    .catch(error => {
        console.log('\n❌ KẾT NỐI THẤT BẠI!');
        console.log('Lỗi kết nối email:', error);
        console.log('\n===== HƯỚNG DẪN KHẮC PHỤC =====');
        
        if (error.code === 'EAUTH' && error.responseCode === 535) {
            console.log('Lỗi xác thực (535-5.7.8): Username và Password không được chấp nhận.');
            console.log('Nguyên nhân phổ biến:');
            console.log('1. Bạn đang sử dụng mật khẩu Google thông thường thay vì App Password');
            console.log('2. App Password không chính xác hoặc đã hết hạn');
            console.log('3. Tài khoản Gmail của bạn có thể đã bị Google chặn do hoạt động đáng ngờ');
            
            console.log('\nCách khắc phục:');
            console.log('1. Tạo App Password mới: https://myaccount.google.com/apppasswords');
            console.log('2. Cập nhật biến EMAIL_PASSWORD trong file .env');
            console.log('3. Xem hướng dẫn chi tiết trong file EMAIL_TROUBLESHOOTING.md');
        } else if (error.code === 'ESOCKET') {
            console.log('Lỗi kết nối socket: Không thể kết nối đến máy chủ SMTP.');
            console.log('Nguyên nhân phổ biến:');
            console.log('1. Không có kết nối internet');
            console.log('2. Cổng 465 bị chặn bởi tường lửa');
            console.log('3. Cấu hình host hoặc port không chính xác');
            
            console.log('\nCách khắc phục:');
            console.log('1. Kiểm tra kết nối internet');
            console.log('2. Kiểm tra cấu hình tường lửa');
            console.log('3. Xác nhận cấu hình host và port là chính xác');
        } else {
            console.log('Vui lòng xem hướng dẫn khắc phục trong file EMAIL_TROUBLESHOOTING.md');
        }
    });