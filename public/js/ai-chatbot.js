/**
 * AI Weather Chatbot
 * Tích hợp trí tuệ nhân tạo vào ứng dụng thời tiết
 */

class WeatherAIChatbot {
  constructor() {
    this.container = null;
    this.toggleButton = null;
    this.messagesContainer = null;
    this.inputField = null;
    this.sendButton = null;
    this.voiceButton = null;
    this.isOpen = false;
    this.isListening = false;
    this.recognition = null;
    this.weatherData = null;
    this.cityName = null;
    this.language = 'vi'; // Mặc định là tiếng Việt
    this.initSpeechRecognition();
    this.initTextToSpeech();
  }

  /**
   * Khởi tạo chatbot và thêm vào DOM
   */
  init() {
    // Tạo nút toggle chatbot
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'chatbot-toggle';
    this.toggleButton.innerHTML = '<i class="fas fa-comment-dots"></i>';
    this.toggleButton.setAttribute('aria-label', 'Mở trợ lý AI thời tiết');
    this.toggleButton.addEventListener('click', () => this.toggleChatbot());
    document.body.appendChild(this.toggleButton);

    // Tạo container chatbot
    this.container = document.createElement('div');
    this.container.className = 'chatbot-container';
    this.container.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-title">
          <i class="fas fa-robot"></i> Trợ lý thời tiết AI
        </div>
        <button class="chatbot-close" aria-label="Đóng chatbot">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="chatbot-messages"></div>
      <div class="chatbot-input-container">
        <button class="voice-input-btn" aria-label="Nhập bằng giọng nói">
          <i class="fas fa-microphone"></i>
        </button>
        <input type="text" class="chatbot-input" placeholder="Hỏi về thời tiết..." aria-label="Nhập câu hỏi của bạn">
        <button class="chatbot-send" aria-label="Gửi tin nhắn">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    `;
    document.body.appendChild(this.container);

    // Lưu các phần tử DOM để sử dụng sau
    this.messagesContainer = this.container.querySelector('.chatbot-messages');
    this.inputField = this.container.querySelector('.chatbot-input');
    this.sendButton = this.container.querySelector('.chatbot-send');
    this.voiceButton = this.container.querySelector('.voice-input-btn');
    const closeButton = this.container.querySelector('.chatbot-close');

    // Thêm event listeners
    closeButton.addEventListener('click', () => this.toggleChatbot(false));
    this.sendButton.addEventListener('click', () => this.handleUserMessage());
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleUserMessage();
    });
    this.voiceButton.addEventListener('click', () => this.toggleVoiceInput());

    // Hiển thị tin nhắn chào mừng
    setTimeout(() => {
      this.addBotMessage('Xin chào! Tôi là trợ lý thời tiết AI. Bạn có thể hỏi tôi về thời tiết hiện tại, dự báo, hoặc gợi ý hoạt động phù hợp với thời tiết. Bạn cũng có thể nói chuyện với tôi bằng giọng nói bằng cách nhấn vào biểu tượng microphone.', 'welcome-message');
    }, 500);

    // Lấy dữ liệu thời tiết hiện tại nếu có
    this.getCurrentWeatherData();
  }

  /**
   * Mở/đóng chatbot
   */
  toggleChatbot(forceState = null) {
    this.isOpen = forceState !== null ? forceState : !this.isOpen;
    this.container.classList.toggle('active', this.isOpen);
    this.toggleButton.classList.toggle('active', this.isOpen);
    
    if (this.isOpen) {
      this.inputField.focus();
      // Cập nhật dữ liệu thời tiết khi mở chatbot
      this.getCurrentWeatherData();
    } else if (this.isListening) {
      // Dừng nhận diện giọng nói nếu đang bật
      this.stopVoiceRecognition();
    }
  }

  /**
   * Xử lý tin nhắn người dùng
   */
  handleUserMessage() {
    const message = this.inputField.value.trim();
    if (!message) return;

    // Hiển thị tin nhắn người dùng
    this.addUserMessage(message);
    this.inputField.value = '';
    
    // Hiển thị trạng thái đang suy nghĩ
    this.showThinking();
    
    // Phát hiện ngôn ngữ
    this.detectLanguage(message);
    
    // Xử lý câu hỏi và trả lời
    this.processUserQuery(message);
  }
  
  /**
   * Phát hiện ngôn ngữ từ tin nhắn người dùng
   * @param {string} message - Tin nhắn người dùng
   * @returns {string} - Mã ngôn ngữ ('vi' hoặc 'en')
   */
  detectLanguage(message) {
    // Danh sách từ tiếng Anh phổ biến để kiểm tra
    const englishWords = [
      // Từ liên quan đến thời tiết
      'weather', 'temperature', 'hot', 'cold', 'rain', 'sunny', 'cloudy', 'wind',
      'forecast', 'tomorrow', 'week', 'weekend', 'today', 'humidity', 'pressure',
      'fog', 'mist', 'snow', 'hail', 'storm', 'thunder', 'lightning', 'shower',
      'drizzle', 'breeze', 'gust', 'chill', 'heat', 'wave', 'index', 'uv',
      
      // Từ liên quan đến hoạt động
      'activity', 'what', 'should', 'picnic', 'travel', 'outdoor', 'indoor',
      'sport', 'exercise', 'walk', 'run', 'hike', 'swim', 'beach', 'park',
      'museum', 'movie', 'shopping', 'restaurant', 'cafe', 'bar', 'club',
      
      // Từ liên quan đến vị trí
      'where', 'location', 'city', 'place', 'country', 'area', 'region',
      'north', 'south', 'east', 'west', 'downtown', 'suburb', 'rural', 'urban',
      
      // Từ liên quan đến trang phục
      'wear', 'clothes', 'clothing', 'dress', 'jacket', 'umbrella', 'shoes',
      'hat', 'sunglasses', 'coat', 'sweater', 'boots', 'scarf', 'gloves',
      'shorts', 'pants', 'shirt', 't-shirt', 'jeans', 'skirt', 'dress',
      'sandals', 'sneakers', 'raincoat', 'suit', 'tie', 'socks', 'underwear',
      
      // Từ liên quan đến thời gian
      'morning', 'afternoon', 'evening', 'night', 'day', 'hour', 'minute',
      'second', 'month', 'year', 'season', 'spring', 'summer', 'autumn', 'fall',
      'winter', 'january', 'february', 'march', 'april', 'may', 'june', 'july',
      'august', 'september', 'october', 'november', 'december',
      
      // Từ thông dụng
      'hello', 'hi', 'hey', 'help', 'thanks', 'thank', 'you', 'please',
      'function', 'capability', 'can', 'tell', 'me', 'about', 'is', 'it',
      'going', 'to', 'will', 'how', 'outside', 'now', 'current', 'degree',
      'celsius', 'fahrenheit', 'feel', 'like', 'feels', 'feeling', 'felt',
      'would', 'could', 'should', 'might', 'may', 'must', 'need', 'want',
      'have', 'has', 'had', 'do', 'does', 'did', 'am', 'are', 'is', 'was',
      'were', 'be', 'been', 'being', 'get', 'got', 'getting', 'go', 'went',
      'gone', 'going', 'come', 'came', 'coming', 'see', 'saw', 'seen', 'seeing',
      'look', 'looked', 'looking', 'watch', 'watched', 'watching', 'hear',
      'heard', 'hearing', 'listen', 'listened', 'listening', 'feel', 'felt',
      'feeling', 'touch', 'touched', 'touching', 'smell', 'smelled', 'smelling',
      'taste', 'tasted', 'tasting', 'think', 'thought', 'thinking', 'know',
      'knew', 'known', 'knowing', 'understand', 'understood', 'understanding',
      'remember', 'remembered', 'remembering', 'forget', 'forgot', 'forgotten',
      'forgetting', 'wonder', 'wondered', 'wondering', 'want', 'wanted',
      'wanting', 'need', 'needed', 'needing', 'require', 'required', 'requiring',
      'must', 'should', 'would', 'could', 'might', 'may', 'can', 'will',
      'shall', 'the', 'a', 'an', 'this', 'that', 'these', 'those', 'my',
      'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'his',
      'hers', 'ours', 'theirs', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'me', 'him', 'her', 'us', 'them', 'myself', 'yourself', 'himself',
      'herself', 'itself', 'ourselves', 'yourselves', 'themselves'
    ];
    
    // Danh sách từ tiếng Việt phổ biến để kiểm tra
    const vietnameseWords = [
      // Từ liên quan đến thời tiết
      'thời tiết', 'nhiệt độ', 'nóng', 'lạnh', 'mưa', 'nắng', 'mây', 'gió',
      'dự báo', 'ngày mai', 'tuần', 'cuối tuần', 'hôm nay', 'độ ẩm', 'áp suất',
      'sương mù', 'sương', 'tuyết', 'mưa đá', 'bão', 'dông', 'sét', 'mưa rào',
      'mưa phùn', 'gió nhẹ', 'gió giật', 'lạnh buốt', 'nóng bức', 'chỉ số', 'tia uv',
      
      // Từ liên quan đến hoạt động
      'hoạt động', 'nên làm gì', 'dã ngoại', 'du lịch', 'ngoài trời', 'trong nhà',
      'thể thao', 'tập thể dục', 'đi bộ', 'chạy', 'leo núi', 'bơi', 'biển', 'công viên',
      'bảo tàng', 'xem phim', 'mua sắm', 'nhà hàng', 'quán cà phê', 'quán bar', 'câu lạc bộ',
      
      // Từ liên quan đến vị trí
      'ở đâu', 'vị trí', 'thành phố', 'địa điểm', 'quốc gia', 'khu vực', 'vùng',
      'phía bắc', 'phía nam', 'phía đông', 'phía tây', 'trung tâm', 'ngoại ô', 'nông thôn', 'thành thị',
      
      // Từ liên quan đến trang phục
      'mặc', 'quần áo', 'trang phục', 'váy', 'áo khoác', 'ô', 'giày',
      'mũ', 'kính râm', 'áo choàng', 'áo len', 'ủng', 'khăn quàng', 'găng tay',
      'quần đùi', 'quần', 'áo', 'áo phông', 'quần jean', 'váy', 'đầm',
      'dép', 'giày thể thao', 'áo mưa', 'bộ vest', 'cà vạt', 'tất', 'đồ lót',
      
      // Từ thông dụng
      'xin chào', 'chào', 'này', 'giúp', 'cảm ơn', 'cám ơn', 'bạn', 'làm ơn',
      'chức năng', 'khả năng', 'có thể', 'nói', 'tôi', 'về', 'là', 'nó',
      'sẽ', 'làm sao', 'bên ngoài', 'bây giờ', 'hiện tại', 'độ',
      'độ c', 'độ f', 'cảm thấy', 'như', 'cảm giác', 'cảm nhận', 'cảm',
      'sẽ', 'có thể', 'nên', 'có lẽ', 'có thể', 'phải', 'cần', 'muốn',
      'có', 'đã có', 'đã', 'làm', 'làm', 'đã làm', 'là', 'là', 'là', 'đã là',
      'đã là', 'là', 'đã là', 'đang là', 'lấy', 'đã lấy', 'đang lấy', 'đi', 'đã đi',
      'đã đi', 'đang đi', 'đến', 'đã đến', 'đang đến', 'thấy', 'đã thấy', 'đã thấy', 'đang thấy',
      'nhìn', 'đã nhìn', 'đang nhìn', 'xem', 'đã xem', 'đang xem', 'nghe',
      'đã nghe', 'đang nghe', 'lắng nghe', 'đã lắng nghe', 'đang lắng nghe', 'cảm thấy', 'đã cảm thấy',
      'đang cảm thấy', 'chạm', 'đã chạm', 'đang chạm', 'ngửi', 'đã ngửi', 'đang ngửi',
      'nếm', 'đã nếm', 'đang nếm', 'nghĩ', 'đã nghĩ', 'đang nghĩ', 'biết',
      'đã biết', 'đã biết', 'đang biết', 'hiểu', 'đã hiểu', 'đang hiểu',
      'nhớ', 'đã nhớ', 'đang nhớ', 'quên', 'đã quên', 'đã quên',
      'đang quên', 'tự hỏi', 'đã tự hỏi', 'đang tự hỏi', 'muốn', 'đã muốn',
      'đang muốn', 'cần', 'đã cần', 'đang cần', 'yêu cầu', 'đã yêu cầu', 'đang yêu cầu',
      'phải', 'nên', 'sẽ', 'có thể', 'có thể', 'có thể', 'có thể', 'sẽ',
      'sẽ', 'cái', 'một', 'một', 'này', 'đó', 'những', 'những', 'của tôi',
      'của bạn', 'của anh ấy', 'của cô ấy', 'của nó', 'của chúng tôi', 'của họ', 'của tôi', 'của bạn', 'của anh ấy',
      'của cô ấy', 'của chúng tôi', 'của họ', 'tôi', 'bạn', 'anh ấy', 'cô ấy', 'nó', 'chúng tôi', 'họ',
      'tôi', 'anh ấy', 'cô ấy', 'chúng tôi', 'họ', 'bản thân tôi', 'bản thân bạn', 'bản thân anh ấy',
      'bản thân cô ấy', 'bản thân nó', 'bản thân chúng tôi', 'bản thân các bạn', 'bản thân họ'
    ];
    
    // Tách tin nhắn thành các từ
    const words = message.toLowerCase().split(/\s+/);
    
    // Đếm số từ tiếng Anh và tiếng Việt
    let englishWordCount = 0;
    let vietnameseWordCount = 0;
    
    for (const word of words) {
      // Kiểm tra từng từ trong danh sách từ tiếng Anh
      if (englishWords.includes(word)) {
        englishWordCount++;
      }
      
      // Kiểm tra xem từ có chứa trong bất kỳ từ tiếng Việt nào không
      for (const vnWord of vietnameseWords) {
        if (vnWord.includes(word) || word.includes(vnWord)) {
          vietnameseWordCount++;
          break; // Thoát vòng lặp nếu tìm thấy
        }
      }
    }
    
    // Tính tỷ lệ từ tiếng Anh và tiếng Việt
    const englishRatio = englishWordCount / words.length;
    const vietnameseRatio = vietnameseWordCount / words.length;
    
    // Xác định ngôn ngữ dựa trên tỷ lệ cao hơn
    if (englishRatio > vietnameseRatio && englishRatio > 0.2) {
      this.language = 'en';
    } else {
      this.language = 'vi';
    }
    
    // Kiểm tra các từ khóa đặc biệt để xác định ngôn ngữ
    const englishKeywords = ['what', 'how', 'when', 'where', 'why', 'who', 'which', 'whose', 'whom', 'can', 'could', 'would', 'should', 'will', 'shall', 'may', 'might', 'must', 'do', 'does', 'did', 'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being'];
    const vietnameseKeywords = ['gì', 'sao', 'khi nào', 'đâu', 'tại sao', 'ai', 'nào', 'của ai', 'với ai', 'có thể', 'có thể', 'sẽ', 'nên', 'sẽ', 'sẽ', 'có thể', 'có thể', 'phải', 'làm', 'làm', 'đã làm', 'là', 'là', 'đã là', 'đã là', 'là', 'đã là', 'đang là'];
    
    // Kiểm tra từ khóa đặc biệt
    for (const word of words) {
      if (englishKeywords.includes(word)) {
        this.language = 'en';
        break;
      }
      if (vietnameseKeywords.includes(word)) {
        this.language = 'vi';
        break;
      }
    }
    
    return this.language;
  }

  /**
   * Thêm tin nhắn của người dùng vào chatbot
   */
  addUserMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user';
    messageElement.textContent = text;
    this.messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  /**
   * Thêm tin nhắn của bot vào chatbot
   */
  addBotMessage(text, extraClass = '') {
    // Xóa tin nhắn "đang suy nghĩ" nếu có
    const thinkingMessage = this.messagesContainer.querySelector('.message.thinking');
    if (thinkingMessage) {
      thinkingMessage.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.className = `message bot ${extraClass}`;
    messageElement.textContent = text;
    this.messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  /**
   * Hiển thị trạng thái đang suy nghĩ
   */
  showThinking() {
    const thinkingElement = document.createElement('div');
    thinkingElement.className = 'message thinking';
    
    // Hiển thị thông báo phù hợp với ngôn ngữ được phát hiện
    const thinkingText = this.language === 'en' ? 'Thinking...' : 'Đang suy nghĩ...';
    
    thinkingElement.innerHTML = `
      <span>${thinkingText}</span>
      <div class="thinking-dots">
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
      </div>
    `;
    this.messagesContainer.appendChild(thinkingElement);
    this.scrollToBottom();
  }

  /**
   * Cuộn xuống cuối cùng của khung chat
   */
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * Lấy dữ liệu thời tiết hiện tại
   */
  getCurrentWeatherData() {
    // Lấy dữ liệu thời tiết từ localStorage nếu có
    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
      this.cityName = lastCity;
    }

    // Lấy dữ liệu thời tiết từ phần tử DOM nếu có
    const weatherContent = document.getElementById('weatherContent');
    if (weatherContent) {
      // Lưu dữ liệu thời tiết hiển thị trên trang
      this.weatherData = {
        temperature: this.extractTemperature(weatherContent),
        condition: this.extractWeatherCondition(weatherContent),
        location: this.extractLocation(weatherContent),
        humidity: this.extractHumidity(weatherContent),
        windSpeed: this.extractWindSpeed(weatherContent),
        feelsLike: this.extractFeelsLike(weatherContent),
        visibility: this.extractVisibility(weatherContent)
      };
    }
  }

  /**
   * Trích xuất nhiệt độ từ nội dung thời tiết
   */
  extractTemperature(weatherContent) {
    const tempElement = weatherContent.querySelector('.temperature');
    if (tempElement) {
      const tempMatch = tempElement.textContent.match(/(-?\d+)°C/);
      return tempMatch ? parseInt(tempMatch[1]) : null;
    }
    return null;
  }

  /**
   * Trích xuất điều kiện thời tiết từ nội dung thời tiết
   */
  extractWeatherCondition(weatherContent) {
    const conditionElement = weatherContent.querySelector('.description');
    return conditionElement ? conditionElement.textContent.trim() : null;
  }

  /**
   * Trích xuất vị trí từ nội dung thời tiết
   */
  extractLocation(weatherContent) {
    const locationElement = weatherContent.querySelector('.location');
    return locationElement ? locationElement.textContent.replace('📍', '').trim() : this.cityName;
  }

  /**
   * Trích xuất độ ẩm từ nội dung thời tiết
   */
  extractHumidity(weatherContent) {
    const humidityElement = weatherContent.querySelector('.detail-item:nth-child(1) .detail-value');
    if (humidityElement) {
      const humidityMatch = humidityElement.textContent.match(/(\d+)%/);
      return humidityMatch ? parseInt(humidityMatch[1]) : null;
    }
    return null;
  }

  /**
   * Trích xuất tốc độ gió từ nội dung thời tiết
   */
  extractWindSpeed(weatherContent) {
    const windElement = weatherContent.querySelector('.detail-item:nth-child(2) .detail-value');
    if (windElement) {
      const windMatch = windElement.textContent.match(/(\d+(\.\d+)?)\s*m\/s/);
      return windMatch ? parseFloat(windMatch[1]) : null;
    }
    return null;
  }

  /**
   * Trích xuất cảm giác nhiệt từ nội dung thời tiết
   */
  extractFeelsLike(weatherContent) {
    const feelsLikeElement = weatherContent.querySelector('.feels-like');
    if (feelsLikeElement) {
      const feelsLikeMatch = feelsLikeElement.textContent.match(/(-?\d+)°C/);
      return feelsLikeMatch ? parseInt(feelsLikeMatch[1]) : null;
    }
    return null;
  }

  /**
   * Trích xuất tầm nhìn từ nội dung thời tiết
   */
  extractVisibility(weatherContent) {
    const visibilityElement = weatherContent.querySelector('.detail-item:nth-child(3) .detail-value');
    return visibilityElement ? visibilityElement.textContent.trim() : null;
  }
  
  /**
   * Kiểm tra xem người dùng có đang hỏi về thời tiết ở một địa điểm khác không
   * @param {string} query - Câu hỏi của người dùng đã chuyển thành chữ thường
   * @returns {string|null} - Tên địa điểm nếu tìm thấy, null nếu không
   */
  checkForOtherLocationQuery(query) {
    // Danh sách các từ khóa chỉ địa điểm trong tiếng Việt
    const viLocationKeywords = ['ở', 'tại', 'thành phố', 'tỉnh', 'quận', 'huyện'];
    
    // Danh sách các từ khóa chỉ địa điểm trong tiếng Anh
    const enLocationKeywords = ['in', 'at', 'city', 'province', 'district', 'town'];
    
    // Danh sách các từ khóa về thời tiết trong tiếng Việt
    const viWeatherKeywords = ['thời tiết', 'nhiệt độ', 'nóng', 'lạnh', 'mưa', 'nắng', 'trời'];
    
    // Danh sách các từ khóa về thời tiết trong tiếng Anh
    const enWeatherKeywords = ['weather', 'temperature', 'hot', 'cold', 'rain', 'sunny', 'sky'];
    
    // Kiểm tra xem câu hỏi có chứa từ khóa về thời tiết và địa điểm không
    let hasWeatherKeyword = false;
    let hasLocationKeyword = false;
    
    // Kiểm tra từ khóa thời tiết
    if (this.language === 'vi') {
      hasWeatherKeyword = viWeatherKeywords.some(keyword => query.includes(keyword));
      hasLocationKeyword = viLocationKeywords.some(keyword => query.includes(keyword));
    } else {
      hasWeatherKeyword = enWeatherKeywords.some(keyword => query.includes(keyword));
      hasLocationKeyword = enLocationKeywords.some(keyword => query.includes(keyword));
    }
    
    // Nếu câu hỏi có chứa từ khóa về thời tiết và địa điểm
    if (hasWeatherKeyword && hasLocationKeyword) {
      // Tìm tên địa điểm trong câu hỏi
      let locationName = null;
      
      if (this.language === 'vi') {
        // Tìm tên địa điểm sau các từ khóa chỉ địa điểm trong tiếng Việt
        for (const keyword of viLocationKeywords) {
          if (query.includes(keyword)) {
            const parts = query.split(keyword);
            if (parts.length > 1) {
              // Lấy phần sau từ khóa và loại bỏ các từ không cần thiết
              const locationPart = parts[1].trim().split(/\s+/);
              if (locationPart.length > 0) {
                // Lấy tối đa 3 từ sau từ khóa làm tên địa điểm
                locationName = locationPart.slice(0, 3).join(' ').replace(/[?.,!]/g, '').trim();
                break;
              }
            }
          }
        }
      } else {
        // Tìm tên địa điểm sau các từ khóa chỉ địa điểm trong tiếng Anh
        for (const keyword of enLocationKeywords) {
          if (query.includes(keyword)) {
            const parts = query.split(keyword);
            if (parts.length > 1) {
              // Lấy phần sau từ khóa và loại bỏ các từ không cần thiết
              const locationPart = parts[1].trim().split(/\s+/);
              if (locationPart.length > 0) {
                // Lấy tối đa 3 từ sau từ khóa làm tên địa điểm
                locationName = locationPart.slice(0, 3).join(' ').replace(/[?.,!]/g, '').trim();
                break;
              }
            }
          }
        }
      }
      
      return locationName;
    }
    
    return null;
  }

  /**
   * Xử lý câu hỏi của người dùng
   * @param {string} query - Câu hỏi của người dùng
   * @param {boolean} useOfflineProcessing - Có sử dụng xử lý offline không
   */
  processUserQuery(query, useOfflineProcessing = false) {
    // Kiểm tra xem query có hợp lệ không
    if (!query || query.trim().length === 0) {
      const errorMessage = this.language === 'en'
        ? 'Please enter a question.'
        : 'Vui lòng nhập câu hỏi.';
      this.addBotMessage(errorMessage);
      return;
    }
    
    // Chuyển query về chữ thường để dễ so sánh
    const lowerQuery = query.toLowerCase().trim();
    
    // Kiểm tra xem có phải là câu hỏi về thời tiết ở một địa điểm khác không
    const otherLocationMatch = this.checkForOtherLocationQuery(lowerQuery);
    if (otherLocationMatch) {
      this.respondWithOtherLocation(otherLocationMatch);
      return;
    }
    
    // Kiểm tra xem có dữ liệu thời tiết không
    if (!this.weatherData || !this.weatherData.temperature) {
      const noDataMessage = this.language === 'en' 
        ? 'I cannot find current weather data. Please search for a city first.' 
        : 'Tôi không thể tìm thấy dữ liệu thời tiết hiện tại. Vui lòng tìm kiếm một thành phố trước.';
      this.addBotMessage(noDataMessage);
      return;
    }
    
    // Kiểm tra các từ khóa đặc biệt
    if (this.handleSpecialKeywords(lowerQuery)) {
      return;
    }
    
    // Kiểm tra cache trước khi gọi API
    if (!useOfflineProcessing && this.checkAndUseCache(query)) {
      return;
    }
    
    // Nếu đang ở chế độ offline hoặc được yêu cầu xử lý offline
    if (useOfflineProcessing || !navigator.onLine) {
      this.processOfflineQuery(lowerQuery);
      return;
    }
    
    // Sử dụng API endpoint để xử lý câu hỏi
    this.fetchChatbotResponse(query);
  }
  
  /**
   * Kiểm tra và sử dụng cache nếu có
   * @param {string} query - Câu hỏi của người dùng
   * @returns {boolean} - Trả về true nếu đã sử dụng cache
   */
  checkAndUseCache(query) {
    try {
      const lowerQuery = query.toLowerCase().trim();
      const cachedResponses = JSON.parse(localStorage.getItem('chatbotCache') || '{}');
      
      // Kiểm tra xem có cache chính xác không
      if (cachedResponses[lowerQuery] && cachedResponses[lowerQuery].language === this.language) {
        const cachedData = cachedResponses[lowerQuery];
        const timeDiff = Date.now() - cachedData.timestamp;
        const isRecent = timeDiff < 30 * 60 * 1000; // 30 phút
        
        // Chỉ sử dụng cache nếu còn mới
        if (isRecent) {
          console.log(`Using cached response for: "${lowerQuery}"`);
          this.addBotMessage(cachedData.response);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking cache:', error);
      return false;
    }
  }
  
  /**
   * Xử lý các từ khóa đặc biệt
   * @param {string} lowerQuery - Câu hỏi đã chuyển thành chữ thường
   * @returns {boolean} - Trả về true nếu đã xử lý từ khóa đặc biệt
   */
  handleSpecialKeywords(lowerQuery) {
    // Xử lý từ khóa tiếng Việt
    if (this.language === 'vi') {
      // Câu chào và giới thiệu
      if (lowerQuery.includes('xin chào') || lowerQuery.includes('chào') || 
          lowerQuery === 'hi' || lowerQuery === 'hello') {
        this.addBotMessage(`Xin chào! Tôi là trợ lý thời tiết AI. Tôi có thể giúp bạn với thông tin thời tiết ở ${this.weatherData.location}. Bạn muốn biết điều gì?`);
        return true;
      }
      // Câu hỏi về khả năng của bot
      else if (lowerQuery.includes('bạn có thể làm gì') || lowerQuery.includes('bạn giúp được gì') || 
              lowerQuery.includes('chức năng') || lowerQuery === 'help' || lowerQuery === 'trợ giúp') {
        this.respondWithCapabilities();
        return true;
      }
      // Cảm ơn
      else if (lowerQuery.includes('cảm ơn') || lowerQuery.includes('thank')) {
        this.addBotMessage('Rất vui được giúp bạn! Bạn có câu hỏi nào khác không?');
        return true;
      }
    }
    // Xử lý từ khóa tiếng Anh
    else {
      // Câu chào và giới thiệu
      if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || 
          lowerQuery.includes('hey') || lowerQuery === 'greetings') {
        this.addBotMessage(`Hello! I'm your AI weather assistant. I can help you with weather information in ${this.weatherData.location}. What would you like to know?`);
        return true;
      }
      // Câu hỏi về khả năng của bot
      else if (lowerQuery.includes('what can you do') || lowerQuery.includes('help me with') || 
              lowerQuery.includes('features') || lowerQuery === 'help') {
        this.respondWithCapabilitiesEnglish();
        return true;
      }
      // Cảm ơn
      else if (lowerQuery.includes('thank you') || lowerQuery.includes('thanks')) {
        this.addBotMessage('You\'re welcome! Is there anything else you\'d like to know?');
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Xử lý câu hỏi trong chế độ offline
   * @param {string} lowerQuery - Câu hỏi đã chuyển thành chữ thường
   */
  processOfflineQuery(lowerQuery) {
    setTimeout(() => {
      // Xử lý câu hỏi tiếng Việt
      if (this.language === 'vi') {
        // Câu hỏi về trang phục
        if (lowerQuery.includes('nên mặc') || lowerQuery.includes('mặc gì') || 
            lowerQuery.includes('trang phục') || lowerQuery.includes('quần áo')) {
          this.respondWithClothingSuggestions();
        }
        // Câu hỏi về thời tiết hiện tại
        else if (lowerQuery.includes('thời tiết') || 
            (lowerQuery.includes('hiện tại') || lowerQuery.includes('bây giờ') || lowerQuery.includes('hôm nay'))) {
          this.respondWithCurrentWeather();
        }
        // Câu hỏi về nhiệt độ
        else if (lowerQuery.includes('nhiệt độ') || lowerQuery.includes('nóng') || lowerQuery.includes('lạnh')) {
          this.respondWithTemperature();
        }
        // Câu hỏi về điều kiện thời tiết
        else if (lowerQuery.includes('trời') || lowerQuery.includes('mưa') || lowerQuery.includes('nắng')) {
          this.respondWithWeatherCondition();
        }
        // Câu hỏi về gợi ý hoạt động
        else if (lowerQuery.includes('nên làm gì') || lowerQuery.includes('hoạt động') || 
                lowerQuery.includes('gợi ý')) {
          this.respondWithActivitySuggestions();
        }
        // Câu hỏi về dự báo
        else if (lowerQuery.includes('dự báo') || lowerQuery.includes('ngày mai') || 
                lowerQuery.includes('tuần này') || lowerQuery.includes('cuối tuần')) {
          this.respondWithForecast();
        }
        // Câu hỏi về vị trí
        else if (lowerQuery.includes('ở đâu') || lowerQuery.includes('vị trí') || 
                lowerQuery.includes('thành phố')) {
          this.respondWithLocation();
        }
        // Câu hỏi không rõ ràng
        else {
          const offlineNotice = '(Chế độ ngoại tuyến - chức năng bị giới hạn)';
          this.addBotMessage(`Tôi không chắc mình hiểu câu hỏi của bạn. Trong chế độ ngoại tuyến, bạn có thể hỏi về thời tiết hiện tại, gợi ý trang phục, hoặc hoạt động phù hợp với thời tiết.\n\n${offlineNotice}`);
        }
      }
      // Xử lý câu hỏi tiếng Anh
      else {
          // Câu hỏi về trang phục
          if (lowerQuery.includes('wear') || lowerQuery.includes('clothes') || 
              lowerQuery.includes('clothing') || lowerQuery.includes('dress')) {
            this.respondWithClothingSuggestionsEnglish();
          }
          // Câu hỏi về thời tiết hiện tại
          else if (lowerQuery.includes('weather') || 
              (lowerQuery.includes('current') || lowerQuery.includes('now') || lowerQuery.includes('today'))) {
            this.respondWithCurrentWeatherEnglish();
          }
          // Câu hỏi về nhiệt độ
          else if (lowerQuery.includes('temperature') || lowerQuery.includes('hot') || lowerQuery.includes('cold')) {
            this.respondWithTemperatureEnglish();
          }
          // Câu hỏi về điều kiện thời tiết
          else if (lowerQuery.includes('sky') || lowerQuery.includes('rain') || lowerQuery.includes('sunny') || 
                  lowerQuery.includes('cloudy') || lowerQuery.includes('windy')) {
            this.respondWithWeatherConditionEnglish();
          }
          // Câu hỏi về gợi ý hoạt động
          else if (lowerQuery.includes('what to do') || lowerQuery.includes('activity') || 
                  lowerQuery.includes('suggestion') || lowerQuery.includes('recommend')) {
            this.respondWithActivitySuggestionsEnglish();
          }
          // Câu hỏi về dự báo
          else if (lowerQuery.includes('forecast') || lowerQuery.includes('tomorrow') || 
                  lowerQuery.includes('week') || lowerQuery.includes('weekend')) {
            this.respondWithForecastEnglish();
          }
          // Câu hỏi về vị trí
          else if (lowerQuery.includes('where') || lowerQuery.includes('location') || 
                  lowerQuery.includes('city')) {
            this.respondWithLocationEnglish();
          }
          // Câu hỏi không rõ ràng
          else {
            const offlineNotice = '(Offline mode - limited functionality)';
            this.addBotMessage(`I'm not sure I understand your question. In offline mode, you can ask about current weather, clothing suggestions, or activities suitable for the weather.\n\n${offlineNotice}`);
          }
        }
    }, 1000); // Giả lập thời gian suy nghĩ
  }

  /**
   * Trả lời về thời tiết hiện tại
   */
  respondWithCurrentWeather() {
    const { temperature, condition, location, humidity, windSpeed, feelsLike } = this.weatherData;
    let response = `Thời tiết hiện tại ở ${location}: ${temperature}°C, ${condition}. `;
    
    if (feelsLike !== null) {
      response += `Cảm giác như ${feelsLike}°C. `;
    }
    
    if (humidity !== null) {
      response += `Độ ẩm ${humidity}%. `;
    }
    
    if (windSpeed !== null) {
      response += `Tốc độ gió ${windSpeed} m/s.`;
    }
    
    this.addBotMessage(response);
    this.speakText(response);
  }

  /**
   * Trả lời về nhiệt độ
   */
  respondWithTemperature() {
    const { temperature, feelsLike, location } = this.weatherData;
    let response = `Nhiệt độ hiện tại ở ${location} là ${temperature}°C. `;
    
    if (feelsLike !== null) {
      response += `Cảm giác như ${feelsLike}°C.`;
    }
    
    if (temperature > 30) {
      response += ' Trời khá nóng, hãy uống nhiều nước và tránh ra ngoài vào giờ cao điểm.';
    } else if (temperature < 15) {
      response += ' Trời khá lạnh, hãy mặc ấm khi ra ngoài.';
    } else {
      response += ' Nhiệt độ dễ chịu.';
    }
    
    this.addBotMessage(response);
    this.speakText(response);
  }

  /**
   * Hàm debounce để tránh gọi API quá nhiều lần trong thời gian ngắn
   * @param {Function} func - Hàm cần debounce
   * @param {number} wait - Thời gian chờ (ms)
   * @returns {Function} - Hàm đã được debounce
   */
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  /**
   * Gọi API chatbot để xử lý câu hỏi
   * @param {string} query - Câu hỏi của người dùng
   * @param {number} timeout - Thời gian timeout cho request (ms)
   * @param {number} retryCount - Số lần thử lại nếu request thất bại
   */
  async fetchChatbotResponse(query, timeout = 10000, retryCount = 2) {
    // Kiểm tra xem query có hợp lệ không
    if (!query || query.trim().length === 0) {
      const errorMessage = this.language === 'en'
        ? 'Please enter a question.'
        : 'Vui lòng nhập câu hỏi.';
      this.addBotMessage(errorMessage);
      return;
    }
    
    // Tạo controller để có thể abort request nếu timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Kiểm tra kết nối mạng trước khi gửi request
    if (!navigator.onLine) {
      clearTimeout(timeoutId);
      console.log('Device is offline, using offline processing');
      this.handleOfflineProcessing(query);
      return;
    }
    
    try {
      // Kiểm tra từ khóa đặc biệt trước khi gọi API
      const lowerQuery = query.toLowerCase().trim();
      if (this.handleSpecialKeywords(lowerQuery)) {
        clearTimeout(timeoutId);
        return;
      }
      
      // Kiểm tra cache trước khi gọi API
      if (this.checkAndUseCache(query)) {
        clearTimeout(timeoutId);
        return;
      }
      
      // Hiển thị trạng thái đang suy nghĩ
      this.showThinking();
      
      // Lưu trữ thời gian bắt đầu request để tính toán thời gian phản hồi
      const startTime = Date.now();
      
      // Chuẩn bị dữ liệu gửi đi
      const requestData = {
        query: query.trim(),
        language: this.language,
        weatherData: this.weatherData,
        timestamp: startTime,
        clientInfo: {
          userAgent: navigator.userAgent,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          platform: navigator.platform,
          language: navigator.language,
          connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
          } : null,
          deviceMemory: navigator.deviceMemory || null,
          hardwareConcurrency: navigator.hardwareConcurrency || null
        }
      };
      
      // Gọi API endpoint với signal để có thể abort
      const response = await fetch('/api/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
        credentials: 'same-origin' // Gửi cookies nếu có
      });
      
      // Tính thời gian phản hồi
      const responseTime = Date.now() - startTime;
      console.log(`API response time: ${responseTime}ms`);
      
      // Xóa timeout vì request đã hoàn thành
      clearTimeout(timeoutId);
      
      // Kiểm tra status code
      if (!response.ok) {
        const statusText = response.statusText || 'Unknown error';
        const status = response.status;
        
        // Xử lý các mã lỗi HTTP cụ thể
        if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (status === 400) {
          throw new Error(`Bad request: ${statusText}`);
        } else if (status === 401 || status === 403) {
          throw new Error(`Authentication error: ${statusText}`);
        } else if (status >= 500) {
          throw new Error(`Server error (${status}): ${statusText}`);
        } else {
          throw new Error(`HTTP error ${status}: ${statusText}`);
        }
      }
      
      // Xử lý kết quả
      const data = await response.json();
      
      if (data.success) {
        // Hiển thị câu trả lời
        this.addBotMessage(data.response);
        // Đọc câu trả lời nếu cần
        this.speakText(data.response);
        // Lưu câu hỏi và câu trả lời vào lịch sử nếu cần
        this.saveToHistory(query, data.response);
        // Lưu vào cache để sử dụng offline nếu cần
        this.cacheResponse(query, data.response, {
          includeWeatherData: true,
          expiresIn: 24 * 60 * 60 * 1000 // 24 giờ
        });
      } else {
        // Hiển thị thông báo lỗi từ server
        const errorMessage = data.message || data.error || (this.language === 'en'
          ? 'Sorry, I encountered an error processing your question.'
          : 'Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn.');
        this.addBotMessage(errorMessage);
        console.error('API error:', data.error || data.message);
      }
    } catch (error) {
      // Xóa timeout để tránh memory leak
      clearTimeout(timeoutId);
      
      console.error('Error calling chatbot API:', error);
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage;
      let shouldRetry = false;
      let retryDelay = 1000; // Mặc định đợi 1 giây trước khi thử lại
      
      if (error.name === 'AbortError') {
        // Lỗi timeout
        errorMessage = this.language === 'en'
          ? 'The request took too long to process. Please try again.'
          : 'Yêu cầu mất quá nhiều thời gian để xử lý. Vui lòng thử lại.';
        shouldRetry = true;
        retryDelay = 2000; // Đợi lâu hơn cho lỗi timeout
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        // Lỗi mạng
        errorMessage = this.language === 'en'
          ? 'Network error. Please check your internet connection.'
          : 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
        shouldRetry = navigator.onLine; // Chỉ thử lại nếu vẫn online
      } else if (error.message.includes('Rate limit')) {
        // Lỗi rate limit
        errorMessage = this.language === 'en'
          ? 'You have sent too many requests. Please wait a moment before trying again.'
          : 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một lát trước khi thử lại.';
        shouldRetry = false; // Không thử lại với lỗi rate limit
      } else if (error.message.includes('Server error')) {
        // Lỗi server
        errorMessage = this.language === 'en'
          ? 'The server is experiencing issues. Please try again later.'
          : 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
        shouldRetry = true;
        retryDelay = 3000; // Đợi lâu hơn cho lỗi server
      } else if (error.message.includes('Authentication error')) {
        // Lỗi xác thực
        errorMessage = this.language === 'en'
          ? 'Authentication error. Please log in again.'
          : 'Lỗi xác thực. Vui lòng đăng nhập lại.';
        shouldRetry = false; // Không thử lại với lỗi xác thực
      } else if (error.message.includes('Bad request')) {
        // Lỗi yêu cầu không hợp lệ
        errorMessage = this.language === 'en'
          ? 'Invalid request. Please try a different question.'
          : 'Yêu cầu không hợp lệ. Vui lòng thử câu hỏi khác.';
        shouldRetry = false; // Không thử lại với lỗi yêu cầu không hợp lệ
      } else {
        // Lỗi khác
        errorMessage = this.language === 'en'
          ? 'Sorry, I encountered an error. Please try again later.'
          : 'Xin lỗi, tôi gặp lỗi. Vui lòng thử lại sau.';
        shouldRetry = true;
      }
      
      // Thử lại nếu còn lượt retry và nên thử lại
      if (retryCount > 0 && shouldRetry) {
        console.log(`Retrying request... (${retryCount} attempts left)`);
        // Đợi trước khi thử lại
        setTimeout(() => {
          this.fetchChatbotResponse(query, timeout, retryCount - 1);
        }, retryDelay);
        return;
      }
      
      this.addBotMessage(errorMessage);
      
      // Thử sử dụng xử lý offline nếu API không hoạt động
      this.handleOfflineProcessing(query);
    }
  }
  
  /**
   * Lưu cache câu trả lời để sử dụng offline
   * @param {string} query - Câu hỏi
   * @param {string} response - Câu trả lời
   * @param {Object} options - Tùy chọn bổ sung
   */
  cacheResponse(query, response, options = {}) {
    try {
      if (!query || !response || query.trim().length < 3) {
        return; // Không cache các câu hỏi quá ngắn
      }
      
      // Lấy cache hiện tại hoặc tạo mới
      const cachedResponses = JSON.parse(localStorage.getItem('chatbotCache') || '{}');
      const lowerQuery = query.toLowerCase().trim();
      
      // Thêm câu trả lời mới vào cache
      cachedResponses[lowerQuery] = {
        response,
        timestamp: Date.now(),
        language: this.language,
        weatherData: options.includeWeatherData ? this.getSimplifiedWeatherData() : null,
        location: this.weatherData?.location?.name || null,
        expiresAt: Date.now() + (options.expiresIn || 24 * 60 * 60 * 1000) // Mặc định hết hạn sau 24 giờ
      };
      
      // Xóa các mục đã hết hạn
      const now = Date.now();
      Object.keys(cachedResponses).forEach(key => {
        if (cachedResponses[key].expiresAt && cachedResponses[key].expiresAt < now) {
          delete cachedResponses[key];
        }
      });
      
      // Giới hạn kích thước cache (giữ tối đa 20 câu trả lời)
      const queries = Object.keys(cachedResponses);
      if (queries.length > 20) {
        // Sắp xếp theo thời gian và loại bỏ các mục cũ nhất
        const sortedQueries = queries.sort((a, b) => 
          cachedResponses[b].timestamp - cachedResponses[a].timestamp
        );
        
        // Giữ lại 20 mục mới nhất
        const newCache = {};
        sortedQueries.slice(0, 20).forEach(q => {
          newCache[q] = cachedResponses[q];
        });
        
        // Lưu cache mới
        localStorage.setItem('chatbotCache', JSON.stringify(newCache));
      } else {
        // Lưu cache
        localStorage.setItem('chatbotCache', JSON.stringify(cachedResponses));
      }
      
      console.log(`Cached response for query: "${lowerQuery}" (${this.language})`);
    } catch (error) {
      console.error('Error caching response:', error);
    }
  }
  
  /**
   * Lấy dữ liệu thời tiết đơn giản để lưu vào cache
   * @returns {Object} Dữ liệu thời tiết đơn giản
   */
  getSimplifiedWeatherData() {
    if (!this.weatherData) return null;
    
    try {
      return {
        location: this.weatherData.location?.name,
        country: this.weatherData.location?.country,
        temp_c: this.weatherData.current?.temp_c,
        condition: this.weatherData.current?.condition?.text,
        humidity: this.weatherData.current?.humidity,
        wind_kph: this.weatherData.current?.wind_kph,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error simplifying weather data:', error);
      return null;
    }
  }
  
  /**
   * Xử lý câu hỏi trong trường hợp không kết nối được với API
   * @param {string} query - Câu hỏi của người dùng
   */
  handleOfflineProcessing(query) {
    // Kiểm tra xem query có hợp lệ không
    if (!query || query.trim().length === 0) {
      const errorMessage = this.language === 'en'
        ? 'Please enter a question.'
        : 'Vui lòng nhập câu hỏi.';
      this.addBotMessage(errorMessage);
      return;
    }
    
    // Chỉ xử lý offline nếu có dữ liệu thời tiết
    if (!this.weatherData || !this.weatherData.location) {
      const noDataMessage = this.language === 'en' 
        ? 'I cannot find current weather data. Please search for a city first and ensure you have internet connection.' 
        : 'Tôi không thể tìm thấy dữ liệu thời tiết hiện tại. Vui lòng tìm kiếm một thành phố trước và đảm bảo bạn có kết nối internet.';
      this.addBotMessage(noDataMessage);
      return;
    }
    
    console.log('Falling back to offline processing');
    
    // Kiểm tra từ khóa đặc biệt trước
    const lowerQuery = query.toLowerCase().trim();
    if (this.handleSpecialKeywords(lowerQuery)) {
      return;
    }
    
    // Kiểm tra cache trước
    try {
      const cachedResponses = JSON.parse(localStorage.getItem('chatbotCache') || '{}');
      
      // Tìm câu trả lời chính xác trong cache
      if (cachedResponses[lowerQuery] && cachedResponses[lowerQuery].language === this.language) {
        const cachedData = cachedResponses[lowerQuery];
        const timeDiff = Date.now() - cachedData.timestamp;
        const isRecent = timeDiff < 24 * 60 * 60 * 1000; // 24 giờ
        
        if (isRecent) {
          // Thêm thông báo rằng đây là câu trả lời từ cache
          const cacheNotice = this.language === 'en'
            ? '(Offline mode - using cached response)'
            : '(Chế độ ngoại tuyến - sử dụng câu trả lời đã lưu)';
          
          this.addBotMessage(`${cachedData.response}\n\n${cacheNotice}`);
          return;
        }
      }
      
      // Tìm câu trả lời tương tự trong cache
      const similarQueries = Object.keys(cachedResponses).filter(q => {
        // Kiểm tra xem câu hỏi hiện tại có chứa từ khóa của câu hỏi trong cache không
        // Và đảm bảo độ dài tương đối gần nhau để tránh kết quả không liên quan
        return (lowerQuery.includes(q) || q.includes(lowerQuery)) && 
               Math.abs(q.length - lowerQuery.length) < 15 && 
               cachedResponses[q].language === this.language;
      });
      
      if (similarQueries.length > 0) {
        // Sắp xếp theo độ tương đồng và thời gian
        similarQueries.sort((a, b) => {
          // Tính điểm tương đồng dựa trên độ dài chung
          const similarityA = Math.min(a.length, lowerQuery.length) / Math.max(a.length, lowerQuery.length);
          const similarityB = Math.min(b.length, lowerQuery.length) / Math.max(b.length, lowerQuery.length);
          
          // Nếu độ tương đồng chênh lệch đáng kể, ưu tiên độ tương đồng
          if (Math.abs(similarityA - similarityB) > 0.2) {
            return similarityB - similarityA;
          }
          
          // Nếu độ tương đồng gần nhau, ưu tiên câu trả lời mới nhất
          const timeA = cachedResponses[a].timestamp;
          const timeB = cachedResponses[b].timestamp;
          return timeB - timeA;
        });
        
        const bestMatch = similarQueries[0];
        const cachedData = cachedResponses[bestMatch];
        
        const cacheNotice = this.language === 'en'
          ? '(Offline mode - using similar cached response)'
          : '(Chế độ ngoại tuyến - sử dụng câu trả lời tương tự đã lưu)';
        
        this.addBotMessage(`${cachedData.response}\n\n${cacheNotice}`);
        return;
      }
    } catch (error) {
      console.error('Error retrieving from cache:', error);
    }
    
    // Nếu không tìm thấy trong cache, sử dụng xử lý offline cơ bản
    this.processOfflineQuery(lowerQuery);
  }
  
  /**
   * Trả lời về điều kiện thời tiết
   */
  respondWithWeatherCondition() {
    const { condition, location } = this.weatherData;
    let response = `Điều kiện thời tiết hiện tại ở ${location}: ${condition}. `;
    
    // Thêm mô tả chi tiết dựa trên điều kiện
    if (condition) {
      const lowerCondition = condition.toLowerCase();
      if (lowerCondition.includes('mưa')) {
        response += 'Bạn nên mang theo ô hoặc áo mưa khi ra ngoài.';
      } else if (lowerCondition.includes('nắng') || lowerCondition.includes('quang')) {
        response += 'Thời tiết tốt để ra ngoài, nhưng đừng quên bôi kem chống nắng.';
      } else if (lowerCondition.includes('mây')) {
        response += 'Thời tiết khá dễ chịu, thích hợp cho các hoạt động ngoài trời.';
      } else if (lowerCondition.includes('sương mù') || lowerCondition.includes('sương')) {
        response += 'Tầm nhìn có thể bị hạn chế, hãy cẩn thận khi lái xe.';
      }
    }
    
    this.addBotMessage(response);
    this.speakText(response);
  }

  /**
   * Trả lời với gợi ý hoạt động
   */
  respondWithActivitySuggestions() {
    const { temperature, condition, windSpeed } = this.weatherData;
    let response = 'Dựa vào thời tiết hiện tại, tôi gợi ý: ';
    
    // Gợi ý dựa trên nhiệt độ
    if (temperature > 30) {
      response += '\n- Tránh ra ngoài vào giờ cao điểm (11h-15h)\n- Uống nhiều nước\n- Mặc quần áo nhẹ, thoáng mát\n- Có thể đi bơi hoặc tìm nơi có điều hòa';
    } else if (temperature >= 25 && temperature <= 30) {
      response += '\n- Thời tiết lý tưởng cho các hoạt động ngoài trời\n- Đi dạo, chạy bộ, đạp xe\n- Picnic hoặc ăn uống ngoài trời\n- Tham quan các điểm du lịch';
    } else if (temperature >= 15 && temperature < 25) {
      response += '\n- Thời tiết mát mẻ, thích hợp cho hầu hết các hoạt động\n- Đi bộ đường dài\n- Chơi thể thao ngoài trời\n- Khám phá thành phố';
    } else {
      response += '\n- Mặc ấm khi ra ngoài\n- Uống đồ uống nóng\n- Các hoạt động trong nhà như đọc sách, xem phim\n- Tập thể dục trong nhà';
    }
    
    // Gợi ý thêm dựa trên điều kiện thời tiết
    if (condition) {
      const lowerCondition = condition.toLowerCase();
      if (lowerCondition.includes('mưa')) {
        response += '\n\nVì trời đang mưa:\n- Mang theo ô hoặc áo mưa\n- Tránh các khu vực dễ ngập\n- Cân nhắc các hoạt động trong nhà';
      } else if (lowerCondition.includes('nắng')) {
        response += '\n\nVì trời nắng:\n- Bôi kem chống nắng\n- Đội mũ, đeo kính râm\n- Tìm bóng râm khi cần thiết';
      } else if (lowerCondition.includes('mây')) {
        response += '\n\nVới bầu trời nhiều mây:\n- Thời tiết lý tưởng cho chụp ảnh\n- Ánh sáng dịu, thích hợp cho các hoạt động ngoài trời';
      }
    }
    
    // Gợi ý dựa trên tốc độ gió
    if (windSpeed && windSpeed > 10) {
      response += '\n\nLưu ý: Gió khá mạnh, không thích hợp cho các hoạt động như đi thuyền nhỏ, thả diều hoặc các hoạt động đòi hỏi độ chính xác cao ngoài trời.';
    }
    
    this.addBotMessage(response);
    this.speakText('Dựa vào thời tiết hiện tại, tôi có một số gợi ý hoạt động phù hợp cho bạn.');
  }

  /**
   * Trả lời về dự báo thời tiết
   */
  respondWithForecast() {
    // Vì không có dữ liệu dự báo thực tế, chúng ta sẽ đưa ra thông báo
    const response = `Để xem dự báo chi tiết, vui lòng truy cập trang Dự báo trong ứng dụng. Tôi có thể giúp bạn phân tích thông tin thời tiết hiện tại ở ${this.weatherData.location}.`;
    this.addBotMessage(response);
    this.speakText(response);
  }

  /**
   * Trả lời về vị trí
   */
  respondWithLocation() {
    const { location } = this.weatherData;
    const response = `Hiện tại bạn đang xem thông tin thời tiết của ${location}.`;
    this.addBotMessage(response);
    this.speakText(response);
  }

  /**
   * Trả lời về khả năng của bot (tiếng Việt)
   */
  respondWithCapabilities() {
    const response = 'Tôi là trợ lý thời tiết AI và có thể giúp bạn:\n\n' +
                    '- Cung cấp thông tin thời tiết hiện tại\n' +
                    '- Gợi ý hoạt động phù hợp với thời tiết\n' +
                    '- Phân tích điều kiện thời tiết\n' +
                    '- Đưa ra lời khuyên về trang phục phù hợp\n' +
                    '- Trả lời bằng giọng nói\n' +
                    '- Nhận câu hỏi bằng giọng nói\n\n' +
                    'Bạn có thể hỏi tôi như: "Thời tiết hôm nay thế nào?", "Tôi nên mặc gì hôm nay?", "Có nên đi picnic không?"';
    this.addBotMessage(response);
    this.speakText('Tôi là trợ lý thời tiết AI và có thể giúp bạn với nhiều thông tin về thời tiết và gợi ý hoạt động phù hợp.');
  }
  
  /**
   * Trả lời về khả năng của bot (tiếng Anh)
   */
  respondWithCapabilitiesEnglish() {
    const response = 'I am an AI weather assistant and I can help you with:\n\n' +
                    '- Current weather information\n' +
                    '- Activity suggestions based on weather\n' +
                    '- Weather condition analysis\n' +
                    '- Clothing recommendations\n' +
                    '- Voice responses\n' +
                    '- Voice input recognition\n\n' +
                    'You can ask me questions like: "What\'s the weather today?", "What should I wear today?", "Is it good for a picnic?"';
    this.addBotMessage(response);
    this.speakText('I am an AI weather assistant and I can help you with various weather information and suitable activity suggestions.');
  }
  
  /**
   * Trả lời với gợi ý trang phục (tiếng Việt)
   */
  respondWithClothingSuggestions() {
    const { temperature, condition, humidity, windSpeed } = this.weatherData;
    let response = 'Dựa vào thời tiết hiện tại, tôi gợi ý trang phục sau:\n\n';
    
    // Gợi ý dựa trên nhiệt độ
    if (temperature > 30) {
      response += '🌡️ Thời tiết nóng (trên 30°C):\n' +
                 '- Áo thun cotton nhẹ, thoáng khí\n' +
                 '- Quần short hoặc váy nhẹ\n' +
                 '- Mũ rộng vành chống nắng\n' +
                 '- Kính râm chống tia UV\n' +
                 '- Dép hoặc sandal thoáng khí\n' +
                 '- Khẩu trang chống nắng nếu ra đường lâu\n';
    } else if (temperature >= 25 && temperature <= 30) {
      response += '🌡️ Thời tiết ấm (25-30°C):\n' +
                 '- Áo thun hoặc áo sơ mi nhẹ\n' +
                 '- Quần short, váy hoặc quần vải nhẹ\n' +
                 '- Mũ nhỏ hoặc nón lưỡi trai\n' +
                 '- Giày thể thao hoặc sandal\n';
    } else if (temperature >= 20 && temperature < 25) {
      response += '🌡️ Thời tiết mát mẻ (20-25°C):\n' +
                 '- Áo sơ mi hoặc áo thun dài tay mỏng\n' +
                 '- Quần dài vải nhẹ hoặc quần jean\n' +
                 '- Áo khoác mỏng (tùy chọn)\n' +
                 '- Giày thể thao hoặc giày lười\n';
    } else if (temperature >= 15 && temperature < 20) {
      response += '🌡️ Thời tiết se lạnh (15-20°C):\n' +
                 '- Áo thun dài tay hoặc áo sơ mi\n' +
                 '- Áo khoác nhẹ hoặc cardigan\n' +
                 '- Quần dài\n' +
                 '- Giày kín chân\n';
    } else if (temperature >= 10 && temperature < 15) {
      response += '🌡️ Thời tiết lạnh (10-15°C):\n' +
                 '- Áo len hoặc áo nỉ\n' +
                 '- Áo khoác dày vừa\n' +
                 '- Quần dài dày\n' +
                 '- Tất\n' +
                 '- Giày kín chân\n';
    } else {
      response += '🌡️ Thời tiết rất lạnh (dưới 10°C):\n' +
                 '- Áo giữ nhiệt\n' +
                 '- Áo len dày\n' +
                 '- Áo khoác dày, có thể là áo phao\n' +
                 '- Khăn quàng cổ\n' +
                 '- Găng tay\n' +
                 '- Mũ len\n' +
                 '- Tất dày\n' +
                 '- Giày bốt hoặc giày kín chân\n';
    }
    
    // Gợi ý thêm dựa trên điều kiện thời tiết
    if (condition) {
      const lowerCondition = condition.toLowerCase();
      response += '\n🌤️ Dựa trên điều kiện thời tiết: ';
      
      if (lowerCondition.includes('mưa')) {
        response += '\n- Mang theo ô\n' +
                   '- Áo mưa hoặc áo khoác chống thấm nước\n' +
                   '- Giày không thấm nước\n' +
                   '- Tránh mặc quần áo sáng màu dễ bị bẩn\n';
      } else if (lowerCondition.includes('nắng') || lowerCondition.includes('quang')) {
        response += '\n- Bôi kem chống nắng (SPF 30+ hoặc cao hơn)\n' +
                   '- Mặc quần áo có khả năng chống tia UV\n' +
                   '- Đội mũ rộng vành\n' +
                   '- Đeo kính râm\n';
      } else if (lowerCondition.includes('mây')) {
        response += '\n- Mang theo áo khoác nhẹ phòng khi thời tiết thay đổi\n';
      } else if (lowerCondition.includes('sương mù') || lowerCondition.includes('sương')) {
        response += '\n- Mặc quần áo có khả năng giữ ấm tốt\n' +
                   '- Tránh mặc quần áo dễ thấm ẩm\n';
      }
    }
    
    // Gợi ý dựa trên độ ẩm
    if (humidity !== null) {
      response += '\n💧 Dựa trên độ ẩm: ';
      if (humidity > 80) {
        response += '\n- Mặc vải thoáng khí, thấm hút mồ hôi tốt\n' +
                   '- Tránh vải tổng hợp không thoáng khí\n' +
                   '- Quần áo rộng rãi, thoải mái\n';
      } else if (humidity < 30) {
        response += '\n- Mặc nhiều lớp để giữ ẩm cho da\n' +
                   '- Mang theo xịt khoáng nếu cần\n';
      }
    }
    
    // Gợi ý dựa trên tốc độ gió
    if (windSpeed && windSpeed > 8) {
      response += '\n🌬️ Lưu ý về gió: \n- Mặc áo khoác chắn gió\n' +
                 '- Tránh mặc váy ngắn hoặc quần áo rộng dễ bay\n' +
                 '- Đội mũ có dây buộc\n';
    }
    
    this.addBotMessage(response);
    this.speakText('Tôi đã gợi ý trang phục phù hợp với thời tiết hiện tại cho bạn.');
  }
  
  /**
   * Trả lời với gợi ý trang phục (tiếng Anh)
   */
  respondWithClothingSuggestionsEnglish() {
    const { temperature, condition, humidity, windSpeed } = this.weatherData;
    let response = 'Based on the current weather, I recommend the following clothing:\n\n';
    
    // Gợi ý dựa trên nhiệt độ
    if (temperature > 30) {
      response += '🌡️ Hot weather (above 30°C/86°F):\n' +
                 '- Light, breathable cotton t-shirts\n' +
                 '- Shorts or light skirts\n' +
                 '- Wide-brimmed hat for sun protection\n' +
                 '- UV-protective sunglasses\n' +
                 '- Sandals or breathable footwear\n' +
                 '- Sun-protective face mask if outdoors for long periods\n';
    } else if (temperature >= 25 && temperature <= 30) {
      response += '🌡️ Warm weather (25-30°C/77-86°F):\n' +
                 '- T-shirts or light shirts\n' +
                 '- Shorts, skirts, or light pants\n' +
                 '- Cap or small hat\n' +
                 '- Sneakers or sandals\n';
    } else if (temperature >= 20 && temperature < 25) {
      response += '🌡️ Mild weather (20-25°C/68-77°F):\n' +
                 '- Light long-sleeve shirts or t-shirts\n' +
                 '- Light pants or jeans\n' +
                 '- Light jacket (optional)\n' +
                 '- Sneakers or loafers\n';
    } else if (temperature >= 15 && temperature < 20) {
      response += '🌡️ Cool weather (15-20°C/59-68°F):\n' +
                 '- Long-sleeve shirts\n' +
                 '- Light jacket or cardigan\n' +
                 '- Long pants\n' +
                 '- Closed-toe shoes\n';
    } else if (temperature >= 10 && temperature < 15) {
      response += '🌡️ Cold weather (10-15°C/50-59°F):\n' +
                 '- Sweater or sweatshirt\n' +
                 '- Medium-weight jacket\n' +
                 '- Thick pants\n' +
                 '- Socks\n' +
                 '- Closed-toe shoes\n';
    } else {
      response += '🌡️ Very cold weather (below 10°C/50°F):\n' +
                 '- Thermal underwear\n' +
                 '- Thick sweater\n' +
                 '- Heavy jacket or down coat\n' +
                 '- Scarf\n' +
                 '- Gloves\n' +
                 '- Beanie or wool hat\n' +
                 '- Thick socks\n' +
                 '- Boots or closed-toe shoes\n';
    }
    
    // Gợi ý thêm dựa trên điều kiện thời tiết
    if (condition) {
      const lowerCondition = condition.toLowerCase();
      response += '\n🌤️ Based on weather conditions: ';
      
      if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
        response += '\n- Bring an umbrella\n' +
                   '- Raincoat or waterproof jacket\n' +
                   '- Waterproof footwear\n' +
                   '- Avoid light-colored clothing that can get dirty easily\n';
      } else if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
        response += '\n- Apply sunscreen (SPF 30+ or higher)\n' +
                   '- Wear UV-protective clothing\n' +
                   '- Wide-brimmed hat\n' +
                   '- Sunglasses\n';
      } else if (lowerCondition.includes('cloud')) {
        response += '\n- Bring a light jacket in case the weather changes\n';
      } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
        response += '\n- Wear clothing with good insulation\n' +
                   '- Avoid fabrics that absorb moisture easily\n';
      }
    }
    
    // Gợi ý dựa trên độ ẩm
    if (humidity !== null) {
      response += '\n💧 Based on humidity: ';
      if (humidity > 80) {
        response += '\n- Wear breathable, moisture-wicking fabrics\n' +
                   '- Avoid non-breathable synthetic materials\n' +
                   '- Loose-fitting, comfortable clothing\n';
      } else if (humidity < 30) {
        response += '\n- Layer clothing to retain skin moisture\n' +
                   '- Carry a facial mist if needed\n';
      }
    }
    
    // Gợi ý dựa trên tốc độ gió
    if (windSpeed && windSpeed > 8) {
      response += '\n🌬️ Wind considerations: \n- Wear a windproof jacket\n' +
                 '- Avoid short skirts or loose clothing that can blow around\n' +
                 '- Wear a hat with a strap\n';
    }
    
    this.addBotMessage(response);
    this.speakText('I have suggested appropriate clothing for the current weather conditions.');
  }

  /**
   * Khởi tạo nhận diện giọng nói
   */
  initSpeechRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      // Ngôn ngữ mặc định là tiếng Việt, sẽ được cập nhật khi bắt đầu nhận diện
      this.recognition.lang = 'vi-VN';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.inputField.value = transcript;
        this.handleUserMessage();
        this.stopVoiceRecognition();
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        this.stopVoiceRecognition();
        if (event.error === 'no-speech') {
          const noSpeechMessage = this.language === 'en' 
            ? 'I didn\'t hear anything. Please try again.' 
            : 'Tôi không nghe thấy gì. Vui lòng thử lại.';
          this.addBotMessage(noSpeechMessage);
        } else {
          const errorMessage = this.language === 'en' 
            ? 'An error occurred during voice recognition. Please try again or type your question.' 
            : 'Có lỗi xảy ra khi nhận diện giọng nói. Vui lòng thử lại hoặc nhập bằng bàn phím.';
          this.addBotMessage(errorMessage);
        }
      };

      this.recognition.onend = () => {
        this.stopVoiceRecognition();
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
      this.voiceButton.style.display = 'none';
    }
  }

  /**
   * Bật/tắt nhận diện giọng nói
   */
  toggleVoiceInput() {
    if (this.isListening) {
      this.stopVoiceRecognition();
    } else {
      this.startVoiceRecognition();
    }
  }

  /**
   * Bắt đầu nhận diện giọng nói
   */
  startVoiceRecognition() {
    if (this.recognition) {
      this.isListening = true;
      this.voiceButton.classList.add('listening');
      this.voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
      
      // Đặt ngôn ngữ nhận diện giọng nói phù hợp với ngôn ngữ được phát hiện
      if (this.language === 'en') {
        this.recognition.lang = 'en-US';
        this.addBotMessage('Listening... Please speak your question.');
      } else {
        this.recognition.lang = 'vi-VN';
        this.addBotMessage('Đang lắng nghe... Hãy nói câu hỏi của bạn.');
      }
      
      this.recognition.start();
    }
  }

  /**
   * Dừng nhận diện giọng nói
   */
  stopVoiceRecognition() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.voiceButton.classList.remove('listening');
      this.voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Recognition already stopped');
      }
    }
  }

  /**
   * Khởi tạo Text-to-Speech
   */
  initTextToSpeech() {
    this.speechSynthesis = window.speechSynthesis;
    this.voices = [];

    // Lấy danh sách giọng nói
    if (this.speechSynthesis) {
      // Lấy danh sách giọng nói khi có sẵn
      this.speechSynthesis.onvoiceschanged = () => {
        this.voices = this.speechSynthesis.getVoices();
      };
      // Thử lấy ngay lập tức (cho một số trình duyệt)
      this.voices = this.speechSynthesis.getVoices();
    }
  }

  /**
   * Đọc văn bản bằng Text-to-Speech
   */
  speakText(text) {
    if (this.speechSynthesis) {
      // Dừng bất kỳ phát âm nào đang diễn ra
      this.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (this.language === 'en') {
        // Tìm giọng tiếng Anh nếu có
        let englishVoice = this.voices.find(voice => 
          voice.lang.includes('en') || voice.name.includes('English')
        );
        
        // Nếu có giọng tiếng Anh, sử dụng nó
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
        
        utterance.lang = 'en-US';
      } else {
        // Tìm giọng tiếng Việt nếu có
        let vietnameseVoice = this.voices.find(voice => 
          voice.lang.includes('vi') || voice.name.includes('Vietnam')
        );
        
        // Nếu có giọng tiếng Việt, sử dụng nó
        if (vietnameseVoice) {
          utterance.voice = vietnameseVoice;
        }
        
        utterance.lang = 'vi-VN';
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      this.speechSynthesis.speak(utterance);
    }
  }
  
  /**
   * Trả lời về thời tiết hiện tại bằng tiếng Anh
   */
  respondWithCurrentWeatherEnglish() {
    const { temperature, condition, location, humidity, windSpeed, feelsLike, visibility, pressure } = this.weatherData;
    const englishCondition = this.translateConditionToEnglish(condition);
    let response = `Current weather in ${location}: ${temperature}°C (${Math.round(temperature * 9/5 + 32)}°F), ${englishCondition}. `;
    
    if (feelsLike !== null) {
      response += `Feels like ${feelsLike}°C (${Math.round(feelsLike * 9/5 + 32)}°F). `;
    }
    
    if (humidity !== null) {
      response += `Humidity ${humidity}%. `;
    }
    
    if (windSpeed !== null) {
      // Convert m/s to km/h if needed
      const windSpeedKmh = windSpeed > 20 ? (windSpeed * 3.6).toFixed(1) : windSpeed;
      response += `Wind speed ${windSpeedKmh} km/h. `;
    }
    
    if (visibility !== null && visibility !== undefined) {
      response += `Visibility ${visibility} km. `;
    }
    
    if (pressure !== null && pressure !== undefined) {
      response += `Pressure ${pressure} hPa. `;
    }
    
    // Add time-specific greeting
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      response += '\n\nGood morning! ';
    } else if (hour >= 12 && hour < 18) {
      response += '\n\nGood afternoon! ';
    } else {
      response += '\n\nGood evening! ';
    }
    
    // Add weather-specific advice
    if (englishCondition) {
      const lowerCondition = englishCondition.toLowerCase();
      if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
        response += 'Don\'t forget your umbrella today.';
      } else if (lowerCondition.includes('snow')) {
        response += 'Bundle up and be careful on the roads.';
      } else if (lowerCondition.includes('sunny') && temperature > 25) {
        response += 'Stay hydrated and use sun protection.';
      } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
        response += 'Drive carefully due to reduced visibility.';
      } else if (temperature < 10) {
        response += 'It\'s quite cold, dress warmly.';
      } else if (temperature > 30) {
        response += 'It\'s very hot, try to stay cool and hydrated.';
      } else if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
        response += 'Enjoy the beautiful weather today!';
      }
    }
    
    this.addBotMessage(response);
    this.speakText(response);
  }

  /**
   * Trả lời về nhiệt độ bằng tiếng Anh
   */
  respondWithTemperatureEnglish() {
    const { temperature, feelsLike, location, humidity, windSpeed } = this.weatherData;
    let response = `Current temperature in ${location} is ${temperature}°C (${Math.round(temperature * 9/5 + 32)}°F). `;
    
    if (feelsLike !== null) {
      const tempDiff = Math.abs(temperature - feelsLike);
      if (tempDiff > 3) {
        response += `Feels like ${feelsLike}°C (${Math.round(feelsLike * 9/5 + 32)}°F), which is ${Math.round(tempDiff)}°C ${feelsLike < temperature ? 'colder' : 'warmer'} than the actual temperature. `;
      } else {
        response += `Feels like ${feelsLike}°C (${Math.round(feelsLike * 9/5 + 32)}°F). `;
      }
    }
    
    // Add humidity impact on temperature perception
    if (humidity !== null) {
      if (temperature > 25 && humidity > 70) {
        response += `The high humidity (${humidity}%) makes it feel more uncomfortable. `;
      } else if (temperature > 30 && humidity < 30) {
        response += `The low humidity (${humidity}%) makes the heat more bearable, but stay hydrated. `;
      } else if (temperature < 10 && humidity > 80) {
        response += `The high humidity (${humidity}%) makes the cold feel more penetrating. `;
      }
    }
    
    // Add wind chill factor
    if (windSpeed !== null && windSpeed > 5 && temperature < 15) {
      response += `The wind increases the cooling effect on your skin. `;
    }
    
    // Temperature assessment and advice
    if (temperature > 35) {
      response += 'It\'s extremely hot. Avoid outdoor activities, stay in air-conditioned spaces, and drink plenty of water. Heat exhaustion risk is high.';
    } else if (temperature > 30) {
      response += 'It\'s very hot. Limit outdoor activities, especially during midday (11 AM - 3 PM). Stay hydrated and seek shade when outside.';
    } else if (temperature > 25) {
      response += 'It\'s hot. Light clothing is recommended. Remember to apply sunscreen and stay hydrated when outdoors.';
    } else if (temperature > 20) {
      response += 'The temperature is warm and pleasant. Perfect for most outdoor activities. Light clothing is suitable.';
    } else if (temperature > 15) {
      response += 'The temperature is mild. A light jacket or long sleeves might be comfortable, especially in the shade or evening.';
    } else if (temperature > 10) {
      response += 'It\'s cool. Consider wearing layers and a light jacket when going outside.';
    } else if (temperature > 5) {
      response += 'It\'s cold. Wear a warm jacket, hat, and consider gloves when staying outside for extended periods.';
    } else if (temperature > 0) {
      response += 'It\'s very cold. Bundle up with multiple layers, a warm coat, hat, gloves, and scarf.';
    } else {
      response += 'It\'s freezing. Minimize time outdoors, wear proper winter clothing, and be aware of ice on surfaces.';
    }
    
    this.addBotMessage(response);
    this.speakText(response);
  }

  /**
   * Trả lời về điều kiện thời tiết bằng tiếng Anh
   */
  respondWithWeatherConditionEnglish() {
    const { condition, location, humidity, windSpeed, visibility } = this.weatherData;
    const englishCondition = this.translateConditionToEnglish(condition);
    let response = `Current weather condition in ${location}: ${englishCondition}. `;
    
    // Thêm thông tin về độ ẩm và gió nếu có
    if (humidity !== null) {
      response += `Humidity is at ${humidity}%. `;
    }
    
    if (windSpeed !== null) {
      response += `Wind speed is ${windSpeed} km/h. `;
    }
    
    if (visibility !== null && visibility !== undefined) {
      response += `Visibility is ${visibility} km. `;
    }
    
    // Thêm mô tả chi tiết dựa trên điều kiện
    if (englishCondition) {
      const lowerCondition = englishCondition.toLowerCase();
      if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
        response += 'You should bring an umbrella or raincoat when going outside. Check for weather updates as conditions may change.';
      } else if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
        response += 'Great weather to go outside, but don\'t forget to apply sunscreen and stay hydrated. UV index may be high.';
      } else if (lowerCondition.includes('cloud')) {
        response += 'The weather is quite pleasant, suitable for outdoor activities. It\'s a good day for photography with diffused natural light.';
      } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
        response += 'Visibility may be limited, be careful when driving. Allow extra time for travel and use appropriate lights.';
      } else if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) {
        response += 'Be cautious of lightning and strong winds. Stay indoors if possible and avoid open areas or tall structures.';
      } else if (lowerCondition.includes('snow') || lowerCondition.includes('sleet')) {
        response += 'Roads may be slippery. Dress warmly in layers and wear appropriate footwear with good traction.';
      } else if (lowerCondition.includes('windy')) {
        response += 'Secure loose objects outdoors and be careful of flying debris. Consider postponing activities like cycling in open areas.';
      }
    }
    
    this.addBotMessage(response);
    this.speakText(response);
  }
  
  /**
   * Dịch điều kiện thời tiết từ tiếng Việt sang tiếng Anh
   */
  translateConditionToEnglish(condition) {
    if (!condition) return '';
    
    // Nếu điều kiện đã là tiếng Anh, trả về nguyên bản
    if (/^[a-zA-Z\s]+$/.test(condition)) {
      return condition;
    }
    
    const conditionMap = {
      // Mưa và các loại mưa
      'mưa': 'rain',
      'mưa nhẹ': 'light rain',
      'mưa vừa': 'moderate rain',
      'mưa to': 'heavy rain',
      'mưa rào': 'showers',
      'mưa dông': 'thunderstorm with rain',
      'mưa phùn': 'drizzle',
      'mưa đá': 'hail',
      'mưa đông': 'freezing rain',
      
      // Nắng và quang đãng
      'nắng': 'sunny',
      'nắng nhẹ': 'mild sunshine',
      'nắng gắt': 'intense sunshine',
      'quang': 'clear',
      'quang đãng': 'clear sky',
      'trời đẹp': 'fair weather',
      
      // Mây
      'mây': 'cloudy',
      'nhiều mây': 'mostly cloudy',
      'ít mây': 'partly cloudy',
      'mây rải rác': 'scattered clouds',
      'mây thưa': 'few clouds',
      'mây đen': 'dark clouds',
      
      // Sương và tầm nhìn
      'sương mù': 'foggy',
      'sương': 'mist',
      'sương mù dày đặc': 'heavy fog',
      'khói mù': 'haze',
      'bụi': 'dust',
      
      // Dông bão
      'dông': 'thunderstorm',
      'bão': 'storm',
      'lốc': 'tornado',
      'gió mạnh': 'strong wind',
      'gió lớn': 'high wind',
      'gió giật': 'wind gusts',
      
      // Tuyết và băng giá
      'tuyết': 'snow',
      'tuyết nhẹ': 'light snow',
      'tuyết rơi': 'snowfall',
      'băng giá': 'frost',
      'giá lạnh': 'freezing cold',
      'băng': 'ice',
      
      // Các điều kiện khác
      'oi bức': 'humid and hot',
      'ẩm ướt': 'damp',
      'khô': 'dry',
      'nóng': 'hot',
      'lạnh': 'cold',
      'se lạnh': 'chilly',
      'ấm áp': 'warm'
    };
    
    const lowerCondition = condition.toLowerCase().trim();
    
    // Kiểm tra điều kiện chính xác trước
    if (conditionMap[lowerCondition]) {
      return conditionMap[lowerCondition];
    }
    
    // Kiểm tra từng từ khóa trong điều kiện
    for (const [viKey, enValue] of Object.entries(conditionMap)) {
      if (lowerCondition.includes(viKey)) {
        return enValue;
      }
    }
    
    // Nếu không tìm thấy từ khóa phù hợp, trả về điều kiện gốc
    return condition;
  }
  
  /**
   * Trả lời về gợi ý hoạt động bằng tiếng Anh
   */
  respondWithActivitySuggestionsEnglish() {
    const { temperature, condition, windSpeed } = this.weatherData;
    const englishCondition = this.translateConditionToEnglish(condition);
    let response = 'Based on the current weather, here are some activity suggestions:\n\n';
    
    // Gợi ý dựa trên nhiệt độ
    if (temperature > 30) {
      response += '• It\'s quite hot outside. Indoor activities are recommended such as visiting museums, shopping malls, or watching movies.\n';
      response += '• If you must go outside, swimming or water activities would be refreshing.\n';
      response += '• Remember to stay hydrated and avoid direct sun exposure between 11 AM and 3 PM.\n';
    } else if (temperature > 25) {
      response += '• The temperature is warm and pleasant for most outdoor activities.\n';
      response += '• Great time for picnics, hiking, cycling, or visiting parks.\n';
      response += '• Beach activities and water sports are also good options.\n';
    } else if (temperature > 15) {
      response += '• The temperature is moderate, perfect for almost any outdoor activity.\n';
      response += '• Ideal for sightseeing, walking tours, outdoor sports, or dining at outdoor restaurants.\n';
      response += '• Light clothing is sufficient, but consider bringing a light jacket for the evening.\n';
    } else if (temperature > 5) {
      response += '• It\'s a bit cool outside. Outdoor activities are still possible with proper clothing.\n';
      response += '• Good for brisk walking, jogging, or visiting outdoor attractions with less crowds.\n';
      response += '• Indoor activities like museums, cafes, or shopping are also good options.\n';
    } else {
      response += '• It\'s cold outside. Indoor activities are recommended.\n';
      response += '• If you go outside, dress warmly in layers and limit exposure time.\n';
      response += '• Consider visiting indoor attractions, museums, theaters, or enjoying warm drinks at a cozy cafe.\n';
    }
    
    // Gợi ý dựa trên điều kiện thời tiết
    if (englishCondition) {
      const lowerCondition = englishCondition.toLowerCase();
      if (lowerCondition.includes('rain')) {
        response += '\n**Due to the rain:**\n';
        response += '• Indoor activities are recommended such as museums, galleries, shopping malls, or cafes.\n';
        response += '• If you must go outside, bring an umbrella or raincoat.\n';
      } else if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
        response += '\n**With the clear sky:**\n';
        response += '• Great conditions for outdoor photography, sightseeing, or nature walks.\n';
        response += '• Don\'t forget to apply sunscreen and wear a hat for sun protection.\n';
      } else if (lowerCondition.includes('cloud')) {
        response += '\n**With cloudy conditions:**\n';
        response += '• Good weather for outdoor activities without excessive sun exposure.\n';
        response += '• Perfect for walking tours, hiking, or outdoor sports.\n';
      } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
        response += '\n**Due to reduced visibility:**\n';
        response += '• Be cautious if driving or cycling.\n';
        response += '• Consider indoor activities or stay in areas you\'re familiar with.\n';
      }
    }
    
    // Gợi ý dựa trên tốc độ gió
    if (windSpeed !== null && windSpeed > 8) {
      response += '\n**Note about wind conditions:**\n';
      response += '• The wind is quite strong today.\n';
      response += '• Activities like flying kites could be fun, but be cautious with umbrellas.\n';
      response += '• Sailing or windsurfing might be good for experienced enthusiasts.\n';
      response += '• Avoid areas with trees or loose objects during very high winds.\n';
    }
    
    this.addBotMessage(response);
    this.speakText('Here are some activity suggestions based on the current weather.');
  }
  
  /**
   * Trả lời về dự báo thời tiết bằng tiếng Anh
   */
  respondWithForecastEnglish() {
    const { temperature, condition, location } = this.weatherData;
    const englishCondition = this.translateConditionToEnglish(condition);
    
    // Tạo dự báo giả định dựa trên thời tiết hiện tại
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const tomorrowDay = days[tomorrow.getDay()];
    const dayAfterTomorrowDay = days[dayAfterTomorrow.getDay()];
    
    // Tạo biến động ngẫu nhiên cho nhiệt độ và điều kiện
    const getRandomChange = () => Math.floor(Math.random() * 5) - 2; // -2 to +2
    const tomorrowTemp = Math.round(temperature + getRandomChange());
    const dayAfterTemp = Math.round(tomorrowTemp + getRandomChange());
    
    // Mảng các điều kiện thời tiết có thể xảy ra
    const possibleConditions = [
      englishCondition,
      englishCondition.includes('rain') ? 'partly cloudy' : 'light rain',
      englishCondition.includes('cloud') ? 'sunny' : 'partly cloudy',
      englishCondition.includes('clear') ? 'partly cloudy' : 'clear'
    ];
    
    // Chọn ngẫu nhiên điều kiện cho ngày mai và ngày kia
    const getRandomCondition = () => possibleConditions[Math.floor(Math.random() * possibleConditions.length)];
    const tomorrowCondition = getRandomCondition();
    const dayAfterCondition = getRandomCondition();
    
    let response = `Weather forecast for ${location}:\n\n`;
    
    // Dự báo cho ngày mai
    response += `**${tomorrowDay}**: ${tomorrowTemp}°C (${Math.round(tomorrowTemp * 9/5 + 32)}°F), ${tomorrowCondition}. `;
    
    if (tomorrowTemp > 30) {
      response += 'It will be hot, stay hydrated and avoid prolonged sun exposure.\n';
    } else if (tomorrowTemp < 10) {
      response += 'It will be cold, dress warmly in layers.\n';
    } else {
      response += 'The temperature will be moderate.\n';
    }
    
    if (tomorrowCondition.includes('rain')) {
      response += 'Remember to bring an umbrella or raincoat.\n';
    }
    
    // Dự báo cho ngày kia
    response += `\n**${dayAfterTomorrowDay}**: ${dayAfterTemp}°C (${Math.round(dayAfterTemp * 9/5 + 32)}°F), ${dayAfterCondition}. `;
    
    if (dayAfterTemp > 30) {
      response += 'Hot conditions will continue, plan indoor activities during midday.\n';
    } else if (dayAfterTemp < 10) {
      response += 'Cold conditions will persist, bundle up when going outside.\n';
    } else {
      response += 'Expect comfortable temperatures.\n';
    }
    
    if (dayAfterCondition.includes('rain')) {
      response += 'Prepare for wet conditions.\n';
    }
    
    // Thêm lưu ý
    response += '\n**Note**: This is a simplified forecast based on current conditions. For more accurate and detailed forecasts, please check the Forecast section in the app or visit a professional weather service.';
    
    this.addBotMessage(response);
    this.speakText(`Here's a simplified weather forecast for ${location} for the next couple of days.`);
  }
  
  /**
   * Trả lời về vị trí bằng tiếng Anh
   */
  respondWithLocationEnglish() {
    const { location, country } = this.weatherData;
    let response = `You are currently viewing weather information for ${location}`;
    
    if (country) {
      response += `, ${country}`;
    }
    
    response += '.';
    
    // Thêm thông tin về thời gian cập nhật
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    response += `\n\nThis information was last updated at ${timeString}.`;
    
    // Thêm gợi ý để tìm kiếm vị trí khác
    response += '\n\nTo view weather for a different location, use the search bar at the top of the page.';
    
    // Thêm thông tin về vị trí gần đó (giả định)
    response += '\n\nYou can also ask me about specific aspects of the weather such as temperature, conditions, or clothing recommendations for this location.';
    
    this.addBotMessage(response);
    this.speakText(`You are currently viewing weather information for ${location}.`);
  }
  
  /**
   * Trả lời về thời tiết ở một địa điểm khác
   * @param {string} locationName - Tên địa điểm cần tra cứu
   */
  async respondWithOtherLocation(locationName) {
    // Hiển thị thông báo đang tìm kiếm
    const searchingMessage = this.language === 'en'
      ? `Searching for weather information in ${locationName}...`
      : `Đang tìm kiếm thông tin thời tiết ở ${locationName}...`;
    this.addBotMessage(searchingMessage);
    
    try {
      // Sử dụng API key từ biến toàn cục
      const API_KEY = window.API_KEY || "037b6dda3ea6bd588dd48b35ae88f478";
      // Gọi API để lấy thông tin thời tiết
      const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(locationName)}&units=metric&lang=${this.language === 'en' ? 'en' : 'vi'}&appid=${API_KEY}`);
      if (!response.ok) {
        if (response.status === 404) {
          const notFoundMessage = this.language === 'en'
            ? `I couldn't find weather information for "${locationName}". Please check the location name and try again.`
            : `Tôi không thể tìm thấy thông tin thời tiết cho "${locationName}". Vui lòng kiểm tra lại tên địa điểm và thử lại.`;
          this.addBotMessage(notFoundMessage);
        } else {
          const errorMessage = this.language === 'en'
            ? `An error occurred while fetching weather data: ${response.statusText}`
            : `Đã xảy ra lỗi khi tải dữ liệu thời tiết: ${response.statusText}`;
          this.addBotMessage(errorMessage);
        }
        return;
      }
      
      const data = await response.json();
      
      // Tạo thông tin thời tiết
      const weatherInfo = {
        location: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        feelsLike: Math.round(data.main.feels_like)
      };
      
      // Tạo phản hồi dựa trên ngôn ngữ
      let response = '';
      if (this.language === 'en') {
        response = `Current weather in ${weatherInfo.location}:\n\n` +
                  `🌡️ Temperature: ${weatherInfo.temperature}°C (feels like ${weatherInfo.feelsLike}°C)\n` +
                  `🌤️ Condition: ${weatherInfo.condition}\n` +
                  `💧 Humidity: ${weatherInfo.humidity}%\n` +
                  `💨 Wind speed: ${weatherInfo.windSpeed} m/s`;
      } else {
        response = `Thời tiết hiện tại ở ${weatherInfo.location}:\n\n` +
                  `🌡️ Nhiệt độ: ${weatherInfo.temperature}°C (cảm giác như ${weatherInfo.feelsLike}°C)\n` +
                  `🌤️ Điều kiện: ${weatherInfo.condition}\n` +
                  `💧 Độ ẩm: ${weatherInfo.humidity}%\n` +
                  `💨 Tốc độ gió: ${weatherInfo.windSpeed} m/s`;
      }
      
      // Hiển thị phản hồi
      this.addBotMessage(response);
      this.speakText(this.language === 'en' 
        ? `Here is the current weather in ${weatherInfo.location}.` 
        : `Đây là thời tiết hiện tại ở ${weatherInfo.location}.`);
      
      // Lưu truy vấn này vào lịch sử nếu người dùng đã đăng nhập
      this.saveLocationQuery(locationName);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      const errorMessage = this.language === 'en'
        ? 'Sorry, I encountered an error while fetching the weather data. Please try again later.'
        : 'Xin lỗi, tôi gặp lỗi khi tải dữ liệu thời tiết. Vui lòng thử lại sau.';
      this.addBotMessage(errorMessage);
    }
  }
  
  /**
   * Lưu truy vấn địa điểm vào lịch sử nếu người dùng đã đăng nhập
   * @param {string} locationName - Tên địa điểm đã tra cứu
   */
  saveLocationQuery(locationName) {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const userId = this.getUserId();
    if (!userId) return;
    
    // Lưu truy vấn vào localStorage
    const storageKey = `weather_queries_${userId}`;
    let queries = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Thêm truy vấn mới vào đầu danh sách
    queries.unshift({
      location: locationName,
      timestamp: new Date().toISOString()
    });
    
    // Giới hạn số lượng truy vấn lưu trữ (tối đa 10)
    if (queries.length > 10) {
      queries = queries.slice(0, 10);
    }
    
    // Lưu lại vào localStorage
    localStorage.setItem(storageKey, JSON.stringify(queries));
  }
  
  /**
   * Lấy ID người dùng nếu đã đăng nhập
   * @returns {string|null} - ID người dùng hoặc null nếu chưa đăng nhập
   */
  getUserId() {
    // Kiểm tra xem có thông tin người dùng trong localStorage không
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return null;
    
    try {
      const user = JSON.parse(userInfo);
      return user.id || null;
    } catch (error) {
      console.error('Error parsing user info:', error);
      return null;
    }
  }
  
  /**
   * Trả lời về lịch sử truy vấn thời tiết (tiếng Việt)
   */
  respondWithQueryHistory() {
    const userId = this.getUserId();
    if (!userId) {
      this.addBotMessage('Bạn cần đăng nhập để xem lịch sử truy vấn thời tiết.');
      return;
    }
    
    const storageKey = `weather_queries_${userId}`;
    const queries = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (queries.length === 0) {
      this.addBotMessage('Bạn chưa có lịch sử truy vấn thời tiết nào.');
      return;
    }
    
    let response = 'Đây là lịch sử truy vấn thời tiết của bạn:\n\n';
    
    queries.forEach((query, index) => {
      const date = new Date(query.timestamp);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      response += `${index + 1}. ${query.location} - ${formattedDate}\n`;
    });
    
    response += '\nBạn có thể hỏi tôi về thời tiết ở bất kỳ địa điểm nào trong danh sách trên.';
    
    this.addBotMessage(response);
    this.speakText('Đây là lịch sử truy vấn thời tiết của bạn.');
  }
  
  /**
   * Trả lời về lịch sử truy vấn thời tiết (tiếng Anh)
   */
  respondWithQueryHistoryEnglish() {
    const userId = this.getUserId();
    if (!userId) {
      this.addBotMessage('You need to log in to view your weather query history.');
      return;
    }
    
    const storageKey = `weather_queries_${userId}`;
    const queries = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (queries.length === 0) {
      this.addBotMessage('You don\'t have any weather query history yet.');
      return;
    }
    
    let response = 'Here is your weather query history:\n\n';
    
    queries.forEach((query, index) => {
      const date = new Date(query.timestamp);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      response += `${index + 1}. ${query.location} - ${formattedDate}\n`;
    });
    
    response += '\nYou can ask me about the weather in any of the locations listed above.';
    
    this.addBotMessage(response);
    this.speakText('Here is your weather query history.');
  }
}

// Khởi tạo chatbot khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
  // Tải CSS cho chatbot
  const chatbotCSS = document.createElement('link');
  chatbotCSS.rel = 'stylesheet';
  chatbotCSS.href = '../css/ai-chatbot.css';
  document.head.appendChild(chatbotCSS);

  // Khởi tạo chatbot
  const chatbot = new WeatherAIChatbot();
  chatbot.init();

  // Lưu chatbot vào window để có thể truy cập từ console nếu cần
  window.weatherChatbot = chatbot;
});