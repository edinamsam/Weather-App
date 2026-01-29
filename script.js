const searchForm = document.querySelector(".search-box");
const searchInput = document.querySelector(".search-box input");
const cityEl = document.querySelector("[data-city]");
const dateEl = document.querySelector("[data-date]");
const tempEl = document.querySelector("[data-temp]");
const iconEl = document.querySelector("[data-weather-icon]");
const feelsEl = document.querySelector("[data-feels]");
const humidityEl = document.querySelector("[data-humidity]");
const windEl = document.querySelector("[data-wind]");
const precipEl = document.querySelector("[data-precip]");
const dailyEl = document.querySelector("[data-daily]");
const hourlyEl = document.querySelector("[data-hourly]");
const unitToggle = document.querySelector(".unit-toggle");
const loadingEl = document.querySelector(".loading");
const errorEl = document.querySelector(".error");

let weatherData = null;
let currentLocation = null;
let unit = "metric";

function showLoading() {
  loadingEl.classList.remove("hidden");
}

function hideLoading() {
  loadingEl.classList.add("hidden");
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function clearError() {
  errorEl.classList.add("hidden");
}

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearError();

  const query = searchInput.value.trim();
  if (!query) return;

  const location = await getCoordinates(query);
  if (!location) return;

  showLoading();

  const data = await getCurrentWeather(location.lat, location.lon);
  if (!data) {
    hideLoading();
    return;
  }

  weatherData = data;
  currentLocation = location;

  renderCurrentWeather(location, data.current_weather);
  renderStats(data);
  renderDailyForecast(data);
  renderHourlyForecast(data);

  hideLoading();
  searchInput.value = "";
});

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("Location not found");
    }

    const location = data.results[0];

    return {
      name: location.name,
      country: location.country,
      lat: location.latitude,
      lon: location.longitude,
    };
  } catch (error) {
    console.error(error.message);
    showError("City not found. Try another.");
  }
}

async function getCurrentWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.current_weather) {
      throw new Error("Weather data not available");
    }

    return data;
  } catch (error) {
    console.error(error.message);
    showError("Unable to fetch weather data.");
  }
}

function renderCurrentWeather(location, weather) {
  cityEl.textContent = `${location.name}, ${location.country}`;
  tempEl.textContent = `${convertTemp(weather.temperature)}°`;
  dateEl.textContent = formatDate(weather.time);
  iconEl.src = getWeatherIcon(weather.weathercode);
}

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-Us", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getWeatherIcon(code) {
  if (code === 0) return "images/icon-sunny.webp";
  if (code <= 3) return "images/icon-partly-cloudy.webp";
  if (code <= 48) return "images/icon-fog.webp";
  if (code <= 67) return "images/icon-rain.webp";
  if (code <= 77) return "images/icon-snow.webp";
  return "images/icon-storm.webp";
}

function renderStats(data) {
  const current = data.current_weather;

  feelsEl.textContent = `${convertTemp(current.temperature)}°`;
  windEl.textContent = `${Math.round(current.windspeed)} km/h`;

  //Use first hourly value as "current"
  humidityEl.textContent = `${data.hourly.relativehumidity_2m[0]}%`;
  precipEl.textContent = `${data.hourly.precipitation[0]} mm`;
}

function renderDailyForecast(data) {
  dailyEl.innerHTML = "";

  const days = data.daily.time;
  const maxTemps = data.daily.temperature_2m_max;
  const minTemps = data.daily.temperature_2m_min;

  days.forEach((day, index) => {
    const date = new Date(day);
    const weekday = date.toLocaleDateString("en-US", {
      weekday: "short",
    });

    const card = document.createElement("div");
    card.className = "day-card";

    card.innerHTML = `
    <span>${weekday}</span>
    <span>${convertTemp(maxTemps[index])}° / ${convertTemp(minTemps[index])}°</span>
    `;

    dailyEl.appendChild(card);
  });
}

function renderHourlyForecast(data) {
  hourlyEl.innerHTML = "";

  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;

  //Show next 8 hours only
  for (let i = 0; i < 8; i++) {
    const date = new Date(times[i]);
    const hour = date.toLocaleTimeString("en-US", {
      hour: "numeric",
    });

    const hourCard = document.createElement("div");
    hourCard.className = "hour";

    hourCard.innerHTML = `
    <span>${hour}</span>
    <strong>${convertTemp(temps[i])}°</strong>
    `;

    hourlyEl.appendChild(hourCard);
  }
}

function convertTemp(temp) {
  return unit === "metric" ? Math.round(temp) : Math.round((temp * 9) / 5 + 32);
}

unitToggle.addEventListener("click", () => {
  if (!weatherData || !currentLocation) return;

  unit = unit === "metric" ? "imperial" : "metric";

  unitToggle.textContent = unit === "metric" ? "Units °C" : "Units °F";

  //Re-render everything using stored data
  renderCurrentWeather(currentLocation, weatherData.current_weather);
  renderStats(weatherData);
  renderDailyForecast(weatherData);
  renderHourlyForecast(weatherData);
});

window.addEventListener("load", async () => {
  const location = await getCoordinates("Berlin");
  if (!location) return;

  const data = await getCurrentWeather(location.lat, location.lon);
  if (!data) return;

  weatherData = data;
  currentLocation = location;

  renderCurrentWeather(location, data.current_weather);
  renderStats(data);
  renderDailyForecast(data);
  renderHourlyForecast(data);
});
