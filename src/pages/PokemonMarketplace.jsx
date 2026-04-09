import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPE_GRADIENTS, TYPE_COLORS, TYPE_GLOWS } from "../utils/typeColors";

// ─── Constants ─────────────────────────────────────────────────────────────────
const POKEAPI_BASE = "https://pokeapi.co/api/v2/pokemon";
const POKEAPI_SPECIES_BASE = "https://pokeapi.co/api/v2/pokemon-species";

const MARKETPLACE_IDS = [
  6, 9, 25, 38, 59, 65, 94, 130, 131, 143, 149, 150,
  3, 34, 68, 76, 78, 103, 112, 121, 135, 136, 137, 139,
];

const TYPE_FILTER_ICONS = {
  "All Types": "🎴", fire: "🔥", water: "💧", grass: "🌿", electric: "⚡",
  psychic: "🔮", ice: "❄️", dragon: "🐉", dark: "🌑", fairy: "✨",
  fighting: "🥊", poison: "☠️", ground: "🏜️", flying: "🕊️", bug: "🐛",
  rock: "🪨", ghost: "👻", steel: "⚙️", normal: "⭐",
};

// Exact same rarity styles as PokemonCard.jsx on home page
const RARITY_STYLES = {
  Common:    { border: "border-gray-400/50",   badge: "bg-gray-500/80 border-gray-400",   glow: "" },
  Uncommon:  { border: "border-green-500/50",  badge: "bg-green-500/80 border-green-400",  glow: "shadow-green-500/20 shadow-lg" },
  Rare:      { border: "border-blue-500/60",   badge: "bg-blue-600/90 border-blue-400",    glow: "shadow-blue-500/40 shadow-xl" },
  Epic:      { border: "border-purple-500",    badge: "bg-purple-600/90 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]", glow: "shadow-purple-500/60 shadow-2xl" },
  Legendary: { border: "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]", badge: "bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 border-yellow-200 shadow-lg", glow: "shadow-yellow-400/80 shadow-[0_0_40px_rgba(250,204,21,0.4)]" },
  Mythical:  { border: "border-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.4)]", badge: "bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white border-pink-200 shadow-lg", glow: "shadow-pink-400/90 shadow-[0_0_50px_rgba(244,114,182,0.5)]" },
  Ultra:     { border: "border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.5)]", badge: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-200 shadow-lg", glow: "shadow-cyan-400/90 shadow-[0_0_60px_rgba(34,211,238,0.6)]" },
};

const SORT_OPTIONS = ["Recent", "Price: Low", "Price: High", "Power", "Rarity"];

const SELLER_NAMES = [
  "AshKetchum", "MistyWater", "BrockRock", "LanceElite", "CynthiaGOAT",
  "RedChamp", "ProfOak", "GaryOak", "StevenStone", "DianthaStar",
  "N_Harmonia", "LeonUnbeatable", "IrisChamp", "WallaceMaster", "SabrinaP",
  "BlaineFire", "ErikaGrass", "SurgeThunder", "LoreleiIce", "BrunoFight",
  "AgathaGhost", "KogaPoison", "JanetDragon", "MortySpirit",
];


// ─── SVG Type Icon (Exact copy from PokemonCard.jsx) ───────────────────────────
const TypeIcon = ({ type, className = "w-4 h-4" }) => {
  const icons = {
    fire: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.292 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
    water: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />,
    grass: <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.5 0 10-2 5.5-5 8-8 8z" />,
    electric: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    psychic: <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />,
    dragon: <path d="M12 2L4 5v11c0 5.25 7 9 8 9s8-3.75 8-9V5l-8-3zm0 4.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5zM12 18c-2.5 0-4.5-2-4.5-4.5 0-1 .36-1.92.96-2.65L12 11l3.54-.15c.6.73.96 1.65.96 2.65 0 2.5-2 4.5-4.5 4.5z" />,
    dark: <path d="M12 3a9 9 0 0 0 9 9 9 9 0 1 1-9-9z" />,
    fairy: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
    ice: <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07l14.14-14.14" />,
    fighting: <path d="M18 10V4h-6v6H6v6h6v6h6v-6h6v-6h-6z" />,
    poison: <circle cx="12" cy="12" r="10" />,
    ground: <path d="M2 12h20l-10-8-10 8zM22 12l-10 8-10-8h20z" />,
    flying: <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />,
    bug: <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm-9 5c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9zm11.5 0c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5z" />,
    rock: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
    ghost: <path d="M12 2c-4.97 0-9 4.03-9 9v11l3-1.5 3 1.5 3-1.5 3 1.5 3-1.5 3 1.5V11c0-4.97-4.03-9-9-9zM9 10c.83 0 1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5S8.17 10 9 10zm6 0c.83 0 1.5.67 1.5 1.5S15.83 13 15 13s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z" />,
    steel: <path d="M12 2L4 5v11l8 3 8-3V5l-8-3z" />,
    normal: <circle cx="12" cy="12" r="8" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      {icons[type] || icons.normal}
    </svg>
  );
};


// ─── Attack Row (Exact copy from AttackRow.jsx) ────────────────────────────────
function AttackRow({ name, power }) {
  return (
    <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/5 hover:bg-white/20 transition-colors group/row">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 flex items-center justify-center text-yellow-500 group-hover/row:scale-110 transition-transform drop-shadow-[0_0_5px_rgba(234,179,8,0.3)]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 2l2.4 7.6 7.6 2.4-7.6 2.4-2.4 7.6-2.4-7.6-7.6-2.4 7.6-2.4z" />
          </svg>
        </div>
        <span className="text-white font-bold text-sm capitalize truncate tracking-wide">
          {name}
        </span>
      </div>
      <div className="flex items-center bg-black/40 rounded px-2 py-0.5 border border-white/10 shadow-inner">
        <span className="text-yellow-400 font-black text-xs">{power}</span>
        <span className="text-white/40 text-[8px] ml-1 font-bold">PWR</span>
      </div>
    </div>
  );
}


// ─── Helpers ───────────────────────────────────────────────────────────────────
function getRarity(pokemon) {
  if (pokemon.isMythical) return "Mythical";
  if (pokemon.isLegendary) return "Legendary";
  const bst = pokemon.stats.reduce((a, s) => a + s.value, 0);
  if (bst >= 600) return "Ultra";
  if (bst > 520) return "Epic";
  if (bst > 450) return "Rare";
  if (bst > 350) return "Uncommon";
  return "Common";
}

function getPriceFromBST(bst, rarity) {
  const base = Math.round(bst * 2.5);
  const mult = { Mythical: 8, Legendary: 6, Ultra: 4, Epic: 3, Rare: 2, Uncommon: 1.2, Common: 1 };
  return Math.round(base * (mult[rarity] || 1));
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatMoveName(name) {
  return name.split("-").map(capitalize).join(" ");
}


// ─── Data Fetching ─────────────────────────────────────────────────────────────
async function fetchPokemonForMarketplace(id) {
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${POKEAPI_BASE}/${id}`),
    fetch(`${POKEAPI_SPECIES_BASE}/${id}`),
  ]);
  if (!pokemonRes.ok || !speciesRes.ok) throw new Error(`Failed to fetch #${id}`);
  const [pokemon, species] = await Promise.all([pokemonRes.json(), speciesRes.json()]);

  const genusEntry = species.genera.find((g) => g.language.name === "en");
  const flavorEntry = species.flavor_text_entries.find((f) => f.language.name === "en");
  const stats = pokemon.stats.map((s) => ({ name: s.stat.name, value: s.base_stat }));
  const bst = stats.reduce((a, s) => a + s.value, 0);
  const types = pokemon.types.map((t) => t.type.name);
  const rarity = getRarity({ isMythical: species.is_mythical, isLegendary: species.is_legendary, stats });

  const allMoves = pokemon.moves.map((m) => m.move.name);
  const shuffled = [...allMoves].sort(() => 0.5 - Math.random());
  const selectedMoves = shuffled.slice(0, 2);
  const sellerIdx = id % SELLER_NAMES.length;

  return {
    id: pokemon.id,
    name: capitalize(pokemon.name),
    image: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
    types,
    rarity,
    power: bst,
    price: getPriceFromBST(bst, rarity),
    likes: Math.floor(Math.random() * 400) + 20,
    seller: SELLER_NAMES[sellerIdx],
    sellerVerified: Math.random() > 0.35,
    description: flavorEntry ? flavorEntry.flavor_text.replace(/[\n\f\r]/g, " ") : "A mysterious Pokemon of incredible power.",
    attacks: selectedMoves.map((m) => ({
      name: formatMoveName(m),
      power: Math.floor(Math.random() * 80) + 30,
    })),
    genus: genusEntry ? genusEntry.genus : "Unknown Pokémon",
    featured: false,
  };
}


// ─── Skeleton Loader (matches the card shape) ──────────────────────────────────
function CardSkeleton() {
  return (
    <div className="w-64 h-[440px] rounded-2xl border-4 border-gray-700/30 bg-gray-800/20 animate-pulse mx-auto">
      <div className="flex flex-col h-full p-3 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-24 rounded bg-gray-700/40" />
          <div className="h-4 w-14 rounded-full bg-gray-700/40" />
        </div>
        <div className="flex-1 rounded-xl bg-gray-700/20 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-gray-700/30" />
        </div>
        <div className="flex gap-2 justify-center">
          <div className="h-5 w-14 rounded bg-gray-700/30" />
          <div className="h-5 w-14 rounded bg-gray-700/30" />
        </div>
        <div className="space-y-1.5">
          <div className="h-8 rounded-lg bg-gray-700/20" />
          <div className="h-8 rounded-lg bg-gray-700/20" />
        </div>
        <div className="h-3 w-32 mx-auto rounded bg-gray-700/20" />
        <div className="h-10 rounded-lg bg-gray-700/20" />
      </div>
    </div>
  );
}


// ─── Card Detail Modal ─────────────────────────────────────────────────────────
function CardDetailModal({ card, onClose }) {
  if (!card) return null;

  const primaryType = card.types[0] || "normal";
  const gradient = TYPE_GRADIENTS[primaryType] || TYPE_GRADIENTS.normal;
  const rarityStyle = RARITY_STYLES[card.rarity] || RARITY_STYLES.Common;
  const glowColor = TYPE_GLOWS[primaryType] || TYPE_GLOWS.normal;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 40 }}
        transition={{ type: "spring", bounce: 0.2 }}
        className="relative flex w-full max-w-4xl flex-col md:flex-row gap-8 rounded-2xl border border-purple-500/20 bg-[#0a0615]/95 p-6 md:p-8"
        style={{ boxShadow: `0 0 80px ${glowColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 z-10 text-gray-500 hover:text-white text-xl transition-colors">✕</button>

        {/* Left: The full PokemonCard-style card */}
        <div className="flex flex-shrink-0 items-center justify-center">
          <div className={`relative w-64 h-96 rounded-2xl overflow-hidden bg-gradient-to-br ${gradient} border-4 ${rarityStyle.border} backdrop-blur-md shadow-xl ${rarityStyle.glow}`}>
            <div className="flex flex-col h-full p-3 bg-black/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 truncate">
                  <div className={`${TYPE_COLORS[primaryType]} p-1 rounded-full text-white shadow-sm ring-1 ring-white/30`}>
                    <TypeIcon type={primaryType} className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-white font-black text-xl capitalize tracking-tight drop-shadow-md truncate">{card.name}</h3>
                </div>
                <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full text-white border ${rarityStyle.badge}`}>{card.rarity}</span>
              </div>

              {/* Image area */}
              <div className="relative bg-black/20 rounded-xl flex items-center justify-center p-2 flex-shrink-0 h-44 border border-white/10 shadow-inner overflow-hidden">
                <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '12px 12px' }} />
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)` }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                  <svg viewBox="0 0 100 100" className="w-40 h-40">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="4" />
                    <line x1="2" y1="50" x2="98" y2="50" stroke="white" strokeWidth="4" />
                    <circle cx="50" cy="50" r="14" fill="none" stroke="white" strokeWidth="4" />
                  </svg>
                </div>
                <img src={card.image} alt={card.name} className="relative z-10 h-36 w-36 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" />
              </div>

              {/* Types */}
              <div className="flex gap-2 mt-2 justify-center">
                {card.types.map((type) => (
                  <div key={type} className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${TYPE_COLORS[type] || "bg-gray-400"} text-white shadow-sm border border-white/20`}>
                    <TypeIcon type={type} className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">{type}</span>
                  </div>
                ))}
              </div>

              {/* Attacks */}
              <div className="mt-auto space-y-1.5">
                {card.attacks.map((atk, i) => (
                  <AttackRow key={i} name={atk.name} power={atk.power} />
                ))}
              </div>

              {/* Footer */}
              <div className="mt-3 flex flex-col items-center gap-0.5 pointer-events-none">
                <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.1em]">
                  #{String(card.id).padStart(3, "0")} · {card.genus}
                </p>
                <p className="text-white/30 text-[7px] font-bold uppercase tracking-[0.2em]">
                  GEN 1 · {card.types.join(" / ")} TYPE
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              ── #{String(card.id).padStart(3, "0")} ──
            </p>
            <h2 className="mb-1 text-3xl font-black text-white tracking-tight">{card.name}</h2>
            <p className="mb-3 text-sm italic text-gray-500">{card.genus}</p>
            <p className="mb-5 text-sm leading-relaxed text-gray-400">{card.description}</p>

            {/* Types */}
            <div className="mb-4 flex gap-2">
              {card.types.map((t) => (
                <div key={t} className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${TYPE_COLORS[t] || "bg-gray-400"} text-white shadow-md border border-white/20`}>
                  <TypeIcon type={t} className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold uppercase">{t}</span>
                </div>
              ))}
            </div>

            {/* Seller */}
            <div className="mb-5 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${TYPE_GRADIENTS[primaryType]} text-sm font-bold text-white`}>
                {card.seller.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Listed By</p>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  {card.seller}
                  {card.sellerVerified && <span className="text-green-400 text-xs">☑</span>}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-5 flex gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Base Stat Total</p>
                <p className="text-lg font-bold text-yellow-400">⚡ {card.power.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Rarity</p>
                <p className="text-lg font-bold text-purple-400">{card.rarity}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Likes</p>
                <p className="text-lg font-bold text-red-400">❤ {card.likes}</p>
              </div>
            </div>

            {/* Moves */}
            <div className="mb-5 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Attacks</p>
              {card.attacks.map((atk, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-800/50 border border-gray-700/40 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center text-yellow-500">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12 2l2.4 7.6 7.6 2.4-7.6 2.4-2.4 7.6-2.4-7.6-7.6-2.4 7.6-2.4z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-white capitalize">{atk.name}</span>
                  </div>
                  <div className="flex items-center bg-black/40 rounded px-2 py-0.5 border border-white/10">
                    <span className="text-yellow-400 font-black text-xs">{atk.power}</span>
                    <span className="text-white/40 text-[8px] ml-1 font-bold">PWR</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price & Buy */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/30 p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <span className="text-3xl font-black text-amber-400">{card.price.toLocaleString()}</span>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Credits</span>
            </div>
            <button className="ml-auto rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3 font-bold uppercase tracking-wider text-white transition-all hover:from-amber-400 hover:to-orange-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.97]">
              Buy Now
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


// ─── Marketplace Card (Same visual as PokemonCard on home page + price bar) ────
function MarketplaceCard({ card, onClick }) {
  const primaryType = card.types[0] || "normal";
  const gradient = TYPE_GRADIENTS[primaryType] || TYPE_GRADIENTS.normal;
  const rarityStyle = RARITY_STYLES[card.rarity] || RARITY_STYLES.Common;
  const glowColor = TYPE_GLOWS[primaryType] || TYPE_GLOWS.normal;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", bounce: 0.3 }}
      className="flex flex-col items-center cursor-pointer"
      onClick={onClick}
    >
      {/* The Card — exact home page design */}
      <div className="group perspective-[1000px]">
        <div className={`relative w-64 h-96 transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]`}>
          <div
            className={`
              absolute inset-0 rounded-2xl overflow-hidden
              bg-gradient-to-br ${gradient}
              border-4 ${rarityStyle.border}
              backdrop-blur-md shadow-xl
              ${rarityStyle.glow}
            `}
          >
            <div className="flex flex-col h-full p-3 bg-black/10">
              {/* Header row */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 truncate">
                  <div className={`${TYPE_COLORS[primaryType]} p-1 rounded-full text-white shadow-sm ring-1 ring-white/30`}>
                    <TypeIcon type={primaryType} className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-white font-black text-xl capitalize tracking-tight drop-shadow-md truncate">
                    {card.name}
                  </h3>
                </div>
                <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full text-white border ${rarityStyle.badge}`}>
                  {card.rarity}
                </span>
              </div>

              {/* Image area */}
              <div className="relative bg-black/20 rounded-xl flex items-center justify-center p-2 flex-shrink-0 h-44 border border-white/10 shadow-inner overflow-hidden">
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-15 pointer-events-none"
                     style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '12px 12px' }} />
                {/* Radial glow */}
                <div className="absolute inset-0 pointer-events-none"
                     style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)` }} />
                {/* Pokeball watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                  <svg viewBox="0 0 100 100" className="w-40 h-40">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="4" />
                    <line x1="2" y1="50" x2="98" y2="50" stroke="white" strokeWidth="4" />
                    <circle cx="50" cy="50" r="14" fill="none" stroke="white" strokeWidth="4" />
                  </svg>
                </div>
                <img
                  src={card.image}
                  alt={card.name}
                  className="relative z-10 h-36 w-36 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]
                             transition-all duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              {/* Types with SVG icons */}
              <div className="flex gap-2 mt-2 justify-center">
                {card.types.map((type) => (
                  <div
                    key={type}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${TYPE_COLORS[type] || "bg-gray-400"} text-white shadow-sm border border-white/20`}
                  >
                    <TypeIcon type={type} className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">{type}</span>
                  </div>
                ))}
              </div>

              {/* Attacks */}
              <div className="mt-auto space-y-1.5">
                {card.attacks.map((atk, i) => (
                  <AttackRow key={i} name={atk.name} power={atk.power} />
                ))}
              </div>

              {/* Footer */}
              <div className="mt-3 flex flex-col items-center gap-0.5 pointer-events-none">
                <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.1em]">
                  #{String(card.id).padStart(3, "0")} · {card.genus}
                </p>
                <p className="text-white/30 text-[7px] font-bold uppercase tracking-[0.2em]">
                  GEN 1 · {card.types.join(" / ")} TYPE
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price bar below the card */}
      <div className="w-64 mt-2 flex items-center justify-between rounded-xl bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🪙</span>
          <span className="text-lg font-black text-amber-400">{card.price.toLocaleString()}</span>
        </div>
        <button
          className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:from-amber-400 hover:to-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95"
          onClick={(e) => { e.stopPropagation(); }}
        >
          Buy
        </button>
      </div>

      {/* Seller tag */}
      <div className="mt-1.5 flex items-center gap-1.5 opacity-60">
        <span className="text-[10px] text-gray-400">{card.seller}</span>
        {card.sellerVerified && <span className="text-green-400 text-[10px]">☑</span>}
      </div>
    </motion.div>
  );
}


// ─── Featured Card Hero ────────────────────────────────────────────────────────
function FeaturedCardHero({ card, onViewDetails }) {
  if (!card) return null;

  const primaryType = card.types[0] || "normal";
  const gradient = TYPE_GRADIENTS[primaryType] || TYPE_GRADIENTS.normal;
  const rarityStyle = RARITY_STYLES[card.rarity] || RARITY_STYLES.Common;
  const glowColor = TYPE_GLOWS[primaryType] || TYPE_GLOWS.normal;

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-[#0a0615] via-[#120826] to-[#0a0615]">
      {/* Rainbow accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />

      <div className="flex flex-col md:flex-row items-center gap-8 p-6 md:p-10">
        {/* The featured card — same PokemonCard style */}
        <motion.div
          whileHover={{ rotate: -2, scale: 1.03 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="relative flex-shrink-0 cursor-pointer"
          onClick={() => onViewDetails(card)}
        >
          <div className={`relative w-60 h-[360px] rounded-2xl overflow-hidden bg-gradient-to-br ${gradient} border-4 ${rarityStyle.border} backdrop-blur-md shadow-xl ${rarityStyle.glow}`}>
            <div className="flex flex-col h-full p-3 bg-black/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 truncate">
                  <div className={`${TYPE_COLORS[primaryType]} p-1 rounded-full text-white shadow-sm ring-1 ring-white/30`}>
                    <TypeIcon type={primaryType} className="w-3 h-3" />
                  </div>
                  <h3 className="text-white font-black text-lg capitalize tracking-tight drop-shadow-md truncate">{card.name}</h3>
                </div>
                <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full text-white border ${rarityStyle.badge}`}>⭐ FEAT</span>
              </div>

              {/* Image */}
              <div className="relative bg-black/20 rounded-xl flex items-center justify-center p-2 flex-shrink-0 h-40 border border-white/10 shadow-inner overflow-hidden">
                <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '12px 12px' }} />
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)` }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                  <svg viewBox="0 0 100 100" className="w-36 h-36">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="4" />
                    <line x1="2" y1="50" x2="98" y2="50" stroke="white" strokeWidth="4" />
                    <circle cx="50" cy="50" r="14" fill="none" stroke="white" strokeWidth="4" />
                  </svg>
                </div>
                <img src={card.image} alt={card.name} className="relative z-10 h-32 w-32 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" />
              </div>

              {/* Types */}
              <div className="flex gap-2 mt-2 justify-center">
                {card.types.map((type) => (
                  <div key={type} className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${TYPE_COLORS[type] || "bg-gray-400"} text-white shadow-sm border border-white/20`}>
                    <TypeIcon type={type} className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">{type}</span>
                  </div>
                ))}
              </div>

              {/* Attacks */}
              <div className="mt-auto space-y-1">
                {card.attacks.map((atk, i) => (
                  <AttackRow key={i} name={atk.name} power={atk.power} />
                ))}
              </div>

              {/* Footer */}
              <div className="mt-2 flex flex-col items-center gap-0.5 pointer-events-none">
                <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.1em]">
                  #{String(card.id).padStart(3, "0")} · {card.genus}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-r from-purple-600/10 via-amber-500/10 to-purple-600/10 blur-2xl" />
        </motion.div>

        {/* Featured Info */}
        <div className="flex-1 text-center md:text-left">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
            ── Featured Listing ──
          </p>
          <h2 className="mb-1 text-3xl md:text-4xl font-black text-white tracking-tight">{card.name}</h2>
          <p className="mb-2 text-sm italic text-gray-500">{card.genus} · #{String(card.id).padStart(3, "0")}</p>
          <p className="mb-5 max-w-md text-sm leading-relaxed text-gray-400">{card.description}</p>

          {/* Types */}
          <div className="mb-4 flex gap-2 justify-center md:justify-start">
            {card.types.map((t) => (
              <div key={t} className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${TYPE_COLORS[t] || "bg-gray-400"} text-white shadow-md border border-white/20`}>
                <TypeIcon type={t} className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase">{t}</span>
              </div>
            ))}
          </div>

          {/* Seller */}
          <div className="mb-5 flex items-center gap-3 justify-center md:justify-start">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-sm font-bold text-white`}>
              {card.seller.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Listed By</p>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                {card.seller}
                {card.sellerVerified && <span className="text-green-400 text-xs">☑</span>}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-5 flex gap-6 justify-center md:justify-start">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Base Stat Total</p>
              <p className="text-lg font-bold text-yellow-400">⚡ {card.power.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Rarity</p>
              <p className="text-lg font-bold text-purple-400">{card.rarity}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Likes</p>
              <p className="text-lg font-bold text-red-400">❤ {card.likes}</p>
            </div>
          </div>

          {/* Price & Buy */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <span className="text-4xl font-black text-amber-400">{card.price.toLocaleString()}</span>
              <span className="text-sm font-medium uppercase tracking-wider text-gray-500">Credits</span>
            </div>
            <button
              onClick={() => onViewDetails(card)}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3 font-bold uppercase tracking-wider text-white transition-all hover:from-amber-400 hover:to-orange-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.97]"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Main Marketplace Component ────────────────────────────────────────────────
export default function PokemonMarketplace() {
  const [pokemonCards, setPokemonCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Types");
  const [sortBy, setSortBy] = useState("Recent");
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadMarketplace() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          MARKETPLACE_IDS.map((id) => fetchPokemonForMarketplace(id).catch(() => null))
        );
        if (!cancelled) {
          const valid = results.filter(Boolean);
          if (valid.length > 0) {
            const maxBst = Math.max(...valid.map((c) => c.power));
            const featuredIdx = valid.findIndex((c) => c.power === maxBst);
            if (featuredIdx !== -1) valid[featuredIdx].featured = true;
          }
          setPokemonCards(valid);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadMarketplace();
    return () => { cancelled = true; };
  }, []);

  const availableTypes = useMemo(() => {
    const typeSet = new Set();
    pokemonCards.forEach((c) => c.types.forEach((t) => typeSet.add(t)));
    return ["All Types", ...Array.from(typeSet).sort()];
  }, [pokemonCards]);

  const featuredCard = useMemo(() => pokemonCards.find((c) => c.featured), [pokemonCards]);

  const filteredCards = useMemo(() => {
    let cards = pokemonCards.filter((c) => !c.featured);
    if (activeFilter !== "All Types") cards = cards.filter((c) => c.types.includes(activeFilter));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter((c) =>
        c.name.toLowerCase().includes(q) || c.seller.toLowerCase().includes(q) ||
        c.types.some((t) => t.includes(q)) || c.genus.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "Price: Low": cards.sort((a, b) => a.price - b.price); break;
      case "Price: High": cards.sort((a, b) => b.price - a.price); break;
      case "Power": cards.sort((a, b) => b.power - a.power); break;
      case "Rarity": {
        const order = { Mythical: 0, Legendary: 1, Ultra: 2, Epic: 3, Rare: 4, Uncommon: 5, Common: 6 };
        cards.sort((a, b) => (order[a.rarity] ?? 9) - (order[b.rarity] ?? 9));
        break;
      }
      default: break;
    }
    return cards;
  }, [pokemonCards, activeFilter, searchQuery, sortBy]);

  const totalListings = pokemonCards.length;
  const userCredits = 12500;
  const userGems = 84;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#070412]">

      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between border-b border-gray-800/50 bg-[#0a0716]/80 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-lg font-black text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]">V</div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">Poke<span className="text-purple-400">Vault</span></h1>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gray-500">Pokémon Marketplace</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">Listings</p>
            <p className="text-sm font-black text-white">{totalListings}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">Credits</p>
            <p className="flex items-center gap-1 text-sm font-black text-amber-400">🪙 {userCredits.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">Gems</p>
            <p className="flex items-center gap-1 text-sm font-black text-blue-400">💎 {userGems}</p>
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white cursor-pointer transition-transform hover:scale-110">ME</div>
      </div>

      <div className="h-0.5 w-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-8 py-6 custom-scrollbar">

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-center">
            <p className="text-red-400 font-semibold">⚠️ Failed to load marketplace</p>
            <p className="text-sm text-red-400/70 mt-1">{error}</p>
          </div>
        )}

        {loading ? (
          <>
            <div className="mb-8 rounded-2xl border border-gray-800/30 bg-[#0a0615]/50 p-10 animate-pulse">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-60 h-[360px] rounded-2xl bg-gray-800/40" />
                <div className="flex-1 space-y-4">
                  <div className="h-3 w-32 rounded bg-gray-800/40" />
                  <div className="h-8 w-64 rounded bg-gray-800/50" />
                  <div className="h-16 w-full max-w-md rounded bg-gray-800/30" />
                  <div className="h-12 w-48 rounded bg-gray-800/40" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8 justify-items-center">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          </>
        ) : (
          <>
            <FeaturedCardHero card={featuredCard} onViewDetails={setSelectedCard} />

            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">Browse Pokémon</h2>
                  <p className="mt-1 text-sm text-gray-500">Showing <span className="font-bold text-blue-400">{filteredCards.length}</span> Pokémon</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Pokémon, types..."
                      className="w-48 md:w-56 rounded-lg border border-gray-700/50 bg-gray-900/60 py-2 pl-9 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500 focus:w-64" />
                  </div>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-gray-700/50 bg-gray-900/60 px-3 py-2 text-sm text-gray-300 outline-none transition-colors focus:border-purple-500">
                    {SORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {availableTypes.map((filter) => (
                  <button key={filter} onClick={() => setActiveFilter(filter)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                      activeFilter === filter
                        ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                        : "border border-gray-700/50 bg-gray-900/40 text-gray-400 hover:border-gray-600 hover:text-white"
                    }`}>
                    <span>{TYPE_FILTER_ICONS[filter] || "⭐"}</span> {filter === "All Types" ? "All Types" : capitalize(filter)}
                  </button>
                ))}
              </div>
            </div>

            {/* ═══ CARD GRID ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8 justify-items-center">
              <AnimatePresence mode="popLayout">
                {filteredCards.map((card) => (
                  <MarketplaceCard key={card.id} card={card} onClick={() => setSelectedCard(card)} />
                ))}
              </AnimatePresence>
            </div>

            {filteredCards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="mb-4 text-5xl">🔍</span>
                <h3 className="mb-2 text-xl font-bold text-gray-400">No Pokémon found</h3>
                <p className="text-sm text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ MODALS ═══ */}
      <AnimatePresence>
        {selectedCard && <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
      </AnimatePresence>
    </div>
  );
}
