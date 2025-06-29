# Hướng dẫn khắc phục lỗi kết nối Email Gmail

## Lỗi phổ biến: 535-5.7.8 Username and Password not accepted

Nếu bạn gặp lỗi sau khi cố gắng kết nối với dịch vụ email Gmail:

```
code: 'EAUTH',
response: '535-5.7.8 Username and Password not accepted. For more information, go to\n' +
  '535 5.7.8  https://support.google.com/mail/?p=BadCredentials ...',
responseCode: 535,
command: 'AUTH PLAIN'
```

## Nguyên nhân

Lỗi này xảy ra vì Google đã tăng cường bảo mật cho các ứng dụng bên thứ ba khi truy cập vào tài khoản Gmail. Khi bạn sử dụng Nodemailer để gửi email thông qua SMTP của Gmail, bạn không thể sử dụng mật khẩu Google thông thường, đặc biệt nếu bạn đã bật xác thực 2 bước (2FA).

## Cách khắc phục

### 1. Tạo App Password (Mật khẩu ứng dụng)

1. Đảm bảo bạn đã bật xác thực 2 bước cho tài khoản Google của mình:
   - Truy cập https://myaccount.google.com/security
   - Bật "Xác minh 2 bước" nếu chưa bật

2. Tạo mật khẩu ứng dụng:
   - Truy cập https://myaccount.google.com/apppasswords
   - Trong mục "Chọn ứng dụng", chọn "Khác (Tên tùy chỉnh)" và đặt tên "Weather App"
   - Nhấn "Tạo" và Google sẽ cung cấp mật khẩu 16 ký tự
   - Sao chép mật khẩu này (không cần khoảng trắng)

3. Cập nhật file `.env`:
   - Mở file `.env` trong thư mục gốc của dự án
   - Tìm biến `EMAIL_PASSWORD=`
   - Dán mật khẩu ứng dụng vào sau dấu bằng (không để khoảng trắng)
   - Ví dụ: `EMAIL_PASSWORD=abcdefghijklmnop`

### 2. Kiểm tra cấu hình SMTP

Ứng dụng đã được cấu hình để sử dụng SMTP của Gmail với các thông số sau:

```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Sử dụng SSL/TLS cho port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Phải là App Password
    },
    tls: {
        rejectUnauthorized: false // Chỉ dùng trong môi trường phát triển
    }
});
```

### 3. Kiểm tra thêm nếu vẫn gặp lỗi

- Đảm bảo bạn đã nhập đúng App Password (không phải mật khẩu Google thông thường)
- Đảm bảo tài khoản Gmail không bị Google chặn do hoạt động đáng ngờ
- Thử đăng nhập vào Gmail trên trình duyệt để xác nhận tài khoản hoạt động bình thường
- Kiểm tra xem tài khoản Gmail có bị giới hạn bởi chính sách SMTP của Google không

### 4. Lưu ý về bảo mật

- Không bao giờ chia sẻ App Password của bạn
- Không lưu trữ App Password trong mã nguồn hoặc đưa lên hệ thống kiểm soát phiên bản
- Nếu nghi ngờ App Password bị lộ, hãy xóa và tạo lại một cái mới

## Tài liệu tham khảo

- [Nodemailer SMTP Transport](https://nodemailer.com/smtp/)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)