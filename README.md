# Weather-Web - Ứng dụng Thời tiết

## Giới thiệu

Weather-Web là một ứng dụng web thời tiết được xây dựng hoàn toàn bằng Node.js (Express) với xác thực người dùng thông qua Google OAuth và sử dụng MySQL làm cơ sở dữ liệu.

## Tính năng chính

- Xem thông tin thời tiết hiện tại và dự báo
- Đăng nhập bằng tài khoản Google
- Lưu các thành phố yêu thích
- Nhận thông báo email về thời tiết hàng ngày
- Cảnh báo thời tiết khắc nghiệt

## Cấu trúc dự án

```
├── config/                 # Thư mục chứa cấu hình
│   ├── database.js        # Cấu hình kết nối MySQL
│   ├── index.js           # Cấu hình chung
│   ├── middleware.js      # Cấu hình middleware
│   └── passport.js        # Cấu hình xác thực Passport
├── models/                 # Thư mục chứa mô hình dữ liệu
│   ├── init-db.js         # Khởi tạo cơ sở dữ liệu
│   └── sequelize/         # Mô hình Sequelize
│       ├── index.js       # Cấu hình Sequelize
│       └── User.js        # Mô hình User
├── public/                 # Thư mục chứa tài nguyên tĩnh
│   ├── css/               # Các file CSS
│   ├── html/              # Các file HTML
│   └── js/                # Các file JavaScript
├── routes/                 # Thư mục chứa định tuyến
│   ├── auth.js            # Định tuyến xác thực
│   └── index.js           # Định tuyến chính
├── views/                  # Thư mục chứa giao diện EJS
│   ├── layout.ejs         # Bố cục chung
│   ├── login.ejs          # Trang đăng nhập
│   └── profile.ejs        # Trang hồ sơ
├── create-mysql-db.js      # Script tạo cơ sở dữ liệu
├── loading.html            # Trang loading
├── server.js              # Máy chủ Node.js
└── package.json           # Cấu hình dự án Node.js
```

## Yêu cầu hệ thống

- Node.js (v14 trở lên)
- MySQL (v5.7 trở lên)
- npm (v6 trở lên)

## Cài đặt và chạy ứng dụng

### 1. Cài đặt các gói phụ thuộc Node.js

```bash
npm install
```

### 2. Cấu hình môi trường

Sao chép file `.env.example` thành `.env` và cập nhật các thông tin cấu hình:

```bash
cp .env.example .env
```

Sau đó, mở file `.env` và cập nhật các thông tin sau:
- Thông tin xác thực Google OAuth
- Thông tin kết nối cơ sở dữ liệu
- Thông tin email (xem phần "Cấu hình Email" bên dưới)

### 3. Tạo cơ sở dữ liệu

```bash
node create-mysql-db.js
```

Hoặc chạy file batch:

```bash
create-mysql-db.bat
```

### 4. Khởi động ứng dụng

```bash
node server.js
```

Hoặc chạy file batch:

```bash
start_node.bat
```

### 5. Cấu hình MySQL

- Đảm bảo dịch vụ MySQL đang chạy
- Tạo cơ sở dữ liệu `weather` (script `create-mysql-db.js` sẽ tự động thực hiện điều này)
- Cập nhật thông tin kết nối trong file `.env`

## Cấu hình Email

Ứng dụng sử dụng Gmail SMTP để gửi thông báo email. Để cấu hình:

### 1. Tạo App Password cho Gmail

Nếu bạn đã bật xác thực 2 bước cho tài khoản Google, bạn cần tạo App Password:

1. Truy cập https://myaccount.google.com/security
2. Đảm bảo đã bật "Xác minh 2 bước"
3. Truy cập https://myaccount.google.com/apppasswords
4. Chọn "Khác (Tên tùy chỉnh)" và đặt tên "Weather App"
5. Nhấn "Tạo" và sao chép mật khẩu 16 ký tự được tạo ra

### 2. Cập nhật file `.env`

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Kiểm tra kết nối email

Chạy script kiểm tra kết nối email:

```bash
node test-email-connection.js
```

Hoặc sử dụng file batch:

```bash
test-email.bat
```

### Khắc phục lỗi email

Nếu gặp lỗi kết nối email, vui lòng tham khảo hướng dẫn chi tiết trong file `EMAIL_TROUBLESHOOTING.md`.

## Tài liệu bổ sung

- `HOW_TO_RUN.md` - Hướng dẫn chi tiết cách chạy ứng dụng
- `EMAIL_TROUBLESHOOTING.md` - Hướng dẫn khắc phục lỗi kết nối email
- `README_NODE.md` - Thông tin về phiên bản Node.js

## Liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ với chúng tôi qua email.

## Thiết lập và chạy ứng dụng

#### Thiết lập tự động

Sử dụng script thiết lập tự động để cài đặt các gói phụ thuộc và tạo cơ sở dữ liệu:

```bash
setup.bat
```

Hoặc sử dụng npm:

```bash
npm run setup
```

#### Chạy ứng dụng

**Chế độ phát triển:**

```bash
start_node.bat
```

hoặc

```bash
npm run dev
```

**Chế độ sản xuất:**

```bash
start_node_prod.bat
```

hoặc

```bash
npm start
```

Ứng dụng sẽ chạy tại http://localhost:3000

## Sử dụng ứng dụng

1. Truy cập http://localhost:3000 để mở ứng dụng
2. Sử dụng tính năng đăng nhập bằng Google để xác thực
3. Khám phá các tính năng thời tiết của ứng dụng

## Xử lý sự cố

### Lỗi kết nối MySQL

- Đảm bảo dịch vụ MySQL đang chạy
- Kiểm tra cấu hình kết nối trong file `.env` (host, username, password, database name)
- Đảm bảo cơ sở dữ liệu đã được tạo (sử dụng `create-mysql-db.bat` hoặc tạo thủ công)
- Kiểm tra quyền truy cập của người dùng MySQL

### Lỗi xác thực Google OAuth

- Đảm bảo đã cấu hình đúng Google Client ID và Client Secret trong file `.env`
- Kiểm tra URL callback đã được cấu hình đúng trong Google Cloud Console
- Đảm bảo URL callback trong file `.env` khớp với URL đã đăng ký trong Google Cloud Console
- Nếu gặp lỗi đăng nhập Google, hãy kiểm tra cấu hình Google API trong file `.env`
- Nếu gặp lỗi khi đẩy code lên GitHub, hãy đảm bảo không đẩy file `.env` chứa thông tin nhạy cảm

### Lỗi cổng đã được sử dụng (EADDRINUSE)

- Nếu gặp lỗi "Error: listen EADDRINUSE: address already in use :::3000", có nghĩa là cổng 3000 đã được sử dụng bởi một ứng dụng khác
- Bạn có thể thay đổi cổng trong file `.env` bằng cách đặt giá trị PORT thành một cổng khác (ví dụ: 3001, 8080, 8000)
- Hoặc bạn có thể dừng ứng dụng đang sử dụng cổng 3000 trước khi khởi động ứng dụng này
- Từ phiên bản mới nhất, ứng dụng sẽ tự động thử sử dụng cổng tiếp theo nếu cổng mặc định đã được sử dụng