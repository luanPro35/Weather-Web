# Hướng dẫn chạy ứng dụng Weather-Web với Node.js

## Yêu cầu hệ thống

- Node.js (phiên bản 14.x trở lên)
- MySQL (phiên bản 5.7 trở lên)
- npm hoặc yarn

## Cài đặt MySQL

### Windows

1. Tải MySQL Community Server từ [trang chủ MySQL](https://dev.mysql.com/downloads/mysql/)
2. Cài đặt theo hướng dẫn, đảm bảo ghi nhớ mật khẩu root
3. Đảm bảo dịch vụ MySQL đang chạy:
   - Kiểm tra trong Services (Dịch vụ) của Windows
   - Hoặc sử dụng MySQL Workbench để kiểm tra kết nối

### Tạo cơ sở dữ liệu

Bạn có thể tạo cơ sở dữ liệu bằng cách:

1. Sử dụng file batch đã được tạo sẵn:

```cmd
.\create-mysql-db.bat
```

2. Hoặc sử dụng MySQL Workbench/Command Line để tạo thủ công:

```sql
CREATE DATABASE weather_web;
```

## Cài đặt ứng dụng

### Thiết lập tự động

Cách đơn giản nhất là sử dụng script thiết lập tự động:

```cmd
setup.bat
```

Hoặc sử dụng npm:

```cmd
npm run setup
```

Script này sẽ tự động:
- Cài đặt các gói phụ thuộc
- Tạo cơ sở dữ liệu MySQL (nếu chưa tồn tại)

### Thiết lập thủ công

1. Đảm bảo bạn đã cài đặt Node.js và npm:

```cmd
node --version
npm --version
```

2. Cài đặt các gói phụ thuộc:

```cmd
npm install
```

3. Tạo cơ sở dữ liệu MySQL:

```cmd
npm run create-db
```

4. Tạo file `.env` từ file mẫu:

```cmd
copy .env.example .env
```

5. Chỉnh sửa file `.env` để thêm thông tin xác thực Google OAuth và cấu hình cơ sở dữ liệu.

## Chạy ứng dụng

### Sử dụng file batch

#### Chế độ phát triển (với nodemon)

```cmd
start_node.bat
```

#### Chế độ sản xuất

```cmd
start_node_prod.bat
```

#### Chạy với quyền quản trị viên (nếu cần)

```cmd
run_all.bat
```

### Chạy thủ công

#### Chế độ phát triển (với nodemon)

```cmd
npm run dev
```

#### Chế độ sản xuất

```cmd
npm start
```

## Truy cập ứng dụng

Sau khi khởi động thành công, ứng dụng sẽ chạy ở địa chỉ:

[http://localhost:3000](http://localhost:3000)

## Xử lý lỗi thường gặp

### Lỗi kết nối MySQL

Nếu bạn gặp lỗi kết nối MySQL, hãy kiểm tra:

1. Dịch vụ MySQL đang chạy
2. Cấu hình trong file `.env` đúng (host, port, username, password)
3. Cơ sở dữ liệu đã được tạo (sử dụng `create-mysql-db.bat` hoặc tạo thủ công)
4. Người dùng MySQL có quyền truy cập vào cơ sở dữ liệu

### Lỗi xác thực Google OAuth

Nếu bạn gặp lỗi xác thực Google OAuth, hãy kiểm tra:

1. Client ID và Client Secret trong file `.env` đúng
2. URI chuyển hướng đã được cấu hình đúng trong Google Cloud Console
3. API Google+ đã được bật trong Google Cloud Console

### Lỗi cổng đã được sử dụng (EADDRINUSE)

Nếu bạn gặp lỗi như sau:

```
Error: listen EADDRINUSE: address already in use :::3000
```

Điều này có nghĩa là cổng 3000 đã được sử dụng bởi một ứng dụng khác. Bạn có thể:

1. Thay đổi cổng trong file `.env` bằng cách đặt giá trị PORT thành một cổng khác:
   ```
   PORT=3001
   ```

2. Dừng ứng dụng đang sử dụng cổng 3000 trước khi khởi động ứng dụng này:
   - Kiểm tra ứng dụng đang sử dụng cổng 3000:
     ```cmd
     netstat -ano | findstr :3000
     ```
   - Dừng tiến trình đó bằng ID tiến trình (PID) được hiển thị:
     ```cmd
     taskkill /F /PID <PID>
     ```

3. Từ phiên bản mới nhất, ứng dụng sẽ tự động thử sử dụng cổng tiếp theo nếu cổng mặc định đã được sử dụng.

## Lưu ý

- Đảm bảo MySQL đang chạy trước khi khởi động ứng dụng
- Không đẩy file `.env` lên kho lưu trữ Git vì nó chứa thông tin nhạy cảm
- Nếu bạn thay đổi cổng trong file `.env`, hãy đảm bảo cập nhật URI chuyển hướng trong Google Cloud Console