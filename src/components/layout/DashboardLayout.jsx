import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Marketplace from "../../pages/PokemonMarketplace";
import Recipes from "../../pages/Recipes";
import CardPack from "../CardPack";

export default function DashboardLayout() {
  // Tracks which panel is currently taking up the full screen
  const [activePanel, setActivePanel] = useState("home"); // 'home', 'marketplace', 'inventory', 'recipes'

  const closePanel = () => setActivePanel("home");

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900 text-white">
      
      {/* =========================================
          THE CENTER: GACHA PACK ZONE
      ========================================= */}
      <div className="flex h-full w-full items-center justify-center">
        <div id="gacha-center-wrapper" className="flex h-full w-full items-center justify-center">
          <CardPack activePanel={activePanel} />
        </div>
      </div>

      {/* =========================================
          THE TABS (Triggers to open the panels)
      ========================================= */}
      
      {/* LEFT TAB: Recipes */}
      <button 
        onClick={() => setActivePanel("recipes")}
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-xl bg-purple-600 px-3 py-10 font-bold tracking-widest text-white transition-all hover:scale-105 hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] z-10"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        RECIPES
      </button>

      {/* RIGHT TAB: Marketplace */}
      <button 
        onClick={() => setActivePanel("marketplace")}
        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-xl bg-blue-600 px-3 py-10 font-bold tracking-widest text-white transition-all hover:scale-105 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] z-10"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        MARKET
      </button>

      {/* BOTTOM TAB: Inventory */}
      <button 
        onClick={() => setActivePanel("inventory")}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-xl bg-emerald-600 px-12 py-3 font-bold tracking-widest text-white transition-all hover:scale-105 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10"
      >
        INVENTORY
      </button>


      {/* =========================================
          THE SLIDING FULL-SCREEN PANELS
      ========================================= */}
      <AnimatePresence>
        
        {/* RECIPES PANEL (Slides from Left -> Right) */}
        {activePanel === "recipes" && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute inset-0 z-[60] flex flex-col bg-[#070412]"
          >
            {/* Close button floating over the recipes */}
            <button 
              onClick={closePanel} 
              className="absolute right-4 top-4 z-[60] flex h-9 w-9 items-center justify-center rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/80 text-lg transition-all hover:scale-110"
            >
              ✕
            </button>
            <div className="flex-1 overflow-hidden">
              <Recipes />
            </div>
          </motion.div>
        )}

        {/* MARKETPLACE PANEL (Slides from Right -> Left) */}
        {activePanel === "marketplace" && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute inset-0 z-[60] flex flex-col bg-[#070412]"
          >
            {/* Close button floating over the marketplace */}
            <button 
              onClick={closePanel} 
              className="absolute left-4 top-4 z-[60] flex h-9 w-9 items-center justify-center rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/80 text-lg transition-all hover:scale-110"
            >
              ✕
            </button>
            <div className="flex-1 overflow-hidden">
              <Marketplace />
            </div>
          </motion.div>
        )}

        {/* INVENTORY PANEL (Slides from Bottom -> Top) */}
        {activePanel === "inventory" && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute inset-0 z-[60] flex flex-col bg-gray-950 p-8"
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h2 className="text-4xl font-black text-emerald-500 uppercase tracking-tight">The Vault</h2>
              <button onClick={closePanel} className="text-gray-500 hover:text-white text-3xl transition-colors">✕</button>
            </div>
            <div className="flex h-full w-full items-center justify-center">
              {/* Dev drops Inventory Component here */}
              <span className="text-gray-600">[ Inventory Grid Goes Here ]</span>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}