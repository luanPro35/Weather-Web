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

// Fetch current weather data
async function getWeather(city) {
  const weatherContent = document.getElementById("weatherContent");
  weatherContent.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Đang tải thông tin thời tiết...</p>
    </div>`;

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=vi&appid=${API_KEY}`);
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

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Set active link for current page (Forecast page)
  // Show 'forecast' section by default and activate 'Dự báo' link
  const forecastNavLink = Array.from(document.querySelectorAll('.nav-link')).find(link => link.textContent.trim().includes('Dự báo'));
  if (forecastNavLink) showSection('forecast', forecastNavLink);


  const urlParams = new URLSearchParams(window.location.search);
  const cityFromQuery = urlParams.get('city');

  if (cityFromQuery) {
    getWeather(cityFromQuery);
    const cityInput = document.getElementById("cityInput");
    if (cityInput) cityInput.value = cityFromQuery; // Tùy chọn: điền vào ô tìm kiếm
  } else {
    getWeather(DEFAULT_CITY);
  }

  const cityInput = document.getElementById("cityInput");
  if (cityInput) {
    cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && cityInput.value.trim()) {
        getWeather(cityInput.value.trim());
      }
    });
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
});