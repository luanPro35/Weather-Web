// Chatbot AI for Weather App

// Khởi tạo biến toàn cục
let API_KEY;

// Hàm để lấy API key từ trangchu.js
function getApiKey() {
    if (window.API_KEY) {
        API_KEY = window.API_KEY;
        console.log('API key loaded successfully');
    } else {
        console.error('API key not found in window object');
    }
}

// Thiết lập các sự kiện cho chatbot
function setupChatbotEvents() {
    console.log('Setting up chatbot events');
    
    // Lấy các phần tử cần thiết
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotClose = document.querySelector('.chatbot-close');
    const chatbotWindow = document.querySelector('.chatbot-window');
    const chatbotInput = document.querySelector('.chatbot-input input');
    const chatbotSend = document.querySelector('.chatbot-send');
    
    if (!chatbotToggle || !chatbotClose || !chatbotWindow || !chatbotInput || !chatbotSend) {
        console.error('Some chatbot elements not found');
        // Thử tìm các phần tử trong static-chatbot-button
        const staticChatbot = document.getElementById('static-chatbot-button');
        if (staticChatbot) {
            const staticToggle = staticChatbot.querySelector('.chatbot-toggle');
            const staticWindow = staticChatbot.querySelector('.chatbot-window');
            const staticClose = staticChatbot.querySelector('.chatbot-close');
            const staticInput = staticChatbot.querySelector('.chatbot-input input');
            const staticSend = staticChatbot.querySelector('.chatbot-send');
            
            if (staticToggle && staticWindow) {
                console.log('Found chatbot elements in static-chatbot-button');
                // Thiết lập sự kiện cho nút chat tĩnh
                staticToggle.addEventListener('click', function() {
                    console.log('Static toggle button clicked');
                    staticWindow.classList.toggle('active');
                });
                
                if (staticClose) {
                    staticClose.addEventListener('click', function() {
                        staticWindow.classList.remove('active');
                    });
                }
                
                if (staticInput && staticSend) {
                    staticInput.addEventListener('input', function() {
                        staticSend.disabled = !this.value.trim();
                    });
                    
                    staticSend.addEventListener('click', function() {
                        if (staticInput.value.trim()) {
                            sendMessage();
                        }
                    });
                    
                    staticInput.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter' && this.value.trim()) {
                            sendMessage();
                        }
                    });
                }
            }
        }
        return;
    }
    
    // Sự kiện khi click vào nút chat
chatbotToggle.addEventListener('click', function() {
    console.log('Toggle button clicked');
    chatbotWindow.classList.toggle('active');
});

// Thêm sự kiện click cho tin nhắn
const messages = document.querySelectorAll('.message');
messages.forEach(message => {
    message.addEventListener('click', function() {
        console.log('Message clicked');
        chatbotWindow.classList.add('active');
    });
});
    
    // Sự kiện khi click vào nút đóng
    chatbotClose.addEventListener('click', function() {
        chatbotWindow.classList.remove('active');
    });
    
    // Sự kiện khi nhập tin nhắn
    chatbotInput.addEventListener('input', function() {
        chatbotSend.disabled = !this.value.trim();
    });
    
    // Sự kiện khi nhấn Enter trong ô input
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            sendMessage();
        }
    });
    
    // Sự kiện khi click vào nút gửi
    chatbotSend.addEventListener('click', function() {
        if (chatbotInput.value.trim()) {
            sendMessage();
        }
    });
    
    console.log('Chatbot events setup completed');
}

// Sự kiện khi trang đã tải xong
window.addEventListener('load', function() {
    console.log('Chatbot.js - window.load event fired');
    
    // Lấy API key
    getApiKey();
    
    // Khởi tạo chatbot sau một khoảng thời gian ngắn
    setTimeout(() => {
        // Kiểm tra xem nút chat đã có sự kiện click chưa
        const chatButton = document.getElementById('chat-toggle-button');
        if (chatButton) {
            console.log('Chatbot.js - Nút chat đã được tìm thấy, không gắn sự kiện click mới');
            // Không gắn sự kiện click mới nếu nút đã có ID chat-toggle-button
            // Chỉ khởi tạo cửa sổ chat
            initChatbot();
            
            // Thêm console.log để kiểm tra nút chat
            console.log('Chatbot.js đã được tải - kiểm tra nút chat');
            
            // Xóa tất cả sự kiện click cũ
            const oldButton = chatButton.cloneNode(true);
            chatButton.parentNode.replaceChild(oldButton, chatButton);
            
            // Thêm sự kiện click mới
            oldButton.addEventListener('click', function(e) {
              console.log('Nút chat được click - từ chatbot.js');
              console.log('Event:', e);
              console.log('Button:', this);
              e.preventDefault();
              e.stopPropagation();
              
              // Hiển thị cửa sổ chat
              const chatWindow = document.querySelector('.chatbot-window');
              if (chatWindow) {
                chatWindow.classList.toggle('active');
              }
              return false;
            }, true);
        } else {
            console.log('Chatbot.js - Không tìm thấy nút chat với ID chat-toggle-button');
            // Khởi tạo chatbot và gắn sự kiện click
            initChatbot();
            console.log('Chatbot initialized');
            
            // Kiểm tra xem chatbot container có được thêm vào DOM không
            const chatbotContainer = document.querySelector('.chatbot-container');
            if (chatbotContainer) {
                console.log('Chatbot container found in DOM');
            } else {
                console.error('Chatbot container NOT found in DOM');
            }
            
            // Thiết lập các sự kiện cho chatbot
            setupChatbotEvents();
            
            // Đảm bảo nút chat tĩnh có sự kiện click
            const staticChatbot = document.getElementById('static-chatbot-button');
            if (staticChatbot) {
                const staticToggle = staticChatbot.querySelector('.chatbot-toggle');
                if (staticToggle) {
                    console.log('Adding click event to static toggle button');
                    // Xóa tất cả sự kiện click cũ
                    const newToggle = staticToggle.cloneNode(true);
                    staticToggle.parentNode.replaceChild(newToggle, staticToggle);
                    
                    // Thêm sự kiện click mới
                    newToggle.addEventListener('click', function(e) {
                        console.log('Static toggle button clicked from chatbot.js');
                        const chatWindow = staticChatbot.querySelector('.chatbot-window');
                        if (chatWindow) {
                            chatWindow.classList.toggle('active');
                        }
                        e.stopPropagation(); // Ngăn sự kiện lan truyền
                    });
                }
            }
        }
    }, 500);
});

// Hàm khởi tạo chatbot
function initChatbot() {
    // Kiểm tra xem đã có nút chat tĩnh chưa
    const existingChatbot = document.getElementById('static-chatbot-button');
    
    if (existingChatbot) {
        console.log('Static chatbot button already exists, using it instead');
        
        // Kiểm tra xem cửa sổ chat đã tồn tại chưa
        let existingWindow = existingChatbot.querySelector('.chatbot-window');
        if (!existingWindow) {
            console.log('Creating chat window in static button');
            // Tạo cửa sổ chat nếu chưa tồn tại
            existingWindow = document.createElement('div');
            existingWindow.className = 'chatbot-window';
            existingWindow.innerHTML = `
                <div class="chatbot-header">
                    <div class="chatbot-title">Trợ lý thời tiết</div>
                    <button class="chatbot-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="chatbot-messages"></div>
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="chatbot-input">
                    <input type="text" placeholder="Hỏi về thời tiết..." />
                    <button class="chatbot-send" disabled><i class="fas fa-paper-plane"></i></button>
                </div>
            `;
            existingChatbot.appendChild(existingWindow);
            
            // Thêm tin nhắn chào mừng
            const messagesContainer = existingWindow.querySelector('.chatbot-messages');
            if (messagesContainer) {
                const welcomeMessage = document.createElement('div');
                welcomeMessage.className = 'message bot-message';
                welcomeMessage.textContent = 'Xin chào! Tôi là trợ lý thời tiết. Bạn có thể hỏi tôi về thời tiết ở bất kỳ đâu.';
                messagesContainer.appendChild(welcomeMessage);
            }
        }
        
        // Đảm bảo cửa sổ chat có thể hiển thị khi click vào nút chat
        const chatbotToggle = existingChatbot.querySelector('.chatbot-toggle');
        if (chatbotToggle && existingWindow) {
            // Xóa tất cả sự kiện click cũ
            const newToggle = chatbotToggle.cloneNode(true);
            chatbotToggle.parentNode.replaceChild(newToggle, chatbotToggle);
            
            // Thêm sự kiện click mới
            newToggle.addEventListener('click', function(e) {
                console.log('Static toggle button clicked from initChatbot');
                existingWindow.classList.toggle('active');
                e.stopPropagation(); // Ngăn sự kiện lan truyền
            });
            
            // Thiết lập sự kiện đóng chat
            const closeButton = existingWindow.querySelector('.chatbot-close');
            if (closeButton) {
                closeButton.addEventListener('click', function() {
                    existingWindow.classList.remove('active');
                });
            }
            
            // Thiết lập sự kiện gửi tin nhắn
            const inputField = existingWindow.querySelector('.chatbot-input input');
            const sendButton = existingWindow.querySelector('.chatbot-send');
            
            if (inputField && sendButton) {
                inputField.addEventListener('input', function() {
                    sendButton.disabled = !this.value.trim();
                });
                
                sendButton.addEventListener('click', function() {
                    if (inputField.value.trim()) {
                        sendMessage();
                    }
                });
                
                inputField.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' && this.value.trim()) {
                        sendMessage();
                    }
                });
            }
        }
        
        return; // Tránh thêm nhiều cửa sổ chat
        }
        
        // Thêm cửa sổ chat vào nút chat tĩnh
        const chatWindowHTML = `
            <div class="chatbot-window">
                <div class="chatbot-header">
                    <div class="chatbot-title">
                        <i class="fas fa-robot"></i> Trợ lý thời tiết
                    </div>
                    <button class="chatbot-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chatbot-messages">
                    <div class="message bot-message">
                        Xin chào! Tôi là trợ lý thời tiết. Bạn có thể hỏi tôi về thời tiết ở bất kỳ đâu, ví dụ: "Hôm nay ở Hà Nội có mưa không?"
                    </div>
                </div>
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <div class="chatbot-input">
                    <input type="text" placeholder="Nhập câu hỏi của bạn..." />
                    <button class="chatbot-send" disabled>
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        existingChatbot.insertAdjacentHTML('beforeend', chatWindowHTML);
        console.log('Chat window added to static button');
        
        // Thiết lập lại các sự kiện cho chatbot sau khi thêm cửa sổ chat
        setTimeout(() => {
            setupChatbotEvents();
            console.log('Chatbot events re-setup after adding to static button');
        }, 100);
    } 
        // Tạo cấu trúc HTML cho chatbot
        const chatbotHTML = `
            <div class="chatbot-container" style="display: block !important;">
                <button class="chatbot-toggle" style="display: block !important; background-color: #667eea;">
                    <i class="fas fa-comment" style="color: white;"></i>
                </button>
                <div class="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <i class="fas fa-robot"></i> Trợ lý thời tiết
                        </div>
                        <button class="chatbot-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="chatbot-messages">
                        <div class="message bot-message">
                            Xin chào! Tôi là trợ lý thời tiết. Bạn có thể hỏi tôi về thời tiết ở bất kỳ đâu, ví dụ: "Hôm nay ở Hà Nội có mưa không?"
                        </div>
                    </div>
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                    <div class="chatbot-input">
                        <input type="text" placeholder="Nhập câu hỏi của bạn..." />
                        <button class="chatbot-send" disabled>
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Thêm chatbot vào body
        try {
            document.body.insertAdjacentHTML('beforeend', chatbotHTML);
            console.log('Chatbot HTML added to body');
        } catch (error) {
            console.error('Error adding chatbot to body:', error);
        }

    // Lấy các phần tử DOM
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotWindow = document.querySelector('.chatbot-window');
    const chatbotClose = document.querySelector('.chatbot-close');
    const chatbotInput = document.querySelector('.chatbot-input input');
    const chatbotSend = document.querySelector('.chatbot-send');
    const chatbotMessages = document.querySelector('.chatbot-messages');
    const typingIndicator = document.querySelector('.typing-indicator');
    
    // Thêm sự kiện click cho các tin nhắn ban đầu
    const initialMessages = document.querySelectorAll('.message');
    initialMessages.forEach(message => {
        message.addEventListener('click', function() {
            console.log('Initial message clicked');
            chatbotWindow.classList.add('active');
        });
    });

    // Xử lý sự kiện đóng/mở chatbot
    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.toggle('active');
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });

    // Xử lý sự kiện nhập liệu
    chatbotInput.addEventListener('input', () => {
        chatbotSend.disabled = chatbotInput.value.trim() === '';
    });

    // Xử lý sự kiện gửi tin nhắn
    chatbotSend.addEventListener('click', () => {
        sendMessage();
    });

    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Hàm gửi tin nhắn
    function sendMessage() {
        // Tìm kiếm trong static-chatbot-button trước
        const staticChatbot = document.getElementById('static-chatbot-button');
        let chatbotInput, messagesContainer, chatbotSend;
        
        if (staticChatbot) {
            chatbotInput = staticChatbot.querySelector('.chatbot-input input');
            messagesContainer = staticChatbot.querySelector('.chatbot-messages');
            chatbotSend = staticChatbot.querySelector('.chatbot-send');
        }
        
        // Nếu không tìm thấy trong static-chatbot-button, tìm trong document
        if (!chatbotInput || !messagesContainer) {
            chatbotInput = document.querySelector('.chatbot-input input');
            messagesContainer = document.querySelector('.chatbot-messages');
            chatbotSend = document.querySelector('.chatbot-send');
        }
        
        if (!chatbotInput || !messagesContainer) {
            console.error('Chatbot input or messages container not found');
            return;
        }
        
        const message = chatbotInput.value.trim();
        if (message === '') return;

        // Hiển thị tin nhắn của người dùng
        addMessage(message, 'user');

        // Xóa input
        chatbotInput.value = '';
        if (chatbotSend) {
            chatbotSend.disabled = true;
        }

        // Hiển thị typing indicator
        showTypingIndicator();

        // Xử lý câu hỏi và trả lời
        processUserQuery(message);
    }

    // Hàm thêm tin nhắn vào khung chat
    function addMessage(text, sender) {
        // Tìm kiếm trong static-chatbot-button trước
        const staticChatbot = document.getElementById('static-chatbot-button');
        let messagesContainer;
        
        if (staticChatbot) {
            messagesContainer = staticChatbot.querySelector('.chatbot-messages');
        }
        
        // Nếu không tìm thấy trong static-chatbot-button, tìm trong document
        if (!messagesContainer) {
            messagesContainer = document.querySelector('.chatbot-messages');
        }
        
        if (!messagesContainer) {
            console.error('Messages container not found');
            return;
        }
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messageElement.textContent = text;
        
        // Thêm sự kiện click cho tin nhắn để hiển thị khung chat
        messageElement.addEventListener('click', function() {
            const chatbotWindow = staticChatbot ? staticChatbot.querySelector('.chatbot-window') : document.querySelector('.chatbot-window');
            if (chatbotWindow) {
                chatbotWindow.classList.add('active');
            }
        });
        
        messagesContainer.appendChild(messageElement);
        
        // Cuộn xuống tin nhắn mới nhất
        scrollToBottom();
    }

    // Hàm cuộn xuống cuối khung chat
    function scrollToBottom() {
        // Tìm kiếm trong static-chatbot-button trước
        const staticChatbot = document.getElementById('static-chatbot-button');
        let messagesContainer;
        
        if (staticChatbot) {
            messagesContainer = staticChatbot.querySelector('.chatbot-messages');
        }
        
        // Nếu không tìm thấy trong static-chatbot-button, tìm trong document
        if (!messagesContainer) {
            messagesContainer = document.querySelector('.chatbot-messages');
        }
        
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Hiển thị typing indicator
    function showTypingIndicator() {
        // Tìm kiếm trong static-chatbot-button trước
        const staticChatbot = document.getElementById('static-chatbot-button');
        let typingIndicator;
        
        if (staticChatbot) {
            typingIndicator = staticChatbot.querySelector('.typing-indicator');
        }
        
        // Nếu không tìm thấy trong static-chatbot-button, tìm trong document
        if (!typingIndicator) {
            typingIndicator = document.querySelector('.typing-indicator');
        }
        
        if (typingIndicator) {
            typingIndicator.classList.add('active');
        }
    }

    // Ẩn typing indicator
    function hideTypingIndicator() {
        // Tìm kiếm trong static-chatbot-button trước
        const staticChatbot = document.getElementById('static-chatbot-button');
        let typingIndicator;
        
        if (staticChatbot) {
            typingIndicator = staticChatbot.querySelector('.typing-indicator');
        }
        
        // Nếu không tìm thấy trong static-chatbot-button, tìm trong document
        if (!typingIndicator) {
            typingIndicator = document.querySelector('.typing-indicator');
        }
        
        if (typingIndicator) {
            typingIndicator.classList.remove('active');
        }
    }

    // Xử lý câu hỏi của người dùng
    async function processUserQuery(query) {
        try {
            // Phân tích câu hỏi để tìm địa điểm và thời gian
            const { location, time, weatherType } = parseQuery(query);
    
            // Hàm hiển thị tin nhắn và đảm bảo khung chat hiển thị
            const showBotMessage = (message) => {
                hideTypingIndicator();
                addMessage(message, 'bot');
                
                // Đảm bảo khung chat hiển thị khi có tin nhắn mới
                const staticChatbot = document.getElementById('static-chatbot-button');
                if (staticChatbot) {
                    const chatbotWindow = staticChatbot.querySelector('.chatbot-window');
                    if (chatbotWindow && !chatbotWindow.classList.contains('active')) {
                        chatbotWindow.classList.add('active');
                    }
                }
            };

            if (!location) {
                setTimeout(() => {
                    showBotMessage('Vui lòng cho tôi biết bạn muốn xem thời tiết ở đâu?');
                }, 1000);
                return;
            }

            // Lấy dữ liệu thời tiết
            const weatherData = await getWeatherData(location, time);
            
            // Tạo câu trả lời
            const response = generateResponse(weatherData, location, time, weatherType);
            
            // Hiển thị câu trả lời sau một khoảng thời gian ngắn để mô phỏng suy nghĩ
            setTimeout(() => {
                showBotMessage(response);
            }, 1500);

        } catch (error) {
            console.error('Error processing query:', error);
            setTimeout(() => {
                hideTypingIndicator();
                addMessage('Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại sau.', 'bot');
            }, 1000);
        }
    }

    // Phân tích câu hỏi để tìm địa điểm và thời gian
    function parseQuery(query) {
        query = query.toLowerCase();
        
        // Tìm địa điểm
        let location = null;
        
        // Danh sách các từ khóa địa điểm phổ biến
        const locationKeywords = [
            'ở', 'tại', 'của', 'thành phố', 'tỉnh', 'huyện', 'quận'
        ];
        
        // Danh sách các tỉnh thành Việt Nam
        const vietnamProvinces = [
            'hà nội', 'hồ chí minh', 'đà nẵng', 'hải phòng', 'cần thơ',
            'an giang', 'bà rịa vũng tàu', 'bắc giang', 'bắc kạn', 'bạc liêu',
            'bắc ninh', 'bến tre', 'bình định', 'bình dương', 'bình phước',
            'bình thuận', 'cà mau', 'cao bằng', 'đắk lắk', 'đắk nông',
            'điện biên', 'đồng nai', 'đồng tháp', 'gia lai', 'hà giang',
            'hà nam', 'hà tĩnh', 'hải dương', 'hậu giang', 'hòa bình',
            'hưng yên', 'khánh hòa', 'kiên giang', 'kon tum', 'lai châu',
            'lâm đồng', 'lạng sơn', 'lào cai', 'long an', 'nam định',
            'nghệ an', 'ninh bình', 'ninh thuận', 'phú thọ', 'phú yên',
            'quảng bình', 'quảng nam', 'quảng ngãi', 'quảng ninh', 'quảng trị',
            'sóc trăng', 'sơn la', 'tây ninh', 'thái bình', 'thái nguyên',
            'thanh hóa', 'thừa thiên huế', 'tiền giang', 'trà vinh', 'tuyên quang',
            'vĩnh long', 'vĩnh phúc', 'yên bái', 'sài gòn', 'huế'
        ];

        // Tìm tỉnh thành trong câu hỏi
        for (const province of vietnamProvinces) {
            if (query.includes(province)) {
                location = province;
                break;
            }
        }

        // Nếu không tìm thấy tỉnh thành cụ thể, tìm từ khóa địa điểm
        if (!location) {
            for (const keyword of locationKeywords) {
                const keywordIndex = query.indexOf(` ${keyword} `);
                if (keywordIndex !== -1) {
                    // Lấy từ sau từ khóa
                    const afterKeyword = query.substring(keywordIndex + keyword.length + 1).trim();
                    const nextSpace = afterKeyword.indexOf(' ');
                    location = nextSpace !== -1 ? afterKeyword.substring(0, nextSpace) : afterKeyword;
                    break;
                }
            }
        }

        // Tìm thời gian
        let time = 'current'; // Mặc định là hiện tại
        
        if (query.includes('ngày mai') || query.includes('tomorrow')) {
            time = 'tomorrow';
        } else if (query.includes('hôm nay') || query.includes('today')) {
            time = 'today';
        } else if (query.includes('tuần này') || query.includes('this week')) {
            time = 'week';
        }

        // Tìm loại thời tiết người dùng đang hỏi
        let weatherType = 'general'; // Mặc định là thông tin chung
        
        if (query.includes('mưa') || query.includes('rain')) {
            weatherType = 'rain';
        } else if (query.includes('nhiệt độ') || query.includes('nóng') || query.includes('lạnh') || 
                  query.includes('temperature') || query.includes('hot') || query.includes('cold')) {
            weatherType = 'temperature';
        } else if (query.includes('gió') || query.includes('wind')) {
            weatherType = 'wind';
        } else if (query.includes('độ ẩm') || query.includes('humidity')) {
            weatherType = 'humidity';
        } else if (query.includes('nắng') || query.includes('sunny')) {
            weatherType = 'sunny';
        }

        return { location, time, weatherType };
    }

    // Lấy dữ liệu thời tiết từ API
    async function getWeatherData(location, time) {
        try {
            // Chuyển đổi tên tỉnh thành thành phố nếu có trong bản đồ
            let searchCity = location.toLowerCase().trim();
            const provinceToCityMap = {
                // Miền Bắc
                'hà giang': 'Ha Giang', 'ha giang': 'Ha Giang', // Hà Giang
                'cao bằng': 'Cao Bang', 'cao bang': 'Cao Bang', // Cao Bằng
                'bắc kạn': 'Bac Kan', 'bac kan': 'Bac Kan', // Bắc Kạn
                'lạng sơn': 'Lang Son', 'lang son': 'Lang Son', // Lạng Sơn
                'tuyên quang': 'Tuyen Quang', 'tuyen quang': 'Tuyen Quang', // Tuyên Quang
                'thái nguyên': 'Thai Nguyen', 'thai nguyen': 'Thai Nguyen', // Thái Nguyên
                'phú thọ': 'Phu Tho', 'phu tho': 'Phu Tho', // Phú Thọ
                'bắc giang': 'Bac Giang', 'bac giang': 'Bac Giang', // Bắc Giang
                'quảng ninh': 'Quang Ninh', 'quang ninh': 'Quang Ninh', // Quảng Ninh
                'lào cai': 'Lao Cai', 'lao cai': 'Lao Cai', // Lào Cai
                'yên bái': 'Yen Bai', 'yen bai': 'Yen Bai', // Yên Bái
                'điện biên': 'Dien Bien', 'dien bien': 'Dien Bien', // Điện Biên
                'điện biên phủ': 'Dien Bien Phu', 'dien bien phu': 'Dien Bien Phu', // Điện Biên Phủ
                'lai châu': 'Lai Chau', 'lai chau': 'Lai Chau', // Lai Châu
                'sơn la': 'Son La', 'son la': 'Son La', // Sơn La
                'bắc ninh': 'Bac Ninh', 'bac ninh': 'Bac Ninh', // Bắc Ninh
                'hà nam': 'Ha Nam', 'ha nam': 'Ha Nam', // Hà Nam
                'hải dương': 'Hai Duong', 'hai duong': 'Hai Duong', // Hải Dương
                'hưng yên': 'Hung Yen', 'hung yen': 'Hung Yen', // Hưng Yên
                'nam định': 'Nam Dinh', 'nam dinh': 'Nam Dinh', // Nam Định
                'ninh bình': 'Ninh Binh', 'ninh binh': 'Ninh Binh', // Ninh Bình
                'thái bình': 'Thai Binh', 'thai binh': 'Thai Binh', // Thái Bình
                'vĩnh phúc': 'Vinh Phuc', 'vinh phuc': 'Vinh Phuc', // Vĩnh Phúc
                'hà nội': 'Hanoi', 'ha noi': 'Hanoi', // Hà Nội (Thành phố trực thuộc TW)
                'hải phòng': 'Haiphong', 'hai phong': 'Haiphong', // Hải Phòng (Thành phố trực thuộc TW)

                // Miền Trung
                'thanh hóa': 'Thanh Hoa', 'thanh hoa': 'Thanh Hoa', // Thanh Hóa
                'nghệ an': 'Nghe An', 'nghe an': 'Nghe An', // Nghệ An
                'hà tĩnh': 'Ha Tinh', 'ha tinh': 'Ha Tinh', // Hà Tĩnh
                'quảng bình': 'Quang Binh', 'quang binh': 'Quang Binh', // Quảng Bình
                'quảng trị': 'Quang Tri', 'quang tri': 'Quang Tri', // Quảng Trị
                'thừa thiên huế': 'Thua Thien Hue', 'thua thien hue': 'Thua Thien Hue', 'huế': 'Thua Thien Hue', 'hue': 'Thua Thien Hue', // Thừa Thiên Huế
                'đà nẵng': 'Da Nang', 'da nang': 'Da Nang', // Đà Nẵng (Thành phố trực thuộc TW)
                'quảng nam': 'Quang Nam', 'quang nam': 'Quang Nam', // Quảng Nam
                'quảng ngãi': 'Quang Ngai', 'quang ngai': 'Quang Ngai', // Quảng Ngãi
                'bình định': 'Binh Dinh', 'binh dinh': 'Binh Dinh', // Bình Định
                'phú yên': 'Phu Yen', 'phu yen': 'Phu Yen', // Phú Yên
                'khánh hòa': 'Khanh Hoa', 'khanh hoa': 'Khanh Hoa', // Khánh Hòa
                'ninh thuận': 'Ninh Thuan', 'ninh thuan': 'Ninh Thuan', 'phan rang': 'Ninh Thuan', // Ninh Thuận
                'bình thuận': 'Binh Thuan', 'binh thuan': 'Binh Thuan', // Bình Thuận
                'kon tum': 'Kon Tum', // Kon Tum
                'gia lai': 'Gia Lai', // Gia Lai
                'đắk lắk': 'Dak Lak', 'dak lak': 'Dak Lak', 'bmt': 'Dak Lak', // Đắk Lắk
                'đắk nông': 'Dak Nong', 'dak nong': 'Dak Nong', // Đắk Nông
                'lâm đồng': 'Lam Dong', 'lam dong': 'Lam Dong', // Lâm Đồng

                // Miền Nam
                'bình phước': 'Binh Phuoc', 'binh phuoc': 'Binh Phuoc', // Bình Phước
                'bình dương': 'Binh Duong', 'binh duong': 'Binh Duong', // Bình Dương
                'đồng nai': 'Dong Nai', 'dong nai': 'Dong Nai', // Đồng Nai
                'tây ninh': 'Tay Ninh', 'tay ninh': 'Tay Ninh', // Tây Ninh
                'bà rịa vũng tàu': 'Ba Ria - Vung Tau', // Bà Rịa - Vũng Tàu
                'ba ria vung tau': 'Ba Ria - Vung Tau',
                'brvt': 'Ba Ria - Vung Tau',
                'hồ chí minh': 'Ho Chi Minh City', 'ho chi minh city': 'Ho Chi Minh City', 'hcm': 'Ho Chi Minh City', 'tp hcm': 'Ho Chi Minh City', 'sài gòn': 'Ho Chi Minh City', 'sai gon': 'Ho Chi Minh City',
                'long an': 'Long An', // Long An
                'đồng tháp': 'Dong Thap', 'dong thap': 'Dong Thap', // Đồng Tháp
                'tiền giang': 'Tien Giang', 'tien giang': 'Tien Giang', // Tiền Giang
                'an giang': 'An Giang', // An Giang
                'bến tre': 'Ben Tre', 'ben tre': 'Ben Tre', // Bến Tre
                'vĩnh long': 'Vinh Long', 'vinh long': 'Vinh Long', // Vĩnh Long
                'trà vinh': 'Tra Vinh', 'tra vinh': 'Tra Vinh', // Trà Vinh
                'hậu giang': 'Hau Giang', 'hau giang': 'Hau Giang', // Hậu Giang
                'kiên giang': 'Kien Giang', 'kien giang': 'Kien Giang', // Kiên Giang
                'sóc trăng': 'Soc Trang', 'soc trang': 'Soc Trang', // Sóc Trăng
                'bạc liêu': 'Bac Lieu', 'bac lieu': 'Bac Lieu', // Bạc Liêu
                'cà mau': 'Ca Mau', 'ca mau': 'Ca Mau', // Cà Mau
                'cần thơ': 'Can Tho', 'can tho': 'Can Tho' // Cần Thơ (Thành phố trực thuộc TW)
            };
            
            const mappedCity = provinceToCityMap[searchCity];
            if (mappedCity) {
                searchCity = mappedCity;
            }

            // Lấy dữ liệu thời tiết hiện tại
            if (time === 'current' || time === 'today') {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(searchCity)}&units=metric&lang=vi&appid=${API_KEY}`
                );

                if (!response.ok) {
                    throw new Error('Không tìm thấy thành phố');
                }

                return await response.json();
            } 
            // Lấy dữ liệu dự báo cho ngày mai hoặc tuần này
            else {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(searchCity)}&units=metric&lang=vi&appid=${API_KEY}`
                );

                if (!response.ok) {
                    throw new Error('Không tìm thấy thành phố');
                }

                const data = await response.json();
                
                // Xử lý dữ liệu dự báo
                if (time === 'tomorrow') {
                    // Lấy dữ liệu cho ngày mai (8 mục, mỗi mục cách nhau 3 giờ)
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(0, 0, 0, 0);
                    
                    const tomorrowForecasts = data.list.filter(item => {
                        const itemDate = new Date(item.dt * 1000);
                        return itemDate.getDate() === tomorrow.getDate() &&
                               itemDate.getMonth() === tomorrow.getMonth() &&
                               itemDate.getFullYear() === tomorrow.getFullYear();
                    });
                    
                    // Lấy dự báo giữa ngày (trưa)
                    const middayForecast = tomorrowForecasts.find(item => {
                        const itemDate = new Date(item.dt * 1000);
                        return itemDate.getHours() >= 12 && itemDate.getHours() <= 15;
                    }) || tomorrowForecasts[0];
                    
                    return {
                        ...middayForecast,
                        name: data.city.name,
                        sys: { country: data.city.country },
                        forecast: true
                    };
                } else if (time === 'week') {
                    // Lấy dữ liệu cho 5 ngày tới
                    return {
                        ...data,
                        forecast: true,
                        forecastType: 'week'
                    };
                }
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw error;
        }
    }

    // Tạo câu trả lời dựa trên dữ liệu thời tiết
    function generateResponse(weatherData, location, time, weatherType) {
        if (!weatherData) {
            return `Xin lỗi, tôi không thể tìm thấy thông tin thời tiết cho ${location}.`;
        }

        try {
            // Xử lý dữ liệu dự báo tuần
            if (weatherData.forecast && weatherData.forecastType === 'week') {
                return generateWeekForecastResponse(weatherData, location, weatherType);
            }

            const cityName = weatherData.name;
            const country = weatherData.sys.country;
            
            // Lấy thông tin thời tiết
            const weather = weatherData.weather[0];
            const description = weather.description;
            const temp = Math.round(weatherData.main.temp);
            const feelsLike = Math.round(weatherData.main.feels_like);
            const humidity = weatherData.main.humidity;
            const windSpeed = weatherData.wind.speed;
            
            // Xác định thời gian trong câu trả lời
            let timeString = '';
            if (time === 'current') {
                timeString = 'hiện tại';
            } else if (time === 'today') {
                timeString = 'hôm nay';
            } else if (time === 'tomorrow') {
                timeString = 'ngày mai';
            }

            // Tạo câu trả lời dựa trên loại thời tiết người dùng hỏi
            let response = '';
            
            if (weatherType === 'rain') {
                const isRaining = description.includes('mưa') || description.includes('rain');
                if (isRaining) {
                    response = `${timeString === 'hiện tại' ? 'Đang' : 'Sẽ'} có mưa ở ${cityName} ${timeString}.`;
                } else {
                    response = `${timeString === 'hiện tại' ? 'Không' : 'Sẽ không'} có mưa ở ${cityName} ${timeString}.`;
                }
            } else if (weatherType === 'temperature') {
                response = `Nhiệt độ ở ${cityName} ${timeString} là ${temp}°C, cảm giác như ${feelsLike}°C.`;
            } else if (weatherType === 'wind') {
                response = `Tốc độ gió ở ${cityName} ${timeString} là ${windSpeed} m/s.`;
            } else if (weatherType === 'humidity') {
                response = `Độ ẩm ở ${cityName} ${timeString} là ${humidity}%.`;
            } else if (weatherType === 'sunny') {
                const isSunny = description.includes('nắng') || description.includes('quang') || description.includes('clear');
                if (isSunny) {
                    response = `${timeString === 'hiện tại' ? 'Đang' : 'Sẽ'} có nắng ở ${cityName} ${timeString}.`;
                } else {
                    response = `${timeString === 'hiện tại' ? 'Không' : 'Sẽ không'} có nắng ở ${cityName} ${timeString}.`;
                }
            } else {
                // Thông tin chung
                response = `Thời tiết ở ${cityName} ${timeString}: ${description}, nhiệt độ ${temp}°C, cảm giác như ${feelsLike}°C, độ ẩm ${humidity}%, tốc độ gió ${windSpeed} m/s.`;
            }

            return response;
        } catch (error) {
            console.error('Error generating response:', error);
            return `Xin lỗi, tôi không thể xử lý thông tin thời tiết cho ${location}.`;
        }
    }

    // Tạo câu trả lời cho dự báo tuần
    function generateWeekForecastResponse(weatherData, location, weatherType) {
        try {
            const cityName = weatherData.city.name;
            const country = weatherData.city.country;
            
            // Lấy dự báo cho 5 ngày, mỗi ngày lấy dự báo vào buổi trưa
            const dailyForecasts = [];
            const processedDates = new Set();
            
            weatherData.list.forEach(forecast => {
                const forecastDate = new Date(forecast.dt * 1000);
                const dateString = forecastDate.toISOString().split('T')[0];
                
                // Chỉ lấy một dự báo cho mỗi ngày (ưu tiên thời điểm từ 12h-15h)
                if (!processedDates.has(dateString) && forecastDate.getHours() >= 12 && forecastDate.getHours() <= 15) {
                    processedDates.add(dateString);
                    dailyForecasts.push({
                        date: forecastDate,
                        weather: forecast.weather[0],
                        temp: Math.round(forecast.main.temp),
                        humidity: forecast.main.humidity,
                        windSpeed: forecast.wind.speed
                    });
                }
            });
            
            // Nếu chưa đủ 5 ngày (do không có dự báo vào buổi trưa), bổ sung thêm
            weatherData.list.forEach(forecast => {
                const forecastDate = new Date(forecast.dt * 1000);
                const dateString = forecastDate.toISOString().split('T')[0];
                
                if (!processedDates.has(dateString) && dailyForecasts.length < 5) {
                    processedDates.add(dateString);
                    dailyForecasts.push({
                        date: forecastDate,
                        weather: forecast.weather[0],
                        temp: Math.round(forecast.main.temp),
                        humidity: forecast.main.humidity,
                        windSpeed: forecast.wind.speed
                    });
                }
            });
            
            // Sắp xếp theo ngày
            dailyForecasts.sort((a, b) => a.date - b.date);
            
            // Tạo câu trả lời dựa trên loại thời tiết người dùng hỏi
            let response = `Dự báo thời tiết tuần này ở ${cityName}:\n`;
            
            dailyForecasts.forEach(forecast => {
                const dayName = forecast.date.toLocaleDateString('vi-VN', { weekday: 'long' });
                const dateStr = forecast.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                
                if (weatherType === 'rain') {
                    const isRaining = forecast.weather.description.includes('mưa') || forecast.weather.description.includes('rain');
                    response += `${dayName} (${dateStr}): ${isRaining ? 'Có mưa' : 'Không mưa'}\n`;
                } else if (weatherType === 'temperature') {
                    response += `${dayName} (${dateStr}): ${forecast.temp}°C\n`;
                } else if (weatherType === 'wind') {
                    response += `${dayName} (${dateStr}): Gió ${forecast.windSpeed} m/s\n`;
                } else if (weatherType === 'humidity') {
                    response += `${dayName} (${dateStr}): Độ ẩm ${forecast.humidity}%\n`;
                } else if (weatherType === 'sunny') {
                    const isSunny = forecast.weather.description.includes('nắng') || forecast.weather.description.includes('quang') || forecast.weather.description.includes('clear');
                    response += `${dayName} (${dateStr}): ${isSunny ? 'Có nắng' : 'Không nắng'}\n`;
                } else {
                    // Thông tin chung
                    response += `${dayName} (${dateStr}): ${forecast.weather.description}, ${forecast.temp}°C\n`;
                }
            });
            
            return response;
        } catch (error) {
            console.error('Error generating week forecast response:', error);
            return `Sorry, I cannot process weekly forecast information for ${location}.`;
        }
    }