@echo off
echo ===================================
echo Khoi dong ung dung Weather-Web
echo ===================================
echo.

REM Kiem tra Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Loi: Node.js chua duoc cai dat. Vui long cai dat Node.js.
    pause
    exit /b
)

REM Kiem tra PHP
where php >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Loi: PHP chua duoc cai dat. Vui long cai dat PHP.
    pause
    exit /b
)

REM Kiem tra MySQL
echo Dang kiem tra MySQL...
echo SELECT 1; | mysql -u root 2>nul
if %ERRORLEVEL% neq 0 (
    echo Canh bao: Khong the ket noi den MySQL. Vui long dam bao MySQL dang chay.
    echo Phan frontend van se duoc khoi dong, nhung chuc nang dang nhap co the khong hoat dong.
    echo.
) else (
    echo MySQL dang hoat dong.
    echo.
)

REM Kiem tra cac goi phu thuoc Node.js
if not exist "node_modules" (
    echo Cai dat cac goi phu thuoc Node.js...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Loi: Khong the cai dat cac goi phu thuoc Node.js.
        pause
        exit /b
    )
)

REM Thong bao cho nguoi dung
echo ===================================
echo HUONG DAN SU DUNG
echo ===================================
echo 1. Ung dung frontend se chay tai: http://localhost:3000
echo 2. Dam bao phan PHP duoc dat tai: http://localhost/weathery/php/
echo 3. Neu ban chua cau hinh PHP, vui long tham khao README.md
echo ===================================
echo.

REM Khoi dong ung dung
echo Dang khoi dong ung dung Weather-Web...
echo Nhan Ctrl+C de dung ung dung.
echo.

REM Khoi dong server Node.js
node server.js