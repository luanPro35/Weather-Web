const API_KEY = "037b6dda3ea6bd588dd48b35ae88f478"; // Thay bằng API key của bạn
      const DEFAULT_CITY = "Da Nang";

      // Weather icons mapping
      const weatherIcons = {
        "01d": "☀️",
        "01n": "🌙",
        "02d": "⛅",
        "02n": "☁️",
        "03d": "☁️",
        "03n": "☁️",
        "04d": "☁️",
        "04n": "☁️",
        "09d": "🌧️",
        "09n": "🌧️",
        "10d": "🌦️",
        "10n": "🌧️",
        "11d": "⛈️",
        "11n": "⛈️",
        "13d": "❄️",
        "13n": "❄️",
        "50d": "🌫️",
        "50n": "🌫️",
      };

      // Navigation functions
      function toggleMobileMenu() {
        const navMenu = document.getElementById("navMenu");
        navMenu.classList.toggle("active");
      }

      function showSection(sectionName, navLinkElement) {
        // Hide all sections
        const sections = document.querySelectorAll(".section");
        sections.forEach((section) => {
          section.style.display = "none";
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName + "Section");
        if (targetSection) {
            targetSection.style.display = "block";
        } else {
            // Nếu bạn đang ở trang khác (ví dụ dubao.html) và gọi showSection từ trang đó,
            // section có thể không tồn tại. Điều này là bình thường nếu hàm này được dùng chung.
            console.warn(`Section with ID '${sectionName}Section' not found on the current page.`);
        }

        // Update active nav link
        const navLinks = document.querySelectorAll(".nav-link");
        navLinks.forEach((link) => {
          link.classList.remove("active");
        });
        if (navLinkElement) { // Chỉ thêm class active nếu navLinkElement được cung cấp
            navLinkElement.classList.add("active");
        }

        // Close mobile menu
        const mobileMenu = document.getElementById("navMenu");
        if (mobileMenu) {
            mobileMenu.classList.remove("active");
        }
      }

      // Smart suggestions based on weather
      function getWeatherSuggestions(weather, temp, humidity, windSpeed) {
        const suggestions = [];
        const condition = weather.toLowerCase();

        // Temperature based suggestions
        if (temp <= 10) {
          suggestions.push({ icon: "🧥", text: "Mặc áo ấm, trời lạnh!" });
          suggestions.push({ icon: "🧤", text: "Đeo găng tay để giữ ấm tay" });
        } else if (temp >= 30) {
          suggestions.push({ icon: "🌡️", text: "Trời nóng, uống nhiều nước!" });
          suggestions.push({ icon: "👕", text: "Mặc quần áo mát mẻ" });
        }

        // Weather condition suggestions
        if (condition.includes("rain") || condition.includes("shower")) {
          suggestions.push({ icon: "☔", text: "Mang theo ô hoặc áo mưa" });
          suggestions.push({ icon: "👢", text: "Đi giày chống nước" });
        }

        if (condition.includes("snow")) {
          suggestions.push({ icon: "❄️", text: "Mang găng tay và mũ ấm" });
          suggestions.push({ icon: "🧣", text: "Quàng khăn giữ ấm" });
        }

        if (condition.includes("thunderstorm")) {
          suggestions.push({ icon: "⛈️", text: "Tránh ra ngoài nếu có thể" });
          suggestions.push({ icon: "🏠", text: "Ở trong nhà để an toàn" });
        }

        // Humidity based suggestions
        if (humidity > 80) {
          suggestions.push({
            icon: "💧",
            text: "Độ ẩm cao, cẩn thận với đồ điện tử",
          });
        }

        // Wind speed based suggestions
        if (windSpeed > 20) {
          suggestions.push({
            icon: "🌪️",
            text: "Gió mạnh, cẩn thận khi ra ngoài",
          });
        }

        return suggestions;
      }

      // Format timestamp to readable date
      function formatDateTime(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      /**
       * Cập nhật hình nền của body dựa trên dữ liệu thời tiết.
       * @param {object} weatherData - Dữ liệu thời tiết từ API.
       */
      function setDynamicBackground(weatherData) {
        const body = document.body;
        // Danh sách tất cả các lớp CSS thời tiết có thể có trên body
        const existingWeatherClasses = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'clear-night', 'misty', 'hot'];

        // 1. Xóa tất cả các lớp thời tiết hiện có khỏi body
        existingWeatherClasses.forEach(cls => {
            if (body.classList.contains(cls)) {
                body.classList.remove(cls);
            }
        });

        // 2. Xác định lớp CSS thời tiết mới dựa trên dữ liệu API
        let newWeatherClass = '';

        if (!weatherData || !weatherData.weather || !weatherData.weather[0] || !weatherData.main) {
            console.warn("Dữ liệu thời tiết không đủ để xác định hình nền. Sử dụng nền mặc định.");
            // Body sẽ tự động sử dụng nền mặc định vì không có class nào được thêm
            return;
        }

        const condition = weatherData.weather[0].main.toLowerCase(); // Ví dụ: "clear", "clouds", "rain"
        const icon = weatherData.weather[0].icon; // Ví dụ: "01d" (ngày), "01n" (đêm)
        const tempCelsius = weatherData.main.temp; // API trả về Celsius do 'units=metric'

        // Ưu tiên kiểm tra ban đêm trước dựa vào icon từ API
        if (icon && icon.endsWith('n')) { // Kiểm tra nếu là ban đêm
            if (condition.includes('clear')) newWeatherClass = 'clear-night';
            else if (condition.includes('cloud')) newWeatherClass = 'cloudy'; // Có thể tạo 'cloudy-night'
            else if (condition.includes('rain') || condition.includes('drizzle')) newWeatherClass = 'rainy';
            else if (condition.includes('snow')) newWeatherClass = 'snowy';
            else if (condition.includes('thunderstorm')) newWeatherClass = 'stormy';
            else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze') || condition.includes('smoke') || condition.includes('sand') || condition.includes('dust') || condition.includes('ash') || condition.includes('squall') || condition.includes('tornado')) newWeatherClass = 'misty';
            else newWeatherClass = 'clear-night'; // Mặc định cho các điều kiện ban đêm khác
        } else { // Ban ngày
            if (tempCelsius > 33) newWeatherClass = 'hot'; // Ngưỡng nhiệt độ cho 'hot'
            else if (condition.includes('clear')) newWeatherClass = 'sunny';
            else if (condition.includes('cloud')) newWeatherClass = 'cloudy';
            else if (condition.includes('rain') || condition.includes('drizzle')) newWeatherClass = 'rainy';
            else if (condition.includes('snow')) newWeatherClass = 'snowy';
            else if (condition.includes('thunderstorm')) newWeatherClass = 'stormy';
            else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze') || condition.includes('smoke') || condition.includes('sand') || condition.includes('dust') || condition.includes('ash') || condition.includes('squall') || condition.includes('tornado')) newWeatherClass = 'misty';
            else newWeatherClass = 'sunny'; // Mặc định cho các điều kiện ban ngày khác
        }

        // 3. Thêm lớp CSS thời tiết mới vào body
        if (newWeatherClass) {
            body.classList.add(newWeatherClass);
            console.log(`Applied background class: ${newWeatherClass}`);
        } else {
            // Nếu không có lớp nào phù hợp, body sẽ sử dụng nền mặc định đã khai báo trong CSS
            console.log("No specific weather class applied, using default body background.");
        }
      }


      // Update weather UI
      function updateWeatherUI(data) {
        const weatherContent = document.getElementById("weatherContent");
        const weather = data.weather[0];
        const temp = Math.round(data.main.temp);
        const suggestions = getWeatherSuggestions(
          weather.description,
          temp,
          data.main.humidity,
          data.wind.speed
        );

        // Cập nhật nền động
        setDynamicBackground(data);

        const html = `
          <div class="weather-card">
            <div class="current-weather">
              <div class="weather-main">
                <div class="location">
                  📍 ${data.name}, ${data.sys.country}
                </div>
                <div class="datetime">${formatDateTime(data.dt)}</div>
                <div class="temperature">${temp}°C</div>
                <div class="description">${weather.description}</div>
                <div class="feels-like">Cảm giác như ${Math.round(
                  data.main.feels_like
                )}°C</div>
              </div>
              <div class="weather-icon-container">
                <div class="weather-icon">${
                  weatherIcons[weather.icon] || "🌤️"
                }</div>
              </div>
            </div>
            
            <div class="weather-details">
              <div class="detail-item">
                <span class="detail-icon">💧</span>
                <div class="detail-label">Độ ẩm</div>
                <div class="detail-value">${data.main.humidity}%</div>
              </div>
              <div class="detail-item">
                <span class="detail-icon">💨</span>
                <div class="detail-label">Tốc độ gió</div>
                <div class="detail-value">${Math.round(
                  data.wind.speed
                )} m/s</div>
              </div>
              <div class="detail-item">
                <span class="detail-icon">🌡️</span>
                <div class="detail-label">Áp suất</div>
                <div class="detail-value">${data.main.pressure} hPa</div>
              </div>
            </div>

            <div class="suggestions">
              <h2 class="suggestions-title">Gợi ý cho bạn</h2>
              <div class="suggestions-grid">
                ${suggestions
                  .map(
                    (suggestion) => `
                  <div class="suggestion-item">
                    <span class="suggestion-icon">${suggestion.icon}</span>
                    <div class="suggestion-text">${suggestion.text}</div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        `;

        weatherContent.innerHTML = html;
      }

      // Fetch weather data
      async function getWeather(city) {
        const weatherContent = document.getElementById("weatherContent");
        weatherContent.innerHTML = `
          <div class="loading">
            <div class="loading-spinner"></div>
            <p>Đang tải thông tin thời tiết...</p>
          </div>
        `;

        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=vi&appid=${API_KEY}`
          );

          if (!response.ok) {
            throw new Error("Không tìm thấy thành phố");
          }

          const data = await response.json();
          updateWeatherUI(data);
        } catch (error) {
          weatherContent.innerHTML = `
            <div class="error">
              <h2>❌ Lỗi</h2>
              <p>${error.message}</p>
            </div>
          `;
          // Đặt lại nền về mặc định nếu có lỗi
          setDynamicBackground(null);
        }
      }

      // Event listeners
      document.addEventListener("DOMContentLoaded", () => {
        getWeather(DEFAULT_CITY);

        // Set active link for current page
        const homeNavLink = Array.from(document.querySelectorAll('.nav-link')).find(link => link.href.includes('trangchu.html') || link.textContent.trim() === 'Trang chủ');
        if (homeNavLink) showSection('home', homeNavLink);


        const cityInput = document.getElementById("cityInput");
        cityInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter" && cityInput.value.trim()) {
            getWeather(cityInput.value.trim());
          }
        });

        // Temperature unit toggle
        const tempUnitToggle = document.getElementById("tempUnitToggle");
        tempUnitToggle.addEventListener("change", () => {
          const isFahrenheit = tempUnitToggle.checked;
          // Convert all temperature displays
          const temps = document.querySelectorAll(".temperature");
          temps.forEach((temp) => {
            const currentTemp = parseFloat(temp.textContent);
            if (isFahrenheit) {
              temp.textContent = `${Math.round((currentTemp * 9) / 5 + 32)}°F`;
            } else {
              temp.textContent = `${Math.round(
                ((currentTemp - 32) * 5) / 9
              )}°C`;
            }
          });
        });

        // Language selection
        const languageSelect = document.getElementById("languageSelect");
        languageSelect.addEventListener("change", (e) => {
          const lang = e.target.value;
          // Implement language change logic here
          // You'll need to store translations and update UI text
        });
      });