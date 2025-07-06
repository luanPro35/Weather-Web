const API_KEY = "037b6dda3ea6bd588dd48b35ae88f478"; // Thay bằng API key của bạn
      // Thiết lập API_KEY toàn cục để các file khác có thể sử dụng
      window.API_KEY = API_KEY;
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
        const existingWeatherClasses = ['sunny', 'cloudy', 'overcast', 'rainy', 'snowy', 'stormy', 'clear-night', 'cloudy-night', 'overcast-night', 'misty', 'hot'];

        // 1. Xóa tất cả các lớp thời tiết hiện có khỏi body
        existingWeatherClasses.forEach(cls => {
            if (body.classList.contains(cls)) {
                body.classList.remove(cls);
            }
        });

        // 2. Xác định lớp CSS thời tiết mới dựa trên dữ liệu API
        let newWeatherClass = ''; // Default to empty, so body's default CSS background applies if no match

        if (!weatherData || !weatherData.weather || !weatherData.weather[0] || !weatherData.main) {
            console.warn("Dữ liệu thời tiết không đủ để xác định hình nền. Sử dụng nền mặc định.");
            return;
        }

        const description = weatherData.weather[0].description.toLowerCase(); // Use description for more detail
        const mainCondition = weatherData.weather[0].main.toLowerCase(); // Use main for general categories
        const icon = weatherData.weather[0].icon; // Ví dụ: "01d" (ngày), "01n" (đêm)
        const tempCelsius = weatherData.main.temp; // API trả về Celsius do 'units=metric'

        // Ưu tiên kiểm tra ban đêm trước dựa vào icon từ API
        if (icon && icon.endsWith('n')) { // Kiểm tra nếu là ban đêm
            if (description.includes('clear sky')) newWeatherClass = 'clear-night';
            else if (description.includes('few clouds')) newWeatherClass = 'clear-night'; // Few clouds at night can still be clear-night
            else if (description.includes('scattered clouds')) newWeatherClass = 'cloudy-night'; // New class for scattered clouds at night
            else if (description.includes('broken clouds') || description.includes('overcast clouds')) newWeatherClass = 'overcast-night'; // New class for darker clouds at night
            else if (mainCondition.includes('rain') || mainCondition.includes('drizzle')) newWeatherClass = 'rainy';
            else if (mainCondition.includes('snow')) newWeatherClass = 'snowy';
            else if (mainCondition.includes('thunderstorm')) newWeatherClass = 'stormy';
            else if (mainCondition.includes('mist') || mainCondition.includes('fog') || mainCondition.includes('haze') || mainCondition.includes('smoke') || mainCondition.includes('sand') || mainCondition.includes('dust') || mainCondition.includes('ash') || mainCondition.includes('squall') || mainCondition.includes('tornado')) newWeatherClass = 'misty';
            else if (mainCondition.includes('clouds')) newWeatherClass = 'cloudy-night'; // Fallback for other cloud types at night
            else newWeatherClass = 'clear-night'; // Default night if no specific match
        } else { // Ban ngày
            if (tempCelsius > 33) newWeatherClass = 'hot'; // Ngưỡng nhiệt độ cho 'hot'
            else if (description.includes('clear sky')) newWeatherClass = 'sunny';
            else if (description.includes('few clouds')) newWeatherClass = 'sunny';
            else if (description.includes('scattered clouds')) newWeatherClass = 'cloudy'; // Existing cloudy for scattered
            else if (description.includes('broken clouds') || description.includes('overcast clouds')) newWeatherClass = 'overcast'; // New class for darker clouds
            else if (mainCondition.includes('rain') || mainCondition.includes('drizzle')) newWeatherClass = 'rainy';
            else if (mainCondition.includes('snow')) newWeatherClass = 'snowy';
            else if (mainCondition.includes('thunderstorm')) newWeatherClass = 'stormy';
            else if (mainCondition.includes('mist') || mainCondition.includes('fog') || mainCondition.includes('haze') || mainCondition.includes('smoke') || mainCondition.includes('sand') || mainCondition.includes('dust') || mainCondition.includes('ash') || mainCondition.includes('squall') || mainCondition.includes('tornado')) newWeatherClass = 'misty';
            else if (mainCondition.includes('clouds')) newWeatherClass = 'cloudy'; // Fallback for other cloud types during day
            else newWeatherClass = 'sunny'; // Default day if no specific match
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

        // Xử lý hiển thị tầm nhìn. API OpenWeatherMap thường giới hạn ở 10,000m.
        // Nếu giá trị là 10,000m, chúng ta hiển thị là "Trên 10 km" để phản ánh đúng hơn.
        let visibilityText;
        if (data.visibility >= 10000) {
            visibilityText = 'Trên 10 km';
        } else {
            // Hiển thị giá trị chính xác nếu dưới 10km
            visibilityText = `${(data.visibility / 1000).toFixed(1)} km`;
        }

        // Cập nhật nền động
        setDynamicBackground(data);

        // Lưu thành phố hiện tại vào localStorage để các trang khác có thể sử dụng
        localStorage.setItem('lastSearchedCity', data.name);

        // Cập nhật link "Dự báo" với thành phố hiện tại
        const forecastLink = document.querySelector('a[href*="dubao.html"]');
        if (forecastLink) {
            forecastLink.href = `../html/dubao.html?city=${encodeURIComponent(data.name)}`;
        }

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
                <span class="detail-icon"><i class="fas fa-eye"></i></span>
                <div class="detail-label">Tầm nhìn</div>
                <div class="detail-value">${visibilityText}</div>
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
        'thừa thiên huế': 'Thua Thien Hue', 'thua thien hue': 'Thua Thien Hue', // Thừa Thiên Huế
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
  // Kiểm tra trạng thái đăng nhập
  // Kiểm tra xem có đang chạy từ file:// protocol không
  if (window.location.protocol === 'file:') {
    console.log('Đang chạy từ file system, bỏ qua kiểm tra đăng nhập');
    // Khi chạy từ file system, không thể gọi API, nên bỏ qua
  } else {
    // Chỉ thực hiện fetch khi không phải protocol file://
    fetch('/api/user')
      .then(response => response.json())
      .then(data => {
        if (data.isAuthenticated) {
          // Hiển thị thông tin người dùng đã đăng nhập
          const userGreeting = document.getElementById('user-greeting');
          const authSection = document.getElementById('auth-section');
          const loginTriggerLink = document.getElementById('loginTriggerLink');
          
          if (userGreeting && authSection && loginTriggerLink) {
            userGreeting.textContent = `Xin chào, ${data.user.displayName}`;
            userGreeting.style.display = 'inline-block';
            loginTriggerLink.style.display = 'none';
            
            // Thêm nút đăng xuất
            const logoutButton = document.createElement('a');
            logoutButton.href = '/auth/logout';
            logoutButton.className = 'nav-link';
            logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Đăng xuất';
            authSection.appendChild(logoutButton);
          }
        }
      })
      .catch(error => console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error));
  }

        loadWeatherBasedOnLocation(DEFAULT_CITY, API_KEY, getWeather);
 
        // Set active link for current page based on URL
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
 
        // Xóa trạng thái 'active' khỏi tất cả các link để đảm bảo reset đúng
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
 
        // Thêm lại trạng thái 'active' chỉ cho link khớp với trang hiện tại
        const homeLink = document.querySelector('a[href*="trangchu.html"]');
        if (homeLink && currentPath.includes('trangchu.html')) {
            homeLink.classList.add('active');
        }
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

      // Xử lý đăng nhập
      if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          
          const email = document.getElementById('loginEmail').value;
          const password = document.getElementById('loginPassword').value;
          
          try {
            const response = await fetch('/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
              // Đăng nhập thành công
              const userGreeting = document.getElementById('user-greeting');
              const loginTriggerLink = document.getElementById('loginTriggerLink');
              const authSection = document.getElementById('auth-section');
              const loginModal = document.getElementById('loginModal');
              
              if (userGreeting && loginTriggerLink && authSection) {
                userGreeting.textContent = `Xin chào, ${data.user.displayName}`;
                userGreeting.style.display = 'inline-block';
                loginTriggerLink.style.display = 'none';
                
                // Thêm nút đăng xuất
                const logoutButton = document.createElement('a');
                logoutButton.href = '/auth/logout';
                logoutButton.className = 'nav-link';
                logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Đăng xuất';
                authSection.appendChild(logoutButton);
                
                // Đóng modal đăng nhập
                if (loginModal) {
                  loginModal.style.display = 'none';
                }
                
                // Làm mới trang để cập nhật trạng thái
                window.location.reload();
              }
            } else {
              // Đăng nhập thất bại
              alert(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
            }
          } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            alert('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
          }
        });
      }
      
      // Xử lý đăng ký
      if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          
          const email = document.getElementById('registerEmail').value;
          const password = document.getElementById('registerPassword').value;
          const confirmPassword = document.getElementById('registerConfirmPassword').value;
          
          // Kiểm tra mật khẩu
          if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
          }
          
          if (password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
          }
          
          try {
            const response = await fetch('/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
              // Đăng ký thành công
              const userGreeting = document.getElementById('user-greeting');
              const loginTriggerLink = document.getElementById('loginTriggerLink');
              const authSection = document.getElementById('auth-section');
              const loginModal = document.getElementById('loginModal');
              
              if (userGreeting && loginTriggerLink && authSection) {
                userGreeting.textContent = `Xin chào, ${data.user.displayName}`;
                userGreeting.style.display = 'inline-block';
                loginTriggerLink.style.display = 'none';
                
                // Thêm nút đăng xuất
                const logoutButton = document.createElement('a');
                logoutButton.href = '/auth/logout';
                logoutButton.className = 'nav-link';
                logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Đăng xuất';
                authSection.appendChild(logoutButton);
                
                // Đóng modal đăng nhập
                if (loginModal) {
                  loginModal.style.display = 'none';
                }
                
                // Làm mới trang để cập nhật trạng thái
                window.location.reload();
              }
            } else {
              // Đăng ký thất bại
              alert(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
          } catch (error) {
            console.error('Lỗi đăng ký:', error);
            alert('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.');
          }
        });
      }

      // Xử lý nút Đăng nhập với Google
      if (googleLoginButton) {
        googleLoginButton.addEventListener("click", () => {
          console.log('Nút "Đăng nhập với Google" đã được nhấp!');
          window.location.href = '/auth/google';
          if (loginModalElement) loginModalElement.style.display = 'none'; // Đóng modal sau khi nhấp
        });
      }