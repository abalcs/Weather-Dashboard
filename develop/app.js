/**
 * Weather Dashboard - Modern Weather App
 * Uses OpenWeatherMap API (Free Tier)
 */

// Configuration
const CONFIG = {
  API_KEY: 'd788f32e8b9da745fbd42aba6ed8176a',
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  ICON_URL: 'https://openweathermap.org/img/wn',
  MAX_HISTORY: 10,
  STORAGE_KEY: 'weatherDashboard'
};

// State
const state = {
  unit: 'imperial', // 'imperial' (F) or 'metric' (C)
  currentCity: null,
  currentWeather: null,
  forecast: null,
  searchHistory: []
};

// DOM Elements
const elements = {
  searchInput: document.getElementById('searchInput'),
  searchButton: document.getElementById('searchButton'),
  searchHistory: document.getElementById('searchHistory'),
  unitToggle: document.getElementById('unitToggle'),
  geolocateBtn: document.getElementById('geolocateBtn'),
  loadingState: document.getElementById('loadingState'),
  emptyState: document.getElementById('emptyState'),
  errorState: document.getElementById('errorState'),
  errorMessage: document.getElementById('errorMessage'),
  retryBtn: document.getElementById('retryBtn'),
  weatherContent: document.getElementById('weatherContent'),
  cityName: document.getElementById('cityName'),
  currentDate: document.getElementById('currentDate'),
  currentWeatherIcon: document.getElementById('currentWeatherIcon'),
  currentTemp: document.getElementById('currentTemp'),
  weatherDescription: document.getElementById('weatherDescription'),
  feelsLike: document.getElementById('feelsLike'),
  humidity: document.getElementById('humidity'),
  windSpeed: document.getElementById('windSpeed'),
  pressure: document.getElementById('pressure'),
  visibility: document.getElementById('visibility'),
  uvIndex: document.getElementById('uvIndex'),
  sunrise: document.getElementById('sunrise'),
  sunset: document.getElementById('sunset'),
  sunPosition: document.getElementById('sunPosition'),
  hourlyForecast: document.getElementById('hourlyForecast'),
  dailyForecast: document.getElementById('dailyForecast')
};

// Weather icon mapping
const weatherIcons = {
  '01d': 'fa-sun',
  '01n': 'fa-moon',
  '02d': 'fa-cloud-sun',
  '02n': 'fa-cloud-moon',
  '03d': 'fa-cloud',
  '03n': 'fa-cloud',
  '04d': 'fa-cloud',
  '04n': 'fa-cloud',
  '09d': 'fa-cloud-showers-heavy',
  '09n': 'fa-cloud-showers-heavy',
  '10d': 'fa-cloud-sun-rain',
  '10n': 'fa-cloud-moon-rain',
  '11d': 'fa-cloud-bolt',
  '11n': 'fa-cloud-bolt',
  '13d': 'fa-snowflake',
  '13n': 'fa-snowflake',
  '50d': 'fa-smog',
  '50n': 'fa-smog'
};

// Initialize
function init() {
  loadState();
  setupEventListeners();
  renderSearchHistory();

  // Show empty state initially or load last city
  if (state.currentCity) {
    fetchWeatherByCity(state.currentCity);
  } else {
    showState('empty');
  }
}

// Event Listeners
function setupEventListeners() {
  elements.searchButton.addEventListener('click', handleSearch);
  elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  elements.unitToggle.addEventListener('click', toggleUnit);
  elements.geolocateBtn.addEventListener('click', handleGeolocation);
  elements.retryBtn.addEventListener('click', handleRetry);
}

// State Management
function loadState() {
  try {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state.unit = parsed.unit || 'imperial';
      state.searchHistory = parsed.searchHistory || [];
      state.currentCity = parsed.currentCity || null;
      updateUnitToggle();
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
}

function saveState() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
      unit: state.unit,
      searchHistory: state.searchHistory,
      currentCity: state.currentCity
    }));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// UI State Management
function showState(stateName) {
  elements.loadingState.classList.remove('active');
  elements.emptyState.classList.remove('active');
  elements.errorState.classList.remove('active');
  elements.weatherContent.classList.remove('active');

  switch (stateName) {
    case 'loading':
      elements.loadingState.classList.add('active');
      break;
    case 'empty':
      elements.emptyState.classList.add('active');
      break;
    case 'error':
      elements.errorState.classList.add('active');
      break;
    case 'content':
      elements.weatherContent.classList.add('active');
      break;
  }
}

// Search Handler
function handleSearch() {
  const query = elements.searchInput.value.trim();
  if (!query) {
    showNotification('Please enter a city name');
    return;
  }
  fetchWeatherByCity(query);
}

// Geolocation Handler
function handleGeolocation() {
  if (!navigator.geolocation) {
    showNotification('Geolocation is not supported by your browser');
    return;
  }

  showState('loading');
  elements.geolocateBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
      elements.geolocateBtn.disabled = false;
    },
    (error) => {
      elements.geolocateBtn.disabled = false;
      let message = 'Unable to get your location';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Location permission denied';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          message = 'Location request timed out';
          break;
      }
      showError(message);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// Retry Handler
function handleRetry() {
  if (state.currentCity) {
    fetchWeatherByCity(state.currentCity);
  } else {
    showState('empty');
  }
}

// Unit Toggle
function toggleUnit() {
  state.unit = state.unit === 'imperial' ? 'metric' : 'imperial';
  updateUnitToggle();
  saveState();

  if (state.currentCity) {
    fetchWeatherByCity(state.currentCity);
  }
}

function updateUnitToggle() {
  const unitF = elements.unitToggle.querySelector('.unit-f');
  const unitC = elements.unitToggle.querySelector('.unit-c');

  if (state.unit === 'imperial') {
    unitF.classList.add('active');
    unitC.classList.remove('active');
  } else {
    unitF.classList.remove('active');
    unitC.classList.add('active');
  }

  // Update displayed unit
  document.querySelectorAll('.temp-unit').forEach(el => {
    el.textContent = state.unit === 'imperial' ? '°F' : '°C';
  });
}

// API Calls
async function fetchWeatherByCity(city) {
  showState('loading');

  try {
    // First, get coordinates from city name
    const geoUrl = `${CONFIG.BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=${state.unit}`;
    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      if (geoResponse.status === 404) {
        throw new Error('City not found. Please check the spelling and try again.');
      }
      throw new Error('Failed to fetch weather data');
    }

    const currentData = await geoResponse.json();
    const { lat, lon } = currentData.coord;

    // Fetch forecast data
    const forecastUrl = `${CONFIG.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=${state.unit}`;
    const forecastResponse = await fetch(forecastUrl);

    if (!forecastResponse.ok) {
      throw new Error('Failed to fetch forecast data');
    }

    const forecastData = await forecastResponse.json();

    // Store and display data
    state.currentWeather = currentData;
    state.forecast = forecastData;
    state.currentCity = currentData.name + (currentData.sys.country ? ', ' + currentData.sys.country : '');

    addToHistory(state.currentCity);
    saveState();
    renderWeather();
    showState('content');
    elements.searchInput.value = '';

  } catch (error) {
    console.error('Error fetching weather:', error);
    showError(error.message);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  showState('loading');

  try {
    // Fetch current weather
    const currentUrl = `${CONFIG.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=${state.unit}`;
    const currentResponse = await fetch(currentUrl);

    if (!currentResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const currentData = await currentResponse.json();

    // Fetch forecast
    const forecastUrl = `${CONFIG.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=${state.unit}`;
    const forecastResponse = await fetch(forecastUrl);

    if (!forecastResponse.ok) {
      throw new Error('Failed to fetch forecast data');
    }

    const forecastData = await forecastResponse.json();

    // Store and display
    state.currentWeather = currentData;
    state.forecast = forecastData;
    state.currentCity = currentData.name + (currentData.sys.country ? ', ' + currentData.sys.country : '');

    addToHistory(state.currentCity);
    saveState();
    renderWeather();
    showState('content');

  } catch (error) {
    console.error('Error fetching weather:', error);
    showError(error.message);
  }
}

// Render Functions
function renderWeather() {
  if (!state.currentWeather || !state.forecast) return;

  renderCurrentWeather();
  renderHourlyForecast();
  renderDailyForecast();
  updateBackground();
}

function renderCurrentWeather() {
  const data = state.currentWeather;
  const unitSymbol = state.unit === 'imperial' ? '°F' : '°C';
  const speedUnit = state.unit === 'imperial' ? 'mph' : 'm/s';

  // Location and date
  elements.cityName.textContent = data.name + (data.sys.country ? ', ' + data.sys.country : '');
  elements.currentDate.textContent = formatDate(new Date(data.dt * 1000));

  // Temperature and conditions
  elements.currentTemp.textContent = Math.round(data.main.temp);
  elements.weatherDescription.textContent = data.weather[0].description;

  // Weather icon
  const iconCode = data.weather[0].icon;
  const iconClass = weatherIcons[iconCode] || 'fa-cloud';
  elements.currentWeatherIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;

  // Details
  elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}${unitSymbol}`;
  elements.humidity.textContent = `${data.main.humidity}%`;
  elements.windSpeed.textContent = `${Math.round(data.wind.speed)} ${speedUnit}`;
  elements.pressure.textContent = `${data.main.pressure} hPa`;

  // Visibility (convert from meters to miles or km)
  const visibility = data.visibility;
  if (state.unit === 'imperial') {
    elements.visibility.textContent = `${(visibility / 1609.34).toFixed(1)} mi`;
  } else {
    elements.visibility.textContent = `${(visibility / 1000).toFixed(1)} km`;
  }

  // UV Index - Note: Basic API doesn't provide UV, so we'll estimate or hide
  // For now, we'll hide the UV section since free tier doesn't include it
  const uvItem = document.getElementById('uvItem');
  uvItem.style.display = 'none';

  // Sunrise and Sunset
  const sunriseTime = new Date(data.sys.sunrise * 1000);
  const sunsetTime = new Date(data.sys.sunset * 1000);
  elements.sunrise.textContent = formatTime(sunriseTime);
  elements.sunset.textContent = formatTime(sunsetTime);

  // Sun position
  updateSunPosition(sunriseTime, sunsetTime);
}

function renderHourlyForecast() {
  const data = state.forecast;
  const unitSymbol = state.unit === 'imperial' ? '°' : '°';

  // Get next 8 time slots (24 hours, 3-hour intervals)
  const hourlyData = data.list.slice(0, 8);

  elements.hourlyForecast.innerHTML = hourlyData.map((item, index) => {
    const time = new Date(item.dt * 1000);
    const iconCode = item.weather[0].icon;
    const iconClass = weatherIcons[iconCode] || 'fa-cloud';
    const isNow = index === 0;

    return `
      <div class="hourly-item ${isNow ? 'now' : ''}">
        <div class="hourly-time">${isNow ? 'Now' : formatHour(time)}</div>
        <div class="hourly-icon"><i class="fas ${iconClass}"></i></div>
        <div class="hourly-temp">${Math.round(item.main.temp)}${unitSymbol}</div>
      </div>
    `;
  }).join('');
}

function renderDailyForecast() {
  const data = state.forecast;
  const unitSymbol = state.unit === 'imperial' ? '°' : '°';

  // Group forecast by day and get min/max temps
  const dailyMap = new Map();

  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toDateString();

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: date,
        temps: [],
        weather: item.weather[0],
        icon: item.weather[0].icon
      });
    }

    dailyMap.get(dateKey).temps.push(item.main.temp);

    // Prefer daytime icon
    if (item.weather[0].icon.includes('d')) {
      dailyMap.get(dateKey).icon = item.weather[0].icon;
      dailyMap.get(dateKey).weather = item.weather[0];
    }
  });

  // Convert to array and skip today, take next 5 days
  const dailyData = Array.from(dailyMap.values()).slice(1, 6);

  elements.dailyForecast.innerHTML = dailyData.map(day => {
    const minTemp = Math.round(Math.min(...day.temps));
    const maxTemp = Math.round(Math.max(...day.temps));
    const iconClass = weatherIcons[day.icon] || 'fa-cloud';

    return `
      <div class="daily-item">
        <div class="daily-day">
          ${formatDayName(day.date)}
          <span>${formatShortDate(day.date)}</span>
        </div>
        <div class="daily-icon"><i class="fas ${iconClass}"></i></div>
        <div class="daily-desc">${day.weather.description}</div>
        <div class="daily-temps">
          <span class="daily-high">${maxTemp}${unitSymbol}</span>
          <span class="daily-low">${minTemp}${unitSymbol}</span>
        </div>
      </div>
    `;
  }).join('');
}

function updateSunPosition(sunrise, sunset) {
  const now = new Date();
  const sunriseMs = sunrise.getTime();
  const sunsetMs = sunset.getTime();
  const nowMs = now.getTime();

  let position = 0;

  if (nowMs < sunriseMs) {
    position = 0;
  } else if (nowMs > sunsetMs) {
    position = 100;
  } else {
    position = ((nowMs - sunriseMs) / (sunsetMs - sunriseMs)) * 100;
  }

  elements.sunPosition.style.left = `${Math.min(100, Math.max(0, position))}%`;
}

function updateBackground() {
  const data = state.currentWeather;
  const now = new Date();
  const sunrise = new Date(data.sys.sunrise * 1000);
  const sunset = new Date(data.sys.sunset * 1000);
  const isDay = now >= sunrise && now <= sunset;
  const timeClass = isDay ? 'day' : 'night';

  // Get weather condition
  const weatherMain = data.weather[0].main.toLowerCase();
  let weatherClass = 'weather-clear';

  if (weatherMain.includes('cloud')) {
    weatherClass = 'weather-clouds';
  } else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
    weatherClass = 'weather-rain';
  } else if (weatherMain.includes('thunder')) {
    weatherClass = 'weather-thunderstorm';
  } else if (weatherMain.includes('snow')) {
    weatherClass = 'weather-snow';
  } else if (weatherMain.includes('mist') || weatherMain.includes('fog') || weatherMain.includes('haze')) {
    weatherClass = 'weather-mist';
  }

  // Remove all weather classes
  document.body.className = '';
  document.body.classList.add(weatherClass, timeClass);
}

// Search History
function addToHistory(city) {
  // Remove if already exists
  const index = state.searchHistory.findIndex(
    c => c.toLowerCase() === city.toLowerCase()
  );
  if (index > -1) {
    state.searchHistory.splice(index, 1);
  }

  // Add to beginning
  state.searchHistory.unshift(city);

  // Limit size
  if (state.searchHistory.length > CONFIG.MAX_HISTORY) {
    state.searchHistory = state.searchHistory.slice(0, CONFIG.MAX_HISTORY);
  }

  renderSearchHistory();
}

function renderSearchHistory() {
  if (state.searchHistory.length === 0) {
    elements.searchHistory.innerHTML = '<li class="no-history">No recent searches</li>';
    return;
  }

  elements.searchHistory.innerHTML = state.searchHistory.map(city => `
    <li>
      <button onclick="fetchWeatherByCity('${city.replace(/'/g, "\\'")}')">
        <i class="fas fa-location-dot"></i>
        ${city}
      </button>
    </li>
  `).join('');
}

// Error Handling
function showError(message) {
  elements.errorMessage.textContent = message;
  showState('error');
}

function showNotification(message) {
  // Simple alert for now - could be enhanced with a toast notification
  alert(message);
}

// Utility Functions
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function formatHour(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true
  });
}

function formatDayName(date) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

// Make fetchWeatherByCity globally available for history buttons
window.fetchWeatherByCity = fetchWeatherByCity;

// Initialize app
document.addEventListener('DOMContentLoaded', init);
