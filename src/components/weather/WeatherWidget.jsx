import { useState, useRef, useEffect } from "react";
import { useWeather } from "../../context/WeatherContext";
import { motion, AnimatePresence } from "framer-motion";
import { TYPE_COLORS, TYPE_GLOWS } from "../../utils/typeColors";

const WEATHER_EMOJIS = {
  Thunderstorm: "⛈️",
  Drizzle: "🌦️",
  Rain: "🌧️",
  Snow: "🌨️",
  Clear: "☀️",
  Clouds: "☁️",
  Mist: "🌫️",
  Smoke: "💨",
  Haze: "🌫️",
  Dust: "🏜️",
  Fog: "🌫️",
  Sand: "⏳",
  Ash: "🌋",
  Squall: "🌬️",
  Tornado: "🌪️",
};

export default function WeatherWidget() {
  const { weather } = useWeather();
  const [isExpanded, setIsExpanded] = useState(false);
  const widgetRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!weather) return null;

  const emoji = WEATHER_EMOJIS[weather.condition] || "🌍";

  return (
    <motion.div
      ref={widgetRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 right-6 z-[100]"
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* COMPACT MODE */
          <motion.button
            key="compact"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer group outline-none"
          >
            {/* Subtle floating shadow/glow */}
            <div className="absolute inset-0 bg-white/5 blur-xl group-hover:bg-white/10 rounded-full transition-all" />
            
            <span className="relative text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform">
              {emoji}
            </span>
            <span className="relative text-sm font-black text-white/90 tracking-tighter drop-shadow-md group-hover:text-white transition-colors">
              {Math.round(weather.temp)}°C
            </span>
          </motion.button>
        ) : (
          /* EXPANDED MODE */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="relative flex flex-col gap-3 rounded-[2.5rem] border border-white/10 bg-gray-900/60 p-4 min-w-[200px] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-glow"
          >
            {/* Expanded Header */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-2xl shadow-inner">
                {emoji}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">
                    {weather.isSimulated ? "Simulated" : "Current"}
                  </span>
                  <span className={`h-1 w-1 rounded-full animate-pulse ${weather.isSimulated ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">
                  {weather.condition} <span className="text-gray-500 font-bold ml-1">{Math.round(weather.temp)}°C</span>
                </h4>
              </div>
            </div>

            {/* Expanded Info (Boosts) */}
            {weather.boostedType && (
              <div className="mt-1 pt-3 border-t border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Active Boost</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`h-2 w-2 rounded-full ${TYPE_COLORS[weather.boostedType]}`}
                      style={{ boxShadow: `0 0 10px ${TYPE_GLOWS[weather.boostedType]}` }}
                    />
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
                      {weather.boostedType} Pokémon <span className="text-emerald-400 font-black">+25% Chance</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Simple Close Button (Optional since we have click outside, but nice for UX) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="absolute top-2 right-4 text-[10px] font-bold text-white/20 hover:text-white/60 transition-colors uppercase tracking-widest"
            >
              close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .border-glow {
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.03);
        }
      `}</style>
    </motion.div>
  );
}
