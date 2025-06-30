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
   */
  processUserQuery(query) {
    // Chuyển query về chữ thường để dễ so sánh
    const lowerQuery = query.toLowerCase();
    
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

    // Xử lý các loại câu hỏi
    setTimeout(() => {
      // Xử lý câu hỏi tiếng Việt
      if (this.language === 'vi') {
        // Câu hỏi về trang phục
        if (lowerQuery.includes('nên mặc') || lowerQuery.includes('mặc gì') || 
            lowerQuery.includes('trang phục') || lowerQuery.includes('quần áo')) {
          this.respondWithClothingSuggestions();
        }
        // Câu hỏi về thời tiết hiện tại
        else if (lowerQuery.includes('thời tiết') && 
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
        // Câu hỏi về lịch sử truy vấn
        else if (lowerQuery.includes('lịch sử') || lowerQuery.includes('truy vấn') || 
                lowerQuery.includes('tìm kiếm gần đây') || lowerQuery.includes('đã tìm')) {
          this.respondWithQueryHistory();
        }
        // Câu chào và giới thiệu
        else if (lowerQuery.includes('xin chào') || lowerQuery.includes('chào') || 
                lowerQuery.includes('hi') || lowerQuery.includes('hello')) {
          this.addBotMessage(`Xin chào! Tôi là trợ lý thời tiết AI. Tôi có thể giúp bạn với thông tin thời tiết ở ${this.weatherData.location}. Bạn muốn biết điều gì?`);
        }
        // Câu hỏi về khả năng của bot
        else if (lowerQuery.includes('bạn có thể làm gì') || lowerQuery.includes('bạn giúp được gì') || 
                lowerQuery.includes('chức năng')) {
          this.respondWithCapabilities();
        }
        // Câu hỏi không rõ ràng
        else {
          this.addBotMessage('Tôi không chắc mình hiểu câu hỏi của bạn. Bạn có thể hỏi về thời tiết hiện tại, dự báo, gợi ý trang phục, hoặc hoạt động phù hợp với thời tiết.');
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
        else if (lowerQuery.includes('weather') && 
            (lowerQuery.includes('current') || lowerQuery.includes('now') || lowerQuery.includes('today'))) {
          this.respondWithCurrentWeatherEnglish();
        }
        // Câu hỏi về nhiệt độ
        else if (lowerQuery.includes('temperature') || lowerQuery.includes('hot') || lowerQuery.includes('cold')) {
          this.respondWithTemperatureEnglish();
        }
        // Câu hỏi về điều kiện thời tiết
        else if (lowerQuery.includes('sky') || lowerQuery.includes('rain') || lowerQuery.includes('sunny')) {
          this.respondWithWeatherConditionEnglish();
        }
        // Câu hỏi về gợi ý hoạt động
        else if (lowerQuery.includes('what to do') || lowerQuery.includes('activity') || 
                lowerQuery.includes('suggestion')) {
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
        // Câu hỏi về lịch sử truy vấn
        else if (lowerQuery.includes('history') || lowerQuery.includes('queries') || 
                lowerQuery.includes('recent searches') || lowerQuery.includes('searched')) {
          this.respondWithQueryHistoryEnglish();
        }
        // Câu chào và giới thiệu
        else if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || 
                lowerQuery.includes('hey')) {
          this.addBotMessage(`Hello! I'm your AI weather assistant. I can help you with weather information in ${this.weatherData.location}. What would you like to know?`);
        }
        // Câu hỏi về khả năng của bot
        else if (lowerQuery.includes('what can you do') || lowerQuery.includes('help me with') || 
                lowerQuery.includes('features')) {
          this.respondWithCapabilitiesEnglish();
        }
        // Câu hỏi không rõ ràng
        else {
          this.addBotMessage('I\'m not sure I understand your question. You can ask about current weather, forecast, clothing suggestions, or activities suitable for the weather.');
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
    const { temperature, condition, location, humidity, windSpeed, feelsLike } = this.weatherData;
    let response = `Current weather in ${location}: ${temperature}°C, ${this.translateConditionToEnglish(condition)}. `;
    
    if (feelsLike !== null) {
      response += `Feels like ${feelsLike}°C. `;
    }
    
    if (humidity !== null) {
      response += `Humidity ${humidity}%. `;
    }
    
    if (windSpeed !== null) {
      response += `Wind speed ${windSpeed} m/s.`;
    }
    
    this.addBotMessage(response);
    this.speakText(response);
  }

  /**
   * Trả lời về nhiệt độ bằng tiếng Anh
   */
  respondWithTemperatureEnglish() {
    const { temperature, feelsLike, location } = this.weatherData;
    let response = `Current temperature in ${location} is ${temperature}°C. `;
    
    if (feelsLike !== null) {
      response += `Feels like ${feelsLike}°C. `;
    }
    
    if (temperature > 30) {
      response += 'It\'s quite hot, make sure to stay hydrated and avoid going outside during peak hours.';
    } else if (temperature < 15) {
      response += 'It\'s quite cold, make sure to dress warmly when going outside.';
    } else {
      response += 'The temperature is comfortable.';
    }
    
    this.addBotMessage(response);
    this.speakText(response);
  }

  /**
   * Trả lời về điều kiện thời tiết bằng tiếng Anh
   */
  respondWithWeatherConditionEnglish() {
    const { condition, location } = this.weatherData;
    const englishCondition = this.translateConditionToEnglish(condition);
    let response = `Current weather condition in ${location}: ${englishCondition}. `;
    
    // Thêm mô tả chi tiết dựa trên điều kiện
    if (englishCondition) {
      const lowerCondition = englishCondition.toLowerCase();
      if (lowerCondition.includes('rain')) {
        response += 'You should bring an umbrella or raincoat when going outside.';
      } else if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
        response += 'Great weather to go outside, but don\'t forget to apply sunscreen.';
      } else if (lowerCondition.includes('cloud')) {
        response += 'The weather is quite pleasant, suitable for outdoor activities.';
      } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
        response += 'Visibility may be limited, be careful when driving.';
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
    
    const conditionMap = {
      'mưa': 'rain',
      'mưa nhẹ': 'light rain',
      'mưa vừa': 'moderate rain',
      'mưa to': 'heavy rain',
      'mưa rào': 'showers',
      'nắng': 'sunny',
      'quang': 'clear',
      'quang đãng': 'clear',
      'mây': 'cloudy',
      'nhiều mây': 'mostly cloudy',
      'ít mây': 'partly cloudy',
      'sương mù': 'foggy',
      'sương': 'mist',
      'dông': 'thunderstorm',
      'tuyết': 'snow',
      'mưa đá': 'hail'
    };
    
    const lowerCondition = condition.toLowerCase();
    
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
    this.addBotMessage('I\'m sorry, but detailed forecast information is not available in this version. You can check the forecast section on the main page for more information about upcoming weather.');
    this.speakText('Detailed forecast information is not available in this version.');
  }
  
  /**
   * Trả lời về vị trí bằng tiếng Anh
   */
  respondWithLocationEnglish() {
    const { location } = this.weatherData;
    const response = `You are currently viewing weather information for ${location}.`;
    this.addBotMessage(response);
    this.speakText(response);
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