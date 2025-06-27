@echo off
echo ===================================================
echo = Khởi động ứng dụng Weather-Web chỉ với PHP =
echo ===================================================
echo.

:: Kiểm tra XAMPP/WAMP đã được cài đặt chưa
echo Đang kiểm tra cài đặt XAMPP/WAMP...

set XAMPP_PATH=C:\xampp
set WAMP_PATH=C:\wamp64
set FOUND_SERVER=0

if exist "%XAMPP_PATH%\apache\bin\httpd.exe" (
    echo XAMPP đã được tìm thấy tại %XAMPP_PATH%
    set FOUND_SERVER=1
    set SERVER_TYPE=XAMPP
    set SERVER_PATH=%XAMPP_PATH%
    set HTDOCS_PATH=%XAMPP_PATH%\htdocs
) else if exist "%WAMP_PATH%\bin\apache\apache2.4.54\bin\httpd.exe" (
    echo WAMP đã được tìm thấy tại %WAMP_PATH%
    set FOUND_SERVER=1
    set SERVER_TYPE=WAMP
    set SERVER_PATH=%WAMP_PATH%
    set HTDOCS_PATH=%WAMP_PATH%\www
) else (
    echo [CẢNH BÁO] Không tìm thấy XAMPP hoặc WAMP.
    echo Vui lòng cài đặt XAMPP hoặc WAMP để chạy ứng dụng.
    echo Bạn có thể tải XAMPP tại: https://www.apachefriends.org/download.html
    echo.
    pause
    exit /b 1
)

:: Kiểm tra thư mục weathery trong htdocs/www
set WEATHERY_PATH=%HTDOCS_PATH%\weathery

if not exist "%WEATHERY_PATH%" (
    echo [THÔNG BÁO] Thư mục weathery chưa tồn tại trong %HTDOCS_PATH%
    echo Đang tạo liên kết đến dự án...
    
    :: Tạo thư mục weathery nếu chưa tồn tại
    mkdir "%WEATHERY_PATH%"
    
    :: Tạo liên kết đến thư mục hiện tại
    mklink /D "%WEATHERY_PATH%\php" "%~dp0"
    
    if %errorlevel% neq 0 (
        echo [LỖI] Không thể tạo liên kết. Vui lòng chạy CMD với quyền Administrator.
        echo.
        pause
        exit /b 1
    )
    
    :: Tạo liên kết đến thư mục public
    mklink /D "%WEATHERY_PATH%\public" "%~dp0..\public"
    
    if %errorlevel% neq 0 (
        echo [LỖI] Không thể tạo liên kết. Vui lòng chạy CMD với quyền Administrator.
        echo.
        pause
        exit /b 1
    )
    
    :: Tạo liên kết đến file loading_php.php
    mklink "%WEATHERY_PATH%\loading_php.php" "%~dp0..\loading_php.php"
    
    if %errorlevel% neq 0 (
        echo [LỖI] Không thể tạo liên kết. Vui lòng chạy CMD với quyền Administrator.
        echo.
        pause
        exit /b 1
    )
) else (
    echo Thư mục weathery đã tồn tại trong %HTDOCS_PATH%
)

:: Kiểm tra và khởi động Apache và MySQL
echo.
echo Đang kiểm tra trạng thái Apache và MySQL...

if "%SERVER_TYPE%"=="XAMPP" (
    :: Kiểm tra xem Apache và MySQL đã chạy chưa
    tasklist /fi "imagename eq httpd.exe" | find /i "httpd.exe" > nul
    if %errorlevel% neq 0 (
        echo Apache chưa chạy. Đang khởi động Apache...
        start "" "%SERVER_PATH%\apache_start.bat"
    ) else (
        echo Apache đã đang chạy.
    )
    
    tasklist /fi "imagename eq mysqld.exe" | find /i "mysqld.exe" > nul
    if %errorlevel% neq 0 (
        echo MySQL chưa chạy. Đang khởi động MySQL...
        start "" "%SERVER_PATH%\mysql_start.bat"
    ) else (
        echo MySQL đã đang chạy.
    )
) else if "%SERVER_TYPE%"=="WAMP" (
    :: Kiểm tra xem Wampserver đã chạy chưa
    tasklist /fi "imagename eq wampmanager.exe" | find /i "wampmanager.exe" > nul
    if %errorlevel% neq 0 (
        echo Wampserver chưa chạy. Đang khởi động Wampserver...
        start "" "%SERVER_PATH%\wampmanager.exe"
        echo Vui lòng đợi Wampserver khởi động hoàn tất...
        timeout /t 10 /nobreak > nul
    ) else (
        echo Wampserver đã đang chạy.
    )
)

:: Kiểm tra cài đặt PHP
echo.
echo Đang kiểm tra cài đặt PHP...
start http://localhost/weathery/php/check_php_setup.php

:: Mở ứng dụng trong trình duyệt
echo.
echo Đang mở ứng dụng Weather-Web trong trình duyệt...
start http://localhost/weathery/php/

echo.
echo ===================================================
echo = Ứng dụng Weather-Web đã được khởi động! =
echo = Truy cập: http://localhost/weathery/php/ =
echo ===================================================
echo.
echo Lưu ý: Để dừng ứng dụng, hãy tắt Apache và MySQL từ Control Panel của %SERVER_TYPE%.
echo.

pause