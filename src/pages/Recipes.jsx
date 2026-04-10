import { motion, AnimatePresence } from "framer-motion";
import { useUserData } from "../context/Store";
import { useEffect, useState, useMemo } from "react";
import { STONE_METADATA, RESTOCK_INTERVAL_MS } from "../services/shop";

// ─── Evolution Stone Data ─────────────────────────────────────────────────────
const EVOLUTION_STONES = [
  {
    id: "fire-stone",
    name: "Fire Stone",
    emoji: "🔥",
    description: "A peculiar stone that makes certain species of Pokémon evolve. It has a fiery orange heart.",
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-500",
    glowColor: "rgba(239, 68, 68, 0.4)",
    borderColor: "border-red-500/40",
    textColor: "text-red-400",
    evolutions: [
      { from: "Vulpix", fromId: 37, to: "Ninetales", toId: 38 },
      { from: "Growlithe", fromId: 58, to: "Arcanine", toId: 59 },
      { from: "Eevee", fromId: 133, to: "Flareon", toId: 136 },
    ],
  },
  {
    id: "water-stone",
    name: "Water Stone",
    emoji: "💧",
    description: "A peculiar stone that makes certain species of Pokémon evolve. It is the clear blue of a otherwise.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500",
    glowColor: "rgba(59, 130, 246, 0.4)",
    borderColor: "border-blue-500/40",
    textColor: "text-blue-400",
    evolutions: [
      { from: "Poliwhirl", fromId: 61, to: "Poliwrath", toId: 62 },
      { from: "Shellder", fromId: 90, to: "Cloyster", toId: 91 },
      { from: "Staryu", fromId: 120, to: "Starmie", toId: 121 },
      { from: "Eevee", fromId: 133, to: "Vaporeon", toId: 134 },
    ],
  },
  {
    id: "thunder-stone",
    name: "Thunder Stone",
    emoji: "⚡",
    description: "A peculiar stone that makes certain species of Pokémon evolve. It has a thunderbolt pattern.",
    color: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-400",
    glowColor: "rgba(250, 204, 21, 0.4)",
    borderColor: "border-yellow-500/40",
    textColor: "text-yellow-400",
    evolutions: [
      { from: "Pikachu", fromId: 25, to: "Raichu", toId: 26 },
      { from: "Eevee", fromId: 133, to: "Jolteon", toId: 135 },
    ],
  },
  {
    id: "leaf-stone",
    name: "Leaf Stone",
    emoji: "🍃",
    description: "A peculiar stone that makes certain species of Pokémon evolve. It has an earthy fragrance.",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500",
    glowColor: "rgba(34, 197, 94, 0.4)",
    borderColor: "border-green-500/40",
    textColor: "text-green-400",
    evolutions: [
      { from: "Gloom", fromId: 44, to: "Vileplume", toId: 45 },
      { from: "Weepinbell", fromId: 70, to: "Victreebel", toId: 71 },
      { from: "Exeggcute", fromId: 102, to: "Exeggutor", toId: 103 },
    ],
  },
  {
    id: "moon-stone",
    name: "Moon Stone",
    emoji: "🌙",
    description: "A peculiar stone that makes certain species of Pokémon evolve. It is as dark as the night sky.",
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-indigo-500",
    glowColor: "rgba(99, 102, 241, 0.4)",
    borderColor: "border-indigo-500/40",
    textColor: "text-indigo-400",
    evolutions: [
      { from: "Nidorina", fromId: 30, to: "Nidoqueen", toId: 31 },
      { from: "Nidorino", fromId: 33, to: "Nidoking", toId: 34 },
      { from: "Clefairy", fromId: 35, to: "Clefable", toId: 36 },
      { from: "Jigglypuff", fromId: 39, to: "Wigglytuff", toId: 40 },
    ],
  },
  {
    id: "sun-stone",
    name: "Sun Stone",
    emoji: "☀️",
    description: "A peculiar stone that radiates warmth like the sun. It makes certain species of Pokémon evolve.",
    color: "from-orange-400 to-yellow-500",
    bgColor: "bg-orange-400",
    glowColor: "rgba(251, 146, 60, 0.4)",
    borderColor: "border-orange-500/40",
    textColor: "text-orange-400",
    evolutions: [
      { from: "Gloom", fromId: 44, to: "Bellossom", toId: 182 },
      { from: "Sunkern", fromId: 191, to: "Sunflora", toId: 192 },
    ],
  },
  {
    id: "ice-stone",
    name: "Ice Stone",
    emoji: "❄️",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It has an ice-like pattern inside.",
    color: "from-cyan-300 to-blue-400",
    bgColor: "bg-cyan-300",
    glowColor: "rgba(103, 232, 249, 0.4)",
    borderColor: "border-cyan-400/40",
    textColor: "text-cyan-400",
    evolutions: [
      { from: "Sandshrew-A", fromId: 27, to: "Sandslash-A", toId: 28 },
      { from: "Vulpix-A", fromId: 37, to: "Ninetales-A", toId: 38 },
    ],
  },
  {
    id: "dusk-stone",
    name: "Dusk Stone",
    emoji: "🌑",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It holds shadows within.",
    color: "from-purple-800 to-gray-900",
    bgColor: "bg-purple-800",
    glowColor: "rgba(91, 33, 182, 0.4)",
    borderColor: "border-purple-700/40",
    textColor: "text-purple-400",
    evolutions: [
      { from: "Murkrow", fromId: 198, to: "Honchkrow", toId: 430 },
      { from: "Misdreavus", fromId: 200, to: "Mismagius", toId: 429 },
    ],
  },
  {
    id: "dawn-stone",
    name: "Dawn Stone",
    emoji: "🌅",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It sparkles like eyes at dawn.",
    color: "from-pink-400 to-rose-300",
    bgColor: "bg-pink-400",
    glowColor: "rgba(244, 114, 182, 0.4)",
    borderColor: "border-pink-400/40",
    textColor: "text-pink-400",
    evolutions: [
      { from: "Kirlia ♂", fromId: 281, to: "Gallade", toId: 475 },
      { from: "Snorunt ♀", fromId: 361, to: "Froslass", toId: 478 },
    ],
  },
  {
    id: "shiny-stone",
    name: "Shiny Stone",
    emoji: "✨",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It shines with a dazzling light.",
    color: "from-yellow-200 to-amber-300",
    bgColor: "bg-yellow-200",
    glowColor: "rgba(253, 224, 71, 0.4)",
    borderColor: "border-yellow-300/40",
    textColor: "text-yellow-300",
    evolutions: [
      { from: "Togetic", fromId: 176, to: "Togekiss", toId: 468 },
      { from: "Roselia", fromId: 315, to: "Roserade", toId: 407 },
    ],
  },
];

const STONE_FILTERS = ["All Stones", "Fire", "Water", "Electric", "Grass", "Cosmic", "Special"];

const FILTER_MAPPING = {
  "All Stones": null,
  Fire: ["fire-stone", "sun-stone"],
  Water: ["water-stone", "ice-stone"],
  Electric: ["thunder-stone"],
  Grass: ["leaf-stone"],
  Cosmic: ["moon-stone", "dawn-stone", "shiny-stone"],
  Special: ["dusk-stone"],
};

const FILTER_ICONS = {
  "All Stones": "💎",
  Fire: "🔥",
  Water: "💧",
  Electric: "⚡",
  Grass: "🍃",
  Cosmic: "🌙",
  Special: "🌑",
};


// ─── Pokémon Sprite Helper ────────────────────────────────────────────────────
function getPokemonSprite(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function getPokemonSmallSprite(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}


// ─── Evolution Arrow SVG ──────────────────────────────────────────────────────
function EvolutionArrow({ stoneColor }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10"
        style={{ background: `linear-gradient(135deg, ${stoneColor})` }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}


// ─── Restock Timer Component ──────────────────────────────────────────────────
function RestockTimer({ lastRestockTime }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      if (!lastRestockTime) return;
      const last = (typeof lastRestockTime?.toMillis === 'function') ? lastRestockTime.toMillis() : (lastRestockTime?.seconds * 1000 || Date.now());
      const now = Date.now();
      const diff = Math.max(0, RESTOCK_INTERVAL_MS - (now - last));
      
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      
      setIsUrgent(diff < 60000);
      setTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [lastRestockTime]);

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-950/60 border border-gray-800/50 shadow-inner">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Next Restock:</span>
      <span className={`font-mono text-sm font-black tracking-wider ${isUrgent ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
        {timeLeft || "00:00"}
      </span>
    </div>
  );
}


// ─── Shop Slot Card Component ─────────────────────────────────────────────────
function ShopSlotCard({ stone, currentStock, onBuy }) {
  const [buying, setBuying] = useState(false);
  const isSoldOut = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= 2;

  const handleBuy = async () => {
    if (isSoldOut || buying) return;
    setBuying(true);
    const res = await onBuy(stone.id, stone.price);
    if (!res.success) {
      console.error(res.error);
    }
    setBuying(false);
  };

  const rarityColors = {
    Common: "from-blue-500 to-cyan-500 text-blue-400 border-blue-500/30",
    Rare: "from-purple-500 to-pink-500 text-purple-400 border-purple-500/30",
    Legendary: "from-orange-500 to-amber-600 text-amber-400 border-amber-500/30",
    Mythical: "from-emerald-400 to-teal-600 text-emerald-400 border-emerald-500/30",
  };

  const currentRarityColor = rarityColors[stone.rarity] || rarityColors.Common;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group rounded-2xl border bg-[#0d0a1a]/60 backdrop-blur-md p-5 transition-all overflow-hidden ${isSoldOut ? 'grayscale opacity-50' : 'hover:scale-[1.02] hover:bg-[#120e26]/80'}`}
      style={!isSoldOut ? { borderColor: stone.glowColor } : {}}
    >
      {!isSoldOut && (
        <div className={`absolute -top-10 -right-10 w-24 h-24 blur-3xl rounded-full opacity-20 bg-gradient-to-br ${currentRarityColor}`} />
      )}

      <div className={`inline-block mb-3 rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${currentRarityColor.split(' ').slice(2).join(' ')}`}>
        {stone.rarity}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className={`relative flex h-16 w-16 items-center justify-center rounded-xl bg-gray-950/80 border border-gray-800 shadow-inner`}>
           <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{stone.emoji}</span>
           {isSoldOut && (
             <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center rotate-[-15deg]">
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">SOLD OUT</span>
             </div>
           )}
        </div>
        <div>
           <h3 className="text-sm font-black text-white tracking-tight uppercase line-clamp-1">{stone.name}</h3>
           <div className="flex items-center gap-1.5 mt-1">
              <span className="text-amber-400 text-xs">🪙</span>
              <span className="text-sm font-black text-white">{stone.price}</span>
           </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-end mb-1">
           <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Stock</span>
           <span className={`text-[10px] font-black ${isSoldOut ? 'text-red-500' : isLowStock ? 'text-amber-400 animate-pulse' : 'text-gray-300'}`}>
             {currentStock} / {stone.maxStock}
           </span>
        </div>
        <div className="h-1.5 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-800/50">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${(currentStock / stone.maxStock) * 100}%` }}
             className={`h-full bg-gradient-to-r ${currentRarityColor}`}
           />
        </div>
      </div>

      <button
        onClick={handleBuy}
        disabled={isSoldOut || buying}
        className={`w-full rounded-xl py-2.5 text-xs font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden ${
          isSoldOut 
            ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-800' 
            : 'bg-white text-black hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95'
        }`}
      >
        {buying ? "Purchasing..." : isSoldOut ? "OUT OF STOCK" : "Buy Stone"}
      </button>
    </motion.div>
  );
}


function StoneShop({ shop, onBuy }) {
  if (!shop || !shop.stock) return (
    <div className="py-24 flex flex-col items-center justify-center">
       <div className="h-10 w-10 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin mb-4" />
       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">Loading Stone Shop...</p>
    </div>
  );

  // Merge metadata with live stock data
  const allStones = EVOLUTION_STONES.map(uiData => {
    const meta = STONE_METADATA[uiData.id];
    return {
      ...uiData,
      rarity: meta.rarity,
      price: meta.price,
      maxStock: meta.stock,
      currentStock: shop.stock[uiData.id] || 0
    };
  });

  // Sort by rarity: Common -> Rare -> Legendary -> Mythical
  const rarityOrder = { Common: 1, Rare: 2, Legendary: 3, Mythical: 4 };
  const sortedStones = [...allStones].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/40 to-gray-950/40 border border-purple-500/20 shadow-2xl backdrop-blur-xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
         
          <div className="relative z-10">
             <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
               Purchase Your <span className="text-purple-400">Stone</span>
             </h2>
          </div>
         <div className="relative z-10">
            <RestockTimer lastRestockTime={shop.lastRestockTime} />
         </div>
         
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-12">
        {sortedStones.map((stone) => (
          <ShopSlotCard key={stone.id} stone={stone} currentStock={stone.currentStock} onBuy={onBuy} />
        ))}
      </div>

      <div className="p-8 rounded-3xl border border-gray-800 bg-gray-950/40 backdrop-blur-sm">
         <div className="flex flex-col md:flex-row items-center justify-center gap-10 opacity-60">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 whitespace-nowrap">Restock Chances</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {[
                { label: "Common", chance: "60%", color: "bg-blue-400" },
                { label: "Rare", chance: "25%", color: "bg-purple-400" },
                { label: "Legendary", chance: "12%", color: "bg-orange-400" },
                { label: "Mythical", chance: "3%", color: "bg-emerald-400" },
              ].map((r) => (
                 <div key={r.label} className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${r.color} shadow-[0_0_5px_currentColor]`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{r.label} {r.chance}</span>
                 </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
}


// ─── Evolution Chain Row ──────────────────────────────────────────────────────
function EvolutionChainRow({ evolution, stone, delay = 0, isAvailable = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`group flex items-center gap-2 rounded-xl border border-gray-800/50 bg-gray-900/30 p-3 transition-all hover:border-gray-700 hover:bg-gray-800/30 ${!isAvailable ? 'grayscale-[0.8] opacity-60' : ''}`}
    >
      {/* FROM Pokémon */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="h-12 w-12 rounded-lg bg-gray-800/80 border border-gray-700/50 overflow-hidden flex items-center justify-center">
            <img
              src={getPokemonSmallSprite(evolution.fromId)}
              alt={evolution.from}
              className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white capitalize truncate">{evolution.from}</p>
          <p className="text-[10px] text-gray-500 font-mono">#{String(evolution.fromId).padStart(3, "0")}</p>
        </div>
      </div>

      {/* Arrow with Stone */}
      <EvolutionArrow stoneColor={stone.glowColor} />

      {/* TO Pokémon */}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <div className="min-w-0 text-right">
          <p className="text-xs font-bold text-white capitalize truncate">{evolution.to}</p>
          <p className="text-[10px] text-gray-500 font-mono">#{String(evolution.toId).padStart(3, "0")}</p>
        </div>
        <div className="relative flex-shrink-0">
          <div className="h-12 w-12 rounded-lg bg-gray-800/80 border border-gray-700/50 overflow-hidden flex items-center justify-center">
            <img
              src={getPokemonSmallSprite(evolution.toId)}
              alt={evolution.to}
              className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          {/* Glow ring on hover */}
          <div
            className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md"
            style={{ background: stone.glowColor }}
          />
        </div>
      </div>
    </motion.div>
  );
}


// ─── Stone Detail Modal ───────────────────────────────────────────────────────
function StoneDetailModal({ stone, onClose, inventory, stoneCount, evolvePokemon }) {
  const [evolvingId, setEvolvingId] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!stone) return null;

  const handleEvolve = async (evo) => {
    if (evolvingId) return;
    
    // Find the base pokemon in inventory
    const baseCard = inventory.find(c => c.name.toLowerCase() === evo.from.toLowerCase() || c.pokemonId === evo.fromId);
    if (!baseCard) return;

    setEvolvingId(evo.fromId);
    const res = await evolvePokemon(stone.id, baseCard.docId, evo.toId);
    
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEvolvingId(null);
        // Maybe close modal or keep it open?
      }, 3000);
    } else {
      setEvolvingId(null);
      alert(res.error);
    }
  };

  // Pick a representative "to" pokemon for the hero image
  const heroPokemonId = stone.evolutions[0]?.toId || 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", bounce: 0.2 }}
        className={`relative w-full max-w-2xl rounded-2xl border ${stone.borderColor} bg-[#0a0615]/95 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: `0 0 80px ${stone.glowColor}` }}
      >
        {/* Hero Header */}
        <div className={`relative h-48 bg-gradient-to-br ${stone.color} overflow-hidden`}>
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/20"
                style={{
                  width: Math.random() * 6 + 2,
                  height: Math.random() * 6 + 2,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Stone icon & name */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center">
            <motion.span
              className="text-6xl mb-2"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {stone.emoji}
            </motion.span>
            <h2 className="text-3xl font-black text-white tracking-tight">{stone.name}</h2>
            <p className="mt-1 text-sm text-white/70 font-medium">
              {stone.evolutions.length} Evolution{stone.evolutions.length > 1 ? "s" : ""} Available
            </p>
          </div>

          {/* Hero pokémon silhouettes */}
          <img
            src={getPokemonSprite(heroPokemonId)}
            alt=""
            className="absolute -right-8 -bottom-4 h-44 opacity-15"
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/50 transition-all text-lg"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="mb-6 text-sm text-gray-400 leading-relaxed">
            {stone.description}
          </p>

          {/* Section Header */}
          <div className="mb-4 flex items-center gap-2">
            <div className={`h-1 w-6 rounded-full bg-gradient-to-r ${stone.color}`} />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Possible Evolutions
            </h3>
            <div className={`h-1 flex-1 rounded-full bg-gradient-to-r ${stone.color} opacity-20`} />
          </div>

          {/* Evolution chains with full-size sprites */}
          <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {stone.evolutions.map((evolution, idx) => {
              const hasBase = inventory.some(c => c.name.toLowerCase() === evolution.from.toLowerCase() || c.pokemonId === evolution.fromId);
              const canEvolve = hasBase && stoneCount > 0;

              return (
                <motion.div
                  key={`${evolution.fromId}-${evolution.toId}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`group relative flex items-center rounded-xl border ${stone.borderColor} bg-gray-900/40 p-4 transition-all hover:bg-gray-800/40 ${!hasBase ? 'opacity-50' : ''}`}
                >
                  {/* FROM */}
                  <div className="flex flex-1 items-center gap-3">
                    <div className="h-20 w-20 rounded-xl bg-gray-800/80 border border-gray-700/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img
                        src={getPokemonSprite(evolution.fromId)}
                        alt={evolution.from}
                        className="h-16 w-16 object-contain transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white capitalize">{evolution.from}</p>
                      <p className="text-xs text-gray-500 font-mono">#{String(evolution.fromId).padStart(3, "0")}</p>
                      {!hasBase && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Not in Inventory</p>}
                    </div>
                  </div>

                  {/* Stone + Arrow */}
                  <div className="flex flex-col items-center gap-1 px-4 flex-shrink-0">
                    <motion.div
                      className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${stone.color} shadow-lg`}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ boxShadow: `0 0 20px ${stone.glowColor}` }}
                    >
                      <span className="text-lg">{stone.emoji}</span>
                    </motion.div>
                    <div className="flex items-center gap-1">
                      <div className={`h-[2px] w-4 bg-gradient-to-r ${stone.color} opacity-50`} />
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={stone.textColor}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">
                      {stone.name}
                    </span>
                  </div>

                  {/* TO */}
                  <div className="flex flex-1 items-center gap-3 justify-end relative">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white capitalize">{evolution.to}</p>
                      <p className="text-xs text-gray-500 font-mono">#{String(evolution.toId).padStart(3, "0")}</p>
                      {canEvolve && (
                        <button
                          onClick={() => handleEvolve(evolution)}
                          disabled={evolvingId !== null}
                          className={`mt-2 rounded-lg ${stone.bgColor} px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50`}
                        >
                          {evolvingId === evolution.fromId ? "Evolving..." : "Evolve"}
                        </button>
                      )}
                    </div>
                    <div className="relative h-20 w-20 rounded-xl bg-gray-800/80 border border-gray-700/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img
                        src={getPokemonSprite(evolution.toId)}
                        alt={evolution.to}
                        className="h-16 w-16 object-contain transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      {/* Glow on hover */}
                      <div
                        className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-lg"
                        style={{ background: stone.glowColor }}
                      />
                    </div>
                  </div>
                  
                  {/* Success Overlay */}
                  <AnimatePresence>
                    {success && evolvingId === evolution.fromId && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-emerald-500/90 backdrop-blur-sm"
                      >
                         <div className="text-center">
                            <span className="text-2xl mb-1 block">✨</span>
                            <p className="text-xs font-black uppercase text-white">Evolved!</p>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Stone Status */}
          <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-900/60 p-4 border border-gray-800">
             <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Your Resources</p>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-lg">{stone.emoji}</span>
                   <span className="text-lg font-black text-white">{stoneCount} {stone.name}s</span>
                </div>
             </div>
             {stoneCount === 0 && (
               <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-red-500">Stone Required</p>
                  <p className="text-[9px] text-gray-600 max-w-[120px]">Obtain more stones from packs or events.</p>
               </div>
             )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


// ─── Stone Card ───────────────────────────────────────────────────────────────
function StoneCard({ stone, onClick, index, stoneCount, inventory }) {
  const [isHovered, setIsHovered] = useState(false);
  const evolutionAvailable = stone.evolutions.some(evo => 
    inventory.some(c => c.name.toLowerCase() === evo.from.toLowerCase() || c.pokemonId === evo.fromId)
  ) && stoneCount > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", bounce: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border ${stone.borderColor} bg-[#0d0a1a]/60 backdrop-blur-md transition-shadow duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={isHovered ? { boxShadow: `0 0 30px ${stone.glowColor}` } : {}}
    >
      {/* Top gradient band */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${stone.color}`} />

      {/* Stone Header */}
      <div className="relative p-5 pb-3">
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 1,
                height: Math.random() * 4 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: stone.glowColor,
              }}
              animate={isHovered ? {
                y: [0, -20, 0],
                opacity: [0, 0.8, 0],
              } : {}}
              transition={{
                duration: 1.5 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 1.5,
              }}
            />
          ))}
        </div>

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stone.color} shadow-lg`}
              animate={isHovered ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.6 }}
              style={isHovered ? { boxShadow: `0 0 25px ${stone.glowColor}` } : {}}
            >
              <span className="text-2xl">{stone.emoji}</span>
            </motion.div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">{stone.name}</h3>
              <div className="flex items-center gap-2">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${stone.textColor}`}>
                  {stone.evolutions.length} Evolution{stone.evolutions.length > 1 ? "s" : ""}
                </p>
                <div className="h-1 w-1 rounded-full bg-gray-700" />
                <p className="text-[10px] font-black text-amber-400">
                  {stoneCount} Owned
                </p>
              </div>
            </div>
          </div>
          {evolutionAvailable && (
             <div className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 animate-pulse">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Ready</span>
             </div>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-500 leading-relaxed line-clamp-2">
          {stone.description}
        </p>
      </div>

      {/* Evolution Preview */}
      <div className="px-5 pb-4 space-y-2">
        {stone.evolutions.slice(0, 2).map((evo, idx) => (
          <EvolutionChainRow
            key={`${evo.fromId}-${evo.toId}`}
            evolution={evo}
            stone={stone}
            delay={idx * 0.1}
            isAvailable={inventory.some(c => c.name.toLowerCase() === evo.from.toLowerCase() || c.pokemonId === evo.fromId)}
          />
        ))}

        {stone.evolutions.length > 2 && (
          <div className="text-center pt-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${stone.textColor}`}>
              +{stone.evolutions.length - 2} more evolution{stone.evolutions.length - 2 > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Bottom action hint */}
      <div className={`flex items-center justify-center gap-2 border-t border-gray-800/50 bg-gray-900/30 px-4 py-3 transition-all ${isHovered ? "bg-gray-800/50" : ""}`}>
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isHovered ? stone.textColor : "text-gray-600"} transition-colors`}>
          View Full Recipe
        </span>
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`${isHovered ? stone.textColor : "text-gray-600"} transition-colors`}
          animate={isHovered ? { x: [0, 4, 0] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </motion.svg>
      </div>
    </motion.div>
  );
}


// ─── Main Recipes Component ───────────────────────────────────────────────────
export default function Recipes() {
  const { profile, inventory, evolvePokemon, shop, purchaseStone } = useUserData();
  const [activeTab, setActiveTab] = useState("shop"); // 'shop' | 'lab'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Stones");
  const [selectedStone, setSelectedStone] = useState(null);

  const getStoneCount = (id) => profile?.stones?.[id] || 0;
  const userStoneTotal = Object.values(profile?.stones || {}).reduce((a, b) => a + b, 0);

  const filteredStones = useMemo(() => {
    let stones = [...EVOLUTION_STONES];

    // Filter by category
    const filterIds = FILTER_MAPPING[activeFilter];
    if (filterIds) {
      stones = stones.filter((s) => filterIds.includes(s.id));
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      stones = stones.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.evolutions.some(
            (e) =>
              e.from.toLowerCase().includes(q) ||
              e.to.toLowerCase().includes(q)
          )
      );
    }

    return stones;
  }, [activeFilter, searchQuery]);

  const totalEvolutions = EVOLUTION_STONES.reduce(
    (acc, s) => acc + s.evolutions.length,
    0
  );

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#070412]">

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover z-0"
        src="/bg.mp4"
      />
      <div className="absolute inset-0 bg-black/60 z-[1]" />

      {/* ═══ TOP BAR ═══ */}
      <div className="relative z-[2] flex items-center justify-between border-b border-gray-800/50 bg-[#0a0716]/80 px-6 py-3 backdrop-blur-md">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-lg shadow-[0_0_15px_rgba(147,51,234,0.4)]">
            ⚗️
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">
              Evolution<span className="text-purple-400">Lab</span>
            </h1>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gray-500">
              Stone Recipes
            </p>
          </div>
        </div>
        </div>

        {/* Header Tabs & Shop Meta Row */}
        <div className="relative z-[2] mt-6 px-6 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 p-1.5 rounded-3xl bg-gray-950/40 border border-gray-800/40 backdrop-blur-xl">
             <div className="flex bg-gray-950/60 p-1.5 rounded-[1.25rem] border border-gray-800/40 shadow-inner">
                <button
                  onClick={() => setActiveTab("shop")}
                  className={`relative flex items-center gap-3 rounded-[0.9rem] px-8 py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-all duration-500 ${
                    activeTab === "shop"
                      ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-[0_10px_25px_-5px_rgba(245,158,11,0.5)] scale-[1.02]"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <span className={`${activeTab === "shop" ? 'scale-125' : 'grayscale'} transition-all`}>💎</span>
                  Market
                  {Object.entries(shop?.stock || {}).some(([id, stock]) => stock > 0 && STONE_METADATA[id]?.rarity === 'Mythical') && (
                    <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-gray-950"></span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("lab")}
                  className={`flex items-center gap-3 rounded-[0.9rem] px-8 py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-all duration-500 ${
                    activeTab === "lab"
                      ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_10px_25px_-5px_rgba(124,58,237,0.5)] scale-[1.02]"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <span className={`${activeTab === "lab" ? 'scale-125' : 'grayscale'} transition-all`}>🔬</span>
                  Laboratory
                </button>
             </div>

             <div className="flex items-center gap-8 px-6 lg:border-l lg:border-gray-800/50">
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 opacity-60 mb-1">Vault Credits</p>
                   <div className="flex items-center gap-2 justify-end">
                      <span className="text-lg">🪙</span>
                      <span className="text-xl font-black text-white tracking-tight leading-none">{profile?.credits?.toLocaleString() || 0}</span>
                   </div>
                </div>
                
                <div className="text-right border-l border-gray-800/50 pl-8">
                   <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 opacity-60 mb-1">Stone Collection</p>
                   <div className="flex items-center gap-2 justify-end">
                      <span className="text-lg">📦</span>
                      <span className="text-xl font-black text-amber-500 tracking-tight leading-none">{userStoneTotal}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* ═══ SCROLLABLE CONTENT ═══ */}
        <div className="relative z-[2] flex-1 overflow-y-auto overflow-x-hidden px-6 pb-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "shop" ? (
              <motion.div
                key="shop-tab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pt-6"
              >
                <StoneShop shop={shop} onBuy={purchaseStone} />
              </motion.div>
            ) : (
              <motion.div
                key="lab-tab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pt-6"
              >
                {/* ═══ HERO SECTION ═══ */}
                <div className="relative mb-8 overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-[#0a0615]/60 via-[#120826]/60 to-[#0a0615]/60 backdrop-blur-md">
                  <div className="h-1 w-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />
                  <div className="relative px-8 py-10 md:py-14">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="absolute -top-20 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
                      <div className="absolute -bottom-20 right-1/4 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 tracking-tight mb-2">
                        Evolution Stone Recipes
                      </h2>
                      <p className="text-sm text-gray-400 max-w-lg">
                        Use evolution stones to transform your Pokémon into their more powerful forms.
                        Each stone unlocks <strong className="text-white">unique evolutions</strong> for specific species.
                      </p>
                      <div className="flex gap-3 mt-5">
                        <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-300">
                          {EVOLUTION_STONES.length} Stones
                        </span>
                        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-300">
                          {totalEvolutions} Evolutions
                        </span>
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300">
                          Gen 1–4
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ═══ BROWSE SECTION ═══ */}
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
                        Browse Stones
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Showing <span className="font-bold text-blue-400">{filteredStones.length}</span> stones
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search stones, Pokémon..."
                          className="w-48 md:w-56 rounded-lg border border-gray-700/50 bg-gray-900/60 py-2 pl-9 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500 focus:w-64"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {STONE_FILTERS.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`flex items-center justify-center rounded-full px-6 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${activeFilter === filter
                          ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                          : "border border-gray-700/50 bg-gray-900/40 text-gray-400 hover:border-gray-600 hover:text-white"
                          }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ═══ STONE GRID ═══ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                  <AnimatePresence mode="popLayout">
                    {filteredStones.map((stone, index) => (
                      <StoneCard
                        key={stone.id}
                        stone={stone}
                        index={index}
                        stoneCount={getStoneCount(stone.id)}
                        inventory={inventory}
                        onClick={() => setSelectedStone(stone)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Empty State */}
                {filteredStones.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="mb-4 text-5xl">🔍</span>
                    <h3 className="mb-2 text-xl font-bold text-gray-400">No stones found</h3>
                    <p className="text-sm text-gray-600">Try adjusting your search or filters</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ MODAL ═══ */}
        <AnimatePresence>
          {selectedStone && (
            <StoneDetailModal 
              stone={selectedStone} 
              stoneCount={getStoneCount(selectedStone.id)}
              inventory={inventory}
              evolvePokemon={evolvePokemon}
              onClose={() => setSelectedStone(null)} 
            />
          )}
        </AnimatePresence>
      </div>
  );
}
