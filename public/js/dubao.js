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
  const existingWeatherClasses = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'clear-night', 'misty', 'hot'];

  existingWeatherClasses.forEach(cls => {
    if (body.classList.contains(cls)) {
      body.classList.remove(cls);
    }
  });

  if (!weatherData || !weatherData.weather || !weatherData.weather[0] || !weatherData.main) {
    console.warn("Dữ liệu thời tiết không đủ để xác định hình nền. Sử dụng nền mặc định.");
    return;
  }

  const condition = weatherData.weather[0].main.toLowerCase();
  const icon = weatherData.weather[0].icon;
  const tempCelsius = weatherData.main.temp;
  let newWeatherClass = '';

  if (icon && icon.endsWith('n')) {
    if (condition.includes('clear')) newWeatherClass = 'clear-night';
    else if (condition.includes('cloud')) newWeatherClass = 'cloudy';
    else if (condition.includes('rain') || condition.includes('drizzle')) newWeatherClass = 'rainy';
    else if (condition.includes('snow')) newWeatherClass = 'snowy';
    else if (condition.includes('thunderstorm')) newWeatherClass = 'stormy';
    else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze') || condition.includes('smoke') || condition.includes('sand') || condition.includes('dust') || condition.includes('ash') || condition.includes('squall') || condition.includes('tornado')) newWeatherClass = 'misty';
    else newWeatherClass = 'clear-night';
  } else {
    if (tempCelsius > 33) newWeatherClass = 'hot';
    else if (condition.includes('clear')) newWeatherClass = 'sunny';
    else if (condition.includes('cloud')) newWeatherClass = 'cloudy';
    else if (condition.includes('rain') || condition.includes('drizzle')) newWeatherClass = 'rainy';
    else if (condition.includes('snow')) newWeatherClass = 'snowy';
    else if (condition.includes('thunderstorm')) newWeatherClass = 'stormy';
    else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze') || condition.includes('smoke') || condition.includes('sand') || condition.includes('dust') || condition.includes('ash') || condition.includes('squall') || condition.includes('tornado')) newWeatherClass = 'misty';
    else newWeatherClass = 'sunny';
  }

  if (newWeatherClass) {
    body.classList.add(newWeatherClass);
    console.log(`Applied background class: ${newWeatherClass}`);
  } else {
    console.log("No specific weather class applied, using default body background.");
  }
}

// Update weather UI for current weather
function updateWeatherUI(data) {
  const weatherContent = document.getElementById("weatherContent");
  if (!data || !data.weather || !data.weather[0] || !data.main) {
    weatherContent.innerHTML = `<div class="error"><p>Không thể tải dữ liệu thời tiết hiện tại.</p></div>`;
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
          <div class="feels-like">Cảm giác như ${Math.round(data.main.feels_like)}°C</div>
        </div>
        <div class="weather-icon-container">
          <div class="weather-icon">${weatherIcons[weather.icon] || "🌤️"}</div>
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
          <div class="detail-value">${Math.round(data.wind.speed)} m/s</div>
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
          ${suggestions.map(suggestion => `
            <div class="suggestion-item">
              <span class="suggestion-icon">${suggestion.icon}</span>
              <div class="suggestion-text">${suggestion.text}</div>
            </div>`).join("")}
        </div>
      </div>
    </div>`;
  weatherContent.innerHTML = html;
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
    'bà rịa vũng tàu': 'Vũng Tàu', 'ba ria vung tau': 'Vũng Tàu', 'brvt': 'Vũng Tàu',
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

// Fetch current weather data
async function getWeather(city) {
  const weatherContent = document.getElementById("weatherContent");
  weatherContent.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Đang tải thông tin thời tiết...</p>
    </div>`;

  // Chuyển đổi tên tỉnh thành thành phố nếu có trong bản đồ
  let searchCity = city.toLowerCase().trim();
  const mappedCity = provinceToCityMap[searchCity];
  if (mappedCity) {
      console.log(`Ánh xạ "${city}" sang "${mappedCity}" để gọi API.`);
      searchCity = mappedCity;
  }

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(searchCity)}&units=metric&lang=vi&appid=${API_KEY}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không tìm thấy thành phố");
    }
    const data = await response.json();
    updateWeatherUI(data);
    getForecast(city); // Fetch forecast after current weather
  } catch (error) {
    weatherContent.innerHTML = `
      <div class="error">
        <h2>❌ Lỗi</h2>
        <p>${error.message}</p>
      </div>`;
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

  const urlParams = new URLSearchParams(window.location.search);
  const cityFromQuery = urlParams.get('city');

  if (cityFromQuery) { // If city is specified in URL, use it
    getWeather(cityFromQuery);
    const cityInput = document.getElementById("cityInput");
    if (cityInput) cityInput.value = cityFromQuery; // Tùy chọn: điền vào ô tìm kiếm
  } else { // Otherwise, try to get location or use default
    loadWeatherBasedOnLocation(DEFAULT_CITY, API_KEY, getWeather);
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

  // Xử lý submit form (hiện tại chỉ là placeholder)
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Chức năng đăng nhập đang được phát triển.');
    });
  }
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Chức năng đăng ký đang được phát triển.');
    });
  }
  if (googleLoginButton) {
    googleLoginButton.addEventListener("click", () => {
      alert("Chức năng đăng nhập bằng Google đang được phát triển.");
    });
  }
});