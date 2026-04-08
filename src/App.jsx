import PokeballSplash from "./components/gacha/PokeballSplash";
import DashboardLayout from "./components/layout/DashboardLayout"; // Import the new layout

function App() {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      
      {/* The cinematic reveal */}
      <PokeballSplash>
        
        {/* The main app structure is revealed when the ball opens */}
        <DashboardLayout />

      </PokeballSplash>

    </div>
  );
}

export default App;