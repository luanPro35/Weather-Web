const API_KEY = "037b6dda3ea6bd588dd48b35ae88f478"; // Thay bằng API key của bạn
      const DEFAULT_CITY = "Da Nang"; // Fallback default city
      
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
        if (!weatherContent) {
            console.error("Element with ID 'weatherContent' not found.");
            return;
        }
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

      // Bộ chuyển đổi tên Tỉnh sang Thành phố để API dễ nhận dạng hơn
      // Bao gồm tất cả 63 tỉnh thành và các tên gọi phổ biến.
      const provinceToCityMap = {
        // Miền Bắc
        'hà giang': 'Hà Giang', 'ha giang': 'Hà Giang',
        'cao bằng': 'Cao Bằng', 'cao bang': 'Cao Bằng',
        'bắc kạn': 'Bắc Kạn', 'bac kan': 'Bắc Kạn',
        'lạng sơn': 'Lạng Sơn', 'lang son': 'Lạng Sơn',
        'tuyên quang': 'Tuyên Quang', 'tuyen quang': 'Tuyên Quang',
        'thái nguyên': 'Thái Nguyên', 'thai nguyen': 'Thái Nguyên',
        'phú thọ': 'Việt Trì', 'phu tho': 'Việt Trì',
        'bắc giang': 'Bắc Giang', 'bac giang': 'Bắc Giang',
        'quảng ninh': 'Hạ Long', 'quang ninh': 'Hạ Long',
        'lào cai': 'Lào Cai', 'lao cai': 'Lào Cai',
        'yên bái': 'Yên Bái', 'yen bai': 'Yên Bái',
        'điện biên': 'Điện Biên Phủ', 'dien bien': 'Điện Biên Phủ',
        'hòa bình': 'Hòa Bình', 'hoa binh': 'Hòa Bình',
        'lai châu': 'Lai Châu', 'lai chau': 'Lai Châu',
        'sơn la': 'Sơn La', 'son la': 'Sơn La',
        'bắc ninh': 'Bắc Ninh', 'bac ninh': 'Bắc Ninh',
        'hà nam': 'Phủ Lý', 'ha nam': 'Phủ Lý',
        'hải dương': 'Hải Dương', 'hai duong': 'Hải Dương',
        'hưng yên': 'Hưng Yên', 'hung yen': 'Hưng Yên',
        'nam định': 'Nam Định', 'nam dinh': 'Nam Định',
        'ninh bình': 'Ninh Bình', 'ninh binh': 'Ninh Bình',
        'thái bình': 'Thái Bình', 'thai binh': 'Thái Bình',
        'vĩnh phúc': 'Vĩnh Yên', 'vinh phuc': 'Vĩnh Yên',
        'hà nội': 'Hà Nội', 'ha noi': 'Hà Nội',
        'hải phòng': 'Hải Phòng', 'hai phong': 'Hải Phòng',
    
        // Miền Trung
        'thanh hóa': 'Thanh Hóa', 'thanh hoa': 'Thanh Hóa',
        'nghệ an': 'Vinh', 'nghe an': 'Vinh',
        'hà tĩnh': 'Hà Tĩnh', 'ha tinh': 'Hà Tĩnh',
        'quảng bình': 'Đồng Hới', 'quang binh': 'Đồng Hới',
        'quảng trị': 'Đông Hà', 'quang tri': 'Đông Hà',
        'thừa thiên huế': 'Huế', 'thua thien hue': 'Huế',
        'đà nẵng': 'Đà Nẵng', 'da nang': 'Đà Nẵng',
        'quảng nam': 'Tam Kỳ', 'quang nam': 'Tam Kỳ',
        'quảng ngãi': 'Quảng Ngãi', 'quang ngai': 'Quảng Ngãi',
        'bình định': 'Quy Nhơn', 'binh dinh': 'Quy Nhơn',
        'phú yên': 'Tuy Hòa', 'phu yen': 'Tuy Hòa',
        'khánh hòa': 'Nha Trang', 'khanh hoa': 'Nha Trang',
        'ninh thuận': 'Phan Rang-Tháp Chàm', 'ninh thuan': 'Phan Rang-Tháp Chàm', 'phan rang': 'Phan Rang-Tháp Chàm',
        'bình thuận': 'Phan Thiết', 'binh thuan': 'Phan Thiết',
        'kon tum': 'Kon Tum',
        'gia lai': 'Pleiku',
        'đắk lắk': 'Buôn Ma Thuột', 'dak lak': 'Buôn Ma Thuột', 'bmt': 'Buôn Ma Thuột',
        'đắk nông': 'Gia Nghĩa', 'dak nong': 'Gia Nghĩa',
        'lâm đồng': 'Đà Lạt', 'lam dong': 'Đà Lạt',
    
        // Miền Nam
        'bình phước': 'Đồng Xoài', 'binh phuoc': 'Đồng Xoài',
        'bình dương': 'Thủ Dầu Một', 'binh duong': 'Thủ Dầu Một',
        'đồng nai': 'Biên Hòa', 'dong nai': 'Biên Hòa',
        'tây ninh': 'Tây Ninh', 'tay ninh': 'Tây Ninh',
        'bà rịa vũng tàu': 'Vũng Tàu',
        'ba ria vung tau': 'Vũng Tàu',
        'brvt': 'Vũng Tàu',
        'hồ chí minh': 'Ho Chi Minh City', 'ho chi minh city': 'Ho Chi Minh City', 'hcm': 'Ho Chi Minh City', 'tp hcm': 'Ho Chi Minh City', 'sài gòn': 'Ho Chi Minh City', 'sai gon': 'Ho Chi Minh City',
        'long an': 'Tân An',
        'đồng tháp': 'Cao Lãnh', 'dong thap': 'Cao Lãnh',
        'tiền giang': 'Mỹ Tho', 'tien giang': 'Mỹ Tho',
        'an giang': 'Long Xuyên',
        'bến tre': 'Bến Tre', 'ben tre': 'Bến Tre',
        'vĩnh long': 'Vĩnh Long', 'vinh long': 'Vĩnh Long',
        'trà vinh': 'Trà Vinh', 'tra vinh': 'Trà Vinh',
        'hậu giang': 'Vị Thanh', 'hau giang': 'Vị Thanh',
        'kiên giang': 'Rạch Giá', 'kien giang': 'Rạch Giá',
        'sóc trăng': 'Sóc Trăng', 'soc trang': 'Sóc Trăng',
        'bạc liêu': 'Bạc Liêu', 'bac lieu': 'Bạc Liêu',
        'cà mau': 'Cà Mau', 'ca mau': 'Cà Mau',
        'cần thơ': 'Cần Thơ', 'can tho': 'Cần Thơ'
      };

      // Fetch weather data
      async function getWeather(city) {
        const weatherContent = document.getElementById("weatherContent");
        if (!weatherContent) {
            console.error("Element with ID 'weatherContent' not found. Cannot display loading or weather info.");
            return;
        }
        weatherContent.innerHTML = `
          <div class="loading">
            <div class="loading-spinner"></div>
            <p>Đang tải thông tin thời tiết...</p>
          </div>
        `;

        // Chuyển đổi tên tỉnh thành thành phố nếu có trong bản đồ
        let searchCity = city.toLowerCase().trim();
        const mappedCity = provinceToCityMap[searchCity];
        if (mappedCity) {
            console.log(`Ánh xạ "${city}" sang "${mappedCity}" để gọi API.`);
            searchCity = mappedCity;
        }

        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(searchCity)}&units=metric&lang=vi&appid=${API_KEY}`
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

      // New function to get city name from coordinates using OpenWeatherMap Geocoding API
      async function getCityFromCoordinates(lat, lon, apiKey) {
          try {
              const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
              if (!response.ok) {
                  console.error("Failed to reverse geocode coordinates.");
                  return null;
              }
              const data = await response.json();
              if (data && data.length > 0) {
                  return data[0].name; // Return the city name
              }
              return null;
          } catch (error) {
              console.error("Error during reverse geocoding:", error);
              return null;
          }
      }

      // Function to get user's current location and fetch weather
      async function loadWeatherBasedOnLocation(defaultCity, apiKey, weatherFetchFunction) {
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(async (position) => {
                  const lat = position.coords.latitude;
                  const lon = position.coords.longitude;
                  const cityName = await getCityFromCoordinates(lat, lon, apiKey);
                  if (cityName) {
                      console.log(`Detected location: ${cityName}. Fetching weather.`);
                      weatherFetchFunction(cityName);
                  } else {
                      console.warn(`Could not determine city from coordinates. Falling back to ${defaultCity}.`);
                      weatherFetchFunction(defaultCity);
                  }
              }, (error) => {
                  console.warn(`Geolocation failed: ${error.message}. Falling back to ${defaultCity}.`);
                  weatherFetchFunction(defaultCity);
              }, { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 });
          } else {
              console.warn(`Geolocation is not supported by this browser. Falling back to ${defaultCity}.`);
              weatherFetchFunction(defaultCity);
          }
      }

      // Event listeners
      document.addEventListener("DOMContentLoaded", () => {
        loadWeatherBasedOnLocation(DEFAULT_CITY, API_KEY, getWeather);

        // Set active link for current page based on URL
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.href.includes(currentPath.split('/').pop())) { // Compare last part of path
                link.classList.add('active');
            }
        });

        const cityInput = document.getElementById("cityInput");
        const searchIcon = document.querySelector(".search-icon"); // Lấy icon tìm kiếm

        // Hàm xử lý tìm kiếm để tránh lặp code
        function handleSearch() {
            if (cityInput && cityInput.value.trim()) {
                getWeather(cityInput.value.trim());
            }
        }

        if (cityInput) {
            cityInput.addEventListener("keypress", (e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            });
        } else {
            console.warn("Element with ID 'cityInput' not found.");
        }

        if (searchIcon) {
            searchIcon.addEventListener("click", handleSearch);
        }

        // Temperature unit toggle
        const tempUnitToggle = document.getElementById("tempUnitToggle");
        if (tempUnitToggle) {
            tempUnitToggle.addEventListener("change", () => {
              const isFahrenheit = tempUnitToggle.checked;
              // Convert all temperature displays
              const temps = document.querySelectorAll(".temperature, .feels-like"); // Thêm .feels-like nếu muốn đổi cả nó
              temps.forEach((tempElement) => {
                // Cần trích xuất số từ chuỗi phức tạp hơn nếu có cả text, ví dụ "Cảm giác như 20°C"
                const tempText = tempElement.textContent;
                const currentTempMatch = tempText.match(/-?\d+(\.\d+)?/); // Trích xuất số
                if (currentTempMatch) {
                    const currentTemp = parseFloat(currentTempMatch[0]);
                    let newTempText;
                    if (isFahrenheit) {
                      newTempText = `${Math.round((currentTemp * 9) / 5 + 32)}°F`;
                    } else {
                      newTempText = `${Math.round(((currentTemp - 32) * 5) / 9)}°C`;
                    }
                    // Cập nhật lại, giữ nguyên phần text nếu có (ví dụ "Cảm giác như ")
                    if (tempElement.classList.contains('feels-like')) {
                        tempElement.textContent = `Cảm giác như ${newTempText}`;
                    } else {
                        tempElement.textContent = newTempText;
                    }
                }
              });
            });
        } else {
            console.warn("Element with ID 'tempUnitToggle' not found.");
        }

        // Language selection
        const languageSelect = document.getElementById("languageSelect");
        if (languageSelect) {
            languageSelect.addEventListener("change", (e) => {
              const lang = e.target.value;
              // Implement language change logic here
              console.log(`Language selected: ${lang}. Implement I18N.`);
            });
        } else {
            console.warn("Element with ID 'languageSelect' not found.");
        }
      });
      const loginTriggerLink = document.getElementById("loginTriggerLink");
      const loginModalElement = document.getElementById("loginModal");
      const closeModalButton = loginModalElement ? loginModalElement.querySelector(".modal-close-button") : null;

      const loginView = document.getElementById('loginView');
      const registerView = document.getElementById('registerView');
      const showRegisterViewLink = document.getElementById('showRegisterViewLink');
      const showLoginViewLink = document.getElementById('showLoginViewLink');

      const loginForm = document.getElementById('loginForm');
      const registerForm = document.getElementById('registerForm');
      const googleLoginButton = document.getElementById('googleLoginButton');

      // Gắn sự kiện mở modal cho liên kết "Đăng nhập"
      if (loginTriggerLink && loginModalElement) {
        loginTriggerLink.addEventListener("click", (event) => {
          event.preventDefault(); // Ngăn hành vi mặc định của thẻ <a>
          loginModalElement.style.display = "flex";
          // Mặc định hiển thị form đăng nhập khi mở modal
          if(loginView) loginView.style.display = 'block';
          if(registerView) registerView.style.display = 'none';
        });
      }

      // Gắn sự kiện đóng modal cho nút "x"
      if (closeModalButton && loginModalElement) {
        closeModalButton.addEventListener("click", () => {
          loginModalElement.style.display = "none";
        });
      }

      // Gắn sự kiện đóng modal khi click ra ngoài nội dung modal
      if (loginModalElement) {
        loginModalElement.addEventListener("click", (event) => {
          // Chỉ đóng modal nếu nhấp vào lớp phủ (overlay) bên ngoài modal-content
          if (event.target === loginModalElement) {
            loginModalElement.style.display = "none";
          }
        });
      }

      // Logic chuyển đổi giữa các form Đăng nhập và Đăng ký
      if (showRegisterViewLink && loginView && registerView) {
        showRegisterViewLink.addEventListener('click', (event) => {
          event.preventDefault();
          loginView.style.display = 'none';
          registerView.style.display = 'block';
        });
      }

      if (showLoginViewLink && loginView && registerView) {
        showLoginViewLink.addEventListener('click', (event) => {
          event.preventDefault();
          registerView.style.display = 'none';
          loginView.style.display = 'block';
        });
      }

      // Xử lý submit form Đăng nhập (hiện tại chỉ là placeholder)
      if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
          event.preventDefault();
          const email = document.getElementById('loginEmail').value;
          // const password = document.getElementById('loginPassword').value; // Lấy mật khẩu nếu cần
          alert(`Đăng nhập với Email: ${email}. (Chức năng đang phát triển)`);
          // Thêm logic xử lý đăng nhập ở đây (gửi dữ liệu đến backend)
          // if (loginModalElement) loginModalElement.style.display = 'none'; // Tùy chọn: đóng modal sau khi submit
        });
      }

      // Xử lý submit form Đăng ký (hiện tại chỉ là placeholder)
      if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
          event.preventDefault();
          const email = document.getElementById('registerEmail').value;
          const password = document.getElementById('registerPassword').value;
          const confirmPassword = document.getElementById('registerConfirmPassword').value;

          if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
          }
          alert(`Đăng ký với Email: ${email}. (Chức năng đang phát triển)`);
          // Thêm logic xử lý đăng ký ở đây (gửi dữ liệu đến backend)
          // if (loginModalElement) loginModalElement.style.display = 'none'; // Tùy chọn: đóng modal sau khi submit
        });
      }

      // Xử lý nút Đăng nhập với Google (hiện tại chỉ là placeholder)
      if (googleLoginButton) {
        googleLoginButton.addEventListener("click", () => {
          console.log('Nút "Đăng nhập với Google" đã được nhấp!');
          alert(
            "Chức năng đăng nhập bằng Google sẽ được tích hợp tại đây. Hiện tại, đây chỉ là giao diện mẫu."
          );
          // if (loginModalElement) loginModalElement.style.display = 'none'; // Tùy chọn: đóng modal sau khi nhấp
        });
      }