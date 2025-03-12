document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'f0c52972790f40258db73654251203';
    const apiUrl = 'https://api.weatherapi.com/v1/current.json';
    
    const locationInput = document.getElementById('location-input');
    const searchBtn = document.getElementById('search-btn');
    const currentLocationBtn = document.getElementById('current-location-btn');
    const errorMessage = document.getElementById('error-message');
    const loading = document.getElementById('loading');
    const weatherCard = document.getElementById('weather-card');
    const weatherBackground = document.getElementById('weather-background');
    // Get elements for weather data
    const locationName = document.getElementById('location-name');
    const country = document.getElementById('country');
    const temperature = document.getElementById('temperature');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherCondition = document.getElementById('weather-condition');
    const feelsLike = document.getElementById('feels-like');
    const humidity = document.getElementById('humidity');
    const wind = document.getElementById('wind');
    const uv = document.getElementById('uv');
    const aqiLevel = document.getElementById('aqi-level');
    const aqiDescription = document.getElementById('aqi-description');
    const lastUpdated = document.getElementById('last-updated');
    // Add event listeners
    searchBtn.addEventListener('click', getWeather);
    currentLocationBtn.addEventListener('click', getCurrentLocation);
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getWeather();
        }
    });
    // Weather background themes mapping
    const weatherThemes = {
        // Sunny conditions
        'sunny': {
            class: 'sunny-theme',
            background: 'linear-gradient(to bottom, #ffdf7e, #ffbc40)',
            animation: createSunAnimation
        },
        'clear': {
            class: 'sunny-theme',
            background: 'linear-gradient(to bottom, #ffdf7e, #ffbc40)',
            animation: createSunAnimation
        },
        // Cloudy conditions
        'cloudy': {
            class: 'cloudy-theme',
            background: 'linear-gradient(to bottom, #b6d0e2, #8ab6d6)',
            animation: createCloudAnimation
        },
        'partly cloudy': {
            class: 'cloudy-theme',
            background: 'linear-gradient(to bottom, #c9e8ff, #a1d2f7)',
            animation: createCloudAnimation
        },
        'overcast': {
            class: 'cloudy-theme',
            background: 'linear-gradient(to bottom, #9faeb8, #7d8a94)',
            animation: createCloudAnimation
        },
        // Rainy conditions
        'rain': {
            class: 'rainy-theme',
            background: 'linear-gradient(to bottom, #6e7f8c, #546a79)',
            animation: createRainAnimation
        },
        'drizzle': {
            class: 'rainy-theme',
            background: 'linear-gradient(to bottom, #8499a8, #6e8496)',
            animation: createRainAnimation
        },
        'light rain': {
            class: 'rainy-theme',
            background: 'linear-gradient(to bottom, #8499a8, #6e8496)',
            animation: createRainAnimation
        },
        'moderate rain': {
            class: 'rainy-theme',
            background: 'linear-gradient(to bottom, #7a8d9b, #5f7182)',
            animation: createRainAnimation
        },
        'heavy rain': {
            class: 'rainy-theme',
            background: 'linear-gradient(to bottom, #5d6d7a, #435160)',
            animation: createRainAnimation
        },
        'patchy rain': {
            class: 'rainy-theme',
            background: 'linear-gradient(to bottom, #8499a8, #6e8496)',
            animation: createRainAnimation
        },
        // Snowy conditions
        'snow': {
            class: 'snowy-theme',
            background: 'linear-gradient(to bottom, #e3e8f0, #c8d1df)',
            animation: createSnowAnimation
        },
        'blizzard': {
            class: 'snowy-theme',
            background: 'linear-gradient(to bottom, #d4dbe4, #b8c4d1)',
            animation: createSnowAnimation
        },
        'light snow': {
            class: 'snowy-theme',
            background: 'linear-gradient(to bottom, #e9edf3, #d0d8e4)',
            animation: createSnowAnimation
        },
        'patchy snow': {
            class: 'snowy-theme',
            background: 'linear-gradient(to bottom, #e9edf3, #d0d8e4)',
            animation: createSnowAnimation
        },
        // Stormy conditions
        'thunderstorm': {
            class: 'stormy-theme',
            background: 'linear-gradient(to bottom, #494e57, #2d3239)',
            animation: createThunderstormAnimation
        },
        'thunder': {
            class: 'stormy-theme',
            background: 'linear-gradient(to bottom, #494e57, #2d3239)',
            animation: createThunderstormAnimation
        },
        'lightning': {
            class: 'stormy-theme',
            background: 'linear-gradient(to bottom, #494e57, #2d3239)',
            animation: createThunderstormAnimation
        },
        // Foggy conditions
        'fog': {
            class: 'foggy-theme',
            background: 'linear-gradient(to bottom, #c9cfd3, #a3adb4)',
            animation: createFogAnimation
        },
        'mist': {
            class: 'foggy-theme',
            background: 'linear-gradient(to bottom, #c9cfd3, #a3adb4)',
            animation: createFogAnimation
        },
        'haze': {
            class: 'foggy-theme',
            background: 'linear-gradient(to bottom, #d1d5d8, #b1b9be)',
            animation: createFogAnimation
        }
    };
    // Default theme (night theme will be applied based on time)
    const defaultTheme = {
        class: 'sunny-theme',
        background: 'linear-gradient(to bottom, #ffdf7e, #ffbc40)',
        animation: createSunAnimation
    };
    // Night theme override
    const nightTheme = {
        class: 'night-theme',
        background: 'linear-gradient(to bottom, #1a2330, #090d14)',
        animation: createNightAnimation
    };
    function getWeather() {
        const location = locationInput.value.trim();
        if (location === '') {
            showError('Please enter a location');
            return;
        }
        
        showLoading();
        fetchWeatherData(location);
    }
    function getCurrentLocation() {
        if (navigator.geolocation) {
            showLoading();
            navigator.geolocation.getCurrentPosition(function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherData(`${lat},${lon}`);
            }, function(error) {
                hideLoading();
                showError("Unable to get your location. Please enter it manually.");
            });
        } else {
            showError("Geolocation is not supported by this browser.");
        }
    }
    function fetchWeatherData(location) {
        // Hide error message
        errorMessage.style.display = 'none';
        // Construct the API URL
        const url = `${apiUrl}?key=${apiKey}&q=${location}&aqi=yes`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Location not found');
                }
                return response.json();
            })
            .then(data => {
                displayWeatherData(data);
                hideLoading();
            })
            .catch(error => {
                hideLoading();
                showError(error.message);
            });
    }
    function displayWeatherData(data) {
        // Display weather card
        weatherCard.style.display = 'block';
        // Update location information
        locationName.textContent = data.location.name;
        country.textContent = data.location.country;
        // Update temperature and condition
        temperature.textContent = `${Math.round(data.current.temp_c)}°C`;
        weatherIcon.src = `https:${data.current.condition.icon}`;
        weatherCondition.textContent = data.current.condition.text;
        // Update weather details
        feelsLike.textContent = `${Math.round(data.current.feelslike_c)}°C`;
        humidity.textContent = `${data.current.humidity}%`;
        wind.textContent = `${data.current.wind_kph} km/h`;
        uv.textContent = data.current.uv;
        // Update air quality if available
        if (data.current.air_quality) {
            const airQuality = document.getElementById('air-quality');
            airQuality.style.display = 'block';
            const aqiUS = data.current.air_quality['us-epa-index'];
            let aqiText = '';
            let aqiClass = '';
            switch(aqiUS) {
                case 1:
                    aqiText = 'Good';
                    aqiClass = 'good';
                    aqiDescription.textContent = 'Air quality is considered satisfactory, and air pollution poses little or no risk.';
                    break;
                case 2:
                    aqiText = 'Moderate';
                    aqiClass = 'moderate';
                    aqiDescription.textContent = 'Air quality is acceptable; however, there may be a moderate health concern for a small number of people.';
                    break;
                case 3:
                    aqiText = 'Unhealthy for Sensitive Groups';
                    aqiClass = 'unhealthy';
                    aqiDescription.textContent = 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.';
                    break;
                case 4:
                    aqiText = 'Unhealthy';
                    aqiClass = 'unhealthy';
                    aqiDescription.textContent = 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.';
                    break;
                case 5:
                    aqiText = 'Very Unhealthy';
                    aqiClass = 'very-unhealthy';
                    aqiDescription.textContent = 'Health warnings of emergency conditions. The entire population is more likely to be affected.';
                    break;
                case 6:
                    aqiText = 'Hazardous';
                    aqiClass = 'hazardous';
                    aqiDescription.textContent = 'Health alert: everyone may experience more serious health effects.';
                    break;
                default:
                    aqiText = 'Unknown';
            }
            aqiLevel.textContent = aqiText;
            // Remove all classes and add the new one
            aqiLevel.className = 'aqi-level';
            if (aqiClass) aqiLevel.classList.add(aqiClass);
        } else {
            document.getElementById('air-quality').style.display = 'none';
        }
        // Update last updated time
        const updatedTime = new Date(data.current.last_updated);
        lastUpdated.textContent = `Last updated: ${updatedTime.toLocaleTimeString()}`;
        // Update the background based on weather condition
        updateBackground(data);
    }
    function updateBackground(data) {
        // Clear previous animations
        clearAnimations();
        // Get weather condition in lowercase for matching
        const condition = data.current.condition.text.toLowerCase();
        const isDay = data.current.is_day;
        // Find matching theme or use default
        let matchedTheme = null;
        // Check for specific conditions first
        for (const [key, theme] of Object.entries(weatherThemes)) {
            if (condition.includes(key)) {
                matchedTheme = theme;
                break;
            }
        }
        // If no match found, use default
        if (!matchedTheme) {
            matchedTheme = defaultTheme;
        }
        // Override with night theme if it's night time
        if (!isDay) {
            matchedTheme = nightTheme;
        }
        // Apply theme
        document.body.className = matchedTheme.class;
        weatherBackground.style.background = matchedTheme.background;
        // Add animation elements based on theme
        if (matchedTheme.animation) {
            matchedTheme.animation();
        }
    }
    // Animation creation functions
    function createSunAnimation() {
        weatherBackground.innerHTML = `
            <div style="position: absolute; top: 15%; right: 15%; width: 100px; height: 100px; background: radial-gradient(circle, #ffffa8 0%, #ffea64 70%, transparent 100%); border-radius: 50%; box-shadow: 0 0 40px #ffffa8;"></div>
            <div style="position: absolute; top: 15%; right: 15%; width: 120px; height: 120px; border-radius: 50%; filter: blur(10px); opacity: 0.4; background: transparent; box-shadow: 0 0 60px 30px #fff4bb; animation: sunRays 120s linear infinite;"></div>
            <div style="position: absolute; top: 40%; left: 20%; width: 120px; height: 60px; background: rgba(255, 255, 255, 0.5); border-radius: 50px; filter: blur(20px); transform: translateX(-50%); animation: cloudDrift 30s ease-in-out infinite;"></div>
            <div style="position: absolute; top: 30%; left: 60%; width: 180px; height: 80px; background: rgba(255, 255, 255, 0.6); border-radius: 50px; filter: blur(15px); transform: translateX(-50%); animation: cloudDrift 25s ease-in-out infinite reverse;"></div>
        `;
    }
    function createCloudAnimation() {
        weatherBackground.innerHTML = `
            <div style="position: absolute; top: 15%; left: 20%; width: 150px; height: 80px; background: rgba(255, 255, 255, 0.8); border-radius: 50px; filter: blur(10px); transform: translateX(-50%); animation: cloudDrift 30s ease-in-out infinite;"></div>
            <div style="position: absolute; top: 25%; left: 50%; width: 200px; height: 100px; background: rgba(255, 255, 255, 0.7); border-radius: 50px; filter: blur(12px); transform: translateX(-50%); animation: cloudDrift 35s ease-in-out infinite reverse;"></div>
            <div style="position: absolute; top: 40%; left: 70%; width: 180px; height: 90px; background: rgba(255, 255, 255, 0.6); border-radius: 50px; filter: blur(15px); transform: translateX(-50%); animation: cloudDrift 40s ease-in-out infinite;"></div>
            <div style="position: absolute; top: 60%; left: 30%; width: 220px; height: 110px; background: rgba(255, 255, 255, 0.5); border-radius: 50px; filter: blur(20px); transform: translateX(-50%); animation: cloudDrift 45s ease-in-out infinite reverse;"></div>
        `;
    }
    function createRainAnimation() {
        weatherBackground.innerHTML = `
            <div style="position: absolute; top: 5%; left: 20%; width: 150px; height: 80px; background: rgba(220, 220, 220, 0.8); border-radius: 50px; filter: blur(10px); transform: translateX(-50%); animation: cloudDrift 30s ease-in-out infinite;"></div>
            <div style="position: absolute; top: 15%; left: 50%; width: 200px; height: 100px; background: rgba(200, 200, 200, 0.7); border-radius: 50px; filter: blur(12px); transform: translateX(-50%); animation: cloudDrift 35s ease-in-out infinite reverse;"></div>
            <div style="position: absolute; top: 10%; left: 80%; width: 180px; height: 90px; background: rgba(180, 180, 180, 0.6); border-radius: 50px; filter: blur(15px); transform: translateX(-50%); animation: cloudDrift 40s ease-in-out infinite;"></div>
        `;
        // Add rain drops
        createRaindrops(100);
    }
    function createSnowAnimation() {
        weatherBackground.innerHTML = `
            <div style="position: absolute; top: 5%; left: 20%; width: 150px; height: 80px; background: rgba(230, 230, 230, 0.8); border-radius: 50px; filter: blur(10px); transform: translateX(-50%); animation: cloudDrift 30s ease-in-out infinite;"></div>
            <div style="position: absolute; top: 15%; left: 50%; width: 200px; height: 100px; background: rgba(220, 220, 220, 0.7); border-radius: 50px; filter: blur(12px); transform: translateX(-50%); animation: cloudDrift 35s ease-in-out infinite reverse;"></div>
            <div style="position: absolute; top: 10%; left: 80%; width: 180px; height: 90px; background: rgba(210, 210, 210, 0.6); border-radius: 50px; filter: blur(15px); transform: translateX(-50%); animation: cloudDrift 40s ease-in-out infinite;"></div>
        `;
        // Add snowflakes
        createSnowflakes(80);
    }
    function createThunderstormAnimation() {
        weatherBackground.innerHTML = `
            <div style="position: absolute; top: 5%; left: 20%; width: 150px; height: 80px; background: rgba(100, 100, 100, 0.8); border-radius: 50px; filter: blur(10px); transform: translateX(-50%); animation: cloudDrift 30s ease-in-out infinite;"></div>
            <div style="position: absolute; top: 15%; left: 50%; width: 200px; height: 100px; background: rgba(80, 80, 80, 0.7); border-radius: 50px; filter: blur(12px); transform: translateX(-50%); animation: cloudDrift 35s ease-in-out infinite reverse;"></div>
            <div style="position: absolute; top: 10%; left: 80%; width: 180px; height: 90px; background: rgba(60, 60, 60, 0.6); border-radius: 50px; filter: blur(15px); transform: translateX(-50%); animation: cloudDrift 40s ease-in-out infinite;"></div>
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0); animation: lightning 8s ease-in-out infinite;"></div>
        `;
        // Add rain drops
        createRaindrops(120);
    }
    function createFogAnimation() {
        weatherBackground.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, rgba(220, 220, 220, 0.8) 0%, rgba(200, 200, 200, 0.6) 50%, rgba(220, 220, 220, 0.8) 100%); background-size: 400% 400%; animation: fogDrift 30s ease infinite;"></div>
            <div style="position: absolute; top: 20%; left: 0; width: 100%; height: 60%; background: linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1)); filter: blur(20px); animation: fogDrift 50s ease infinite reverse;"></div>
        `;
    }
    function createNightAnimation() {
        weatherBackground.innerHTML = `
            <div style="position: absolute; top: 15%; right: 15%; width: 60px; height: 60px; background: radial-gradient(circle, #fff 0%, #f0f0f0 50%, transparent 100%); border-radius: 50%; box-shadow: 0 0 20px #fff, 0 0 40px #f0f0f0; opacity: 0.7;"></div>
            <div style="position: absolute; top: 20%; left: 20%; width: 2px; height: 2px; background: #fff; border-radius: 50%; box-shadow: 0 0 2px #fff, 0 0 4px #fff;"></div>
            <div style="position: absolute; top: 30%; left: 30%; width: 3px; height: 3px; background: #fff; border-radius: 50%; box-shadow: 0 0 2px #fff, 0 0 4px #fff;"></div>
            <div style="position: absolute; top: 25%; left: 50%; width: 2px; height: 2px; background: #fff; border-radius: 50%; box-shadow: 0 0 2px #fff, 0 0 4px #fff;"></div>
            <div style="position: absolute; top: 15%; left: 70%; width: 2px; height: 2px; background: #fff; border-radius: 50%; box-shadow: 0 0 2px #fff, 0 0 4px #fff;"></div>
            <div style="position: absolute; top: 35%; left: 80%; width: 3px; height: 3px; background: #fff; border-radius: 50%; box-shadow: 0 0 2px #fff, 0 0 4px #fff;"></div>
            <div style="position: absolute; top: 45%; left: 40%; width: 2px; height: 2px; background: #fff; border-radius: 50%; box-shadow: 0 0 2px #fff, 0 0 4px #fff;"></div>
            <div style="position: absolute; top: 55%; left: 75%; width: 2px; height: 2px; background: #fff; border-radius: 50%; box-shadow: 0 0 2px #fff, 0 0 4px #fff;"></div>
            <div style="position: absolute; top: 65%; left: 25%; width: 3px; height: 3px; background: #fff; border-radius: 50%; box-shadow: 0 0 2px #fff, 0 0 4px #fff;"></div>
            <div style="position: absolute; top: 75%; left: 60%; width: 2px; height: 2px; background: #fff; border-radius: 50%; box-shadow: 0 0 2px #fff, 0 0 4px #fff;"></div>
        `;
    }
    function createRaindrops(count) {
        for (let i = 0; i < count; i++) {
            const drop = document.createElement('div');
            drop.className = 'weather-drop';
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.width = `${Math.random() * 3 + 1}px`;
            drop.style.height = `${Math.random() * 10 + 10}px`;
            drop.style.opacity = Math.random() * 0.3 + 0.3;
            drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
            drop.style.animationDelay = `${Math.random()}s`;
            drop.style.animationIterationCount = 'infinite';
            drop.style.animationName = 'rainDrop';
            weatherBackground.appendChild(drop);
        }
    }
    function createSnowflakes(count) {
        for (let i = 0; i < count; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'weather-drop';
            snowflake.style.left = `${Math.random() * 100}%`;
            const size = Math.random() * 5 + 3;
            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.opacity = Math.random() * 0.7 + 0.3;
            snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
            snowflake.style.animationDelay = `${Math.random() * 5}s`;
            snowflake.style.animationIterationCount = 'infinite';
            snowflake.style.animationName = 'snowFall';
            weatherBackground.appendChild(snowflake);
        }
    }
    function clearAnimations() {
        weatherBackground.innerHTML = '';
    }
    function showLoading() {
        loading.style.display = 'block';
        weatherCard.style.display = 'none';
        errorMessage.style.display = 'none';
    }
    function hideLoading() {
        loading.style.display = 'none';
    }
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        weatherCard.style.display = 'none';
    }
    // Initialize by trying to get the user's current location
    window.addEventListener('load', function() {
        // Check if geolocation is available before trying to get the location
        if (navigator.geolocation) {
            getCurrentLocation();
        } else {
            // If geolocation is not available, show a default location
            fetchWeatherData('New York');
        }
    });
});