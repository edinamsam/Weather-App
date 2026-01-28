const searchForm = document.querySelector(".search-box");
const searchInput = document.querySelector(".search-box input");

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = searchInput.value.trim();

  if (!query) return;

  const location = await getCoordinates(query);

  if (!location) return;

  console.log("Coordinates found:", location);

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
