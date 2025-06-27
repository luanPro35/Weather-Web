# Weather-Web - Ứng dụng Thời tiết

## Giới thiệu

Weather-Web là một ứng dụng web thời tiết với giao diện người dùng được xây dựng bằng Node.js (Express) cho phần frontend và PHP cho phần xác thực người dùng thông qua Google OAuth.

## Cấu trúc dự án

```
├── public/                  # Thư mục chứa tài nguyên tĩnh
│   ├── css/                # Các file CSS
│   ├── html/               # Các file HTML
│   └── js/                 # Các file JavaScript
├── php/                    # Thư mục chứa mã nguồn PHP
│   ├── vendor/             # Thư mục chứa các thư viện PHP (Composer)
│   ├── config.php          # Cấu hình PHP
│   ├── login_with_google.php # Xử lý đăng nhập Google
│   └── google_oauth_callback.php # Callback xử lý OAuth
├── loading.html            # Trang loading
├── server.js              # Máy chủ Node.js
└── package.json           # Cấu hình dự án Node.js
```

## Yêu cầu hệ thống

- Node.js (v14 trở lên)
- PHP (v7.4 trở lên)
- MySQL
- Composer (đã cài đặt)

## Cài đặt và chạy ứng dụng

### 1. Cài đặt các gói phụ thuộc Node.js

```bash
npm install
```

### 2. Cài đặt các gói phụ thuộc PHP (nếu chưa cài đặt)

```bash
cd php
composer install
```

### 3. Cấu hình MySQL

- Đảm bảo dịch vụ MySQL đang chạy
- Tạo cơ sở dữ liệu và bảng `users` theo cấu trúc trong file `php/test_db.php`

### 4. Cấu hình PHP

- Đảm bảo extension mysqli đã được bật trong php.ini
- Tạo file `.env` trong thư mục `php/` dựa trên file `.env.example`:

```bash
cd php
cp .env.example .env
```

- Chỉnh sửa file `.env` để thêm thông tin xác thực Google OAuth và cấu hình cơ sở dữ liệu:

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost/weathery/php/google_oauth_callback.php

DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=your_password_here
DB_NAME=weather
```

### 5. Chạy ứng dụng

#### Chạy phần frontend (Node.js)

```bash
npm start
```

Ứng dụng sẽ chạy tại http://localhost:3000

#### Cấu hình phần backend (PHP)

Để phần xác thực Google OAuth hoạt động, bạn cần:

1. Đặt thư mục `php` vào thư mục web server của bạn (ví dụ: `C:\xampp\htdocs\weathery\php` hoặc thư mục web server tương ứng)
2. Đảm bảo đường dẫn trong các file HTML trỏ đến đúng vị trí của file PHP:
   - Đường dẫn mặc định: `http://localhost/weathery/php/login_with_google.php`

## Sử dụng ứng dụng

1. Truy cập http://localhost:3000 để mở ứng dụng
2. Sử dụng tính năng đăng nhập bằng Google để xác thực
3. Khám phá các tính năng thời tiết của ứng dụng

## Xử lý sự cố

- Nếu gặp lỗi kết nối cơ sở dữ liệu, hãy kiểm tra cấu hình MySQL trong file `.env`
- Nếu gặp lỗi đăng nhập Google, hãy kiểm tra cấu hình Google API trong file `.env`
- Nếu gặp lỗi "Class mysqli not found", hãy đảm bảo extension mysqli đã được bật trong php.ini
- Nếu gặp lỗi "Class 'Dotenv\Dotenv' not found", hãy chạy lệnh `composer install` trong thư mục `php/`
- Nếu gặp lỗi khi đẩy code lên GitHub, hãy đảm bảo không đẩy file `.env` chứa thông tin nhạy cảm