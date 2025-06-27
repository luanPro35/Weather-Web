# Hướng dẫn chạy ứng dụng Weather-Web

## Lỗi khi chạy file batch trong PowerShell

Nếu bạn gặp lỗi như sau khi chạy các file batch trong PowerShell:

```
start_app.bat : The term 'start_app.bat' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

### Nguyên nhân

Lỗi này xảy ra vì PowerShell không tự động chạy các file từ thư mục hiện tại vì lý do bảo mật. Thay vào đó, bạn cần chỉ định rõ đường dẫn tương đối hoặc tuyệt đối đến file batch.

### Cách khắc phục

Bạn có thể sử dụng một trong các cách sau để chạy file batch:

#### Cách 1: Thêm '.\' vào trước tên file

```powershell
.\start_app.bat
```

#### Cách 2: Sử dụng Command Prompt (CMD) thay vì PowerShell

1. Mở Command Prompt bằng cách nhấn `Win + R`, gõ `cmd` và nhấn Enter
2. Di chuyển đến thư mục dự án bằng lệnh `cd`
3. Chạy file batch trực tiếp:

```cmd
start_app.bat
```

#### Cách 3: Sử dụng đường dẫn tuyệt đối

```powershell
& "D:\Web\Weather-Web\start_app.bat"
```

## Các file batch trong dự án

Dự án Weather-Web có các file batch sau:

1. **start_app.bat**: Khởi động cả Node.js frontend và PHP backend
2. **check_system.bat**: Kiểm tra cài đặt hệ thống
3. **php\start_php_only.bat**: Khởi động ứng dụng chỉ với PHP (không cần Node.js)

## Chạy ứng dụng với Node.js và PHP

```cmd
.\start_app.bat
```

Hoặc trong CMD:

```cmd
start_app.bat
```

## Chạy ứng dụng chỉ với PHP

```cmd
.\php\start_php_only.bat
```

Hoặc trong CMD:

```cmd
cd php
start_php_only.bat
```

## Kiểm tra cài đặt hệ thống

```cmd
.\check_system.bat
```

Hoặc trong CMD:

```cmd
check_system.bat
```

## Thiết lập biến môi trường

Ứng dụng này sử dụng biến môi trường để lưu trữ thông tin nhạy cảm như thông tin xác thực Google OAuth và cấu hình cơ sở dữ liệu. Bạn cần thiết lập các biến môi trường này trước khi chạy ứng dụng:

1. Tạo file `.env` trong thư mục `php/` dựa trên file `.env.example`:

```cmd
cd php
copy .env.example .env
```

2. Chỉnh sửa file `.env` để thêm thông tin xác thực Google OAuth và cấu hình cơ sở dữ liệu của bạn.

3. Cài đặt các gói phụ thuộc PHP bằng Composer:

```cmd
cd php
composer install
```

4. Kiểm tra cài đặt biến môi trường:

```cmd
cd php
php test_env.php
```

## Lưu ý

- Các file batch cần được chạy với quyền Administrator nếu chúng thực hiện các thao tác yêu cầu quyền nâng cao
- Nếu bạn sử dụng PowerShell, hãy nhớ thêm `.\` trước tên file batch
- Nếu bạn muốn tránh các vấn đề về quyền, hãy sử dụng Command Prompt (CMD) thay vì PowerShell
- **KHÔNG BAO GIỜ** đẩy file `.env` lên kho lưu trữ Git vì nó chứa thông tin nhạy cảm
- Xem thêm hướng dẫn về bảo mật trong file `php/SECURITY.md` và thiết lập môi trường trong file `php/ENV_SETUP.md`