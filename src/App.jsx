import StoreProvider, { useAuth } from "./context/Store";
import PokeballSplash from "./components/gacha/PokeballSplash";
import DashboardLayout from "./components/layout/DashboardLayout";
import ClickSparkEffect from "./components/effects/ClickSparkEffect";
import AuthPage from "./pages/AuthPage";

/**
 * AppContent — Renders either the AuthPage or the main app
 * depending on the user's authentication state.
 */
function AppContent() {
  const { user, loading } = useAuth();

  // While Firebase is determining auth state, show a loading screen
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
            <svg viewBox="0 0 100 100" className="relative w-full h-full text-purple-400 animate-spin" style={{ animationDuration: '3s' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="70 200" />
            </svg>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 animate-pulse">
            Loading PokeVault...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in → show auth page
  if (!user) {
    return <AuthPage />;
  }

  // Logged in → show the main app
  return (
    <div className="bg-gray-900 min-h-screen text-white overflow-hidden">
      <ClickSparkEffect />
      
      {/* The cinematic reveal */}
      <PokeballSplash>
        
        {/* The main app structure is revealed when the ball opens */}
        <DashboardLayout />

      </PokeballSplash>

    </div>
  );
}

import { WeatherProvider } from "./context/WeatherContext";

function App() {
  return (
    <StoreProvider>
      <WeatherProvider>
        <AppContent />
      </WeatherProvider>
    </StoreProvider>
  );
}

export default App;