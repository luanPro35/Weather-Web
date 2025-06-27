<?php
// Bắt đầu session nếu chưa bắt đầu
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Kiểm tra xem người dùng đã đăng nhập chưa
$user_logged_in = isset($_SESSION['user_email']);
$user_name = $user_logged_in ? $_SESSION['user_name'] : '';
$user_email = $user_logged_in ? $_SESSION['user_email'] : '';
?>
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weather App - Thời tiết thông minh</title>
    <link rel="stylesheet" href="/weathery/php/public/css/trangchu.css" />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />
  </head>
  <body>
    <!-- Navigation -->
    <nav class="navbar" id="mainNav">
      <div class="brand">
        <i class="fas fa-sun brand-icon"></i>
        <span class="brand-name">Weathery</span>
      </div>
      <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">
        <i class="fas fa-bars"></i>
      </button>
      <ul class="nav-menu" id="navMenu">
        <li class="nav-item">
          <a href="/weathery/php/trangchu" class="nav-link active">
            <i class="fas fa-home"></i> Trang Chủ
          </a>
        </li>
        <li class="nav-item">
          <a href="/weathery/php/dubao" class="nav-link">
            <i class="fas fa-calendar-alt"></i> Dự báo
          </a>
        </li>
        <li class="nav-item">
          <a href="/weathery/php/thanhpho" class="nav-link">
            <i class="fas fa-city"></i> Thành phố
          </a>
        </li>
        <li class="nav-item">
          <a href="/weathery/php/thongbao" class="nav-link">
            <i class="fas fa-bell"></i> Thông báo
          </a>
        </li>
        <li class="nav-item" id="auth-section">
          <?php if ($user_logged_in): ?>
            <!-- Hiển thị thông tin người dùng khi đã đăng nhập -->
            <span id="user-greeting" class="nav-link">
              <i class="fas fa-user"></i> Xin chào, <?php echo htmlspecialchars($user_name); ?>
            </span>
          <?php else: ?>
            <!-- Nút/Link Đăng nhập khi chưa đăng nhập -->
            <a
              href="/weathery/php/login_with_google"
              class="nav-link"
              id="loginTriggerLink"
            >
              <i class="fas fa-sign-in-alt"></i> Đăng nhập
            </a>
          <?php endif; ?>
        </li>
        <li class="nav-item">
          <div class="settings-dropdown">
            <button class="settings-btn">
              <i class="fas fa-cog"></i>
            </button>
            <div class="settings-content">
              <div class="temp-toggle">
                <span>°C</span>
                <label class="switch">
                  <input type="checkbox" id="tempUnitToggle" />
                  <span class="slider round"></span>
                </label>
                <span>°F</span>
              </div>
              <div class="language-select">
                <select id="languageSelect">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </nav>

    <div class="container">
      <div class="search-container">
        <div class="search-wrapper">
          <input
            type="text"
            id="cityInput"
            placeholder="Tìm kiếm thành phố..."
            autocomplete="off"
          />
          <button id="searchBtn">
            <i class="fas fa-search"></i>
          </button>
        </div>
        <div class="search-results" id="searchResults"></div>
      </div>

      <div class="weather-container">
        <div class="current-weather">
          <div class="weather-header">
            <h2 id="cityName">Đang tải...</h2>
            <div class="date-time">
              <span id="currentDate">--/--/----</span>
              <span id="currentTime">--:--</span>
            </div>
          </div>

          <div class="weather-info">
            <div class="temperature-container">
              <div class="temperature">
                <span id="temperature">--</span>
                <span class="unit">°C</span>
              </div>
              <div class="feels-like">
                Cảm giác như: <span id="feelsLike">--</span>°
              </div>
            </div>

            <div class="weather-details">
              <div class="weather-icon">
                <img id="weatherIcon" src="" alt="Weather Icon" />
              </div>
              <div class="weather-description">
                <span id="weatherDescription">--</span>
              </div>
            </div>
          </div>

          <div class="weather-metrics">
            <div class="metric">
              <i class="fas fa-wind"></i>
              <div class="metric-info">
                <span class="metric-value" id="windSpeed">-- km/h</span>
                <span class="metric-label">Gió</span>
              </div>
            </div>
            <div class="metric">
              <i class="fas fa-tint"></i>
              <div class="metric-info">
                <span class="metric-value" id="humidity">--%</span>
                <span class="metric-label">Độ ẩm</span>
              </div>
            </div>
            <div class="metric">
              <i class="fas fa-compress-arrows-alt"></i>
              <div class="metric-info">
                <span class="metric-value" id="pressure">-- hPa</span>
                <span class="metric-label">Áp suất</span>
              </div>
            </div>
            <div class="metric">
              <i class="fas fa-eye"></i>
              <div class="metric-info">
                <span class="metric-value" id="visibility">-- km</span>
                <span class="metric-label">Tầm nhìn</span>
              </div>
            </div>
          </div>
        </div>

        <div class="hourly-forecast">
          <h3>Dự báo theo giờ</h3>
          <div class="hourly-container" id="hourlyContainer"></div>
        </div>

        <div class="air-quality">
          <h3>Chất lượng không khí</h3>
          <div class="aqi-container">
            <div class="aqi-value">
              <span id="aqiValue">--</span>
              <span class="aqi-label">AQI</span>
            </div>
            <div class="aqi-description">
              <span id="aqiDescription">Đang tải...</span>
            </div>
            <div class="aqi-meter">
              <div class="aqi-meter-bar">
                <div class="aqi-meter-fill" id="aqiMeterFill"></div>
              </div>
              <div class="aqi-meter-labels">
                <span>Tốt</span>
                <span>Trung bình</span>
                <span>Kém</span>
                <span>Xấu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script src="/weathery/php/public/js/trangchu.js"></script>
  </body>
</html>