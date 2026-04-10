import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PokemonMarketplace from "../../pages/PokemonMarketplace";
import Recipes from "../../pages/Recipes";
import CardPack from "../CardPack";
import PokemonCard from "../PokemonCard";
import { useAuth } from "../../context/Store";
import { useUserData } from "../../context/Store";
import WeatherWidget from "../weather/WeatherWidget";

export default function DashboardLayout() {
  // Tracks which panel is currently taking up the full screen
  const [activePanel, setActivePanel] = useState("home"); // 'home', 'marketplace', 'inventory', 'recipes'
  const [expandedCard, setExpandedCard] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sortMode, setSortMode] = useState("default"); // 'default', 'rarity', 'type'
  const [cardToSell, setCardToSell] = useState(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState(new Set());
  const [showBulkSellModal, setShowBulkSellModal] = useState(false);

  const RARITY_MAP = {
    "Mythical": 1,
    "Legendary": 2,
    "Epic": 3,
    "Rare": 4,
    "Uncommon": 5,
    "Common": 6
  };

  const TYPE_ORDER = [
    "fire", "water", "grass", "electric", "psychic", "poison", "normal", "flying"
  ];

  const { user, logout } = useAuth();
  const { profile, inventory, addCardsToInventory, spendCredits, sellCard, bulkSellCards } = useUserData();

  const closePanel = () => setActivePanel("home");

  // Display username from profile, fallback to Firebase displayName
  const displayName = profile?.username || user?.displayName || "Trainer";
  const initials = displayName.substring(0, 2).toUpperCase();

  const getSellPrice = (rarity) => {
    const prices = {
      Common: 30,
      Uncommon: 50,
      Rare: 120,
      Epic: 250,
      Legendary: 600,
      Mythical: 2000,
      Ultra: 2500,
    };
    return prices[rarity] || 40;
  };

  const sortedInventory = useMemo(() => {
    let sorted = [...inventory];

    if (sortMode === "rarity") {
      sorted.sort((a, b) => {
        const weightA = RARITY_MAP[a.rarity] || 7;
        const weightB = RARITY_MAP[b.rarity] || 7;
        if (weightA !== weightB) return weightA - weightB;
        return (a.name || "").localeCompare(b.name || "");
      });
    } else if (sortMode === "type") {
      sorted.sort((a, b) => {
        const typeA = (a.types?.[0] || "normal").toLowerCase();
        const typeB = (b.types?.[0] || "normal").toLowerCase();
        
        let indexA = TYPE_ORDER.indexOf(typeA);
        let indexB = TYPE_ORDER.indexOf(typeB);
        
        if (indexA === -1) indexA = 99;
        if (indexB === -1) indexB = 99;
        
        if (indexA !== indexB) return indexA - indexB;
        return (a.name || "").localeCompare(b.name || "");
      });
    }

    return sorted;
  }, [inventory, sortMode]);

  const toggleSelection = (docId) => {
    setSelectedDocIds(prev => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedDocIds.size === inventory.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(inventory.map(c => c.docId)));
    }
  };

  const getSelectedMetadata = () => {
    return inventory.filter(c => selectedDocIds.has(c.docId));
  };

  const totalSelectedValue = useMemo(() => {
    return getSelectedMetadata().reduce((sum, c) => sum + getSellPrice(c.rarity), 0);
  }, [selectedDocIds, inventory]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900 text-white">

      {/* ── User Info Bar (top-right) ─────────────────── */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        {/* Credits */}
        {profile && (
          <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-gray-900/80 backdrop-blur-md px-3 py-1.5">
            <span className="text-sm">🪙</span>
            <span className="text-xs font-black text-amber-400">
              {(profile.credits || 0).toLocaleString()}
            </span>
          </div>
        )}


        {/* User avatar + dropdown (click-based) */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 cursor-pointer hover:border-purple-400/50 transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-[10px] font-bold text-white">
              {initials}
            </div>
            <span className="text-xs font-bold text-gray-300 hidden sm:block">{displayName}</span>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              {/* Invisible overlay to close on outside click */}
              <div className="fixed inset-0 z-[70]" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-gray-700/50 bg-gray-900/95 backdrop-blur-xl shadow-2xl z-[80] animate-in fade-in">
                <div className="p-2">
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================================
          BACKGROUND VIDEO
      ========================================= */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover z-0"
        src="/bg.mp4"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      {/* =========================================
          THE CENTER: GACHA PACK ZONE
      ========================================= */}
      <div className="relative z-[2] flex h-full w-full items-center justify-center">
        <div id="gacha-center-wrapper" className="flex h-full w-full items-center justify-center">
          <CardPack activePanel={activePanel} addCardsToInventory={addCardsToInventory} spendCredits={spendCredits} userCredits={profile?.credits || 0} />
        </div>
      </div>

      {/* =========================================
          THE TABS (Triggers to open the panels)
      ========================================= */}

      {/* LEFT TAB: Recipes */}
      <button
        onClick={() => setActivePanel("recipes")}
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-xl bg-blue-900/60 backdrop-blur-md border border-blue-400/20 px-3 py-10 font-bold tracking-widest text-white transition-all hover:scale-105 hover:bg-blue-800/75 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] z-10"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        RECIPES
      </button>

      {/* RIGHT TAB: Marketplace */}
      <button
        onClick={() => setActivePanel("marketplace")}
        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-xl bg-blue-900/60 backdrop-blur-md border border-blue-400/20 px-3 py-10 font-bold tracking-widest text-white transition-all hover:scale-105 hover:bg-blue-800/75 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] z-10"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        <span style={{ display: 'block', transform: 'rotate(180deg)' }}>MARKET</span>
      </button>

      {/* BOTTOM TAB: Inventory */}
      <button
        onClick={() => setActivePanel("inventory")}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-xl bg-amber-900/60 backdrop-blur-md border border-amber-400/20 px-12 py-3 font-bold tracking-widest text-white transition-all hover:scale-105 hover:bg-amber-800/75 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] z-10"
      >
        INVENTORY ({inventory.length})
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
            {/* Back button floating over the recipes */}
            <button
              onClick={closePanel}
              className="absolute right-4 top-4 z-[60] flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all hover:from-purple-500 hover:to-purple-400 hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              ← Back
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
            {/* Back button floating over the marketplace */}
            <button
              onClick={closePanel}
              className="absolute right-4 top-4 z-[60] flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all hover:from-purple-500 hover:to-purple-400 hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              ← Back
            </button>
            <div className="flex-1 overflow-hidden">
              <PokemonMarketplace />
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
              <div>
                <h2 className="text-4xl font-black text-emerald-500 uppercase tracking-tight">The Vault</h2>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-1">
                  <p className="text-xs text-gray-500">{displayName}'s Collection · {inventory.length} cards</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Sort:</label>
                      <select 
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value)}
                        className="bg-gray-900 border border-gray-800 text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 py-1 outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
                      >
                        <option value="default">Default</option>
                        <option value="rarity">Rarity</option>
                        <option value="type">Type</option>
                      </select>
                    </div>

                    <div className="h-4 w-[1px] bg-gray-800 mx-1" />

                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => {
                           setIsSelectMode(!isSelectMode);
                           if (isSelectMode) setSelectedDocIds(new Set());
                         }}
                         className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                           isSelectMode 
                           ? "bg-emerald-500 text-gray-950 shadow-lg shadow-emerald-500/20" 
                           : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                         }`}
                       >
                         {isSelectMode ? "Cancel Selection" : "Select Items"}
                       </button>

                       {isSelectMode && (
                         <button 
                           onClick={selectAll}
                           className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-gray-700 transition-all border border-gray-700"
                         >
                           {selectedDocIds.size === inventory.length ? "Deselect All" : "Select All"}
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={closePanel}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all hover:from-purple-500 hover:to-purple-400 hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] hover:scale-105 active:scale-95"
              >
                ← Back
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mt-8 custom-scrollbar">
              {inventory.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-12 gap-x-4 pb-12">
                  {sortedInventory.map((card, idx) => {
                    // Map Firestore inventory doc fields to PokemonCard's expected shape
                    const cardForDisplay = {
                      id: card.pokemonId || card.id,
                      name: card.name,
                      image: card.image,
                      types: card.types || [],
                      attacks: card.attacks || [],
                      rarity: card.rarity || "Common",
                      genus: card.genus || "Unknown Pokémon",
                    };
                    const isExpanded = expandedCard?.idx === idx;
                    return (
                      <div key={card.docId || `${card.id}-${idx}`} className="flex justify-center -mb-20 min-h-[220px]">
                        {!isExpanded && (
                            <motion.div
                              layoutId={`vault-card-${cardForDisplay.id}-${idx}`}
                              className={`scale-[0.55] sm:scale-[0.6] origin-top transition-all duration-300 hover:z-10 cursor-pointer ${
                                selectedDocIds.has(card.docId) ? 'brightness-110' : ''
                              } ${!isExpanded ? 'hover:scale-[0.65]' : ''}`}
                              onClick={() => {
                                if (isSelectMode) {
                                  toggleSelection(card.docId);
                                } else {
                                  setExpandedCard({ card: cardForDisplay, idx });
                                }
                              }}
                            >
                              <PokemonCard card={cardForDisplay} disableFlip={true} />
                              
                              {/* SELECTION OVERLAY (Select Mode) */}
                              {isSelectMode && (
                                <div className={`absolute inset-0 z-30 flex items-start justify-end p-4 transition-all duration-300 ${
                                  selectedDocIds.has(card.docId) ? 'bg-emerald-500/10' : 'bg-transparent'
                                }`}>
                                   <div className={`flex h-12 w-12 items-center justify-center rounded-full border-4 transition-all duration-300 ${
                                     selectedDocIds.has(card.docId)
                                     ? "bg-emerald-500 border-emerald-300 scale-110 shadow-lg"
                                     : "bg-black/50 border-white/30 scale-100"
                                   }`}>
                                      {selectedDocIds.has(card.docId) && (
                                        <svg className="w-6 h-6 text-gray-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                   </div>
                                </div>
                              )}

                              {/* SELL OVERLAY (Standard Mode) */}
                              {!isSelectMode && (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  whileHover={{ opacity: 1 }}
                                  className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[2px]"
                                >
                                   <button 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setCardToSell({ ...cardForDisplay, docId: card.docId });
                                     }}
                                     className="group/sell relative flex items-center gap-2 rounded-xl bg-red-600/90 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/20 hover:bg-red-500 hover:scale-110 active:scale-95 transition-all"
                                   >
                                      <span>Selling:</span>
                                      <span className="text-amber-300">{getSellPrice(cardForDisplay.rarity)} 🪙</span>
                                      <div className="absolute -inset-0.5 rounded-[13px] border border-red-400 opacity-0 group-hover/sell:opacity-30 group-hover/sell:animate-pulse" />
                                   </button>
                                </motion.div>
                              )}
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

            {/* SELL CONFIRMATION MODAL */}
            <AnimatePresence>
              {cardToSell && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
                  onClick={() => setCardToSell(null)}
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="max-w-sm w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 mb-6 relative">
                        <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl animate-pulse" />
                        <img 
                          src={cardToSell.image} 
                          alt={cardToSell.name}
                          className="w-full h-full object-contain relative z-10"
                        />
                      </div>
                      
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Sell {cardToSell.name}?</h3>
                      <p className="text-sm text-gray-500 mt-2 mb-8">
                        Are you sure you want to sell this <span className="text-amber-400 font-bold">{cardToSell.rarity}</span> card for <span className="text-emerald-400 font-bold">{getSellPrice(cardToSell.rarity)} 🪙</span>? 
                        <br/>This action cannot be undone.
                      </p>

                      <div className="flex w-full gap-3">
                        <button 
                          onClick={() => setCardToSell(null)}
                          className="flex-1 py-3.5 rounded-2xl bg-gray-800 text-xs font-bold text-gray-400 hover:bg-gray-700 hover:text-white transition-all uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={async () => {
                            const result = await sellCard(cardToSell.docId, cardToSell.rarity);
                            if (result.success) {
                              setCardToSell(null);
                            } else {
                              alert("Sell failed: " + result.error);
                            }
                          }}
                          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 text-xs font-bold text-white shadow-xl shadow-red-900/20 hover:from-red-500 hover:to-red-400 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                        >
                          Confirm Sale
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* BULK SELL CONFIRMATION MODAL */}
            <AnimatePresence>
              {showBulkSellModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
                  onClick={() => setShowBulkSellModal(false)}
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="max-w-sm w-full bg-gray-950 border border-gray-800 rounded-3xl p-8 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center">
                       <div className="flex justify-center mb-6">
                          <div className="relative">
                             <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                             <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-900 border border-gray-800 text-4xl shadow-xl">
                                💰
                             </div>
                          </div>
                       </div>
                       
                       <h3 className="text-2xl font-black text-white uppercase tracking-tight">Bulk Sale</h3>
                       <p className="text-sm text-gray-500 mt-3 mb-8">
                         You are about to sell <span className="text-white font-black">{selectedDocIds.size} cards</span> for a total of <span className="text-emerald-400 font-black">{totalSelectedValue} 🪙</span>.
                         <br/><br/>
                         <span className="text-red-400/80 text-[10px] font-bold uppercase tracking-widest">This process is permanent</span>
                       </p>

                       <div className="flex flex-col gap-3">
                         <button 
                           onClick={async () => {
                             const cardsPayload = getSelectedMetadata().map(c => ({
                                docId: c.docId,
                                rarity: c.rarity
                             }));
                             const result = await bulkSellCards(cardsPayload);
                             if (result.success) {
                               setShowBulkSellModal(false);
                               setIsSelectMode(false);
                               setSelectedDocIds(new Set());
                             } else {
                               alert("Bulk sell failed: " + result.error);
                             }
                           }}
                           className="w-full py-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-black text-white shadow-xl shadow-emerald-900/30 hover:from-emerald-400 hover:to-teal-500 hover:scale-102 active:scale-98 transition-all uppercase tracking-[0.2em]"
                         >
                           Finalize Bulk Sale
                         </button>
                         <button 
                           onClick={() => setShowBulkSellModal(false)}
                           className="w-full py-3.5 rounded-2xl bg-gray-900 text-[10px] font-black text-gray-500 hover:bg-gray-800 hover:text-white transition-all uppercase tracking-widest border border-gray-800"
                         >
                           Go Back
                         </button>
                       </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FLOATING ACTION BAR (Select Mode) */}
            <AnimatePresence>
              {isSelectMode && selectedDocIds.size > 0 && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4"
                >
                  <div className="bg-gray-950/90 backdrop-blur-2xl border border-emerald-500/30 rounded-[2.5rem] p-3 pl-8 flex items-center justify-between shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
                     <div className="flex flex-col">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Items Selected</p>
                        <h4 className="text-xl font-black text-white leading-none tracking-tight">
                          {selectedDocIds.size} <span className="text-gray-600 text-sm font-bold uppercase tracking-widest ml-1">Cards</span>
                        </h4>
                     </div>

                     <div className="flex items-center gap-6">
                        <div className="text-right">
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Total Value</p>
                           <p className="text-xl font-black text-amber-400 leading-none tracking-tight">{totalSelectedValue} 🪙</p>
                        </div>
                        
                        <button 
                          onClick={() => setShowBulkSellModal(true)}
                          className="h-14 px-8 rounded-[1.75rem] bg-emerald-500 text-gray-950 text-xs font-black uppercase tracking-widest hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                        >
                          Sell All
                        </button>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </AnimatePresence>

      {activePanel === "home" && <WeatherWidget />}
    </div>
  );
}