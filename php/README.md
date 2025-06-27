http://localhost/weathery/php/login_with_google.php# Hướng dẫn sử dụng hệ thống đăng nhập Google OAuth

## Cài đặt

Hệ thống đã được cài đặt và cấu hình đầy đủ. Các thành phần chính bao gồm:

1. **PHP với extension mysqli**: Đã được cài đặt và cấu hình
2. **Google API Client**: Đã được cài đặt thông qua Composer
3. **Database MySQL**: Đã được cấu hình và bảng `users` đã được tạo

## Cấu trúc thư mục

- `config.php`: Chứa cấu hình cho Google OAuth và kết nối database
- `login_with_google.php`: Trang bắt đầu quá trình đăng nhập với Google
- `google_oauth_callback.php`: Trang xử lý callback từ Google sau khi xác thực
- `vendor/`: Thư mục chứa các thư viện PHP được cài đặt qua Composer

## Cách sử dụng

1. Để đăng nhập với Google, người dùng truy cập vào đường dẫn:
   ```
   http://localhost/weathery/php/login_with_google.php
   ```

2. Sau khi đăng nhập thành công, người dùng sẽ được chuyển hướng về trang:
   ```
   http://localhost/weathery/loading.html?name={tên_người_dùng}
   ```

## Thông tin kỹ thuật

- **Database**: MySQL 8.0.42
- **PHP**: 8.4.8
- **Google API Client**: 2.12.6

## Kiểm tra hệ thống

Để kiểm tra trạng thái của hệ thống, bạn có thể chạy script:
```
php system_check.php
```

Script này sẽ kiểm tra:
- Phiên bản PHP
- Các extension cần thiết
- Kết nối database
- Cấu hình Google API Client
- Sự tồn tại của các file PHP cần thiết

## Xử lý lỗi

Nếu gặp vấn đề với đăng nhập Google OAuth, hãy kiểm tra:

1. Cấu hình Google API trong `config.php`
2. Đảm bảo URL callback đã được cấu hình đúng trong Google Cloud Console
3. Kiểm tra kết nối database
4. Kiểm tra logs của PHP và web server