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
          
          // Tải cài đặt thông báo email
          loadEmailNotificationSettings();
        }
      }
    })
    .catch(error => console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error));

    const emailInput = document.getElementById("emailAddress");
    const emailDailyEnabledCheckbox = document.getElementById("emailDailyEnabled");
    const emailDailyTimeInput = document.getElementById("emailDailyTime");
    const emailDailyFrequencySelect = document.getElementById("emailDailyFrequency");
    const emailWeeklyEnabledCheckbox = document.getElementById("emailWeeklyEnabled");
    const emailWeeklyDaySelect = document.getElementById("emailWeeklyDay");
    const emailWeeklyTimeInput = document.getElementById("emailWeeklyTime");
    const saveEmailSettingsBtn = document.getElementById("saveEmailSettings");
    
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
        const existingWeatherClasses = ['sunny', 'cloudy', 'overcast', 'rainy', 'snowy', 'stormy', 'clear-night', 'cloudy-night', 'overcast-night', 'misty', 'hot'];

        existingWeatherClasses.forEach(cls => {
            if (body.classList.contains(cls)) {
                body.classList.remove(cls);
            }
        });

        let newWeatherClass = ''; // Default to empty, so body's default CSS background applies if no match

        if (!weatherData || !weatherData.weather || !weatherData.weather[0] || !weatherData.main) {
            console.warn("Dữ liệu thời tiết không đủ để xác định hình nền trên trang thông báo. Sử dụng nền mặc định.");
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
                    console.warn(`Could not determine city from coordinates for background. Falling back to stored/default city.`);
                    // Fallback to localStorage or default if city from coords fails
                    const lastSearchedCity = localStorage.getItem('lastSearchedCity');
                    if (lastSearchedCity) {
                        console.log(`Using last searched city from localStorage for background: ${lastSearchedCity}.`);
                        fetchWeatherForBackground(lastSearchedCity);
                    } else {
                        console.warn(`No last searched city found. Falling back to default: ${fallbackCity}.`);
                        fetchWeatherForBackground(fallbackCity);
                    }
                }
            }, (error) => {
                console.warn(`Geolocation failed for background: ${error.message}. Falling back to stored/default city.`);
                // Fallback to localStorage or default if geolocation fails
                const lastSearchedCity = localStorage.getItem('lastSearchedCity');
                if (lastSearchedCity) {
                    console.log(`Using last searched city from localStorage for background: ${lastSearchedCity}.`);
                    fetchWeatherForBackground(lastSearchedCity);
                } else {
                    console.warn(`No last searched city found. Falling back to default: ${fallbackCity}.`);
                    fetchWeatherForBackground(fallbackCity);
                }
            }, { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 });
        } else {
            console.warn(`Geolocation is not supported by this browser for background. Falling back to stored/default city.`);
            // Fallback to localStorage or default if geolocation not supported
            const lastSearchedCity = localStorage.getItem('lastSearchedCity');
            if (lastSearchedCity) {
                console.log(`Using last searched city from localStorage for background: ${lastSearchedCity}.`);
                fetchWeatherForBackground(lastSearchedCity);
            } else {
                console.warn(`No last searched city found. Falling back to default: ${fallbackCity}.`);
                fetchWeatherForBackground(fallbackCity);
            }
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
    // Ensure this only runs on thongbao.html
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
    
    // Xử lý cài đặt thông báo email
    function loadEmailNotificationSettings() {
      fetch('/api/email-notifications')
        .then(response => response.json())
        .then(data => {
          if (data.success && data.emailSettings) {
            const settings = data.emailSettings;
            
            // Điền thông tin email
            if (emailInput) emailInput.value = settings.email || '';
            
            // Cài đặt thông báo hàng ngày
            if (emailDailyEnabledCheckbox) emailDailyEnabledCheckbox.checked = settings.enabled && settings.dailyWeather.enabled;
            if (emailDailyTimeInput) emailDailyTimeInput.value = settings.dailyWeather.time || '07:00';
            if (emailDailyFrequencySelect) emailDailyFrequencySelect.value = settings.dailyWeather.frequency || 'daily';
            
            // Cài đặt báo cáo hàng tuần
            if (emailWeeklyEnabledCheckbox) emailWeeklyEnabledCheckbox.checked = settings.enabled && settings.weeklyReport.enabled;
            if (emailWeeklyDaySelect) emailWeeklyDaySelect.value = settings.weeklyReport.day || 'monday';
            if (emailWeeklyTimeInput) emailWeeklyTimeInput.value = settings.weeklyReport.time || '08:00';
            
            console.log('Đã tải cài đặt thông báo email thành công');
          }
        })
        .catch(error => console.error('Lỗi khi tải cài đặt thông báo email:', error));
    }
    
    function saveEmailNotificationSettings() {
      // Kiểm tra xem người dùng đã đăng nhập chưa
      fetch('/api/user')
        .then(response => response.json())
        .then(userData => {
          if (!userData.isAuthenticated) {
            alert('Bạn cần đăng nhập để lưu cài đặt thông báo email');
            document.getElementById('loginTriggerLink').click(); // Mở modal đăng nhập
            return;
          }
          
          // Người dùng đã đăng nhập, tiến hành lưu cài đặt
          const emailSettings = {
            enabled: emailDailyEnabledCheckbox.checked || emailWeeklyEnabledCheckbox.checked,
            email: emailInput.value,
            dailyWeather: {
              enabled: emailDailyEnabledCheckbox.checked,
              time: emailDailyTimeInput.value,
              frequency: emailDailyFrequencySelect.value
            },
            weeklyReport: {
              enabled: emailWeeklyEnabledCheckbox.checked,
              day: emailWeeklyDaySelect.value,
              time: emailWeeklyTimeInput.value
            },
            severeWeather: {
              enabled: true, // Mặc định bật thông báo thời tiết khắc nghiệt
              conditions: ['storm', 'heavy-rain', 'extreme-heat', 'fog']
            }
          };
          
          // Kiểm tra email hợp lệ
          if (emailSettings.enabled && !isValidEmail(emailInput.value)) {
            alert('Vui lòng nhập địa chỉ email hợp lệ');
            return;
          }
          
          // Gửi cài đặt lên server
          fetch('/api/email-notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emailSettings })
          })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                alert('Đã lưu cài đặt thông báo email thành công');
              } else {
                alert(data.message || 'Lỗi khi lưu cài đặt thông báo email');
              }
            })
            .catch(error => {
              console.error('Lỗi khi lưu cài đặt thông báo email:', error);
              alert('Đã xảy ra lỗi khi lưu cài đặt. Vui lòng thử lại sau.');
            });
        })
        .catch(error => {
          console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
          alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        });
    }
    
    // Thêm sự kiện cho nút lưu cài đặt email
    if (saveEmailSettingsBtn) {
      saveEmailSettingsBtn.addEventListener('click', saveEmailNotificationSettings);
    }
    
    // Thêm sự kiện thay đổi cho các checkbox để cập nhật trạng thái enabled
    if (emailDailyEnabledCheckbox) {
      emailDailyEnabledCheckbox.addEventListener('change', function() {
        if (this.checked && !isValidEmail(emailInput.value)) {
          alert('Vui lòng nhập địa chỉ email hợp lệ để bật thông báo');
        }
      });
    }
    
    if (emailWeeklyEnabledCheckbox) {
      emailWeeklyEnabledCheckbox.addEventListener('change', function() {
        if (this.checked && !isValidEmail(emailInput.value)) {
          alert('Vui lòng nhập địa chỉ email hợp lệ để bật thông báo');
        }
      });
    }
});

// Hàm kiểm tra email hợp lệ
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}