/**
 * Script gửi email thử nghiệm
 * 
 * Cách sử dụng: node test-email-send.js <email-người-nhận>
 * Ví dụ: node test-email-send.js example@gmail.com
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Lấy địa chỉ email người nhận từ tham số dòng lệnh
const recipientEmail = process.argv[2];

if (!recipientEmail) {
    console.error('Vui lòng cung cấp địa chỉ email người nhận!');
    console.error('Cách sử dụng: node test-email-send.js <email-người-nhận>');
    console.error('Ví dụ: node test-email-send.js example@gmail.com');
    process.exit(1);
}

// Kiểm tra định dạng email đơn giản
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(recipientEmail)) {
    console.error('Địa chỉ email không hợp lệ!');
    process.exit(1);
}

// Hiển thị thông tin cấu hình hiện tại
console.log('\n===== THÔNG TIN CẤU HÌNH EMAIL =====');
console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'Chưa được cấu hình'}`);
console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '******** (đã cấu hình)' : 'Chưa được cấu hình'}`);
console.log(`Người nhận: ${recipientEmail}`);

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

console.log('\n===== ĐANG GỬI EMAIL THỬ NGHIỆM =====');

// Tạo nội dung email
const mailOptions = {
    from: `"Weathery App" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: 'Email thử nghiệm từ Weathery App',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #4ecdc4;">Email thử nghiệm từ Weathery App</h2>
            <p>Xin chào,</p>
            <p>Đây là email thử nghiệm để xác nhận rằng cấu hình email của ứng dụng Weathery đang hoạt động chính xác.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #333;">Thông tin cấu hình</h3>
                <p><strong>Thời gian gửi:</strong> ${new Date().toLocaleString('vi-VN')}</p>
                <p><strong>Người gửi:</strong> ${process.env.EMAIL_USER}</p>
                <p><strong>Người nhận:</strong> ${recipientEmail}</p>
            </div>
            
            <p>Nếu bạn nhận được email này, điều đó có nghĩa là cấu hình email của ứng dụng Weathery đã hoạt động chính xác!</p>
            <p>Bạn có thể tiếp tục sử dụng ứng dụng và tận hưởng các tính năng thông báo email.</p>
            
            <p style="font-size: 12px; color: #888; margin-top: 30px;">
                Đây là email tự động từ ứng dụng Weathery. Vui lòng không trả lời email này.
            </p>
        </div>
    `
};

// Gửi email
transporter.sendMail(mailOptions)
    .then(info => {
        console.log('\n✅ GỬI EMAIL THÀNH CÔNG!');
        console.log(`Email đã được gửi đến: ${recipientEmail}`);
        console.log(`ID thông điệp: ${info.messageId}`);
        console.log('\nVui lòng kiểm tra hộp thư đến của bạn để xác nhận.');
        console.log('Lưu ý: Email có thể xuất hiện trong thư mục Spam hoặc Thư rác.');
    })
    .catch(error => {
        console.log('\n❌ GỬI EMAIL THẤT BẠI!');
        console.log('Lỗi khi gửi email:', error);
        console.log('\n===== HƯỚNG DẪN KHẮC PHỤC =====');
        console.log('Vui lòng xem hướng dẫn khắc phục trong file EMAIL_TROUBLESHOOTING.md');
    });