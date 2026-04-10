import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Card Data ────────────────────────────────────────────────────────────────
const CARDS_DATA = [
  {
    id: 1,
    name: "Volcaris, The Infernal Rage",
    image: "/cards/fire_dragon.png",
    type: "Fire",
    rarity: "Legendary",
    power: 9800,
    atk: 3200,
    def: 2800,
    price: 4500,
    likes: 289,
    seller: "DragonMaster",
    sellerVerified: true,
    description: "A legendary beast of ancient fire, born from the depths of Mount Ignis. It commands the primal forces of flame.",
    ability: "Infernal Blaze: Deals 500 burn damage each turn to all enemy creatures.",
    level: 8,
    element: "HOLY FIRE",
    featured: false,
  },
  {
    id: 2,
    name: "Crystalis, Ice Phoenix",
    image: "/cards/ice_phoenix.png",
    type: "Ice",
    rarity: "Epic",
    power: 7200,
    atk: 2800,
    def: 2400,
    price: 2800,
    likes: 156,
    seller: "FrostQueen",
    sellerVerified: true,
    description: "A mystical creature of pure frost. Once per turn, you may discard one Ice card to freeze one target opponent.",
    ability: "Frozen Ascension: Freeze targets take double damage.",
    level: 7,
    element: "ICE",
    featured: false,
  },
  {
    id: 3,
    name: "Umbral Nightstalker",
    image: "/cards/shadow_wolf.png",
    type: "Shadow",
    rarity: "Legendary",
    power: 8500,
    atk: 3000,
    def: 2200,
    price: 3900,
    likes: 203,
    seller: "ShadowVeil",
    sellerVerified: false,
    description: "This creature cannot be targeted by Light spells. If a Shadow type is on the field, gain +300 ATK.",
    ability: "Shadow Bite: Deals 700 damage + Additional 200 for each Shadow card in play.",
    level: 7,
    element: "DARK",
    featured: false,
  },
  {
    id: 4,
    name: "Voltaris, The Thunder Serpent",
    image: "/cards/thunder_serpent.png",
    type: "Thunder",
    rarity: "Rare",
    power: 6100,
    atk: 2600,
    def: 1800,
    price: 1200,
    likes: 97,
    seller: "StormChaser",
    sellerVerified: true,
    description: "This ancient serpent is the living embodiment of the primal storm, unleashing cataclysmic volts upon its enemies.",
    ability: "Chain Lightning: Hits up to 3 random targets for 400 damage each.",
    level: 6,
    element: "THUNDER",
    featured: false,
  },
  {
    id: 5,
    name: "Aetherial Celestial Unicorn",
    image: "/cards/celestial_unicorn.png",
    type: "Celestial",
    rarity: "Legendary",
    power: 9800,
    atk: 3200,
    def: 2800,
    price: 4500,
    likes: 289,
    seller: "StarKeeper",
    sellerVerified: true,
    description: "A divine creature from the celestial plane. Its horn channels pure starlight energy.",
    ability: "Divine Shield: Cannot be destroyed by battle or card effects once per turn.",
    level: 8,
    element: "HOLY",
    featured: true,
  },
  {
    id: 6,
    name: "Terravex, Stone Guardian",
    image: "/cards/earth_golem.png",
    type: "Earth",
    rarity: "Uncommon",
    power: 4200,
    atk: 1800,
    def: 3200,
    price: 600,
    likes: 42,
    seller: "RockSolid",
    sellerVerified: false,
    description: "An ancient stone guardian awakened from centuries of slumber. Its body is made of living rock and moss.",
    ability: "Stone Wall: Reduces incoming damage by 50% for this turn.",
    level: 4,
    element: "EARTH",
    featured: false,
  },
  {
    id: 7,
    name: "Leviathan, Deep Abyss",
    image: "/cards/water_leviathan.png",
    type: "Ice",
    rarity: "Epic",
    power: 7800,
    atk: 2900,
    def: 2600,
    price: 3200,
    likes: 178,
    seller: "DeepDiver",
    sellerVerified: true,
    description: "A massive sea serpent from the deepest ocean trenches. Controls the tides and commands whirlpools.",
    ability: "Tidal Surge: All Water-type allies gain +200 ATK this turn.",
    level: 7,
    element: "WATER",
    featured: false,
  },
  {
    id: 8,
    name: "Sylvana, Nature Spirit",
    image: "/cards/nature_spirit.png",
    type: "Earth",
    rarity: "Rare",
    power: 5400,
    atk: 2000,
    def: 2800,
    price: 950,
    likes: 64,
    seller: "ForestSage",
    sellerVerified: true,
    description: "A nature spirit fairy with vines and flowers, guardian of the enchanted forest. Heals allies each turn.",
    ability: "Nature's Blessing: Restore 300 HP to all allies at the end of your turn.",
    level: 5,
    element: "NATURE",
    featured: false,
  },
];

const TYPE_FILTERS = ["All Cards", "Fire", "Ice", "Thunder", "Shadow", "Earth", "Celestial"];

const TYPE_ICONS = {
  "All Cards": "🎴",
  Fire: "🔥",
  Ice: "❄️",
  Thunder: "⚡",
  Shadow: "🌑",
  Earth: "🌿",
  Celestial: "✨",
};

const RARITY_COLORS = {
  Legendary: "from-yellow-500 to-amber-600",
  Epic: "from-purple-500 to-violet-600",
  Rare: "from-blue-500 to-cyan-600",
  Uncommon: "from-green-500 to-emerald-600",
  Common: "from-gray-500 to-slate-600",
};

const RARITY_TEXT_COLORS = {
  Legendary: "text-yellow-400",
  Epic: "text-purple-400",
  Rare: "text-blue-400",
  Uncommon: "text-green-400",
  Common: "text-gray-400",
};

const RARITY_BORDER_COLORS = {
  Legendary: "border-yellow-500/40",
  Epic: "border-purple-500/40",
  Rare: "border-blue-500/40",
  Uncommon: "border-green-500/40",
  Common: "border-gray-500/40",
};

const RARITY_GLOW = {
  Legendary: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
  Epic: "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
  Rare: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
  Uncommon: "shadow-[0_0_20px_rgba(34,197,94,0.2)]",
  Common: "",
};

const SORT_OPTIONS = ["Recent", "Price: Low", "Price: High", "Power", "Rarity"];

// ─── Sell Card Modal ──────────────────────────────────────────────────────────
function SellCardModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Fire",
    rarity: "Common",
    price: "",
    description: "",
    atk: "",
    def: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  if (!isOpen) return null;

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
        className="relative w-full max-w-lg rounded-2xl border border-purple-500/30 bg-[#0f0a1e] p-6 shadow-[0_0_60px_rgba(147,51,234,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-white text-xl transition-colors">✕</button>
        <h2 className="mb-6 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          + Sell a Card
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Card Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-colors focus:border-purple-500"
              placeholder="Enter card name..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white outline-none transition-colors focus:border-purple-500"
              >
                {TYPE_FILTERS.filter(t => t !== "All Cards").map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Rarity</label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white outline-none transition-colors focus:border-purple-500"
              >
                {Object.keys(RARITY_COLORS).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Price (Credits)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-colors focus:border-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">ATK</label>
              <input
                type="number"
                value={formData.atk}
                onChange={(e) => setFormData({ ...formData, atk: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-colors focus:border-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">DEF</label>
              <input
                type="number"
                value={formData.def}
                onChange={(e) => setFormData({ ...formData, def: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-colors focus:border-purple-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-colors focus:border-purple-500 resize-none"
              placeholder="Describe your card..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-bold text-white transition-all hover:from-purple-500 hover:to-pink-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-[0.98]"
          >
            List Card for Sale
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}


// ─── Card Detail Modal ────────────────────────────────────────────────────────
function CardDetailModal({ card, onClose }) {
  if (!card) return null;

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
        className="relative flex w-full max-w-4xl flex-col md:flex-row gap-6 rounded-2xl border border-purple-500/20 bg-[#0a0615]/95 p-6 md:p-8 shadow-[0_0_80px_rgba(147,51,234,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 z-10 text-gray-500 hover:text-white text-xl transition-colors">✕</button>

        {/* Card Image Side */}
        <div className="flex flex-shrink-0 items-start justify-center md:w-[300px]">
          <div className={`relative overflow-hidden rounded-xl border-2 ${RARITY_BORDER_COLORS[card.rarity]} ${RARITY_GLOW[card.rarity]}`}>
            {/* Rarity Badge */}
            <div className={`absolute left-3 top-3 z-10 rounded-md bg-gradient-to-r ${RARITY_COLORS[card.rarity]} px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg`}>
              {card.featured ? "⭐ FEATURED" : card.rarity}
            </div>
            <img src={card.image} alt={card.name} className="h-auto w-full object-cover" />
          </div>
        </div>

        {/* Card Details Side */}
        <div className="flex flex-1 flex-col justify-between">
          {/* Header */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              ── Highest Value Listing ──
            </p>
            <h2 className="mb-3 font-serif text-3xl font-light italic text-gray-200 tracking-wide">
              {card.name}
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-gray-400">
              {card.description}
            </p>

            {/* Seller */}
            <div className="mb-5 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${RARITY_COLORS[card.rarity]} text-sm font-bold text-white`}>
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

            {/* Stats Row */}
            <div className="mb-5 flex gap-8">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Power</p>
                <p className="text-lg font-bold text-yellow-400">⚡ {card.power.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Rarity</p>
                <p className={`text-lg font-bold ${RARITY_TEXT_COLORS[card.rarity]}`}>{card.rarity}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Likes</p>
                <p className="text-lg font-bold text-red-400">❤ {card.likes}</p>
              </div>
            </div>

            {/* Ability */}
            <div className="mb-5 rounded-lg border border-gray-800 bg-gray-900/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Special Ability</p>
              <p className="text-sm text-gray-300">{card.ability}</p>
            </div>

            {/* ATK/DEF */}
            <div className="mb-5 flex gap-4 text-sm">
              <span className="rounded-md bg-red-900/30 border border-red-800/30 px-3 py-1.5 font-mono font-bold text-red-400">
                ATK {card.atk.toLocaleString()}
              </span>
              <span className="rounded-md bg-blue-900/30 border border-blue-800/30 px-3 py-1.5 font-mono font-bold text-blue-400">
                DEF {card.def.toLocaleString()}
              </span>
              <span className="rounded-md bg-purple-900/30 border border-purple-800/30 px-3 py-1.5 font-mono font-bold text-purple-400">
                LV. {card.level}
              </span>
              <span className="rounded-md bg-amber-900/30 border border-amber-800/30 px-3 py-1.5 font-mono font-bold text-amber-400">
                {card.element}
              </span>
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


// ─── Card Grid Item ───────────────────────────────────────────────────────────
function MarketplaceCard({ card, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", bounce: 0.3 }}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border ${RARITY_BORDER_COLORS[card.rarity]} bg-[#0d0a1a] transition-shadow duration-300 hover:${RARITY_GLOW[card.rarity]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Rarity Badge */}
      <div className={`absolute left-3 top-3 z-10 rounded-md bg-gradient-to-r ${RARITY_COLORS[card.rarity]} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg`}>
        {card.rarity}
      </div>

      {/* Like Button */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2 py-1 text-[10px] text-gray-300">
        <span className="text-red-400">❤</span> {card.likes}
      </div>

      {/* Card Image */}
      <div className="relative overflow-hidden">
        <img
          src={card.image}
          alt={card.name}
          className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a1a] via-transparent to-transparent" />

        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
            >
              <span className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 text-sm font-bold text-white">
                View Details
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Info */}
      <div className="p-4">
        <h3 className="mb-1 truncate text-sm font-bold text-white">{card.name}</h3>
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
          <span>{TYPE_ICONS[card.type]} {card.type}</span>
          <span>·</span>
          <span>LV. {card.level}</span>
        </div>

        {/* Stats */}
        <div className="mb-3 flex gap-2 text-[10px]">
          <span className="rounded bg-red-900/20 border border-red-900/30 px-1.5 py-0.5 font-mono text-red-400">
            ATK {card.atk}
          </span>
          <span className="rounded bg-blue-900/20 border border-blue-900/30 px-1.5 py-0.5 font-mono text-blue-400">
            DEF {card.def}
          </span>
          <span className="rounded bg-yellow-900/20 border border-yellow-900/30 px-1.5 py-0.5 font-mono text-yellow-400">
            ⚡{card.power}
          </span>
        </div>

        {/* Seller */}
        <div className="mb-3 flex items-center gap-2">
          <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${RARITY_COLORS[card.rarity]} text-[8px] font-bold text-white`}>
            {card.seller.substring(0, 2).toUpperCase()}
          </div>
          <span className="text-xs text-gray-400">{card.seller}</span>
          {card.sellerVerified && <span className="text-green-400 text-[10px]">☑</span>}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between rounded-lg bg-gray-900/50 border border-gray-800/50 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🪙</span>
            <span className="text-lg font-black text-amber-400">{card.price.toLocaleString()}</span>
          </div>
          <button
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:from-amber-400 hover:to-orange-500 active:scale-95"
            onClick={(e) => { e.stopPropagation(); }}
          >
            Buy
          </button>
        </div>
      </div>
    </motion.div>
  );
}


// ─── Featured Card Hero ───────────────────────────────────────────────────────
function FeaturedCardHero({ card, onViewDetails }) {
  if (!card) return null;

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-[#0a0615] via-[#120826] to-[#0a0615]">
      {/* Rainbow accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />

      <div className="flex flex-col md:flex-row items-center gap-8 p-6 md:p-10">
        {/* Card Image */}
        <motion.div
          whileHover={{ rotate: -2, scale: 1.03 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="relative flex-shrink-0 cursor-pointer"
          onClick={() => onViewDetails(card)}
        >
          <div className={`overflow-hidden rounded-xl border-2 border-yellow-500/40 shadow-[0_0_40px_rgba(234,179,8,0.25)]`}>
            <div className="absolute left-3 top-3 z-10 rounded-md bg-gradient-to-r from-yellow-500 to-amber-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg flex items-center gap-1">
              ⭐ FEATURED
            </div>
            <img
              src={card.image}
              alt={card.name}
              className="h-[320px] w-[240px] object-cover"
            />
          </div>
          {/* Floating glow effect */}
          <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-r from-purple-600/10 via-amber-500/10 to-purple-600/10 blur-2xl" />
        </motion.div>

        {/* Featured Info */}
        <div className="flex-1 text-center md:text-left">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
            ── Highest Value Listing ──
          </p>
          <h2 className="mb-3 font-serif text-3xl md:text-4xl font-light italic text-gray-200 tracking-wide">
            {card.name}
          </h2>
          <p className="mb-5 max-w-md text-sm leading-relaxed text-gray-400">
            {card.description}
          </p>

          {/* Seller */}
          <div className="mb-5 flex items-center gap-3 justify-center md:justify-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 text-sm font-bold text-white">
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
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Power</p>
              <p className="text-lg font-bold text-yellow-400">⚡ {card.power.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Rarity</p>
              <p className={`text-lg font-bold ${RARITY_TEXT_COLORS[card.rarity]}`}>{card.rarity}</p>
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


// ─── Main Marketplace Component ───────────────────────────────────────────────
export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Cards");
  const [sortBy, setSortBy] = useState("Recent");
  const [selectedCard, setSelectedCard] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);

  const featuredCard = CARDS_DATA.find((c) => c.featured);

  const filteredCards = useMemo(() => {
    let cards = CARDS_DATA.filter((c) => !c.featured);

    // Filter by type
    if (activeFilter !== "All Cards") {
      cards = cards.filter((c) => c.type === activeFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.seller.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "Price: Low":
        cards.sort((a, b) => a.price - b.price);
        break;
      case "Price: High":
        cards.sort((a, b) => b.price - a.price);
        break;
      case "Power":
        cards.sort((a, b) => b.power - a.power);
        break;
      case "Rarity": {
        const order = { Legendary: 0, Epic: 1, Rare: 2, Uncommon: 3, Common: 4 };
        cards.sort((a, b) => order[a.rarity] - order[b.rarity]);
        break;
      }
      default:
        break;
    }

    return cards;
  }, [activeFilter, searchQuery, sortBy]);

  const totalListings = CARDS_DATA.length;
  const userCredits = 12500;
  const userGems = 84;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#070412]">

      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between border-b border-gray-800/50 bg-[#0a0716]/80 px-6 py-3 backdrop-blur-md">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-lg font-black text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]">
            V
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">
              Poke<span className="text-purple-400">Vault</span>
            </h1>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gray-500">
              Card Marketplace
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">Listings</p>
            <p className="text-sm font-black text-white">{totalListings}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">Credits</p>
            <p className="flex items-center gap-1 text-sm font-black text-amber-400">
              🪙 {userCredits.toLocaleString()}
            </p>
          </div>
        </div>

        {/* User Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white cursor-pointer transition-transform hover:scale-110">
          ME
        </div>
      </div>

      {/* Rainbow bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-8 py-6 custom-scrollbar">

        {/* Featured Card Hero */}
        <FeaturedCardHero card={featuredCard} onViewDetails={setSelectedCard} />

        {/* ═══ BROWSE SECTION ═══ */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
                Browse Marketplace
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Showing <span className="font-bold text-blue-400">{filteredCards.length}</span> cards
              </p>
            </div>

            {/* Search & Sort & Sell */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cards, sellers..."
                  className="w-48 md:w-56 rounded-lg border border-gray-700/50 bg-gray-900/60 py-2 pl-9 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500 focus:w-64"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-700/50 bg-gray-900/60 px-3 py-2 text-sm text-gray-300 outline-none transition-colors focus:border-purple-500"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={() => setShowSellModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-bold text-white transition-all hover:from-green-500 hover:to-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
              >
                <span>+</span> Sell Card
              </button>
            </div>
          </div>

          {/* Type Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${activeFilter === filter
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                    : "border border-gray-700/50 bg-gray-900/40 text-gray-400 hover:border-gray-600 hover:text-white"
                  }`}
              >
                <span>{TYPE_ICONS[filter]}</span> {filter}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ CARD GRID ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => (
              <MarketplaceCard
                key={card.id}
                card={card}
                onClick={() => setSelectedCard(card)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredCards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="mb-4 text-5xl">🔍</span>
            <h3 className="mb-2 text-xl font-bold text-gray-400">No cards found</h3>
            <p className="text-sm text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* ═══ MODALS ═══ */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSellModal && (
          <SellCardModal isOpen={showSellModal} onClose={() => setShowSellModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
