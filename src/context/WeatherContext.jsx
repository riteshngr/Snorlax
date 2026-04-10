import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchCurrentWeather, fetchDefaultWeather } from "../services/weather";

const WeatherContext = createContext(null);

export function WeatherProvider({ children }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshWeather = useCallback(async () => {
    try {
      // 1. Load fallback/simulated data immediately so the UI is visible
      const fallback = await fetchDefaultWeather();
      setWeather(fallback);
      setLoading(false);

      // 2. Attempt to upgrade to real geolocation if available
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const data = await fetchCurrentWeather(
              position.coords.latitude,
              position.coords.longitude
            );
            if (data) setWeather(data);
          },
          (error) => {
            console.warn("Geolocation upgrade failed:", error.message);
          },
          { timeout: 5000 } // Don't wait forever
        );
      }
    } catch (err) {
      console.error("Weather refresh failed", err);
      // Ensure we're not stuck in loading
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWeather();
    // Refresh every 10 minutes
    const interval = setInterval(refreshWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshWeather]);

  return (
    <WeatherContext.Provider value={{ weather, loading, refreshWeather }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
}
