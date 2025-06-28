@echo off
echo ===================================================
echo = Khoi dong Weather-Web (Node.js) =
echo ===================================================
echo.

:: Kiem tra quyen Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Dang chay voi quyen Administrator...
    powershell -Command "Start-Process -FilePath '%~dpnx0' -Verb RunAs"
    exit /b
)

:: Chay ung dung Node.js
echo Dang khoi dong ung dung Node.js...
call start_node.bat