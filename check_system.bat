@echo off
echo ===================================
echo Kiem tra he thong Weather-Web
echo ===================================
echo.

REM Kiem tra Node.js
echo Dang kiem tra Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [X] Node.js: CHUA CAI DAT
) else (
    for /f "tokens=1,2,3 delims=." %%a in ('node --version') do (
        set NODE_VER=%%a.%%b.%%c
    )
    echo [✓] Node.js: DA CAI DAT (Phien ban: %NODE_VER:~1%)
)
echo.

REM Kiem tra NPM
echo Dang kiem tra NPM...
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [X] NPM: CHUA CAI DAT
) else (
    for /f "tokens=1,2,3 delims=." %%a in ('npm --version') do (
        set NPM_VER=%%a.%%b.%%c
    )
    echo [✓] NPM: DA CAI DAT (Phien ban: %NPM_VER%)
)
echo.

REM Kiem tra PHP
echo Dang kiem tra PHP...
where php >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [X] PHP: CHUA CAI DAT
) else (
    for /f "tokens=1,2,3 delims=." %%a in ('php -r "echo PHP_VERSION;"') do (
        set PHP_VER=%%a.%%b.%%c
    )
    echo [✓] PHP: DA CAI DAT (Phien ban: %PHP_VER%)
    
    REM Kiem tra extension mysqli
    php -r "echo extension_loaded('mysqli') ? '[✓] Extension mysqli: DA BAT' : '[X] Extension mysqli: CHUA BAT';echo '';" 2>nul
)
echo.

REM Kiem tra MySQL
echo Dang kiem tra MySQL...
echo SELECT 1; | mysql -u root 2>nul
if %ERRORLEVEL% neq 0 (
    echo [X] MySQL: KHONG THE KET NOI
) else (
    echo [✓] MySQL: DANG CHAY
)
echo.

REM Kiem tra cac goi phu thuoc Node.js
echo Dang kiem tra cac goi phu thuoc Node.js...
if not exist "node_modules" (
    echo [X] Node modules: CHUA CAI DAT
) else (
    echo [✓] Node modules: DA CAI DAT
)
echo.

REM Kiem tra cac goi phu thuoc PHP
echo Dang kiem tra cac goi phu thuoc PHP...
if not exist "php\vendor" (
    echo [X] PHP vendor: CHUA CAI DAT
) else (
    echo [✓] PHP vendor: DA CAI DAT
)
echo.

REM Kiem tra cau hinh
echo Dang kiem tra cau hinh...
if not exist "php\config.php" (
    echo [X] File config.php: KHONG TIM THAY
) else (
    echo [✓] File config.php: DA TON TAI
)
echo.

REM Kiem tra duong dan
echo Dang kiem tra duong dan trong cac file HTML...
findstr /C:"http://localhost/weathery/php/login_with_google.php" "public\html\trangchu.html" >nul
if %ERRORLEVEL% neq 0 (
    echo [X] Duong dan PHP trong trangchu.html: KHONG CHINH XAC
) else (
    echo [✓] Duong dan PHP trong trangchu.html: CHINH XAC
)
echo.

echo ===================================
echo Ket qua kiem tra
echo ===================================
echo Neu co bat ky muc nao danh dau [X], vui long tham khao README.md de khac phuc.
echo.

pause