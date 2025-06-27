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
    <link rel="stylesheet" href="/weathery/php/public/css/trangchu.css" />
    <link rel="stylesheet" href="/weathery/php/public/css/thongbao.css" />
    <title>Ứng dụng Thời tiết - Thông báo thông minh</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />
  </head>
  <body>
    <div class="weather-animation" id="weatherAnimation"></div>

    <nav class="navbar">
      <div class="brand">
        <i class="fas fa-sun brand-icon"></i>
        <span class="brand-name">Weathery</span>
      </div>
      <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">
        <i class="fas fa-bars"></i>
      </button>
      <ul class="nav-menu" id="navMenu">
        <li class="nav-item">
          <a href="/weathery/php/trangchu" class="nav-link">
            <i class="fas fa-home"></i> Trang chủ
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
          <a href="/weathery/php/thongbao" class="nav-link active">
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
      <div class="notification-header">
        <h1>Thông báo thông minh</h1>
        <p class="subtitle">
          Nhận thông báo về thời tiết khắc nghiệt và các sự kiện quan trọng
        </p>
      </div>

      <div class="notification-settings">
        <div class="settings-card">
          <div class="card-header">
            <h2>Cài đặt thông báo</h2>
            <div class="toggle-container">
              <label class="main-toggle">
                <input type="checkbox" id="mainNotificationToggle" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="settings-content" id="settingsContent">
            <div class="setting-group">
              <h3>Loại thông báo</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <i class="fas fa-exclamation-triangle"></i>
                  <div>
                    <h4>Cảnh báo thời tiết khắc nghiệt</h4>
                    <p>Bão, lũ lụt, nắng nóng, giông sét...</p>
                  </div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="severeWeatherToggle" checked />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <i class="fas fa-cloud-rain"></i>
                  <div>
                    <h4>Dự báo hàng ngày</h4>
                    <p>Nhận thông báo dự báo thời tiết mỗi sáng</p>
                  </div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="dailyForecastToggle" checked />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <i class="fas fa-umbrella"></i>
                  <div>
                    <h4>Nhắc nhở mang ô/áo mưa</h4>
                    <p>Khi dự báo có mưa trong ngày</p>
                  </div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="umbrellaReminderToggle" checked />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <i class="fas fa-sun"></i>
                  <div>
                    <h4>Chỉ số UV cao</h4>
                    <p>Cảnh báo khi chỉ số UV ở mức nguy hiểm</p>
                  </div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="uvIndexToggle" checked />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-group">
              <h3>Thời gian thông báo</h3>
              <div class="time-settings">
                <div class="time-setting-item">
                  <label for="morningTime">Buổi sáng</label>
                  <input type="time" id="morningTime" value="07:00" />
                </div>
                <div class="time-setting-item">
                  <label for="eveningTime">Buổi tối</label>
                  <input type="time" id="eveningTime" value="19:00" />
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h3>Thành phố nhận thông báo</h3>
              <div class="city-settings">
                <div class="city-list" id="notificationCities">
                  <!-- Cities will be added dynamically -->
                </div>
                <button class="add-city-btn" id="addCityBtn">
                  <i class="fas fa-plus"></i> Thêm thành phố
                </button>
              </div>
            </div>

            <div class="setting-group">
              <h3>Phương thức thông báo</h3>
              <div class="notification-methods">
                <div class="method-item">
                  <div class="method-info">
                    <i class="fas fa-bell"></i>
                    <div>
                      <h4>Thông báo trên trình duyệt</h4>
                    </div>
                  </div>
                  <label class="toggle">
                    <input
                      type="checkbox"
                      id="browserNotificationToggle"
                      checked
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="method-item">
                  <div class="method-info">
                    <i class="fas fa-envelope"></i>
                    <div>
                      <h4>Email</h4>
                      <p id="userEmail">
                        <?php echo $user_logged_in ? htmlspecialchars($user_email) : 'Đăng nhập để nhận thông báo qua email'; ?>
                      </p>
                    </div>
                  </div>
                  <label class="toggle">
                    <input
                      type="checkbox"
                      id="emailNotificationToggle"
                      <?php echo $user_logged_in ? 'checked' : 'disabled'; ?>
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="save-settings">
              <button id="saveSettingsBtn">Lưu cài đặt</button>
            </div>
          </div>
        </div>

        <div class="notification-history-card">
          <h2>Lịch sử thông báo</h2>
          <div class="notification-list" id="notificationList">
            <!-- Notifications will be added dynamically -->
          </div>
        </div>
      </div>
    </div>

    <!-- Modal tìm kiếm thành phố -->
    <div class="modal" id="citySearchModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Thêm thành phố</h2>
          <button class="close-btn" id="closeModalBtn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="search-container">
            <div class="search-wrapper">
              <input
                type="text"
                id="modalCityInput"
                placeholder="Tìm kiếm thành phố..."
                autocomplete="off"
              />
              <button id="modalSearchBtn">
                <i class="fas fa-search"></i>
              </button>
            </div>
            <div class="search-results" id="modalSearchResults"></div>
          </div>
        </div>
      </div>
    </div>

    <script src="/weathery/php/public/js/thongbao.js"></script>
  </body>
</html>