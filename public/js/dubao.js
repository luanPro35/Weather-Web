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
  }

  // Update active nav link
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.classList.remove("active");
  });
  if (navLinkElement) {
    navLinkElement.classList.add("active");
  }

  // Close mobile menu
  const mobileMenu = document.getElementById("navMenu");
  if (mobileMenu) {
    mobileMenu.classList.remove("active");
  }
}

/**
 * Cập nhật hình nền của body dựa trên dữ liệu thời tiết.
 * @param {object} weatherData - Dữ liệu thời tiết từ API.
 */
function setDynamicBackground(weatherData) {
  const body = document.body;
  const existingWeatherClasses = ['sunny', 'cloudy', 'overcast', 'rainy', 'snowy', 'stormy', 'clear-night', 'cloudy-night', 'overcast-night', 'misty', 'hot'];

  existingWeatherClasses.forEach(cls => {
    if (body.classList.contains(cls)) {
      body.classList.remove(cls);
    }
  });

  let newWeatherClass = ''; // Default to empty, so body's default CSS background applies if no match

  if (!weatherData || !weatherData.weather || !weatherData.weather[0] || !weatherData.main) {
    console.warn("Dữ liệu thời tiết không đủ để xác định hình nền. Sử dụng nền mặc định.");
    return;
  }

  const description = weatherData.weather[0].description.toLowerCase(); // Use description for more detail
  const mainCondition = weatherData.weather[0].main.toLowerCase(); // Use main for general categories
  const icon = weatherData.weather[0].icon;
  const tempCelsius = weatherData.main.temp;

  if (icon && icon.endsWith('n')) {
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
  } else {
    if (tempCelsius > 33) newWeatherClass = 'hot';
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

  if (newWeatherClass) {
    body.classList.add(newWeatherClass);
    console.log(`Applied background class: ${newWeatherClass}`);
  } else {
    console.log("No specific weather class applied, using default body background.");
  }
}

let myTemperatureChart = null;

function formatForecastTime(dateTimeStr) {
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getDayName(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("vi-VN", { weekday: 'long' });
}

function renderHourlyForecast(hourlyData) {
  const container = document.querySelector("#forecastSection .hourly-forecast-grid");
  if (!container) return;
  container.innerHTML = ""; 

  hourlyData.slice(0, 8).forEach(item => {
    const time = formatForecastTime(item.dt_txt);
    const icon = weatherIcons[item.weather[0].icon] || "🌤️";
    const temp = Math.round(item.main.temp);
    const itemHTML = `
      <div class="hourly-item">
        <div class="hourly-time">${time}</div>
        <div class="hourly-icon">${icon}</div>
        <div class="hourly-temp">${temp}°C</div>
      </div>`;
    container.innerHTML += itemHTML;
  });
}

function renderDailyForecast(dailyDataList) {
  const container = document.querySelector("#forecastSection .daily-forecast-grid");
  if (!container) return;
  container.innerHTML = "";

  dailyDataList.forEach(day => {
    const dayName = getDayName(day.dt);
    const icon = weatherIcons[day.icon] || "🌤️";
    const desc = day.description;
    const highTemp = Math.round(day.temp_max);
    const lowTemp = Math.round(day.temp_min);
    const itemHTML = `
      <div class="daily-item">
        <div class="daily-day">${dayName}</div>
        <div class="daily-desc">${desc}</div>
        <div class="daily-icon">${icon}</div>
        <div class="daily-temps">
          <span class="temp-high">${highTemp}°</span> / <span class="temp-low">${lowTemp}°</span>
        </div>
      </div>`;
    container.innerHTML += itemHTML;
  });
}

function renderTemperatureChart(hourlyData) {
  const ctx = document.getElementById('temperatureChart');
  if (!ctx) return;

  const labels = hourlyData.slice(0, 8).map(item => formatForecastTime(item.dt_txt));
  const temperatures = hourlyData.slice(0, 8).map(item => Math.round(item.main.temp));

  if (myTemperatureChart) {
    myTemperatureChart.destroy();
  }

  myTemperatureChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Nhiệt độ (°C)',
        data: temperatures,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'white',
        pointBorderColor: '#667eea',
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#667eea',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          ticks: { color: 'rgba(255, 255, 255, 0.7)', callback: value => value + '°C' },
          grid: { color: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255,255,255,0.1)' }
        },
        x: {
          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.7)', titleFont: { size: 14 }, bodyFont: { size: 12 },
          padding: 10, cornerRadius: 5,
          callbacks: { label: context => `Nhiệt độ: ${context.parsed.y}°C` }
        }
      }
    }
  });
}

async function getForecast(city) {
  const forecastHourlyContainer = document.querySelector("#forecastSection .hourly-forecast-grid");
  const forecastDailyContainer = document.querySelector("#forecastSection .daily-forecast-grid");

  if (forecastHourlyContainer) forecastHourlyContainer.innerHTML = `<p class="loading-text">Đang tải dự báo theo giờ...</p>`;
  if (forecastDailyContainer) forecastDailyContainer.innerHTML = `<p class="loading-text">Đang tải dự báo hàng ngày...</p>`;

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=vi&appid=${API_KEY}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể tải dữ liệu dự báo.");
    }
    const forecastData = await response.json();

    renderHourlyForecast(forecastData.list);

    const dailyProcessed = {};
    forecastData.list.forEach(item => {
      const dateKey = item.dt_txt.split(' ')[0];
      if (!dailyProcessed[dateKey]) {
        dailyProcessed[dateKey] = { dt: item.dt, temps: [], icons: {}, descriptions: {} };
      }
      dailyProcessed[dateKey].temps.push(item.main.temp);
      const iconCode = item.weather[0].icon;
      const descText = item.weather[0].description;
      dailyProcessed[dateKey].icons[iconCode] = (dailyProcessed[dateKey].icons[iconCode] || 0) + 1;
      dailyProcessed[dateKey].descriptions[descText] = (dailyProcessed[dateKey].descriptions[descText] || 0) + 1;
    });

    const dailyForecastForRender = Object.values(dailyProcessed).map(dayData => {
      const mostCommonIcon = Object.keys(dayData.icons).reduce((a, b) => dayData.icons[a] > dayData.icons[b] ? a : b);
      const mostCommonDescription = Object.keys(dayData.descriptions).reduce((a, b) => dayData.descriptions[a] > dayData.descriptions[b] ? a : b);
      return {
        dt: dayData.dt,
        temp_min: Math.min(...dayData.temps),
        temp_max: Math.max(...dayData.temps),
        icon: mostCommonIcon,
        description: mostCommonDescription
      };
    }).slice(0, 7); // Display up to 7 days

    renderDailyForecast(dailyForecastForRender);
    renderTemperatureChart(forecastData.list);
  } catch (error) {
    console.error("Lỗi tải dự báo:", error);
    if (forecastHourlyContainer) forecastHourlyContainer.innerHTML = `<p class="error-text" style="color:red; text-align:center;">${error.message}</p>`;
    if (forecastDailyContainer) forecastDailyContainer.innerHTML = `<p class="error-text" style="color:red; text-align:center;">${error.message}</p>`;
  }
}

// Bộ chuyển đổi tên Tỉnh sang Thành phố để API dễ nhận dạng hơn
const provinceToCityMap = {
    // Miền Bắc
    'hà nội': 'Hà Nội', 'ha noi': 'Hà Nội',
    'huế': 'Huế', 'hue': 'Huế',
    'lai châu': 'Lai Châu', 'lai chau': 'Lai Châu',
    'điện biên': 'Điện Biên Phủ', 'dien bien': 'Điện Biên Phủ',
    'sơn la': 'Sơn La', 'son la': 'Sơn La',
    'lạng sơn': 'Lạng Sơn', 'lang son': 'Lạng Sơn',
    'quảng ninh': 'Hạ Long', 'quang ninh': 'Hạ Long',
    'thanh hóa': 'Thanh Hóa', 'thanh hoa': 'Thanh Hóa',
    'nghệ an': 'Vinh', 'nghe an': 'Vinh',
    'hà tĩnh': 'Hà Tĩnh', 'ha tinh': 'Hà Tĩnh',
    'cao bằng': 'Cao Bằng', 'cao bang': 'Cao Bằng',
    'tuyên quang': 'Tuyên Quang', 'tuyen quang': 'Tuyên Quang', // Merged with Hà Giang
    'lào cai': 'Lào Cai', 'lao cai': 'Lào Cai', // Merged with Yên Bái
    'thái nguyên': 'Thái Nguyên', 'thai nguyen': 'Thái Nguyên', // Merged with Bắc Kạn
    'phú thọ': 'Việt Trì', 'phu tho': 'Việt Trì', // Merged with Vĩnh Phúc and Hòa Bình
    'bắc ninh': 'Bắc Ninh', 'bac ninh': 'Bắc Ninh', // Merged with Bắc Giang
    'hưng yên': 'Hưng Yên', 'hung yen': 'Hưng Yên', // Merged with Thái Bình
    'hải phòng': 'Hải Phòng', 'hai phong': 'Hải Phòng', // Merged with Hải Dương
    'ninh bình': 'Ninh Bình', 'ninh binh': 'Ninh Bình', // Merged with Hà Nam and Nam Định
    'quảng trị': 'Đông Hà', 'quang tri': 'Đông Hà', // Merged with Quảng Bình
    'đà nẵng': 'Đà Nẵng', 'da nang': 'Đà Nẵng', // Merged with Quảng Nam
    'quảng ngãi': 'Quảng Ngãi', 'quang ngai': 'Quảng Ngãi',
    'gia lai': 'Pleiku',
    'khánh hòa': 'Nha Trang', 'khanh hoa': 'Nha Trang',
    'lâm đồng': 'Đà Lạt', 'lam dong': 'Đà Lạt',
    'đắk lắk': 'Buôn Ma Thuột', 'dak lak': 'Buôn Ma Thuột',
    'tp. hồ chí minh': 'Ho Chi Minh City', 'ho chi minh': 'Ho Chi Minh City', 'hcm': 'Ho Chi Minh City',
    'đồng nai': 'Biên Hòa', 'dong nai': 'Biên Hòa',
    'tây ninh': 'Tây Ninh', 'tay ninh': 'Tây Ninh',
    'cần thơ': 'Cần Thơ', 'can tho': 'Cần Thơ',
    'vĩnh long': 'Vĩnh Long', 'vinh long': 'Vĩnh Long',
    'đồng tháp': 'Cao Lãnh', 'dong thap': 'Cao Lãnh',
    'cà mau': 'Cà Mau', 'ca mau': 'Cà Mau',
    'an giang': 'Long Xuyên', 'an giang': 'Long Xuyên'
};

// Fetch current weather data
async function loadPageData(city) {
  // Chuyển đổi tên tỉnh thành thành phố nếu có trong bản đồ
  let searchCity = city.toLowerCase().trim();
  const mappedCity = provinceToCityMap[searchCity];
  if (mappedCity) {
    console.log(`Ánh xạ "${city}" sang "${mappedCity}" để gọi API.`);
    searchCity = mappedCity;
  }

  try {
    // 1. Fetch current weather for background
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(searchCity)}&units=metric&lang=vi&appid=${API_KEY}`);
    if (weatherResponse.ok) {
      const weatherData = await weatherResponse.json();
      setDynamicBackground(weatherData);
      
      // Cập nhật dữ liệu thời tiết cho chatbot nếu đã được khởi tạo
      if (window.weatherChatbot && typeof window.weatherChatbot.updateWeatherData === 'function') {
        window.weatherChatbot.updateWeatherData(weatherData);
        console.log('Dữ liệu thời tiết đã được cập nhật cho chatbot từ dubao.js');
      }
    } else {
      console.error("Không thể tải dữ liệu thời tiết cho nền.");
      setDynamicBackground(null); // Sử dụng nền mặc định
    }

    // 2. Fetch and render the forecast data
    await getForecast(searchCity);
  } catch (error) {
    const forecastHourlyContainer = document.querySelector("#forecastSection .hourly-forecast-grid");
    const forecastDailyContainer = document.querySelector("#forecastSection .daily-forecast-grid");
    if (forecastHourlyContainer) forecastHourlyContainer.innerHTML = `<p class="error-text" style="color:red; text-align:center;">Lỗi: ${error.message}</p>`;
    if (forecastDailyContainer) forecastDailyContainer.innerHTML = `<p class="error-text" style="color:red; text-align:center;">Lỗi: ${error.message}</p>`;
    setDynamicBackground(null); // Reset background on error
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
async function loadWeatherBasedOnLocation(defaultCity, apiKey, pageLoadFunction) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const cityName = await getCityFromCoordinates(lat, lon, apiKey);
      if (cityName) {
        console.log(`Detected location: ${cityName}. Fetching weather.`);
        pageLoadFunction(cityName);
      } else {
        console.warn(`Could not determine city from coordinates. Falling back to ${defaultCity}.`);
        pageLoadFunction(defaultCity);
      }
    }, (error) => {
      console.warn(`Geolocation failed: ${error.message}. Falling back to ${defaultCity}.`);
      pageLoadFunction(defaultCity);
    }, { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 });
  } else {
    console.warn(`Geolocation is not supported by this browser. Falling back to ${defaultCity}.`);
    pageLoadFunction(defaultCity);
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra trạng thái đăng nhập
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


  const urlParams = new URLSearchParams(window.location.search);
  const cityFromQuery = urlParams.get('city');

  if (cityFromQuery) { // If city is specified in URL, use it
    loadPageData(cityFromQuery);
    const cityInput = document.getElementById("cityInput");
    if (cityInput) cityInput.value = cityFromQuery; // Tùy chọn: điền vào ô tìm kiếm
  } else { // Otherwise, try to get location or use default
    loadWeatherBasedOnLocation(DEFAULT_CITY, API_KEY, loadPageData);
  }

  const cityInput = document.getElementById("cityInput");
  const searchIcon = document.querySelector(".search-icon"); // Lấy icon tìm kiếm

  // Hàm xử lý tìm kiếm để tránh lặp code
  function handleSearch() {
    if (cityInput && cityInput.value.trim()) {
      loadPageData(cityInput.value.trim());
    }
  }

  if (cityInput) {
    cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    });
  }

  if (searchIcon) {
      searchIcon.addEventListener("click", handleSearch);
  }

  const tempUnitToggle = document.getElementById("tempUnitToggle");
  if (tempUnitToggle) {
    tempUnitToggle.addEventListener("change", () => {
      // Logic for temperature conversion needs to be robust,
      // considering current values are already displayed.
      // This is a placeholder for a more complex implementation
      // if you need to convert already displayed temperatures.
      console.log("Temperature unit toggled. Implement conversion logic.");
    });
  }

  const languageSelect = document.getElementById("languageSelect");
  if (languageSelect) {
    languageSelect.addEventListener("change", (e) => {
      const lang = e.target.value;
      console.log(`Language changed to: ${lang}. Implement I18N.`);
      // Implement language change logic here
      // This would involve reloading data with new lang param or using a translation library.
    });
  }

  // --- Login Modal Logic ---
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
  if (googleLoginButton) {
    googleLoginButton.addEventListener("click", () => {
      window.location.href = '/auth/google';
      loginModalElement.style.display = 'none'; // Đóng modal sau khi nhấp
    });
  }
});