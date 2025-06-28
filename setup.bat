@echo off
echo ===================================================
echo = Thiet lap moi truong Weather-Web =
echo ===================================================
echo.

:: Kiem tra quyen Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Dang chay voi quyen Administrator...
    powershell -Command "Start-Process -FilePath '%~dpnx0' -Verb RunAs"
    exit /b
)

:: Kiem tra Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js chua duoc cai dat. Vui long cai dat Node.js truoc.
    pause
    exit /b 1
)

:: Kiem tra npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm chua duoc cai dat. Vui long cai dat npm truoc.
    pause
    exit /b 1
)

:: Cai dat dependencies
echo Dang cai dat cac goi phu thuoc...
npm install
if %ERRORLEVEL% neq 0 (
    echo Khong the cai dat cac goi phu thuoc.
    pause
    exit /b 1
)

:: Tao co so du lieu MySQL
echo Dang tao co so du lieu MySQL...
call create-mysql-db.bat

echo.
echo Thiet lap hoan tat. Ban co the chay ung dung bang cach su dung run_all.bat hoac start_node.bat
echo.
pause