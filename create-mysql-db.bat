@echo off
echo Creating MySQL database...

node create-mysql-db.js

echo.
echo If successful, press any key to exit.
pause > nul