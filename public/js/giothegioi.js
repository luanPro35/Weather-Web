document.addEventListener('DOMContentLoaded', function() {
    // API key cho OpenWeatherMap
    const API_KEY = '9ef0cd15c8c6a0f6c3c4f05c2ee4a12f';
    
    // Các biến DOM
    const localTimeElement = document.getElementById('localTime');
    const localDateElement = document.getElementById('localDate');
    const localLocationElement = document.getElementById('localLocation');
    const worldClockGrid = document.getElementById('worldClockGrid');
    const timezoneSelect = document.getElementById('timezoneSelect');
    const addTimezoneButton = document.getElementById('addTimezoneButton');
    const sourceTimezoneSelect = document.getElementById('sourceTimezone');
    const targetTimezoneSelect = document.getElementById('targetTimezone');
    const sourceTimeInput = document.getElementById('sourceTime');
    const targetTimeInput = document.getElementById('targetTime');
    const convertTimeButton = document.getElementById('convertTimeButton');
    const citySearchInput = document.getElementById('citySearch');
    const searchButton = document.getElementById('searchButton');
    
    // Danh sách múi giờ phổ biến
    const popularTimezones = [
        { name: 'Hà Nội, Việt Nam', timezone: 'Asia/Ho_Chi_Minh', offset: '+07:00' },
        { name: 'New York, Hoa Kỳ', timezone: 'America/New_York', offset: '-05:00/-04:00' },
        { name: 'London, Anh', timezone: 'Europe/London', offset: '+00:00/+01:00' },
        { name: 'Tokyo, Nhật Bản', timezone: 'Asia/Tokyo', offset: '+09:00' },
        { name: 'Sydney, Úc', timezone: 'Australia/Sydney', offset: '+10:00/+11:00' },
        { name: 'Paris, Pháp', timezone: 'Europe/Paris', offset: '+01:00/+02:00' },
        { name: 'Berlin, Đức', timezone: 'Europe/Berlin', offset: '+01:00/+02:00' },
        { name: 'Moscow, Nga', timezone: 'Europe/Moscow', offset: '+03:00' },
        { name: 'Dubai, UAE', timezone: 'Asia/Dubai', offset: '+04:00' },
        { name: 'Singapore', timezone: 'Asia/Singapore', offset: '+08:00' },
        { name: 'Los Angeles, Hoa Kỳ', timezone: 'America/Los_Angeles', offset: '-08:00/-07:00' },
        { name: 'Toronto, Canada', timezone: 'America/Toronto', offset: '-05:00/-04:00' },
        { name: 'São Paulo, Brazil', timezone: 'America/Sao_Paulo', offset: '-03:00/-02:00' },
        { name: 'Cairo, Ai Cập', timezone: 'Africa/Cairo', offset: '+02:00' },
        { name: 'Bangkok, Thái Lan', timezone: 'Asia/Bangkok', offset: '+07:00' },
        { name: 'Seoul, Hàn Quốc', timezone: 'Asia/Seoul', offset: '+09:00' },
        { name: 'Mumbai, Ấn Độ', timezone: 'Asia/Kolkata', offset: '+05:30' },
        { name: 'Beijing, Trung Quốc', timezone: 'Asia/Shanghai', offset: '+08:00' },
        { name: 'Mexico City, Mexico', timezone: 'America/Mexico_City', offset: '-06:00/-05:00' },
        { name: 'Johannesburg, Nam Phi', timezone: 'Africa/Johannesburg', offset: '+02:00' }
    ];
    
    // Danh sách múi giờ đã lưu
    let savedTimezones = [];
    
    // Khởi tạo trang
function initPage() {
    updateLocalTime();
    loadSavedTimezones();
    populateTimezoneSelects();
    setupEventListeners();
    loadBackgroundBasedOnLocation('Hanoi');
    
    // Cập nhật thời gian mỗi giây
    setInterval(updateAllClocks, 1000);
}

// Kiểm tra xem múi giờ có đang áp dụng DST không
function isDaylightSavingTime(date, timezone) {
    // Lấy offset của múi giờ vào tháng 1 (mùa đông)
    const january = new Date(date.getFullYear(), 0, 1);
    const januaryOffset = getTimezoneOffset(january, timezone);
    
    // Lấy offset hiện tại
    const currentOffset = getTimezoneOffset(date, timezone);
    
    // Nếu offset hiện tại khác offset mùa đông, có nghĩa là đang áp dụng DST
    return januaryOffset !== currentOffset;
}

// Lấy offset của múi giờ
function getTimezoneOffset(date, timezone) {
    try {
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        return (utcDate - tzDate) / 60000;
    } catch (e) {
        console.error('Lỗi khi tính offset múi giờ:', e);
        return 0;
    }
}

// Tính chênh lệch giờ giữa hai múi giờ
function getTimeDifference(timezone1, timezone2) {
    try {
        const now = new Date();
        const time1 = new Date(now.toLocaleString('en-US', { timeZone: timezone1 }));
        const time2 = new Date(now.toLocaleString('en-US', { timeZone: timezone2 }));
        
        // Tính chênh lệch theo giờ
        const diffHours = (time2 - time1) / (1000 * 60 * 60);
        return Math.round(diffHours);
    } catch (e) {
        console.error('Lỗi khi tính chênh lệch giờ:', e);
        return 0;
    }
}

// Lấy mã quốc gia từ tên thành phố
function getCountryCodeFromCity(cityName) {
    // Bảng ánh xạ tên thành phố/quốc gia sang mã quốc gia
    const countryMapping = {
        'Việt Nam': 'vn',
        'Hà Nội': 'vn',
        'Hoa Kỳ': 'us',
        'New York': 'us',
        'Los Angeles': 'us',
        'Anh': 'gb',
        'London': 'gb',
        'Nhật Bản': 'jp',
        'Tokyo': 'jp',
        'Úc': 'au',
        'Sydney': 'au',
        'Pháp': 'fr',
        'Paris': 'fr',
        'Đức': 'de',
        'Berlin': 'de',
        'Nga': 'ru',
        'Moscow': 'ru',
        'UAE': 'ae',
        'Dubai': 'ae',
        'Singapore': 'sg',
        'Canada': 'ca',
        'Toronto': 'ca',
        'Brazil': 'br',
        'São Paulo': 'br',
        'Ai Cập': 'eg',
        'Cairo': 'eg',
        'Thái Lan': 'th',
        'Bangkok': 'th',
        'Hàn Quốc': 'kr',
        'Seoul': 'kr',
        'Ấn Độ': 'in',
        'Mumbai': 'in',
        'Trung Quốc': 'cn',
        'Beijing': 'cn',
        'Mexico': 'mx',
        'Mexico City': 'mx',
        'Nam Phi': 'za',
        'Johannesburg': 'za'
    };
    
    // Tìm mã quốc gia từ tên thành phố
    for (const [key, value] of Object.entries(countryMapping)) {
        if (cityName.includes(key)) {
            return value;
        }
    }
    
    return null;
}
    
    // Cập nhật thời gian địa phương
    function updateLocalTime() {
        const now = new Date();
        
        // Cập nhật thời gian
        localTimeElement.textContent = now.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        // Cập nhật ngày
        localDateElement.textContent = now.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        // Lấy vị trí hiện tại
        if (navigator.geolocation && localLocationElement.textContent === 'Vị trí hiện tại của bạn') {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Lấy tên thành phố từ tọa độ
                getCityFromCoordinates(lat, lon, API_KEY).then(cityName => {
                    if (cityName) {
                        localLocationElement.textContent = cityName;
                    }
                });
            }, error => {
                console.warn('Không thể lấy vị trí:', error.message);
                localLocationElement.textContent = 'Vị trí không xác định';
            });
        }
    }
    
    // Cập nhật tất cả đồng hồ
    function updateAllClocks() {
        updateLocalTime();
        
        // Cập nhật các đồng hồ thế giới
        savedTimezones.forEach(timezone => {
            const clockElement = document.getElementById(`clock-${timezone.timezone.replace(/\//g, '-')}`);
            if (clockElement) {
                const timeElement = clockElement.querySelector('.clock-time');
                const dateElement = clockElement.querySelector('.clock-date');
                
                const now = new Date();
                const options = { timeZone: timezone.timezone, hour12: false };
                
                timeElement.textContent = now.toLocaleTimeString('vi-VN', {
                    ...options,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                
                dateElement.textContent = now.toLocaleDateString('vi-VN', {
                    ...options,
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });
            }
        });
    }
    
    // Tải các múi giờ đã lưu từ localStorage
function loadSavedTimezones() {
    const saved = localStorage.getItem('savedTimezones');
    if (saved) {
        savedTimezones = JSON.parse(saved);
        
        // Đảm bảo tất cả các múi giờ đều có thuộc tính favorite
        savedTimezones = savedTimezones.map(tz => ({
            ...tz,
            favorite: tz.favorite || false
        }));
        
        // Sắp xếp để các mục yêu thích lên đầu
        savedTimezones.sort((a, b) => {
            if (a.favorite === b.favorite) return 0;
            return a.favorite ? -1 : 1;
        });
        
        renderWorldClocks();
    } else {
        // Thêm một số múi giờ mặc định
        savedTimezones = [
            { name: 'Hà Nội, Việt Nam', timezone: 'Asia/Ho_Chi_Minh', offset: '+07:00', favorite: true },
            { name: 'New York, Hoa Kỳ', timezone: 'America/New_York', offset: '-05:00/-04:00', favorite: false },
            { name: 'London, Anh', timezone: 'Europe/London', offset: '+00:00/+01:00', favorite: false },
            { name: 'Tokyo, Nhật Bản', timezone: 'Asia/Tokyo', offset: '+09:00', favorite: false }
        ];
        saveTimezones();
        renderWorldClocks();
    }
}
    
    // Lưu múi giờ vào localStorage
function saveTimezones() {
    // Sắp xếp để các mục yêu thích lên đầu trước khi lưu
    savedTimezones.sort((a, b) => {
        if (a.favorite === b.favorite) return 0;
        return a.favorite ? -1 : 1;
    });
    localStorage.setItem('savedTimezones', JSON.stringify(savedTimezones));
}
    
    // Hiển thị các đồng hồ thế giới
function renderWorldClocks() {
    worldClockGrid.innerHTML = '';
    
    savedTimezones.forEach(timezone => {
        const clockCard = createClockCard(timezone);
        worldClockGrid.appendChild(clockCard);
    });
}
    
    // Tạo thẻ đồng hồ
function createClockCard(timezone) {
    const clockCard = document.createElement('div');
    clockCard.className = 'clock-card';
    clockCard.id = `clock-${timezone.timezone.replace(/\//g, '-')}`;
    
    const now = new Date();
    const options = { timeZone: timezone.timezone, hour12: false };
    
    // Lấy thông tin thời gian hiện tại theo múi giờ
    const time = now.toLocaleTimeString('vi-VN', {
        ...options,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const date = now.toLocaleDateString('vi-VN', {
        ...options,
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    
    // Kiểm tra trạng thái DST (Daylight Saving Time)
    const isDST = isDaylightSavingTime(now, timezone.timezone);
    const dstStatus = isDST ? '<span class="dst-badge">DST ON</span>' : '';
    
    // Tính chênh lệch giờ với múi giờ địa phương
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeDiff = getTimeDifference(localTimezone, timezone.timezone);
    const timeDiffDisplay = timeDiff > 0 ? `+${timeDiff}` : timeDiff;
    
    // Lấy mã quốc gia từ tên thành phố
    const countryCode = getCountryCodeFromCity(timezone.name);
    const flagIcon = countryCode ? `<img src="https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png" class="flag-icon" alt="${countryCode}">` : '';
    
    // Tạo nút yêu thích
    const isFavorite = timezone.favorite;
    const favoriteClass = isFavorite ? 'favorite active' : 'favorite';
    
    clockCard.innerHTML = `
        <div class="clock-header">
            ${flagIcon}
            <div class="clock-location"><i class="fas fa-map-marker-alt"></i> ${timezone.name}</div>
            <button class="${favoriteClass}" data-timezone="${timezone.timezone}"><i class="fas fa-star"></i></button>
        </div>
        <div class="clock-time">${time}</div>
        <div class="clock-date">${date}</div>
        <div class="clock-info">
            <div class="clock-timezone">UTC ${timezone.offset} ${dstStatus}</div>
            <div class="time-difference">Chênh lệch: ${timeDiffDisplay} giờ</div>
        </div>
        <button class="remove-clock" data-timezone="${timezone.timezone}"><i class="fas fa-times"></i></button>
    `;
    
    return clockCard;
}
    
    // Điền các múi giờ vào dropdown
    function populateTimezoneSelects() {
        // Xóa các tùy chọn hiện tại
        timezoneSelect.innerHTML = '<option value="" disabled selected>Chọn múi giờ...</option>';
        sourceTimezoneSelect.innerHTML = '';
        targetTimezoneSelect.innerHTML = '';
        
        // Thêm các múi giờ phổ biến
        popularTimezones.forEach(tz => {
            const option = document.createElement('option');
            option.value = tz.timezone;
            option.textContent = `${tz.name} (UTC ${tz.offset})`;
            timezoneSelect.appendChild(option.cloneNode(true));
            
            sourceTimezoneSelect.appendChild(option.cloneNode(true));
            targetTimezoneSelect.appendChild(option.cloneNode(true));
        });
        
        // Đặt múi giờ mặc định cho bộ chuyển đổi
        const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localOption = Array.from(sourceTimezoneSelect.options).find(option => option.value === localTimezone);
        if (localOption) {
            localOption.selected = true;
        } else {
            sourceTimezoneSelect.options[0].selected = true;
        }
        
        targetTimezoneSelect.options[0].selected = true;
    }
    
    // Thiết lập các sự kiện
function setupEventListeners() {
    // Thêm múi giờ mới
    addTimezoneButton.addEventListener('click', () => {
        const selectedTimezone = timezoneSelect.value;
        if (!selectedTimezone) return;
        
        const selectedOption = timezoneSelect.options[timezoneSelect.selectedIndex];
        const timezoneName = selectedOption.textContent.split(' (UTC ')[0];
        const timezoneOffset = selectedOption.textContent.match(/\(UTC ([^)]+)\)/)[1];
        
        // Kiểm tra xem múi giờ đã tồn tại chưa
        const exists = savedTimezones.some(tz => tz.timezone === selectedTimezone);
        if (exists) {
            showNotification('Múi giờ này đã được thêm vào danh sách', 'error');
            return;
        }
        
        // Thêm múi giờ mới
        savedTimezones.push({
            name: timezoneName,
            timezone: selectedTimezone,
            offset: timezoneOffset,
            favorite: false
        });
        
        saveTimezones();
        renderWorldClocks();
        showNotification('Đã thêm múi giờ mới', 'success');
    });
    
    // Xóa múi giờ và xử lý nút yêu thích
    worldClockGrid.addEventListener('click', (e) => {
        // Xử lý nút xóa
        if (e.target.closest('.remove-clock')) {
            const button = e.target.closest('.remove-clock');
            const timezone = button.dataset.timezone;
            
            savedTimezones = savedTimezones.filter(tz => tz.timezone !== timezone);
            saveTimezones();
            renderWorldClocks();
            showNotification('Đã xóa múi giờ', 'info');
        }
        
        // Xử lý nút yêu thích
        if (e.target.closest('.favorite')) {
            const button = e.target.closest('.favorite');
            const timezone = button.dataset.timezone;
            
            // Tìm và cập nhật trạng thái yêu thích
            const timezoneIndex = savedTimezones.findIndex(tz => tz.timezone === timezone);
            if (timezoneIndex !== -1) {
                savedTimezones[timezoneIndex].favorite = !savedTimezones[timezoneIndex].favorite;
                
                // Sắp xếp lại danh sách để các mục yêu thích lên đầu
                savedTimezones.sort((a, b) => {
                    if (a.favorite === b.favorite) return 0;
                    return a.favorite ? -1 : 1;
                });
                
                saveTimezones();
                renderWorldClocks();
                
                const status = savedTimezones[timezoneIndex].favorite ? 'đã ghim' : 'đã bỏ ghim';
                showNotification(`Múi giờ ${status}`, 'success');
            }
        }
    });
    
    // Chuyển đổi giờ
    convertTimeButton.addEventListener('click', () => {
        const sourceTime = sourceTimeInput.value;
        if (!sourceTime) {
            showNotification('Vui lòng chọn thời gian nguồn', 'error');
            return;
        }
        
        const sourceTimezone = sourceTimezoneSelect.value;
        const targetTimezone = targetTimezoneSelect.value;
        
        if (!sourceTimezone || !targetTimezone) {
            showNotification('Vui lòng chọn múi giờ nguồn và đích', 'error');
            return;
        }
        
        // Chuyển đổi thời gian
        const date = new Date(sourceTime);
        const options = { timeZone: targetTimezone };
        
        // Tính toán chênh lệch múi giờ
        const sourceDate = new Date(date.toLocaleString('en-US', { timeZone: sourceTimezone }));
        const targetDate = new Date(date.toLocaleString('en-US', { timeZone: targetTimezone }));
        const offset = (targetDate - sourceDate) / (60 * 60 * 1000);
        
        // Điều chỉnh thời gian
        date.setHours(date.getHours() + offset);
        
        // Định dạng kết quả
        const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            targetTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
            showNotification('Đã chuyển đổi thời gian thành công', 'success');
        });
        
        // Tìm kiếm thành phố
        searchButton.addEventListener('click', () => {
            searchCity();
        });
        
        citySearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchCity();
            }
        });
        
        // Thiết lập thời gian nguồn mặc định
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        sourceTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    // Tìm kiếm thành phố
    function searchCity() {
        const query = citySearchInput.value.trim();
        if (!query) {
            showNotification('Vui lòng nhập tên thành phố', 'error');
            return;
        }
        
        // Tìm kiếm múi giờ phù hợp
        const matchingTimezones = popularTimezones.filter(tz => 
            tz.name.toLowerCase().includes(query.toLowerCase())
        );
        
        if (matchingTimezones.length === 0) {
            showNotification('Không tìm thấy thành phố phù hợp', 'error');
            return;
        }
        
        // Hiển thị kết quả tìm kiếm
        const searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        searchResults.innerHTML = `
            <h3>Kết quả tìm kiếm cho "${query}"</h3>
            <div class="search-results-list"></div>
        `;
        
        const resultsList = searchResults.querySelector('.search-results-list');
        
        matchingTimezones.forEach(tz => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <div class="result-name">${tz.name}</div>
                <div class="result-timezone">UTC ${tz.offset}</div>
                <button class="btn btn-primary btn-sm add-timezone-btn" data-timezone="${tz.timezone}" data-name="${tz.name}" data-offset="${tz.offset}">
                    <i class="fas fa-plus"></i> Thêm
                </button>
            `;
            resultsList.appendChild(resultItem);
        });
        
        // Hiển thị kết quả tìm kiếm
        const container = document.querySelector('.container');
        const existingResults = document.querySelector('.search-results');
        if (existingResults) {
            container.removeChild(existingResults);
        }
        
        container.insertBefore(searchResults, document.querySelector('.world-clock-grid'));
        
        // Thêm sự kiện cho các nút thêm
        document.querySelectorAll('.add-timezone-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const timezone = btn.dataset.timezone;
                const name = btn.dataset.name;
                const offset = btn.dataset.offset;
                
                // Kiểm tra xem múi giờ đã tồn tại chưa
                const exists = savedTimezones.some(tz => tz.timezone === timezone);
                if (exists) {
                    showNotification('Múi giờ này đã được thêm vào danh sách', 'error');
                    return;
                }
                
                // Thêm múi giờ mới
                savedTimezones.push({
                    name,
                    timezone,
                    offset
                });
                
                saveTimezones();
                renderWorldClocks();
                showNotification('Đã thêm múi giờ mới', 'success');
                
                // Xóa kết quả tìm kiếm
                container.removeChild(searchResults);
            });
        });
    }
    
    // Hiển thị thông báo
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Hiệu ứng hiển thị
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Lấy tên thành phố từ tọa độ
    async function getCityFromCoordinates(lat, lon, apiKey) {
        try {
            const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
            if (!response.ok) {
                throw new Error('Không thể lấy thông tin vị trí');
            }
            const data = await response.json();
            if (data && data.length > 0) {
                return data[0].name;
            }
            return null;
        } catch (error) {
            console.error('Lỗi khi lấy tên thành phố:', error);
            return null;
        }
    }
    
    // Thiết lập nền động dựa trên thời tiết
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
                    fetchWeatherForBackground(fallbackCity);
                }
            }, (error) => {
                console.warn(`Geolocation failed for background: ${error.message}. Falling back to stored/default city.`);
                fetchWeatherForBackground(fallbackCity);
            }, { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 });
        } else {
            console.warn('Geolocation not supported for background. Using default city.');
            fetchWeatherForBackground(fallbackCity);
        }
    }

    // Lấy thông tin thời tiết cho nền động
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
            console.error('Lỗi khi lấy dữ liệu thời tiết cho nền:', error);
            setDynamicBackground(null);
        }
    }

    // Thiết lập nền động dựa trên thời tiết
    function setDynamicBackground(weatherData) {
        const weatherAnimation = document.getElementById('weatherAnimation');
        if (!weatherAnimation) return;

        // Xóa tất cả các lớp thời tiết hiện tại
        weatherAnimation.className = 'weather-animation';

        if (!weatherData) {
            // Nếu không có dữ liệu thời tiết, sử dụng nền mặc định (trời quang)
            weatherAnimation.classList.add('clear-day');
            return;
        }

        const weatherId = weatherData.weather[0].id;
        const sunset = new Date(weatherData.sys.sunset * 1000);
        const sunrise = new Date(weatherData.sys.sunrise * 1000);
        const now = new Date();
        const isNight = now < sunrise || now > sunset;

        // Thiết lập lớp CSS dựa trên mã thời tiết
        if (weatherId >= 200 && weatherId < 300) {
            // Giông bão
            weatherAnimation.classList.add('thunderstorm');
        } else if (weatherId >= 300 && weatherId < 400) {
            // Mưa phùn
            weatherAnimation.classList.add('drizzle');
        } else if (weatherId >= 500 && weatherId < 600) {
            // Mưa
            weatherAnimation.classList.add('rain');
        } else if (weatherId >= 600 && weatherId < 700) {
            // Tuyết
            weatherAnimation.classList.add('snow');
        } else if (weatherId >= 700 && weatherId < 800) {
            // Sương mù, khói, bụi, ...
            weatherAnimation.classList.add('mist');
        } else if (weatherId === 800) {
            // Trời quang
            weatherAnimation.classList.add(isNight ? 'clear-night' : 'clear-day');
        } else if (weatherId > 800) {
            // Có mây
            if (weatherId === 801) {
                // Ít mây
                weatherAnimation.classList.add(isNight ? 'partly-cloudy-night' : 'partly-cloudy-day');
            } else {
                // Nhiều mây
                weatherAnimation.classList.add('cloudy');
            }
        }
    }

    // Khởi tạo trang
    initPage();
});

// Hàm để chuyển đổi giữa các chế độ đăng nhập và đăng ký
document.addEventListener('DOMContentLoaded', function() {
    const loginModal = document.getElementById('loginModal');
    const loginTriggerLink = document.getElementById('loginTriggerLink');
    const modalCloseButton = document.querySelector('.modal-close-button');
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    const showRegisterViewLink = document.getElementById('showRegisterViewLink');
    const showLoginViewLink = document.getElementById('showLoginViewLink');
    const googleLoginButton = document.getElementById('googleLoginButton');

    // Hiển thị modal đăng nhập
    if (loginTriggerLink) {
        loginTriggerLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'flex';
            loginView.style.display = 'block';
            registerView.style.display = 'none';
        });
    }

    // Đóng modal
    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', function() {
            loginModal.style.display = 'none';
        });
    }

    // Đóng modal khi click bên ngoài
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // Chuyển đổi giữa đăng nhập và đăng ký
    if (showRegisterViewLink) {
        showRegisterViewLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginView.style.display = 'none';
            registerView.style.display = 'block';
        });
    }

    if (showLoginViewLink) {
        showLoginViewLink.addEventListener('click', function(e) {
            e.preventDefault();
            registerView.style.display = 'none';
            loginView.style.display = 'block';
        });
    }

    // Đăng nhập với Google
    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', function() {
            window.location.href = '/auth/google';
        });
    }

    // Xử lý form đăng nhập
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Gửi yêu cầu đăng nhập đến server
            fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert(data.message || 'Đăng nhập thất bại');
                }
            })
            .catch(error => {
                console.error('Lỗi:', error);
                alert('Đã xảy ra lỗi khi đăng nhập');
            });
        });
    }

    // Xử lý form đăng ký
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            if (password !== confirmPassword) {
                alert('Mật khẩu xác nhận không khớp');
                return;
            }

            // Gửi yêu cầu đăng ký đến server
            fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Đăng ký thành công! Vui lòng đăng nhập.');
                    registerView.style.display = 'none';
                    loginView.style.display = 'block';
                } else {
                    alert(data.message || 'Đăng ký thất bại');
                }
            })
            .catch(error => {
                console.error('Lỗi:', error);
                alert('Đã xảy ra lỗi khi đăng ký');
            });
        });
    }
});

// Hàm để chuyển đổi menu trên thiết bị di động
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    } else {
        navMenu.classList.add('active');
    }
}