import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Marketplace from "../../pages/PokemonMarketplace";
import Recipes from "../../pages/Recipes";
import CardPack from "../CardPack";
import PokemonCard from "../PokemonCard";

export default function DashboardLayout() {
  // Tracks which panel is currently taking up the full screen
  const [activePanel, setActivePanel] = useState("home"); // 'home', 'marketplace', 'inventory', 'recipes'
  const [expandedCard, setExpandedCard] = useState(null);

  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem("pokemon-inventory");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load inventory:", e);
      return [];
    }
  });

  const addCardsToInventory = (newCards) => {
    setInventory(prev => {
      const updated = [...prev, ...newCards];
      localStorage.setItem("pokemon-inventory", JSON.stringify(updated));
      return updated;
    });
  };

  const closePanel = () => setActivePanel("home");

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900 text-white">
      
      {/* =========================================
          THE CENTER: GACHA PACK ZONE
      ========================================= */}
      <div className="flex h-full w-full items-center justify-center">
        <div id="gacha-center-wrapper" className="flex h-full w-full items-center justify-center">
          <CardPack activePanel={activePanel} addCardsToInventory={addCardsToInventory} />
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
            <div className="flex-1 overflow-y-auto mt-8 custom-scrollbar">
              {inventory.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-12 gap-x-4 pb-12">
                  {inventory.map((card, idx) => {
                    const isExpanded = expandedCard?.idx === idx;
                    return (
                      <div key={`${card.id}-${idx}`} className="flex justify-center -mb-20 min-h-[220px]">
                        {!isExpanded && (
                          <motion.div 
                            layoutId={`vault-card-${card.id}-${idx}`}
                            className="scale-[0.55] sm:scale-[0.6] origin-top transition-transform hover:scale-[0.65] hover:z-10 cursor-pointer"
                            onClick={() => setExpandedCard({ card, idx })}
                          >
                            <PokemonCard card={card} disableFlip={true} />
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                   <div className="w-24 h-24 mb-6 relative">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                      <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
                        <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="4" />
                        <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="4" />
                        <circle cx="50" cy="50" r="8" fill="currentColor" />
                      </svg>
                   </div>
                   <p className="text-emerald-500 font-black text-2xl tracking-[0.3em] uppercase italic">
                      Empty Vault
                   </p>
                   <p className="text-white/40 text-xs mt-4 tracking-widest uppercase font-bold">
                      Open packs to claim your cards
                   </p>
                </div>
              )}
            </div>

            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(16, 185, 129, 0.3);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(16, 185, 129, 0.5);
              }
            `}</style>
            
            {/* The Expanded Card Modal */}
            <AnimatePresence>
              {expandedCard && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                  onClick={() => setExpandedCard(null)}
                >
                  <motion.div
                    layoutId={`vault-card-${expandedCard.card.id}-${expandedCard.idx}`}
                    className="relative z-10 scale-100 sm:scale-125 md:scale-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PokemonCard card={expandedCard.card} disableFlip={true} />
                    <button
                      onClick={() => setExpandedCard(null)}
                      className="absolute -top-6 -right-6 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shadow-xl"
                    >
                      ✕
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}