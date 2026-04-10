/**
 * weather.js — Service for fetching real-world weather data.
 * Maps weather conditions to Pokémon types for spawn boosts.
 */

// Placeholder key — USER SHOULD REPLACE THIS
const WEATHER_API_KEY = "PLACEHOLDER_OPENWEATHER_KEY";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const WEATHER_MAPPING = {
  Thunderstorm: "electric",
  Drizzle: "water",
  Rain: "water",
  Snow: "ice",
  Clear: "fire",
  Clouds: "flying",
  Mist: "ghost",
  Smoke: "poison",
  Haze: "ghost",
  Dust: "ground",
  Fog: "ghost",
  Sand: "ground",
  Ash: "fire",
  Squall: "flying",
  Tornado: "flying",
};

/**
 * Fetch current weather based on coordinates.
 */
export async function fetchCurrentWeather(lat, lon) {
  // SIMULATION MODE: If key is placeholder, return mock data to show the UI
  if (WEATHER_API_KEY === "PLACEHOLDER_OPENWEATHER_KEY") {
    console.warn("Weather: No API Key. Using simulation mode.");
    const mocks = [
        { condition: "Clear", temp: 24, boostedType: "fire" },
        { condition: "Rain", temp: 16, boostedType: "water" },
        { condition: "Clouds", temp: 19, boostedType: "flying" },
        { condition: "Thunderstorm", temp: 21, boostedType: "electric" }
    ];
    const picked = mocks[Math.floor(Math.random() * mocks.length)];
    return {
      ...picked,
      city: "Simulation Mode",
      icon: "01d",
      isSimulated: true
    };
  }

  try {
    const response = await fetch(
      `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    if (!response.ok) throw new Error("Weather fetch failed");

    const data = await response.json();
    const mainCondition = data.weather[0].main;
    
    return {
      condition: mainCondition,
      temp: data.main.temp,
      city: data.name,
      boostedType: WEATHER_MAPPING[mainCondition] || null,
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error("Weather service error:", error);
    return null;
  }
}

/**
 * Fallback for default location (e.g., Tokyo or New York)
 */
export async function fetchDefaultWeather() {
  // Defaulting to London coordinates
  return fetchCurrentWeather(51.5074, -0.1278);
}
