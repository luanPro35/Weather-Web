/**
 * Xử lý hiển thị lời chào sau khi đăng nhập Google
 * File này được sử dụng bởi tất cả các trang HTML để hiển thị lời chào người dùng
 * sau khi đăng nhập thành công qua Google.
 */

window.addEventListener('DOMContentLoaded', (event) => {
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get('name');

  const loginTriggerLink = document.getElementById('loginTriggerLink');
  const userGreeting = document.getElementById('user-greeting');

  if (userName && loginTriggerLink && userGreeting) {
    const decodedUserName = decodeURIComponent(userName.replace(/\+/g, ' '));
    userGreeting.textContent = `Xin chào, ${decodedUserName}`;
    userGreeting.style.display = 'inline';
    loginTriggerLink.style.display = 'none';
    
    // Xóa tham số 'name' khỏi URL để giao diện đẹp hơn
    const newUrl = window.location.protocol + '//' + window.location.host + 
                  window.location.pathname + window.location.hash;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  }
});