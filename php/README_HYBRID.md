# Hướng dẫn sử dụng HTML cho Frontend và PHP cho Backend

Dự án Weather-Web có thể được cấu hình để sử dụng HTML thuần túy cho frontend và PHP cho backend. Tài liệu này sẽ hướng dẫn bạn cách thiết lập và chạy ứng dụng theo cách này.

## Cấu trúc dự án

Dự án được tổ chức như sau:

```
├── public/
│   ├── css/         # CSS files
│   ├── html/        # HTML files (frontend)
│   ├── js/          # JavaScript files
│   └── php/         # PHP files (hybrid frontend/backend)
├── php/
│   ├── config.php   # Cấu hình PHP
│   ├── index.php    # Entry point cho PHP
│   └── ...          # Các file PHP khác
└── ...
```

## Hai cách chạy ứng dụng

### 1. Sử dụng Node.js + PHP (Cách ban đầu)

- **Frontend**: Chạy bởi Node.js/Express (server.js)
- **Backend**: Chạy bởi PHP/Apache

### 2. Chỉ sử dụng PHP (Cách mới)

- **Frontend + Backend**: Tất cả đều chạy bởi PHP/Apache

## Cách chạy ứng dụng chỉ với PHP

### Bước 1: Cài đặt Apache và PHP

1. Cài đặt XAMPP hoặc WAMP (bao gồm Apache, PHP, MySQL)
2. Đảm bảo extension mysqli của PHP đã được bật

### Bước 2: Cấu hình thư mục dự án

1. Đặt toàn bộ dự án vào thư mục web root của Apache (thường là `htdocs` đối với XAMPP hoặc `www` đối với WAMP)
2. Đường dẫn nên là: `C:/xampp/htdocs/weathery/` hoặc `C:/wamp/www/weathery/`

### Bước 3: Cấu hình cơ sở dữ liệu

1. Tạo cơ sở dữ liệu MySQL theo hướng dẫn trong README.md chính
2. Cập nhật thông tin kết nối trong file `php/config.php`

### Bước 4: Chạy ứng dụng

1. Khởi động Apache và MySQL từ XAMPP/WAMP Control Panel
2. Mở trình duyệt và truy cập: `http://localhost/weathery/php/`

## Cách sử dụng HTML cho Frontend

Bạn có thể tiếp tục phát triển frontend bằng cách chỉnh sửa các file HTML trong thư mục `public/html/`. Các file này sẽ hoạt động độc lập với backend PHP.

### Kết nối HTML với PHP Backend

Để kết nối HTML frontend với PHP backend, bạn cần:

1. Đảm bảo các đường dẫn API trong JavaScript trỏ đến đúng endpoint PHP
2. Ví dụ trong file JavaScript:

```javascript
// Thay vì gọi API Node.js
// fetch('/api/weather')

// Gọi API PHP
fetch('http://localhost/weathery/php/api/weather.php')
```

## Cách chuyển đổi hoàn toàn sang PHP

Nếu bạn muốn chuyển đổi hoàn toàn sang PHP (không sử dụng Node.js), bạn cần:

1. Sao chép các file HTML từ `public/html/` sang `public/php/` và đổi phần mở rộng thành `.php`
2. Thêm mã PHP vào các file này để xử lý logic backend
3. Cập nhật các đường dẫn trong file để trỏ đến đúng vị trí

Chúng tôi đã tạo sẵn các file PHP tương ứng với các file HTML chính:

- `trangchu.php`
- `dubao.php`
- `thanhpho.php`
- `thongbao.php`
- `loading_php.php`

## Lợi ích của việc chỉ sử dụng PHP

1. **Đơn giản hóa triển khai**: Chỉ cần một máy chủ web (Apache) thay vì cả Node.js và Apache
2. **Tích hợp chặt chẽ**: Frontend và backend được tích hợp chặt chẽ hơn
3. **Quản lý session dễ dàng**: PHP có hệ thống quản lý session tích hợp sẵn
4. **Không cần cấu hình CORS**: Vì frontend và backend chạy trên cùng một domain

## Lưu ý

- Các file JavaScript và CSS vẫn được sử dụng như bình thường
- Đảm bảo cập nhật các đường dẫn trong file PHP để trỏ đến đúng vị trí của các file tĩnh
- Nếu bạn thêm tính năng mới, hãy cập nhật cả phiên bản HTML và PHP