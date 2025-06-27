const port = process.env.PORT || 3000;<?php
                                      // Bắt đầu session nếu chưa bắt đầu
                                      if (session_status() === PHP_SESSION_NONE) {
                                        session_start();
                                      }
                                      ?>
<!DOCTYPE html>
<html lang="vi">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Đang tải dữ liệu thời tiết</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      transition: background 2s ease-in-out;
    }

    /* Weather-based backgrounds */
    .sunny {
      background: linear-gradient(135deg,
          #f093fb 0%,
          #f5576c 50%,
          #ffd700 100%);
    }

    .cloudy {
      background: linear-gradient(135deg,
          #667eea 0%,
          #764ba2 50%,
          #a8a8a8 100%);
    }

    .rainy {
      background: linear-gradient(135deg,
          #2c3e50 0%,
          #34495e 50%,
          #4a6741 100%);
    }

    .snowy {
      background: linear-gradient(135deg,
          #e6ddd4 0%,
          #d5d4d0 50%,
          #a8caba 100%);
    }

    .stormy {
      background: linear-gradient(135deg,
          #232526 0%,
          #414345 50%,
          #1a1a2e 100%);
    }

    .clear-night {
      background: linear-gradient(135deg,
          #0f0c29 0%,
          #302b63 50%,
          #24243e 100%);
    }

    .misty {
      background: linear-gradient(135deg,
          #bdc3c7 0%,
          #2c3e50 50%,
          #95a5a6 100%);
    }

    .hot {
      background: linear-gradient(135deg,
          #ff9a9e 0%,
          #fecfef 50%,
          #fecfef 100%);
    }

    .overcast {
      background: linear-gradient(135deg,
          #4a4a4a 0%,
          #333333 50%,
          #222222 100%);
      /* Darker, gloomy gray */
    }

    .cloudy-night {
      background: linear-gradient(135deg,
          #2c3e50 0%,
          #34495e 50%,
          #4a6741 100%);
      /* Similar to rainy, but maybe a bit less green */
    }

    .overcast-night {
      background: linear-gradient(135deg,
          #1a1a1a 0%,
          #0a0a0a 100%);
      /* Very dark, almost black */
    }

    .loading-container {
      text-align: center;
      animation: fadeIn 1s ease-in-out;
    }

    .weather-icon {
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 40px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      animation: pulse 2s infinite;
    }

    .cloud-sync {
      width: 60px;
      height: 60px;
      position: relative;
    }

    .cloud {
      fill: none;
      stroke: url(#gradient);
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .arrow {
      fill: none;
      stroke: url(#gradient);
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      animation: rotate 2s linear infinite;
    }

    .progress-container {
      width: 400px;
      height: 8px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 30px;
      backdrop-filter: blur(10px);
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg,
          rgba(255, 255, 255, 0.8) 0%,
          rgba(255, 255, 255, 1) 100%);
      border-radius: 20px;
      width: 0%;
      animation: loading 3s ease-in-out forwards;
      position: relative;
      overflow: hidden;
    }

    .progress-bar::before {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg,
          transparent,
          rgba(255, 255, 255, 0.4),
          transparent);
      animation: shimmer 1.5s infinite;
    }

    .loading-text {
      color: white;
      font-size: 24px;
      font-weight: 500;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .fade-out {
      animation: fadeOut 0.8s forwards;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
      }

      to {
        opacity: 0;
      }
    }

    @keyframes loading {
      0% {
        width: 0%;
      }

      100% {
        width: 100%;
      }
    }

    @keyframes shimmer {
      0% {
        transform: translateX(0);
      }

      100% {
        transform: translateX(200%);
      }
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2);
      }

      70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
      }

      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
      }
    }

    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
      .progress-container {
        width: 90%;
        max-width: 400px;
      }
    }
  </style>
</head>

<body>
  <div class="loading-container" id="loadingContainer">
    <div class="weather-icon">
      <svg
        class="cloud-sync"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#f0f0f0" />
          </linearGradient>
        </defs>
        <path
          class="cloud"
          d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        <path
          class="arrow"
          d="M13 5.5V9h3l-4 4-4-4h3V5.5M12 3a1 1 0 0 1 1 1v1.5h2a1 1 0 0 1 .7 1.7l-4 4a1 1 0 0 1-1.4 0l-4-4A1 1 0 0 1 7 5.5h2V4a1 1 0 0 1 1-1h2z" />
      </svg>
    </div>
    <div class="progress-container">
      <div class="progress-bar"></div>
    </div>
    <div class="loading-text">Đang tải dữ liệu thời tiết...</div>
  </div>

  <script>
    // API Key - Thay thế bằng API key của bạn
    const API_KEY = "5b4c9f5e0af4e0e88e1e6d0af0a0f8e7";
    const DEFAULT_CITY = "Hanoi";

    // Weather background mapping
    const weatherBackgrounds = {
      clear: "sunny",
      sun: "sunny",
      cloud: "cloudy",
      rain: "rainy",
      drizzle: "rainy",
      snow: "snowy",
      thunder: "stormy",
      storm: "stormy",
      mist: "misty",
      fog: "misty",
      haze: "misty",
      overcast: "overcast",
    };

    // Loading steps
    const loadingSteps = [
      "Đang tải dữ liệu thời tiết...",
      "Đang phân tích dữ liệu...",
      "Đang chuẩn bị giao diện...",
      "Đang hoàn tất dữ liệu",
    ];

    let currentStep = 0;
    const loadingText = document.querySelector(".loading-text");

    // Fetch weather data
    async function fetchWeatherData(city = DEFAULT_CITY) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Lỗi API thời tiết");
        }
        return await response.json();
      } catch (error) {
        console.log("Lỗi lấy dữ liệu thời tiết:", error);
        // Return mock data if API fails
        return {
          weather: [{
            description: "few clouds",
            main: "Clear"
          }],
          main: {
            temp: 28
          },
        };
      }
    }

    // Apply weather-based background
    function applyWeatherBackground(weatherData) {
      const description = weatherData.weather[0].description.toLowerCase();
      const temp = weatherData.main.temp;
      const isNight =
        new Date().getHours() >= 18 || new Date().getHours() <= 6;

      let backgroundClass = "sunny"; // default

      // Determine background based on weather
      for (const [condition, bgClass] of Object.entries(weatherBackgrounds)) {
        if (description.includes(condition)) {
          backgroundClass = bgClass;
          break;
        }
      }

      // Special cases
      if (temp > 35) {
        backgroundClass = "hot";
      } else if (
        isNight &&
        (backgroundClass === "sunny" || backgroundClass === "cloudy")
      ) {
        backgroundClass = "clear-night";
      }

      // Apply background class
      document.body.className = backgroundClass;
    }

    // Update loading text
    const updateLoadingText = () => {
      if (currentStep < loadingSteps.length) {
        loadingText.textContent = loadingSteps[currentStep];
        currentStep++;
      }
    };

    // Main loading process
    async function startLoading() {
      // Fetch weather data in background
      fetchWeatherData().then((weatherData) => {
        applyWeatherBackground(weatherData);
      });

      // Change loading text every 600ms
      const textInterval = setInterval(updateLoadingText, 600);

      // After loading is complete (3 seconds), redirect to homepage
      setTimeout(() => {
        clearInterval(textInterval);
        loadingText.textContent = "Hoàn tất!";

        // Add fade out animation
        document.getElementById("loadingContainer").classList.add("fade-out");

        // Redirect after fade out animation
        setTimeout(() => {
          // Lấy các tham số trên URL hiện tại (ví dụ: ?name=...)
          const params = new URLSearchParams(window.location.search);
          const queryString = params.toString();

          // Đường dẫn đúng là '/trangchu' như đã định nghĩa trong PHP router
          const targetPath = "/weathery/php/trangchu";

          // Tạo URL cuối cùng, giữ lại các tham số
          const redirectUrl = queryString ?
            `${targetPath}?${queryString}` :
            targetPath;

          // Chuyển hướng đến trang chính xác
          window.location.href = redirectUrl;
        }, 800);
      }, 3000);
    }

    // Start the loading process
    startLoading();
  </script>
</body>

</html>