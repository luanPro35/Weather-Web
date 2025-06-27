<?php
// Lấy đường dẫn đến file php.ini
$phpini = php_ini_loaded_file();
echo "PHP.ini path: $phpini\n";

// Kiểm tra xem extension mysqli đã được bật chưa
$extensions = get_loaded_extensions();
if (in_array('mysqli', $extensions)) {
    echo "Extension mysqli đã được bật.\n";
} else {
    echo "Extension mysqli chưa được bật.\n";
    echo "Bạn cần mở file php.ini tại đường dẫn trên và bỏ comment dòng extension=mysqli bằng cách xóa dấu ; ở đầu dòng.\n";
    echo "Sau đó khởi động lại web server.\n";
}

// Hiển thị tất cả các extension đã được bật
echo "\nCác extension đã được bật:\n";
foreach ($extensions as $ext) {
    echo "- $ext\n";
}
?>