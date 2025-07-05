/**
 * Chatbot API Routes
 * 
 * This file defines the API routes for the AI chatbot functionality.
 * Includes rate limiting and improved error handling.
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Cấu hình rate limiting để ngăn chặn tấn công brute force
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Giới hạn mỗi IP chỉ được gọi 100 request trong 15 phút
    standardHeaders: true, // Trả về thông tin rate limit trong header `RateLimit-*`
    legacyHeaders: false, // Tắt header `X-RateLimit-*`
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút'
    },
    skip: (req) => req.isAuthenticated() // Bỏ qua rate limit cho người dùng đã đăng nhập
});

// Middleware để xác thực người dùng (tùy chọn)
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // Nếu không xác thực, vẫn cho phép truy cập nhưng không có thông tin người dùng
    return next();
};

// Middleware để ghi log các request
const logRequest = (req, res, next) => {
    const { query, language, weatherData } = req.body;
    const userIP = req.ip || req.connection.remoteAddress;
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] Chatbot API Request - IP: ${userIP}, Language: ${language}, Query: "${query}", Location: ${weatherData?.location || 'N/A'}`);
    next();
};

/**
 * @route POST /api/chatbot/query
 * @desc Process user query and return chatbot response
 * @access Public
 */
router.post('/query', isAuthenticated, apiLimiter, logRequest, async (req, res) => {
    try {
        const { query, language = 'vi', weatherData } = req.body;
        
        // Kiểm tra và xác thực đầu vào
        if (!query) {
            return res.status(400).json({ 
                success: false, 
                message: language === 'en' ? 'Query is required' : 'Câu hỏi không được để trống' 
            });
        }

        if (!weatherData) {
            console.warn('Weather data not provided in chatbot request');
            response = language === 'en'
                ? 'I cannot find current weather data. Please search for a city first.'
                : 'Tôi không thể tìm thấy dữ liệu thời tiết hiện tại. Vui lòng tìm kiếm một thành phố trước.';
            return res.json({ success: true, response });
        }

        // Xử lý câu hỏi và tạo câu trả lời
        let response = '';
        const lowerQuery = query.toLowerCase();

        // Xử lý câu hỏi dựa trên ngôn ngữ
        if (language === 'en') {
            // Xử lý câu hỏi tiếng Anh
            if (lowerQuery.includes('temperature') || lowerQuery.includes('how hot') || lowerQuery.includes('how cold')) {
                response = `The current temperature is ${weatherData.temperature}°C.`;
            } else if (lowerQuery.includes('weather') || lowerQuery.includes('condition')) {
                response = `The current weather condition is ${weatherData.condition}.`;
            } else if (lowerQuery.includes('humidity')) {
                response = `The current humidity is ${weatherData.humidity}%.`;
            } else if (lowerQuery.includes('wind')) {
                response = `The current wind speed is ${weatherData.windSpeed} km/h.`;
            } else if (lowerQuery.includes('location') || lowerQuery.includes('where')) {
                response = `You are currently viewing weather information for ${weatherData.location}.`;
            } else if (lowerQuery.includes('activity') || lowerQuery.includes('suggest') || lowerQuery.includes('what to do')) {
                // Gợi ý hoạt động dựa trên thời tiết
                response = getActivitySuggestions(weatherData, 'en');
            } else {
                response = `I'm sorry, I don't understand your question. You can ask me about the current temperature, weather condition, humidity, wind speed, or ask for activity suggestions.`;
            }
        } else {
            // Xử lý câu hỏi tiếng Việt
            if (lowerQuery.includes('nhiệt độ') || lowerQuery.includes('nóng') || lowerQuery.includes('lạnh')) {
                response = `Nhiệt độ hiện tại là ${weatherData.temperature}°C.`;
            } else if (lowerQuery.includes('thời tiết') || lowerQuery.includes('trời')) {
                response = `Thời tiết hiện tại là ${weatherData.condition}.`;
            } else if (lowerQuery.includes('độ ẩm')) {
                response = `Độ ẩm hiện tại là ${weatherData.humidity}%.`;
            } else if (lowerQuery.includes('gió')) {
                response = `Tốc độ gió hiện tại là ${weatherData.windSpeed} km/h.`;
            } else if (lowerQuery.includes('vị trí') || lowerQuery.includes('ở đâu')) {
                response = `Hiện tại bạn đang xem thông tin thời tiết của ${weatherData.location}.`;
            } else if (lowerQuery.includes('hoạt động') || lowerQuery.includes('gợi ý') || lowerQuery.includes('nên làm gì')) {
                // Gợi ý hoạt động dựa trên thời tiết
                response = getActivitySuggestions(weatherData, 'vi');
            } else {
                response = `Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi tôi về nhiệt độ hiện tại, tình trạng thời tiết, độ ẩm, tốc độ gió, hoặc yêu cầu gợi ý hoạt động.`;
            }
        }

        // Ghi log câu trả lời
        console.log(`[${new Date().toISOString()}] Chatbot response generated: "${response.substring(0, 50)}..."`);

        // Lưu lịch sử trò chuyện nếu người dùng đã đăng nhập
        if (req.isAuthenticated()) {
            try {
                // TODO: Lưu lịch sử trò chuyện vào cơ sở dữ liệu
                // Có thể triển khai sau khi có model ChatHistory
            } catch (dbError) {
                console.error('Lỗi khi lưu lịch sử trò chuyện:', dbError);
                // Không trả về lỗi cho người dùng vì đây chỉ là chức năng phụ
            }
        }

        return res.json({ 
            success: true, 
            response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Lỗi khi xử lý câu hỏi chatbot:', error);
        
        // Phân loại lỗi để trả về thông báo phù hợp
        const errorMessage = error.message || 'Unknown error';
        const statusCode = error.statusCode || 500;
        
        // Thông báo lỗi theo ngôn ngữ
        const language = req.body.language || 'en';
        const userMessage = language === 'en' 
            ? 'An error occurred while processing your question' 
            : 'Đã xảy ra lỗi khi xử lý câu hỏi của bạn';
        
        return res.status(statusCode).json({ 
            success: false, 
            message: userMessage,
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});

/**
 * Hàm gợi ý hoạt động dựa trên thời tiết
 * @param {Object} weatherData - Dữ liệu thời tiết
 * @param {string} language - Ngôn ngữ ('en' hoặc 'vi')
 * @returns {string} - Câu trả lời gợi ý hoạt động
 */
function getActivitySuggestions(weatherData, language) {
    const { temperature, condition, windSpeed } = weatherData;
    
    if (language === 'en') {
        let response = 'Based on the current weather, here are some activity suggestions:\n\n';
        
        // Gợi ý dựa trên nhiệt độ
        if (temperature > 30) {
            response += '- It\'s very hot! Consider indoor activities with air conditioning.\n';
            response += '- If you go outside, remember to wear sunscreen and a hat.\n';
            response += '- Stay hydrated and avoid strenuous activities during peak sun hours.\n';
        } else if (temperature > 25) {
            response += '- The weather is warm and pleasant for outdoor activities.\n';
            response += '- Good time for swimming, beach visits, or park picnics.\n';
            response += '- Remember to stay hydrated and use sun protection.\n';
        } else if (temperature > 15) {
            response += '- The temperature is comfortable for most outdoor activities.\n';
            response += '- Great for hiking, cycling, or outdoor sports.\n';
            response += '- Light clothing should be sufficient.\n';
        } else if (temperature > 5) {
            response += '- It\'s a bit cool, consider wearing a light jacket or sweater.\n';
            response += '- Good for walking, jogging, or outdoor cafes.\n';
            response += '- Indoor activities are also comfortable.\n';
        } else {
            response += '- It\'s cold! Bundle up with warm clothing if going outside.\n';
            response += '- Indoor activities might be more comfortable.\n';
            response += '- Hot drinks and warm food are recommended.\n';
        }
        
        // Gợi ý dựa trên điều kiện thời tiết
        if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('shower')) {
            response += '\nSince it\'s rainy:\n';
            response += '- Bring an umbrella or raincoat if going outside.\n';
            response += '- Indoor activities like museums, shopping malls, or cafes are recommended.\n';
            response += '- Be careful of slippery roads if driving.\n';
        } else if (condition.toLowerCase().includes('cloud')) {
            response += '\nWith cloudy conditions:\n';
            response += '- UV exposure is reduced, but sun protection is still recommended.\n';
            response += '- Good conditions for photography or sightseeing.\n';
        } else if (condition.toLowerCase().includes('sun') || condition.toLowerCase().includes('clear')) {
            response += '\nWith sunny conditions:\n';
            response += '- Use sun protection (sunscreen, sunglasses, hat).\n';
            response += '- Find shade during peak sun hours.\n';
            response += '- Outdoor activities are highly enjoyable.\n';
        }
        
        // Gợi ý dựa trên tốc độ gió
        if (windSpeed > 30) {
            response += '\nNote: Wind speeds are high. Be cautious with outdoor activities, especially near trees or unsecured objects.\n';
        }
        
        return response;
    } else {
        // Tiếng Việt
        let response = 'Dựa vào thời tiết hiện tại, tôi gợi ý: \n\n';
        
        // Gợi ý dựa trên nhiệt độ
        if (temperature > 30) {
            response += '- Trời rất nóng! Nên tham gia các hoạt động trong nhà có máy lạnh.\n';
            response += '- Nếu ra ngoài, nhớ bôi kem chống nắng và đội mũ.\n';
            response += '- Uống đủ nước và tránh hoạt động gắng sức trong giờ nắng cao điểm.\n';
        } else if (temperature > 25) {
            response += '- Thời tiết ấm áp và dễ chịu cho các hoạt động ngoài trời.\n';
            response += '- Thời điểm tốt để bơi lội, đi biển hoặc dã ngoại trong công viên.\n';
            response += '- Nhớ uống đủ nước và sử dụng đồ bảo vệ nắng.\n';
        } else if (temperature > 15) {
            response += '- Nhiệt độ dễ chịu cho hầu hết các hoạt động ngoài trời.\n';
            response += '- Tuyệt vời để đi bộ đường dài, đạp xe hoặc chơi thể thao ngoài trời.\n';
            response += '- Quần áo nhẹ là đủ.\n';
        } else if (temperature > 5) {
            response += '- Hơi se lạnh, nên mặc áo khoác nhẹ hoặc áo len.\n';
            response += '- Thích hợp để đi bộ, chạy bộ hoặc ngồi quán cà phê ngoài trời.\n';
            response += '- Các hoạt động trong nhà cũng rất thoải mái.\n';
        } else {
            response += '- Trời lạnh! Mặc quần áo ấm nếu ra ngoài.\n';
            response += '- Các hoạt động trong nhà có thể thoải mái hơn.\n';
            response += '- Nên uống đồ uống nóng và ăn thức ăn ấm.\n';
        }
        
        // Gợi ý dựa trên điều kiện thời tiết
        if (condition.toLowerCase().includes('mưa') || condition.toLowerCase().includes('rào')) {
            response += '\nVì trời đang mưa:\n';
            response += '- Mang theo ô hoặc áo mưa nếu ra ngoài.\n';
            response += '- Các hoạt động trong nhà như bảo tàng, trung tâm mua sắm hoặc quán cà phê được khuyến nghị.\n';
            response += '- Cẩn thận với đường trơn nếu lái xe.\n';
        } else if (condition.toLowerCase().includes('mây')) {
            response += '\nVới điều kiện nhiều mây:\n';
            response += '- Tiếp xúc tia UV giảm, nhưng vẫn nên bảo vệ khỏi ánh nắng.\n';
            response += '- Điều kiện tốt để chụp ảnh hoặc tham quan.\n';
        } else if (condition.toLowerCase().includes('nắng') || condition.toLowerCase().includes('quang')) {
            response += '\nVới điều kiện nắng:\n';
            response += '- Sử dụng đồ bảo vệ nắng (kem chống nắng, kính râm, mũ).\n';
            response += '- Tìm bóng râm trong giờ nắng cao điểm.\n';
            response += '- Các hoạt động ngoài trời rất thú vị.\n';
        }
        
        // Gợi ý dựa trên tốc độ gió
        if (windSpeed > 30) {
            response += '\nLưu ý: Tốc độ gió cao. Hãy thận trọng với các hoạt động ngoài trời, đặc biệt là gần cây cối hoặc vật dụng không được cố định.\n';
        }
        
        return response;
    }
}

module.exports = router;