// Global variables
let favoriteCities = [];
let isLoading = false;
const API_KEY = "037b6dda3ea6bd588dd48b35ae88f478"; // Your API key
const DEFAULT_CITY_FOR_BACKGROUND = "Da Nang"; // Fallback default city for page background

// Navigation functions (should be shared or present in each file if not shared)
function toggleMobileMenu() {
    const navMenu = document.getElementById("navMenu");
    if (navMenu) navMenu.classList.toggle("active");
}
// Make it globally accessible if called from HTML onclick
window.toggleMobileMenu = toggleMobileMenu;

function showSection(sectionName, navLinkElement) {
    const sections = document.querySelectorAll(".section");
    sections.forEach((section) => {
      section.style.display = "none";
    });

    const targetSection = document.getElementById(sectionName + "Section");
    if (targetSection) {
        targetSection.style.display = "block";
    } else {
        console.warn(`Section with ID '${sectionName}Section' not found on the current page.`);
    }

    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });
    if (navLinkElement) {
        navLinkElement.classList.add("active");
    }
}

// Mock weather data for demonstration
const mockWeatherData = {
    // This will be used if actual API call fails or for cities not in OpenWeatherMap
    // For a real app, you'd rely more on the API.
    'hanoi': { temp: 28, condition: 'sunny', icon: '01d', description: 'Nắng đẹp' },
    'ho chi minh': { temp: 32, condition: 'cloudy', icon: '02d', description: 'Có mây' },
    'da nang': { temp: 30, condition: 'partly-cloudy', icon: '02d', description: 'Có mây' },
    'hue': { temp: 26, condition: 'rainy', icon: '10d', description: 'Mưa nhẹ' },
    'can tho': { temp: 31, condition: 'sunny', icon: '01d', description: 'Nắng' },
    'nha trang': { temp: 29, condition: 'sunny', icon: '01d', description: 'Nắng đẹp' },
    'dalat': { temp: 22, condition: 'cloudy', icon: '03d', description: 'Nhiều mây' },
    'vung tau': { temp: 28, condition: 'windy', icon: '50d', description: 'Có gió' }, // Using mist icon for windy mock
    'hai phong': { temp: 25, condition: 'rainy', icon: '10d', description: 'Mưa' },
    'quy nhon': { temp: 30, condition: 'sunny', icon: '01d', description: 'Nắng' }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set active link and show main section for current page
    const citiesNavLink = Array.from(document.querySelectorAll('.nav-link')).find(link => {
        // Check if href exists and includes 'thanhpho.html' or text content matches
        return (link.href && link.href.includes('thanhpho.html')) || link.textContent.trim().includes('Thành phố');
    });
    if (citiesNavLink) {
         // Assuming 'citiesPageSection' is the ID of the main content section on thanhpho.html
        showSection('citiesPage', citiesNavLink);
    }

    loadFavoriteCities();
    setupEventListeners();
    updateDisplay();
    loadBackgroundBasedOnLocation(DEFAULT_CITY_FOR_BACKGROUND); // Set initial page background

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

// Setup event listeners
function setupEventListeners() {
    const addCityBtn = document.getElementById('addCityBtn');
    const newCityInput = document.getElementById('newCityInput');
    const tempToggle = document.getElementById('tempUnitToggle');

    if (addCityBtn) addCityBtn.addEventListener('click', handleAddCity);
    if (newCityInput) {
        newCityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleAddCity();
            }
        });
        // Auto-suggest functionality (placeholder)
        newCityInput.addEventListener('input', handleAutoSuggest);
    }

    if (tempToggle) {
        tempToggle.addEventListener('change', handleTempUnitChange);
    }
}

// Load favorite cities from localStorage
function loadFavoriteCities() {
    const stored = JSON.parse(localStorage.getItem('favoriteCities') || '[]');
    // Ensure loaded cities have necessary properties if they were saved in an older format
    favoriteCities = stored.map(city => ({
        id: city.id || Date.now(), // Add ID if missing
        name: city.name,
        temp: city.temp,
        condition: city.condition,
        icon: city.icon, // This should be the OpenWeatherMap icon code
        description: city.description,
        addedAt: city.addedAt || new Date().toISOString(),
        newlyAdded: false // Ensure this is false on load
    }));
}

// Save favorite cities to localStorage
function saveFavoriteCities() {
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
}

// Handle adding a new city
async function handleAddCity() {
    const input = document.getElementById('newCityInput');
    const cityName = input.value.trim();

    if (!cityName) {
        showNotification('Vui lòng nhập tên thành phố!', 'error');
        return;
    }

    if (favoriteCities.some(city => city.name.toLowerCase() === cityName.toLowerCase())) {
        showNotification('Thành phố này đã có trong danh sách!', 'error');
        input.value = '';
        return;
    }

    setLoading(true);

    try {
        // Simulate API call delay (optional, remove for production)
        // await new Promise(resolve => setTimeout(resolve, 1000));

        const weatherData = await getWeatherData(cityName);

        if (weatherData) {
            const newCity = {
                id: Date.now(),
                name: capitalizeWords(cityName),
                newlyAdded: true, // Flag for animation
                ...weatherData, // Includes temp, condition, icon (API code), description
                addedAt: new Date().toISOString()
            };

            favoriteCities.push(newCity);
            saveFavoriteCities();
            input.value = '';
            updateDisplay(); // This will call renderCities
            showNotification(`Đã thêm ${newCity.name} vào danh sách!`, 'success');
        } else {
            showNotification('Không tìm thấy thông tin thời tiết cho thành phố này!', 'error');
        }
    } catch (error) {
        showNotification('Có lỗi xảy ra khi thêm thành phố!', 'error');
    } finally {
        setLoading(false);
    }
}

// Get weather data (can be real API or mock)
async function getWeatherData(cityName) {
    const normalizedName = cityName.toLowerCase();
    // Prioritize real API call
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&lang=vi&appid=${API_KEY}`);
        if (!response.ok) {
            // If API fails or city not found, try mock data
            if (mockWeatherData[normalizedName]) {
                console.warn(`API call failed for ${cityName}, using mock data.`);
                return mockWeatherData[normalizedName];
            }
            console.error(`Weather data not found for ${cityName} via API or mock.`);
            return null; // Or throw an error
        }
        const data = await response.json();
        return {
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main.toLowerCase(), // e.g., 'clouds'
            icon: data.weather[0].icon, // Store the OpenWeatherMap icon code
            description: data.weather[0].description
        };
    } catch (error) {
        console.error(`Error fetching weather for ${cityName}:`, error);
         // Fallback to mock data on error
        if (mockWeatherData[normalizedName]) {
            console.warn(`API call errored for ${cityName}, using mock data.`);
            return mockWeatherData[normalizedName];
        }
        return null;
    }
}

// Helper to convert OpenWeatherMap icon codes to Font Awesome classes (simplified)
function getWeatherIconClass(apiIconCode) {
    const mapping = {
        '01d': 'fas fa-sun', '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun', '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud', '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud-meatball', '04n': 'fas fa-cloud-meatball', // Or just fa-cloud
        '09d': 'fas fa-cloud-showers-heavy', '09n': 'fas fa-cloud-showers-heavy',
        '10d': 'fas fa-cloud-sun-rain', '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt', '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake', '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog', '50n': 'fas fa-smog',
    };
    return mapping[apiIconCode] || 'fas fa-question-circle'; // Default icon
}

// Render cities to the DOM
function renderCities() {
    const container = document.getElementById('favoriteCitiesList');
    const emptyMessage = document.getElementById('emptyListMessage');

    if (!container || !emptyMessage) {
        console.error("Required DOM elements for rendering cities not found.");
        return;
    }

    // Always clear previous city items before rendering
    const oldCityItems = container.querySelectorAll('.favorite-city-item');
    oldCityItems.forEach(item => item.remove());

    favoriteCities.forEach((city, index) => {
        const cityElement = document.createElement('div');
        cityElement.classList.add('favorite-city-item');
        if (city.newlyAdded) {
            cityElement.classList.add('newly-added');
            // Remove the flag and class after animation
            setTimeout(() => {
                cityElement.classList.remove('newly-added');
                // Optional: delete city.newlyAdded; // Clean up the flag from the object if not needed after animation
            }, 600); // Match animation duration from thanhpho.css
        }

        // Use getWeatherIconClass to convert stored icon code to Font Awesome class for display
        const faIconClass = getWeatherIconClass(city.icon);

        cityElement.innerHTML = `
            <div class="city-info" onclick="viewCityWeather('${city.name}')">
                <div class="city-name">${city.name}</div>
                <div class="city-weather">
                    <i class="${faIconClass} weather-icon weather-${city.condition || 'unknown'}"></i>
                    <span>${city.temp !== undefined ? city.temp + '°C' : 'N/A'} - ${city.description || 'Không có dữ liệu'}</span>
                </div>
            </div>
            <div class="city-actions">
                <button class="btn-refresh" title="Làm mới thời tiết" onclick="refreshCityWeather(${index})">
                    <i class="fas fa-sync-alt"></i>
                </button>
                <button class="btn-delete" title="Xóa thành phố" onclick="removeCity(${index})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        // Append the new city item before the empty message placeholder
        container.insertBefore(cityElement, emptyMessage);
    });
}

// Update the display (shows/hides empty message and calls renderCities)
function updateDisplay() {
    const container = document.getElementById('favoriteCitiesList');
    const emptyMessage = document.getElementById('emptyListMessage');

    if (!container || !emptyMessage) {
        console.error("Required DOM elements for updating display not found.");
        return;
    }

    if (favoriteCities.length === 0) {
        emptyMessage.style.display = 'block'; // Show the placeholder
        // Remove any existing city items
        const cityItems = container.querySelectorAll('.favorite-city-item');
        cityItems.forEach(item => item.remove());
    } else {
        emptyMessage.style.display = 'none'; // Hide the placeholder
        renderCities(); // renderCities will now append new city items
    }
}

// Remove a city
function removeCity(index) {
    const cityName = favoriteCities[index].name;
    favoriteCities.splice(index, 1);
    saveFavoriteCities();
    updateDisplay();
    showNotification(`Đã xóa ${cityName} khỏi danh sách!`, 'success');
}
window.removeCity = removeCity; // Make it global for onclick

// Refresh weather for a specific city
async function refreshCityWeather(index) {
    const cityToRefresh = favoriteCities[index];
    if (!cityToRefresh) return;

    // Indicate loading on the specific item (more advanced UI needed for this)
    // For now, we'll use a console log or a simple global indicator
    console.log(`Refreshing weather for ${cityToRefresh.name}...`);
    // You could add a spinner class to the specific city item here

    try {
        const weatherData = await getWeatherData(cityToRefresh.name);
        if (weatherData) {
            // Update data, keep existing properties, ensure newlyAdded is false
            favoriteCities[index] = { ...cityToRefresh, ...weatherData, newlyAdded: false };
            saveFavoriteCities();
            updateDisplay(); // Re-render the list to show updated data
            showNotification(`Đã cập nhật thời tiết cho ${cityToRefresh.name}!`, 'success');
        } else {
            showNotification(`Không thể làm mới thời tiết cho ${cityToRefresh.name}.`, 'error');
        }
    } catch (error) {
        showNotification(`Lỗi khi làm mới thời tiết cho ${cityToRefresh.name}!`, 'error');
    } finally {
        // Remove loading indicator from the specific city item
        console.log(`Finished refreshing weather for ${cityToRefresh.name}.`);
    }
}
window.refreshCityWeather = refreshCityWeather; // Make it global for onclick

// Set loading state for the add button or general loading
function setLoading(loading, isRefresh = false) {
    isLoading = loading;
    const addBtn = document.getElementById('addCityBtn');
    if (addBtn && !isRefresh) {
        addBtn.disabled = loading;
        addBtn.innerHTML = loading ?
        '<span class="loading-indicator"></span> Đang thêm...' :
        '<i class="fas fa-plus"></i> Thêm thành phố';
    }
    // If isRefresh, you might want to show a spinner on the specific city item
}

// Show notification
function showNotification(message, type = 'info') { // type can be 'info', 'success', 'error'
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger reflow to enable transition
    notification.offsetHeight;

    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300); // Match transition duration
    }, 3000); // Notification disappears after 3 seconds
}
window.showNotification = showNotification; // Make it global if needed elsewhere

// Capitalize words in a string
function capitalizeWords(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Function to redirect to forecast page
function viewCityWeather(cityName) {
    window.location.href = `../html/dubao.html?city=${encodeURIComponent(cityName)}`;
}
window.viewCityWeather = viewCityWeather; // Make it global for onclick

// Placeholder for auto-suggest
function handleAutoSuggest() {
    // console.log('Auto-suggest input:', this.value);
    // Implement auto-suggestion logic here if needed
}

// Placeholder for temperature unit change
function handleTempUnitChange() {
    console.log('Temperature unit toggled. Implement conversion logic for favorite cities list.');
    // This would require re-fetching or re-calculating temperatures for all displayed cities
    // and then calling updateDisplay().
}

// --- Dynamic Background Functions (copied from thongbao.js) ---
function setDynamicBackground(weatherData) {
    const body = document.body;
    const existingWeatherClasses = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'clear-night', 'misty', 'hot'];

    existingWeatherClasses.forEach(cls => {
        if (body.classList.contains(cls)) {
            body.classList.remove(cls);
        }
    });

    if (!weatherData || !weatherData.weather || !weatherData.weather[0] || !weatherData.main) {
        console.warn("Dữ liệu thời tiết không đủ để xác định hình nền trên trang thành phố. Sử dụng nền mặc định.");
        return;
    }

    const condition = weatherData.weather[0].main.toLowerCase();
    const iconAPI = weatherData.weather[0].icon; // API icon code e.g. "01d"
    const tempCelsius = weatherData.main.temp;
    let newWeatherClass = '';

    if (iconAPI && iconAPI.endsWith('n')) { // Night
        if (condition.includes('clear')) newWeatherClass = 'clear-night';
        else if (condition.includes('cloud')) newWeatherClass = 'cloudy'; // Or a specific 'cloudy-night'
        else if (condition.includes('rain') || condition.includes('drizzle')) newWeatherClass = 'rainy';
        else if (condition.includes('snow')) newWeatherClass = 'snowy';
        else if (condition.includes('thunderstorm')) newWeatherClass = 'stormy';
        else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze') || condition.includes('smoke')) newWeatherClass = 'misty';
        else newWeatherClass = 'clear-night';
    } else { // Day
        if (tempCelsius > 33) newWeatherClass = 'hot'; // Ngưỡng nhiệt độ cho 'hot'
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

async function fetchWeatherForBackground(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=vi&appid=${API_KEY}`);
        if (!response.ok) {
            console.error(`Không thể lấy thời tiết cho thành phố (nền): ${city}`);
            setDynamicBackground(null); // Reset to default background on error
            return;
        }
        const data = await response.json();
        setDynamicBackground(data);
    } catch (error) {
        console.error("Lỗi khi lấy thời tiết cho nền (thành phố):", error);
        setDynamicBackground(null); // Reset to default background on error
    }
}