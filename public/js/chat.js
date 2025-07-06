// Chatbot functionality for Weather Web

// Hàm để tìm cửa sổ chat
function findChatWindow() {
  // Tìm cửa sổ chat
  let chatWindow = document.querySelector('.chatbot-window');
  
  // Nếu không tìm thấy, kiểm tra trong static-chatbot-button
  if (!chatWindow) {
    const staticButton = document.getElementById('static-chatbot-button');
    if (staticButton) {
      chatWindow = staticButton.querySelector('.chatbot-window');
    }
  }
  
  return chatWindow;
}

// Hàm để hiển thị cửa sổ chat
function showChatWindow(chatWindow) {
  if (chatWindow) {
    chatWindow.classList.add('active');
    chatWindow.style.opacity = '1';
    chatWindow.style.pointerEvents = 'all';
    chatWindow.style.transform = 'translateY(0)';
    chatWindow.style.display = 'flex';
    chatWindow.style.visibility = 'visible';
    console.log('Chat window shown');
    return true;
  }
  return false;
}

// Hàm để ẩn cửa sổ chat
function hideChatWindow(chatWindow) {
  if (chatWindow) {
    chatWindow.classList.remove('active');
    chatWindow.style.opacity = '0';
    chatWindow.style.pointerEvents = 'none';
    chatWindow.style.transform = 'translateY(20px)';
    console.log('Chat window hidden');
    return true;
  }
  return false;
}

// Hàm tạo cửa sổ chat mới
function createChatWindow() {
  // Xóa cửa sổ chat cũ nếu có
  const existingWindows = document.querySelectorAll('.chatbot-window');
  existingWindows.forEach(function(window) {
    window.remove();
  });
  
  // Tạo cửa sổ chat mới
  const staticButton = document.getElementById('static-chatbot-button');
  if (staticButton) {
    const newChatWindow = document.createElement('div');
    newChatWindow.className = 'chatbot-window'; // Không thêm active để ẩn ban đầu
    newChatWindow.style.cssText = 'position: absolute; bottom: 70px; right: 0; width: 350px; height: 450px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(30px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; overflow: hidden; transition: all 0.3s ease; opacity: 0; pointer-events: none; transform: translateY(20px); z-index: 9999;';
    
    newChatWindow.innerHTML = `
      <div class="chatbot-header" style="padding: 15px 20px; background: rgba(255, 255, 255, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: space-between;">
        <div class="chatbot-title" style="color: white; font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-robot"></i> Weather Assistant
        </div>
        <button class="chatbot-close" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;"><i class="fas fa-times"></i></button>
      </div>
      <div class="chatbot-messages" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;">
        <div class="message bot-message" style="max-width: 80%; padding: 12px 16px; border-radius: 18px; font-size: 14px; line-height: 1.4; word-wrap: break-word; cursor: pointer; transition: transform 0.2s, opacity 0.2s; align-self: flex-start; background: rgba(255, 255, 255, 0.1); color: white; border-bottom-left-radius: 5px;">
          Xin chào! Tôi có thể giúp gì cho bạn về thời tiết?
        </div>
      </div>
      <div class="chatbot-input" style="padding: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; gap: 10px;">
        <input type="text" placeholder="Nhập tin nhắn của bạn..." style="flex: 1; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 12px 15px; color: white; font-size: 14px; outline: none; transition: all 0.3s;" />
        <button class="chatbot-send" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; color: white; cursor: pointer; transition: all 0.3s;"><i class="fas fa-paper-plane"></i></button>
      </div>
    `;
    
    staticButton.appendChild(newChatWindow);
    
    // Thiết lập sự kiện đóng
    const closeButton = newChatWindow.querySelector('.chatbot-close');
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        hideChatWindow(newChatWindow);
      });
    }
    
    return newChatWindow;
  }
  
  return null;
}

// Thiết lập sự kiện click cho nút chat
function setupChatButton() {
  const chatButton = document.getElementById('chat-toggle-button');
  if (chatButton) {
    // Xóa tất cả sự kiện cũ
    const newButton = chatButton.cloneNode(true);
    chatButton.parentNode.replaceChild(newButton, chatButton);
    
    // Thêm sự kiện click mới
    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Chat button clicked!");
      
      let chatWindow = findChatWindow();
      
      // Nếu không tìm thấy cửa sổ chat, tạo mới
      if (!chatWindow) {
        chatWindow = createChatWindow();
      }
      
      // Hiển thị hoặc ẩn cửa sổ chat
      if (chatWindow) {
        if (chatWindow.classList.contains('active')) {
          hideChatWindow(chatWindow);
        } else {
          showChatWindow(chatWindow);
        }
      }
      
      return false;
    });
  }
}

// Khởi tạo khi trang tải xong
window.addEventListener('load', function() {
  setTimeout(function() {
    // Tạo cửa sổ chat mới
    createChatWindow();
    
    // Thiết lập sự kiện cho nút chat
    setupChatButton();
  }, 1000);
});