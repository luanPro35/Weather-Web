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
    <link rel="stylesheet" href="/weathery/php/public/css/thanhpho.css" />
    <title>Ứng dụng Thời tiết - Thành phố yêu thích</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
    />
  <body>
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
          <a href="/weathery/php/thanhpho" class="nav-link active">
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

      <div class="favorites-container">
        <h2>Thành phố yêu thích</h2>
        <div class="favorites-grid" id="favoritesGrid">
          <!-- Favorite cities will be dynamically added here -->
        </div>
      </div>

      <div class="no-favorites" id="noFavorites">
        <i class="fas fa-heart-broken"></i>
        <p>Bạn chưa có thành phố yêu thích nào</p>
        <p>Tìm kiếm và thêm thành phố vào danh sách yêu thích</p>
      </div>
    </div>

    <script src="/weathery/php/public/js/thanhpho.js"></script>
  </body>
</html>