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

## Lưu ý

- Các file batch cần được chạy với quyền Administrator nếu chúng thực hiện các thao tác yêu cầu quyền nâng cao
- Nếu bạn sử dụng PowerShell, hãy nhớ thêm `.\` trước tên file batch
- Nếu bạn muốn tránh các vấn đề về quyền, hãy sử dụng Command Prompt (CMD) thay vì PowerShell