document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("emailForNotifications");
    const saveEmailBtn = document.getElementById("saveEmailBtn");
    const notifyRainCheckbox = document.getElementById("notifyRain");
    const notifyHotCheckbox = document.getElementById("notifyHot");
    const notifyWindCheckbox = document.getElementById("notifyWind");
    const toggleBrowserNotificationsBtn = document.getElementById("toggleBrowserNotificationsBtn");
    const notificationHistoryList = document.getElementById("notificationHistoryList");

    const NOTIFICATION_SETTINGS_KEY = "weatherNotificationSettings";
    const API_KEY = "037b6dda3ea6bd588dd48b35ae88f478"; // Sử dụng lại API key của bạn
    const DEFAULT_CITY_FOR_BACKGROUND = "Da Nang"; // Fallback default city for this page's background

    // Navigation functions (should be shared or present in each file if not shared)
    function toggleMobileMenu() {
        const navMenu = document.getElementById("navMenu");
        if (navMenu) navMenu.classList.toggle("active");
    }
    // Make it globally accessible if called from HTML onclick
    window.toggleMobileMenu = toggleMobileMenu;

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
            console.warn(`Section with ID '${sectionName}Section' not found on the current page.`);
        }

        // Update active nav link
        const navLinks = document.querySelectorAll(".nav-link");
        navLinks.forEach((link) => {
          link.classList.remove("active");
        });
        if (navLinkElement) {
            navLinkElement.classList.add("active");
        }
        // Close mobile menu is handled by toggleMobileMenu if needed, or can be added here
        // const mobileMenu = document.getElementById("navMenu");
        // if (mobileMenu) mobileMenu.classList.remove("active");
    }

    // --- Hàm áp dụng nền động (tương tự trangchu.js/dubao.js) ---
    function setDynamicBackground(weatherData) {
        const body = document.body;
        const existingWeatherClasses = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'clear-night', 'misty', 'hot'];

        existingWeatherClasses.forEach(cls => {
            if (body.classList.contains(cls)) {
                body.classList.remove(cls);
            }
        });

        if (!weatherData || !weatherData.weather || !weatherData.weather[0] || !weatherData.main) {
            console.warn("Dữ liệu thời tiết không đủ để xác định hình nền trên trang thông báo. Sử dụng nền mặc định.");
            // Giữ nền mặc định của body nếu không có dữ liệu
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
            else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze') || condition.includes('smoke')) newWeatherClass = 'misty';
            else newWeatherClass = 'clear-night';
        } else {
            if (tempCelsius > 33) newWeatherClass = 'hot';
            else if (condition.includes('clear')) newWeatherClass = 'sunny';
            else if (condition.includes('cloud')) newWeatherClass = 'cloudy';
            else if (condition.includes('rain') || condition.includes('drizzle')) newWeatherClass = 'rainy';
            else if (condition.includes('snow')) newWeatherClass = 'snowy';
            else if (condition.includes('thunderstorm')) newWeatherClass = 'stormy';
            else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze') || condition.includes('smoke')) newWeatherClass = 'misty';
            else newWeatherClass = 'sunny';
        }

        if (newWeatherClass) {
            body.classList.add(newWeatherClass);
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

    // Function to get user's current location and fetch weather for background
    async function loadBackgroundBasedOnLocation(fallbackCity) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const cityName = await getCityFromCoordinates(lat, lon, API_KEY);
                if (cityName) {
                    console.log(`Detected location for background: ${cityName}. Fetching weather.`);
                    fetchWeatherForBackground(cityName);
                } else {
                    console.warn(`Could not determine city from coordinates for background. Falling back to ${fallbackCity}.`);
                    fetchWeatherForBackground(fallbackCity);
                }
            }, (error) => {
                console.warn(`Geolocation failed for background: ${error.message}. Falling back to ${fallbackCity}.`);
                fetchWeatherForBackground(fallbackCity);
            }, { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 });
        } else {
            console.warn(`Geolocation is not supported by this browser for background. Falling back to ${fallbackCity}.`);
            fetchWeatherForBackground(fallbackCity);
        }
    }

    // --- Hàm lấy thời tiết cho nền ---
    async function fetchWeatherForBackground(city) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=vi&appid=${API_KEY}`);
            if (!response.ok) {
                console.error(`Không thể lấy thời tiết cho thành phố: ${city}`);
                setDynamicBackground(null);
                return;
            }
            const data = await response.json();
            setDynamicBackground(data);
        } catch (error) {
            console.error("Lỗi khi lấy thời tiết cho nền:", error);
            setDynamicBackground(null);
        }
    }

    // --- Tải cài đặt đã lưu ---
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem(NOTIFICATION_SETTINGS_KEY)) || {};
        if (emailInput) emailInput.value = settings.email || "";
        if (notifyRainCheckbox) notifyRainCheckbox.checked = settings.notifyRain || false;
        if (notifyHotCheckbox) notifyHotCheckbox.checked = settings.notifyHot || false;
        if (notifyWindCheckbox) notifyWindCheckbox.checked = settings.notifyWind || false;

        if (toggleBrowserNotificationsBtn) {
            const browserNotificationsEnabled = settings.browserNotificationsEnabled || false;
            toggleBrowserNotificationsBtn.dataset.enabled = browserNotificationsEnabled;
            updateBrowserNotificationButton(browserNotificationsEnabled);
        }
        // Tải lịch sử thông báo (hiện tại là placeholder)
        renderNotificationHistory(settings.history || []);
    }

    // --- Lưu cài đặt ---
    function saveSettings() {
        const settings = {
            email: emailInput ? emailInput.value.trim() : "",
            notifyRain: notifyRainCheckbox ? notifyRainCheckbox.checked : false,
            notifyHot: notifyHotCheckbox ? notifyHotCheckbox.checked : false,
            notifyWind: notifyWindCheckbox ? notifyWindCheckbox.checked : false,
            browserNotificationsEnabled: toggleBrowserNotificationsBtn ? toggleBrowserNotificationsBtn.dataset.enabled === "true" : false,
            history: getNotificationHistory() // Lấy lịch sử hiện tại để lưu
        };
        localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
        // alert("Cài đặt đã được lưu!"); // Thông báo đơn giản
    }

    // --- Xử lý nút Lưu Email ---
    if (saveEmailBtn && emailInput) {
        saveEmailBtn.addEventListener("click", () => {
            if (emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
                alert("Vui lòng nhập địa chỉ email hợp lệ.");
                return;
            }
            saveSettings();
            alert("Địa chỉ email và các tùy chọn đã được lưu!");
        });
    }

    // --- Xử lý các checkbox ---
    [notifyRainCheckbox, notifyHotCheckbox, notifyWindCheckbox].forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener("change", saveSettings);
        }
    });

    // --- Xử lý Thông báo Trình duyệt ---
    function updateBrowserNotificationButton(isEnabled) {
        if (!toggleBrowserNotificationsBtn) return;
        if (isEnabled) {
            toggleBrowserNotificationsBtn.innerHTML = '<i class="fas fa-bell"></i> Đang Bật (Nhấn để Tắt)';
            // CSS sẽ xử lý màu sắc dựa trên data-enabled="true"
        } else {
            toggleBrowserNotificationsBtn.innerHTML = '<i class="fas fa-bell-slash"></i> Bật Thông báo Trình duyệt';
            // CSS sẽ xử lý màu sắc dựa trên data-enabled="false"
        }
        toggleBrowserNotificationsBtn.dataset.enabled = isEnabled; // Đảm bảo dataset được cập nhật
    }

    if (toggleBrowserNotificationsBtn) {
        toggleBrowserNotificationsBtn.addEventListener("click", async () => {
            let currentStatus = toggleBrowserNotificationsBtn.dataset.enabled === "true";
            if (!currentStatus) { // Nếu đang tắt, cố gắng bật
                if (!("Notification" in window)) {
                    alert("Trình duyệt này không hỗ trợ thông báo.");
                    return;
                } else if (Notification.permission === "granted") {
                    currentStatus = true; // Đã cho phép
                } else if (Notification.permission !== "denied") {
                    const permission = await Notification.requestPermission();
                    if (permission === "granted") {
                        currentStatus = true;
                        // Có thể gửi một thông báo thử nghiệm ở đây
                        new Notification("Weathery", { body: "Thông báo trình duyệt đã được bật!" });
                    } else {
                        alert("Bạn đã không cho phép nhận thông báo.");
                    }
                } else {
                     alert("Bạn đã chặn thông báo cho trang này. Vui lòng thay đổi trong cài đặt trình duyệt.");
                }
            } else { // Nếu đang bật, thì tắt
                currentStatus = false;
            }
            toggleBrowserNotificationsBtn.dataset.enabled = currentStatus;
            updateBrowserNotificationButton(currentStatus); // Gọi lại để cập nhật text và class (nếu có)
            saveSettings();
        });
    }

    // --- Lịch sử thông báo (Placeholder) ---
    function renderNotificationHistory(history = []) {
        if (!notificationHistoryList) return;
        // Hiện tại chỉ hiển thị placeholder, bạn sẽ cần logic thực tế để thêm thông báo vào đây
        const emptyHistoryMessage = document.getElementById("emptyHistoryMessage"); // Lấy lại element này

        if (history.length === 0) {
            if (emptyHistoryMessage) {
                notificationHistoryList.innerHTML = ''; // Xóa các item cũ nếu có
                notificationHistoryList.appendChild(emptyHistoryMessage); // Thêm lại placeholder
                emptyHistoryMessage.style.display = 'block';
            } else {
                notificationHistoryList.innerHTML = '<p class="loading-text">Chưa có thông báo nào gần đây.</p>';
            }
        } else {
            if (emptyHistoryMessage) emptyHistoryMessage.style.display = 'none';
            // Ví dụ render thực tế (bạn cần điều chỉnh cho phù hợp với cấu trúc dữ liệu history của bạn)
            // notificationHistoryList.innerHTML = history.map(item => `<div class="history-item"><span class="history-icon"><i class="fas fa-info-circle"></i></span><span class="history-message">${item.message}</span><span class="history-time">${new Date(item.timestamp).toLocaleString('vi-VN')}</span></div>`).join('');
        }
    }
    function getNotificationHistory() { /* Logic lấy lịch sử từ đâu đó nếu có */ return []; }
    function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    // --- Khởi tạo ---
    loadSettings();
    // Set active link and show main section for current page
    const notificationsNavLink = Array.from(document.querySelectorAll('.nav-link')).find(link => link.textContent.trim().includes('Thông báo'));
    if (notificationsNavLink) showSection('notificationsPage', notificationsNavLink);

    loadBackgroundBasedOnLocation(DEFAULT_CITY_FOR_BACKGROUND);

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