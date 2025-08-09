// Chatbot thời tiết - Xử lý tương tác và hiển thị thông tin thời tiết

// Biến toàn cục để lưu trữ dữ liệu thời tiết hiện tại
let currentWeatherData = null;

// Khởi tạo chatbot khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    initChatbot();
});

// Hàm khởi tạo chatbot
function initChatbot() {
    // Biến để kiểm tra xem chatbot đã được khởi tạo chưa
    if (window.chatbotInitialized) {
        return;
    }
    
    // Tạo các phần tử HTML cho chatbot
    createChatbotElements();
    
    // Thiết lập các sự kiện
    setupEventListeners();
    
    // Hiển thị tin nhắn chào mừng
    displayWelcomeMessage();
    
    // Đánh dấu chatbot đã được khởi tạo
    window.chatbotInitialized = true;
}

// Tạo các phần tử HTML cho chatbot
function createChatbotElements() {
    // Kiểm tra xem chatbot đã tồn tại chưa
    if (document.getElementById('weather-chatbot')) {
        return;
    }
    
    // Tạo container cho chatbot
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'weather-chatbot';
    chatbotContainer.className = 'weather-chatbot';
    
    // Tạo nút toggle chatbot
    const chatbotToggle = document.createElement('button');
    chatbotToggle.id = 'chatbot-toggle';
    chatbotToggle.className = 'chatbot-toggle';
    chatbotToggle.innerHTML = '<i class="fas fa-comment-dots"></i>';
    chatbotToggle.setAttribute('aria-label', 'Mở trợ lý thời tiết');
    
    // Tạo khung chat
    const chatbotWindow = document.createElement('div');
    chatbotWindow.id = 'chatbot-window';
    chatbotWindow.className = 'chatbot-window';
    
    // Tạo header cho chatbot
    const chatbotHeader = document.createElement('div');
    chatbotHeader.className = 'chatbot-header';
    chatbotHeader.innerHTML = `
        <div class="chatbot-title">
            <i class="fas fa-cloud-sun"></i>
            <span>Trợ lý thời tiết</span>
        </div>
        <button class="chatbot-close" aria-label="Đóng trợ lý thời tiết">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Tạo khu vực hiển thị tin nhắn
    const chatbotMessages = document.createElement('div');
    chatbotMessages.id = 'chatbot-messages';
    chatbotMessages.className = 'chatbot-messages';
    
    // Tạo khu vực nhập tin nhắn
    const chatbotInput = document.createElement('div');
    chatbotInput.className = 'chatbot-input';
    chatbotInput.innerHTML = `
        <input type="text" id="chatbot-message-input" placeholder="Hỏi về thời tiết..." aria-label="Nhập tin nhắn">
        <button id="chatbot-send" aria-label="Gửi tin nhắn">
            <i class="fas fa-paper-plane"></i>
        </button>
    `;
    
    // Tạo khu vực gợi ý nhanh
    const quickSuggestions = document.createElement('div');
    quickSuggestions.className = 'chatbot-quick-suggestions';
    quickSuggestions.innerHTML = `
        <button class="suggestion-btn">Thời tiết hiện tại</button>
        <button class="suggestion-btn">Có mưa không?</button>
        <button class="suggestion-btn">Nên mặc gì hôm nay?</button>
    `;
    
    // Ghép các phần tử lại với nhau
    chatbotWindow.appendChild(chatbotHeader);
    chatbotWindow.appendChild(chatbotMessages);
    chatbotWindow.appendChild(quickSuggestions);
    chatbotWindow.appendChild(chatbotInput);
    
    chatbotContainer.appendChild(chatbotToggle);
    chatbotContainer.appendChild(chatbotWindow);
    
    // Thêm chatbot vào body
    document.body.appendChild(chatbotContainer);
}

// Thiết lập các sự kiện cho chatbot
function setupEventListeners() {
    // Nút toggle để hiện/ẩn chatbot
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.querySelector('.chatbot-close');
    const chatbotInput = document.getElementById('chatbot-message-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    
    if (chatbotToggle) {
        // Xóa tất cả event listener cũ trước khi thêm mới
        chatbotToggle.replaceWith(chatbotToggle.cloneNode(true));
        const newChatbotToggle = document.getElementById('chatbot-toggle');
        
        newChatbotToggle.addEventListener('click', () => {
            chatbotWindow.classList.toggle('active');
            newChatbotToggle.classList.toggle('active');
            
            // Nếu chatbot đang mở, focus vào input
            if (chatbotWindow.classList.contains('active')) {
                chatbotInput.focus();
            }
        });
    }
    
    if (chatbotClose) {
        // Xóa tất cả event listener cũ trước khi thêm mới
        chatbotClose.replaceWith(chatbotClose.cloneNode(true));
        const newChatbotClose = document.querySelector('.chatbot-close');
        
        newChatbotClose.addEventListener('click', () => {
            chatbotWindow.classList.remove('active');
            document.getElementById('chatbot-toggle').classList.remove('active');
        });
    }
    
    // Xử lý sự kiện gửi tin nhắn
    if (chatbotSend) {
        // Xóa tất cả event listener cũ trước khi thêm mới
        chatbotSend.replaceWith(chatbotSend.cloneNode(true));
        const newChatbotSend = document.getElementById('chatbot-send');
        
        newChatbotSend.addEventListener('click', () => {
            sendMessage();
        });
    }
    
    if (chatbotInput) {
        // Xóa tất cả event listener cũ trước khi thêm mới
        chatbotInput.replaceWith(chatbotInput.cloneNode(true));
        const newChatbotInput = document.getElementById('chatbot-message-input');
        
        newChatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Xử lý các nút gợi ý nhanh - Đảm bảo chỉ đăng ký sự kiện một lần
    if (suggestionButtons && suggestionButtons.length > 0) {
        // Xóa tất cả event listener cũ bằng cách thay thế các nút
        suggestionButtons.forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });
        
        // Lấy lại các nút mới sau khi thay thế
        const newSuggestionButtons = document.querySelectorAll('.suggestion-btn');
        
        newSuggestionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const text = button.textContent;
                document.getElementById('chatbot-message-input').value = text;
                
                // Vô hiệu hóa tất cả các nút gợi ý trước khi gửi tin nhắn
                newSuggestionButtons.forEach(btn => {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.pointerEvents = 'none';
                });
                
                sendMessage();
                
                // Kích hoạt lại các nút sau khi nhận được phản hồi
                setTimeout(() => {
                    newSuggestionButtons.forEach(btn => {
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        btn.style.pointerEvents = 'auto';
                    });
                }, 2000); // Thời gian đủ để nhận phản hồi
            });
        });
    }
    
    // Lắng nghe sự kiện cập nhật dữ liệu thời tiết
    document.addEventListener('weatherDataUpdated', (e) => {
        currentWeatherData = e.detail;
        console.log('Chatbot received weather data:', currentWeatherData);
    });
}

// Hiển thị tin nhắn chào mừng
function displayWelcomeMessage() {
    const messages = document.getElementById('chatbot-messages');
    if (!messages) return;
    
    const welcomeMessage = `
        <div class="chatbot-message bot">
            <div class="message-content">
                <p>Xin chào! Tôi là trợ lý thời tiết. Tôi có thể giúp bạn:</p>
                <ul>
                    <li>Thông báo nhiệt độ và thời tiết hiện tại</li>
                    <li>Cho biết có nguy cơ mưa hay không</li>
                    <li>Gợi ý trang phục phù hợp với thời tiết</li>
                </ul>
                <p>Bạn muốn biết thông tin gì?</p>
            </div>
        </div>
    `;
    
    messages.innerHTML = welcomeMessage;
    scrollToBottom();
}

// Gửi tin nhắn từ người dùng
function sendMessage() {
    const input = document.getElementById('chatbot-message-input');
    const messages = document.getElementById('chatbot-messages');
    
    if (!input || !messages) return;
    
    const userMessage = input.value.trim();
    if (userMessage === '') return;
    
    // Hiển thị tin nhắn của người dùng
    const userMessageHTML = `
        <div class="chatbot-message user">
            <div class="message-content">
                <p>${escapeHTML(userMessage)}</p>
            </div>
        </div>
    `;
    
    messages.innerHTML += userMessageHTML;
    input.value = '';
    scrollToBottom();
    
    // Hiển thị trạng thái đang nhập
    showTypingIndicator();
    
    // Xử lý tin nhắn và phản hồi sau một khoảng thời gian ngắn
    setTimeout(() => {
        processUserMessage(userMessage);
    }, 500);
}

// Hiển thị chỉ báo đang nhập
function showTypingIndicator() {
    const messages = document.getElementById('chatbot-messages');
    if (!messages) return;
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chatbot-message bot typing';
    typingIndicator.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messages.appendChild(typingIndicator);
    scrollToBottom();
}

// Xóa chỉ báo đang nhập
function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        const parentMessage = typingIndicator.closest('.chatbot-message.typing');
        if (parentMessage) {
            parentMessage.remove();
        }
    }
}

// Xử lý tin nhắn của người dùng
function processUserMessage(message) {
    // Chuyển tin nhắn về chữ thường để dễ so sánh
    const lowerMessage = message.toLowerCase();
    
    // Kiểm tra xem có dữ liệu thời tiết không
    if (!currentWeatherData) {
        // Nếu không có dữ liệu thời tiết, yêu cầu người dùng tìm kiếm thành phố trước
        const response = `
            <div class="chatbot-message bot">
                <div class="message-content">
                    <p>Vui lòng tìm kiếm một thành phố trước để tôi có thể cung cấp thông tin thời tiết.</p>
                    <p>Bạn có thể tìm kiếm thành phố ở thanh tìm kiếm phía trên hoặc chuyển đến trang Dự báo.</p>
                </div>
            </div>
        `;
        
        removeTypingIndicator();
        const messages = document.getElementById('chatbot-messages');
        messages.innerHTML += response;
        scrollToBottom();
        return;
    }
    
    // Xử lý các loại câu hỏi khác nhau
    let botResponse = '';
    
    // Thời tiết hiện tại
    if (lowerMessage.includes('thời tiết') || 
        lowerMessage.includes('nhiệt độ') || 
        lowerMessage.includes('hiện tại') || 
        lowerMessage.includes('bây giờ')) {
        
        const temp = Math.round(currentWeatherData.main.temp);
        const feelsLike = Math.round(currentWeatherData.main.feels_like);
        const description = currentWeatherData.weather[0].description;
        const location = `${currentWeatherData.name}, ${currentWeatherData.sys.country}`;
        const humidity = currentWeatherData.main.humidity;
        const windSpeed = Math.round(currentWeatherData.wind.speed * 3.6); // Chuyển từ m/s sang km/h
        const pressure = currentWeatherData.main.pressure;
        
        // Đánh giá thời tiết
        let weatherEvaluation = '';
        if (temp < 10) {
            weatherEvaluation = 'Thời tiết khá lạnh, bạn nên mặc ấm khi ra ngoài.';
        } else if (temp < 20) {
            weatherEvaluation = 'Thời tiết mát mẻ, thích hợp cho các hoạt động ngoài trời.';
        } else if (temp < 30) {
            weatherEvaluation = 'Thời tiết ấm áp, rất tốt cho các hoạt động ngoài trời.';
        } else {
            weatherEvaluation = 'Thời tiết khá nóng, hãy uống nhiều nước và tránh nắng gay gắt.';
        }
        
        botResponse = `
            <div class="chatbot-message bot">
                <div class="message-content">
                    <p>Thời tiết hiện tại tại ${location}:</p>
                    <ul>
                        <li>Nhiệt độ: ${temp}°C</li>
                        <li>Cảm giác như: ${feelsLike}°C</li>
                        <li>Thời tiết: ${description}</li>
                        <li>Độ ẩm: ${humidity}%</li>
                        <li>Tốc độ gió: ${windSpeed} km/h</li>
                        <li>Áp suất: ${pressure} hPa</li>
                    </ul>
                    <p>${weatherEvaluation}</p>
                </div>
            </div>
        `;
    }
    // Nguy cơ mưa
    else if (lowerMessage.includes('mưa') || 
             lowerMessage.includes('trời mưa') || 
             lowerMessage.includes('có mưa')) {
        
        const weatherId = currentWeatherData.weather[0].id;
        const isRaining = weatherId >= 200 && weatherId < 700;
        const willRain = currentWeatherData.pop > 0.3; // Nếu có dữ liệu xác suất mưa
        const humidity = currentWeatherData.main.humidity;
        const clouds = currentWeatherData.clouds ? currentWeatherData.clouds.all : 0;
        
        let rainAdvice = '';
        
        if (isRaining) {
            if (weatherId >= 200 && weatherId < 300) {
                rainAdvice = 'Hiện tại đang có giông bão. Bạn nên ở trong nhà và tránh các khu vực cao, hở.';
            } else if (weatherId >= 300 && weatherId < 400) {
                rainAdvice = 'Hiện tại đang có mưa phùn. Bạn nên mang theo áo mưa nhẹ hoặc ô khi ra ngoài.';
            } else if (weatherId >= 500 && weatherId < 600) {
                rainAdvice = 'Hiện tại đang có mưa. Bạn nên mang theo ô hoặc áo mưa khi ra ngoài.';
            } else if (weatherId >= 600 && weatherId < 700) {
                rainAdvice = 'Hiện tại đang có tuyết. Bạn nên mặc ấm và mang giày chống trượt khi ra ngoài.';
            }
            
            botResponse = `
                <div class="chatbot-message bot">
                    <div class="message-content">
                        <p>${rainAdvice}</p>
                        <p>Độ ẩm hiện tại: ${humidity}%, Mây che phủ: ${clouds}%</p>
                    </div>
                </div>
            `;
        } else if (willRain) {
            botResponse = `
                <div class="chatbot-message bot">
                    <div class="message-content">
                        <p>Có khả năng sẽ mưa. Bạn nên chuẩn bị ô hoặc áo mưa khi ra ngoài.</p>
                        <p>Độ ẩm hiện tại: ${humidity}%, Mây che phủ: ${clouds}%</p>
                        <p>Với độ ẩm và lượng mây hiện tại, khả năng mưa trong vài giờ tới là khá cao.</p>
                    </div>
                </div>
            `;
        } else {
            let rainPrediction = '';
            if (humidity > 80 && clouds > 75) {
                rainPrediction = 'Tuy nhiên, với độ ẩm và lượng mây hiện tại, vẫn có thể có mưa nhỏ không lường trước được.';
            } else {
                rainPrediction = 'Với độ ẩm và lượng mây hiện tại, khả năng mưa trong vài giờ tới là rất thấp.';
            }
            
            botResponse = `
                <div class="chatbot-message bot">
                    <div class="message-content">
                        <p>Hiện tại không có mưa và khả năng mưa thấp.</p>
                        <p>Độ ẩm hiện tại: ${humidity}%, Mây che phủ: ${clouds}%</p>
                        <p>${rainPrediction}</p>
                    </div>
                </div>
            `;
        }
    }
    // Gợi ý trang phục
    else if (lowerMessage.includes('mặc gì') || 
             lowerMessage.includes('trang phục') || 
             lowerMessage.includes('quần áo') || 
             lowerMessage.includes('gợi ý')) {
        
        const temp = currentWeatherData.main.temp;
        const weatherId = currentWeatherData.weather[0].id;
        const isRaining = weatherId >= 200 && weatherId < 700;
        const isWindy = currentWeatherData.wind.speed > 5.5; // m/s
        const humidity = currentWeatherData.main.humidity;
        const description = currentWeatherData.weather[0].description;
        
        let clothingSuggestions = [];
        let activitySuggestions = [];
        
        // Dựa vào nhiệt độ
        if (temp < 10) {
            clothingSuggestions.push('Áo khoác dày', 'Găng tay', 'Mũ len', 'Khăn quàng cổ', 'Quần dài dày', 'Giày bốt');
            activitySuggestions.push('Hoạt động trong nhà', 'Uống đồ ấm');
        } else if (temp < 20) {
            clothingSuggestions.push('Áo khoác nhẹ hoặc áo len', 'Quần dài', 'Giày kín');
            activitySuggestions.push('Đi dạo trong công viên', 'Picnic ngoài trời');
        } else if (temp < 30) {
            clothingSuggestions.push('Áo sơ mi hoặc áo thun', 'Quần dài hoặc quần short', 'Giày thoáng khí');
            activitySuggestions.push('Các hoạt động ngoài trời', 'Đi bơi', 'Đạp xe');
        } else {
            clothingSuggestions.push('Áo thun nhẹ', 'Quần short', 'Váy', 'Dép hoặc sandal');
            activitySuggestions.push('Đi bơi', 'Tránh hoạt động ngoài trời vào giữa trưa', 'Uống nhiều nước');
        }
        
        // Thêm gợi ý dựa vào thời tiết
        if (isRaining) {
            if (weatherId >= 200 && weatherId < 300) {
                clothingSuggestions.push('Áo mưa dày', 'Giày không thấm nước', 'Tránh mang đồ kim loại');
                activitySuggestions = ['Ở trong nhà', 'Tránh các khu vực cao, hở'];
            } else {
                clothingSuggestions.push('Áo mưa hoặc ô', 'Giày không thấm nước');
                activitySuggestions.push('Các hoạt động trong nhà');
            }
        }
        
        if (isWindy) {
            clothingSuggestions.push('Áo khoác chắn gió', 'Mũ có dây buộc');
            activitySuggestions.push('Tránh các khu vực có nhiều cây cối');
        }
        
        // Thêm gợi ý về chống nắng nếu trời nắng
        if (weatherId === 800 && temp > 25) { // Trời quang và nóng
            clothingSuggestions.push('Mũ rộng vành', 'Kính râm', 'Kem chống nắng SPF 30+', 'Áo chống nắng');
            activitySuggestions.push('Tìm bóng râm', 'Uống nhiều nước');
        }
        
        const suggestionsList = clothingSuggestions
            .map(item => `<li>${item}</li>`)
            .join('');
            
        const activitiesList = activitySuggestions
            .map(item => `<li>${item}</li>`)
            .join('');
        
        botResponse = `
            <div class="chatbot-message bot">
                <div class="message-content">
                    <p>Với nhiệt độ ${Math.round(temp)}°C và thời tiết ${description}, tôi gợi ý:</p>
                    <p><strong>Trang phục:</strong></p>
                    <ul>
                        ${suggestionsList}
                    </ul>
                    <p><strong>Hoạt động phù hợp:</strong></p>
                    <ul>
                        ${activitiesList}
                    </ul>
                    <p>Độ ẩm hiện tại là ${humidity}%, hãy điều chỉnh trang phục cho phù hợp.</p>
                </div>
            </div>
        `;
    }
    // Vị trí
    else if (lowerMessage.includes('vị trí') || 
             lowerMessage.includes('ở đâu') || 
             lowerMessage.includes('thành phố')) {
        
        const location = `${currentWeatherData.name}, ${currentWeatherData.sys.country}`;
        const coordinates = `${currentWeatherData.coord.lat.toFixed(2)}, ${currentWeatherData.coord.lon.toFixed(2)}`;
        const sunrise = new Date(currentWeatherData.sys.sunrise * 1000).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
        const sunset = new Date(currentWeatherData.sys.sunset * 1000).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
        
        botResponse = `
            <div class="chatbot-message bot">
                <div class="message-content">
                    <p>Thông tin vị trí hiện tại:</p>
                    <ul>
                        <li>Thành phố: ${location}</li>
                        <li>Tọa độ: ${coordinates}</li>
                        <li>Bình minh: ${sunrise}</li>
                        <li>Hoàng hôn: ${sunset}</li>
                    </ul>
                    <p>Bạn có thể xem thêm thông tin chi tiết về thành phố này trong mục Thành phố trên thanh điều hướng.</p>
                </div>
            </div>
        `;
    }
    // Thêm câu hỏi về chất lượng không khí
    else if (lowerMessage.includes('không khí') || 
             lowerMessage.includes('ô nhiễm') || 
             lowerMessage.includes('aqi')) {
        
        botResponse = `
            <div class="chatbot-message bot">
                <div class="message-content">
                    <p>Hiện tại tôi chưa có dữ liệu chi tiết về chất lượng không khí.</p>
                    <p>Tuy nhiên, dựa vào điều kiện thời tiết hiện tại, chất lượng không khí có thể được đánh giá sơ bộ như sau:</p>
                    <ul>
                        <li>Tốc độ gió: ${Math.round(currentWeatherData.wind.speed * 3.6)} km/h</li>
                        <li>Độ ẩm: ${currentWeatherData.main.humidity}%</li>
                        <li>Thời tiết: ${currentWeatherData.weather[0].description}</li>
                    </ul>
                    <p>Để có thông tin chính xác hơn, bạn nên kiểm tra các ứng dụng chuyên về chất lượng không khí.</p>
                </div>
            </div>
        `;
    }
    // Thêm câu hỏi về dự báo
    else if (lowerMessage.includes('dự báo') || 
             lowerMessage.includes('ngày mai') || 
             lowerMessage.includes('tuần này')) {
        
        botResponse = `
            <div class="chatbot-message bot">
                <div class="message-content">
                    <p>Để xem dự báo thời tiết chi tiết, bạn có thể:</p>
                    <ul>
                        <li>Chuyển đến trang Dự báo trên thanh điều hướng</li>
                        <li>Xem dự báo theo giờ và theo ngày</li>
                        <li>Xem biểu đồ nhiệt độ trong những ngày tới</li>
                    </ul>
                    <p>Trang Dự báo sẽ cung cấp thông tin chi tiết hơn về thời tiết trong những ngày tới.</p>
                </div>
            </div>
        `;
    }
    // Trả lời mặc định nếu không hiểu câu hỏi
    else {
        botResponse = `
            <div class="chatbot-message bot">
                <div class="message-content">
                    <p>Tôi có thể giúp bạn với thông tin về:</p>
                    <ul>
                        <li>Thời tiết và nhiệt độ hiện tại</li>
                        <li>Nguy cơ mưa</li>
                        <li>Gợi ý trang phục phù hợp</li>
                        <li>Thông tin vị trí</li>
                        <li>Chất lượng không khí (sơ bộ)</li>
                        <li>Hướng dẫn xem dự báo</li>
                    </ul>
                    <p>Vui lòng hỏi tôi về một trong những chủ đề trên.</p>
                </div>
            </div>
        `;
    }
    
    // Hiển thị phản hồi của bot
    removeTypingIndicator();
    const messages = document.getElementById('chatbot-messages');
    messages.innerHTML += botResponse;
    scrollToBottom();
}

// Cuộn xuống cuối cùng của khung chat
function scrollToBottom() {
    const messages = document.getElementById('chatbot-messages');
    if (messages) {
        messages.scrollTop = messages.scrollHeight;
    }
}

// Hàm escape HTML để tránh XSS
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Hàm để cập nhật dữ liệu thời tiết hiện tại
function updateCurrentWeatherData(data) {
    currentWeatherData = data;
    
    // Tạo một sự kiện tùy chỉnh để thông báo rằng dữ liệu thời tiết đã được cập nhật
    const event = new CustomEvent('weatherDataUpdated', { detail: data });
    document.dispatchEvent(event);
}

// Export các hàm cần thiết
window.weatherChatbot = {
    init: initChatbot,
    updateWeatherData: updateCurrentWeatherData
};