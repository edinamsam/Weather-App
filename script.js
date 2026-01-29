const searchForm = document.querySelector(".search-box");
const searchInput = document.querySelector(".search-box input");
const cityEl = document.querySelector("[data-city]");
const dateEl = document.querySelector("[data-date]");
const tempEl = document.querySelector("[data-temp]");
const iconEl = document.querySelector("[data-weathericon]");

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = searchInput.value.trim();
  if (!query) return;

  const location = await getCoordinates(query);
  if (!location) return;

  const weather = await getCurrentWeather(location.lat, location.lon);
  if (!weather) return;

  renderCurrentWeather(location, weather);

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
    alert("Location not found. Please try another city");
  }
}

async function getCurrentWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.current_weather) {
      throw new Error("Weather data not available");
    }

    return data.current_weather;
  } catch (error) {
    console.error(error.message);
    alert("Unable to fetch weather data.");
  }
}

function renderCurrentWeather(location, weather) {
  cityEl.textContent = `${location.name}, ${location.country}`;
  tempEl.textContent = `${Math.round(weather.temperature)}°`;
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
  if (code <= 3) return "images/icon-cloudy.webp";
  if (code <= 48) return "images/icon-fog.webp";
  if (code <= 67) return "images/icon-rain.webp";
  if (code <= 77) return "images/icon-snow.webp";
  return "images/icon-storm.webp";
}
