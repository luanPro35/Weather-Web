/**
 * Xử lý hiển thị lời chào sau khi đăng nhập Google
 * File này được sử dụng bởi tất cả các trang HTML để hiển thị lời chào người dùng
 * sau khi đăng nhập thành công qua Google.
 */

window.addEventListener('DOMContentLoaded', (event) => {
  // Kiểm tra xem có thông tin người dùng trong URL không
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get('name');

  // Kiểm tra xem có thông tin người dùng trong localStorage không
  const storedUserName = localStorage.getItem('userName');

  const loginTriggerLink = document.getElementById('loginTriggerLink');
  const userGreeting = document.getElementById('user-greeting');

  // Hàm để hiển thị lời chào người dùng
  const showUserGreeting = (name) => {
    userGreeting.textContent = `Xin chào, ${name}`;
    userGreeting.style.display = 'inline';
    loginTriggerLink.style.display = 'none';

    // Kiểm tra xem đã có nút đăng xuất chưa
    if (!document.getElementById('logoutButton')) {
      // Tạo nút đăng xuất
      const logoutButton = document.createElement('a');
      logoutButton.id = 'logoutButton';
      logoutButton.href = '#';
      logoutButton.className = 'nav-link logout-link';
      logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Đăng xuất';
      logoutButton.style.marginLeft = '10px';
      logoutButton.style.color = '#ff5252';
      logoutButton.style.fontSize = '0.9em';
      
      // Thêm sự kiện click cho nút đăng xuất
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        // Xóa thông tin người dùng khỏi localStorage
        localStorage.removeItem('userName');
        // Hiển thị lại nút đăng nhập
        userGreeting.style.display = 'none';
        loginTriggerLink.style.display = 'inline';
        // Xóa nút đăng xuất
        logoutButton.remove();
      });
      
      // Thêm nút đăng xuất vào sau lời chào
      userGreeting.parentNode.insertBefore(logoutButton, userGreeting.nextSibling);
    }
  };

  // Nếu có thông tin người dùng trong URL, lưu vào localStorage và hiển thị
  if (userName && loginTriggerLink && userGreeting) {
    const decodedUserName = decodeURIComponent(userName.replace(/\+/g, ' '));
    localStorage.setItem('userName', decodedUserName);
    showUserGreeting(decodedUserName);
    
    // Xóa tham số 'name' khỏi URL để giao diện đẹp hơn
    const newUrl = window.location.protocol + '//' + window.location.host + 
                  window.location.pathname + window.location.hash;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  }
  // Nếu không có thông tin trong URL nhưng có trong localStorage, hiển thị từ localStorage
  else if (storedUserName && loginTriggerLink && userGreeting) {
    showUserGreeting(storedUserName);
  }
});