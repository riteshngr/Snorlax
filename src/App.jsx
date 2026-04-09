import PokeballSplash from "./components/gacha/PokeballSplash";
import DashboardLayout from "./components/layout/DashboardLayout";
import ClickSparkEffect from "./components/effects/ClickSparkEffect";

function App() {
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

export default App;