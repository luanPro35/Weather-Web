@echo off
echo Dang khoi dong Weather Web voi Node.js...

REM Kiem tra Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js chua duoc cai dat hoac khong co trong PATH. Vui long cai dat Node.js truoc.
    pause
    exit /b 1
)

REM Kiem tra npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm chua duoc cai dat hoac khong co trong PATH. Vui long cai dat npm truoc.
    pause
    exit /b 1
)

REM Cai dat dependencies neu node_modules chua ton tai
if not exist node_modules (
    echo Dang cai dat cac goi phu thuoc...
    npm install
    if %ERRORLEVEL% neq 0 (
        echo Khong the cai dat cac goi phu thuoc.
        pause
        exit /b 1
    )
)

REM Khoi dong ung dung o che do phat trien
echo Dang khoi dong ung dung o che do phat trien...
npm run dev

pause