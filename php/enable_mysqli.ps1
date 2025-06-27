$phpIni = 'C:\Users\Acer\Downloads\php-8.4.8-Win32-vs17-x64\php.ini'
$content = Get-Content $phpIni
$content = $content -replace ';extension=mysqli', 'extension=mysqli'
$content | Set-Content $phpIni
Write-Host "Extension mysqli đã được bật trong file php.ini"