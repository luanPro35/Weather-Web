# Weather Web - Node.js Backend

## Giới thiệu

Đây là phiên bản Weather Web sử dụng Node.js làm backend thay vì PHP. Ứng dụng này sử dụng:

- **Express.js**: Framework web cho Node.js
- **MySQL**: Cơ sở dữ liệu quan hệ
- **Sequelize**: ORM cho Node.js
- **Passport.js**: Xác thực người dùng với Google OAuth
- **EJS**: Template engine

## Cài đặt

### Yêu cầu hệ thống

- Node.js (phiên bản 14.x trở lên)
- MySQL (phiên bản 5.7 trở lên)
- npm hoặc yarn

### Các bước cài đặt

1. Clone repository:

```bash
git clone <repository-url>
cd Weather-Web
```

2. Cài đặt các gói phụ thuộc:

```bash
npm install
```

3. Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

4. Chỉnh sửa file `.env` để thêm thông tin xác thực Google OAuth và cấu hình cơ sở dữ liệu.

## Cấu hình Google OAuth

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo một project mới
3. Vào mục "APIs & Services" > "Credentials"
4. Tạo "OAuth client ID" mới
5. Chọn loại ứng dụng là "Web application"
6. Thêm URI chuyển hướng: `http://localhost:3000/auth/google/callback`
7. Sao chép Client ID và Client Secret vào file `.env`

## Chạy ứng dụng

### Chế độ phát triển

```bash
npm run dev
```

Ứng dụng sẽ chạy ở địa chỉ [http://localhost:3000](http://localhost:3000) với chế độ tự động tải lại khi có thay đổi.

### Chế độ sản xuất

```bash
npm start
```

## Cấu trúc dự án

```
├── config/                 # Cấu hình ứng dụng
│   ├── index.js            # Cấu hình chính
│   ├── database.js         # Cấu hình MongoDB
│   └── passport.js         # Cấu hình Passport.js
├── models/                 # Mô hình dữ liệu
│   └── User.js             # Mô hình người dùng
├── routes/                 # Định tuyến
│   ├── auth.js             # Định tuyến xác thực
│   └── index.js            # Định tuyến chính
├── views/                  # Template EJS
│   ├── layout.ejs          # Layout chung
│   ├── login.ejs           # Trang đăng nhập
│   └── profile.ejs         # Trang hồ sơ
├── public/                 # Tài nguyên tĩnh
│   ├── css/                # Stylesheet
│   ├── js/                 # JavaScript
│   └── html/               # Trang HTML
├── .env                    # Biến môi trường
├── server.js               # Điểm vào ứng dụng
└── package.json            # Cấu hình npm
```

## Chuyển đổi từ PHP sang Node.js

Dự án này đã được chuyển đổi từ backend PHP sang Node.js. Các thay đổi chính bao gồm:

1. Sử dụng MongoDB thay vì MySQL
2. Sử dụng Passport.js cho xác thực Google OAuth
3. Sử dụng Express.js làm web framework
4. Sử dụng EJS làm template engine

## Lưu ý

- Đảm bảo MongoDB đang chạy trước khi khởi động ứng dụng
- Không đẩy file `.env` lên kho lưu trữ Git vì nó chứa thông tin nhạy cảm