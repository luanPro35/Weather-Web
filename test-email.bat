@echo off
echo ===== KIEM TRA KET NOI EMAIL =====
echo.

REM Kiem tra xem Node.js da duoc cai dat chua
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Loi: Node.js chua duoc cai dat!
    echo Vui long cai dat Node.js tu https://nodejs.org/
    pause
    exit /b
)

REM Kiem tra xem cac goi phu thuoc da duoc cai dat chua
if not exist node_modules\ (
    echo Dang cai dat cac goi phu thuoc...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Loi: Khong the cai dat cac goi phu thuoc!
        pause
        exit /b
    )
)

echo Dang kiem tra ket noi email...
node test-email-connection.js

echo.
echo ===== GUI EMAIL THU NGHIEM =====
echo.
echo Ban co muon gui email thu nghiem khong? (Y/N)
set /p choice="Nhap lua chon cua ban: "

if /i "%choice%"=="Y" (
    echo.
    echo Nhap dia chi email nguoi nhan:
    set /p recipient="Email: "
    echo.
    node test-email-send.js %recipient%
)

echo.
echo ===== HOAN THANH =====
echo.
echo Nhan phim bat ky de thoat...
pause > nul