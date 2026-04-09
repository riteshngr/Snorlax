import { motion } from "framer-motion";
import useCountdown from "../../hooks/useCountdown";
import { TYPE_COLORS, TYPE_GLOWS } from "../../utils/typeColors";

/**
 * AuctionCard — Individual auction listing for the marketplace grid.
 *
 * Shows the card, current bid, countdown timer, bid count,
 * and seller info. Fully real-time via parent's onSnapshot data.
 */
export default function AuctionCard({ auction, onClick }) {
  const countdown = useCountdown(auction.expiresAt);
  const card = auction.cardData || {};
  const primaryType = (card.types && card.types[0]) || "normal";
  const glowColor = TYPE_GLOWS[primaryType] || TYPE_GLOWS.normal;

  const isHot = (auction.bidCount || 0) >= 3;

  const RARITY_BADGE_COLORS = {
    Common: "bg-gray-500/80",
    Uncommon: "bg-green-500/80",
    Rare: "bg-blue-600/90",
    Epic: "bg-purple-600/90",
    Legendary: "bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900",
    Mythical: "bg-gradient-to-r from-pink-400 to-fuchsia-500",
    Ultra: "bg-gradient-to-r from-cyan-500 to-blue-600",
  };  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", bounce: 0.3 }}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#0d0a1a]/60 backdrop-blur-md transition-shadow duration-300"
      onClick={onClick}
      style={{
        boxShadow: `0 0 20px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Top accent bar */}
      <div 
        className="h-1.5 w-full transition-colors duration-300" 
        style={{ 
          background: `linear-gradient(to right, ${glowColor}, transparent)` 
        }} 
      />

      {/* Hot indicator */}
      {isHot && (
        <div className="absolute left-3 top-4 z-10 flex items-center gap-1 rounded-full bg-red-500/90 px-2.5 py-1 text-[9px] font-bold text-white uppercase tracking-wider animate-pulse shadow-lg">
          🔥 Hot
        </div>
      )}

      {/* Rarity Badge */}
      <div className={`absolute right-3 top-4 z-10 rounded-md ${RARITY_BADGE_COLORS[card.rarity] || "bg-gray-500/80"} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm border border-white/10`}>
        {card.rarity}
      </div>

      {/* Card Image Area */}
      <div className="relative overflow-hidden pt-4">
        {/* Type Glow Background */}
        <div
          className="absolute inset-0 opacity-10 blur-3xl pointer-events-none"
          style={{ background: glowColor }}
        />
        <img
          src={card.image}
          alt={card.name}
          className="relative z-10 h-52 w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          loading="lazy"
        />
      </div>

      {/* Info Body */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <h3 className="text-base font-black text-white tracking-tight capitalize truncate">
              {card.name}
            </h3>
            {/* Types */}
            <div className="mt-1 flex gap-2">
              {(card.types || []).map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${TYPE_COLORS[t] || "bg-gray-400"} shadow-[0_0_5px_currentColor]`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Timer Bar */}
        <div className={`mb-4 flex items-center gap-3 rounded-xl border border-white/5 py-2.5 px-4 ${
          countdown.isExpired
            ? "bg-red-500/10"
            : countdown.hours < 1
              ? "bg-amber-500/10"
              : "bg-white/5"
        }`}>
          <span className="text-sm">⌛</span>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold leading-none mb-1">Time Remaining</p>
            <p className={`text-sm font-mono font-black tracking-tighter ${
              countdown.isExpired
                ? "text-red-400"
                : countdown.hours < 1
                  ? "text-amber-400"
                  : "text-white"
            }`}>
              {countdown.isExpired ? "EXPIRED" : countdown.formatted}
            </p>
          </div>
        </div>

        {/* Footer Info (Seller & Bids) */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
             <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-[10px] font-black text-white ring-2 ring-white/10 uppercase">
              {(auction.sellerUsername || "?").substring(0, 2)}
            </div>
            <span className="text-[11px] font-bold text-gray-400">{auction.sellerUsername}</span>
          </div>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            {auction.bidCount || 0} Bid{(auction.bidCount || 0) !== 1 && "s"}
          </p>
        </div>

        {/* Price & Action Area (The "View Full Recipe" style button) */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <span className="text-2xl font-black text-amber-400 drop-shadow-sm">
              {(auction.currentBid || auction.startingPrice || 0).toLocaleString()}
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, shadow: `0 0 15px ${glowColor}` }}
            whileTap={{ scale: 0.95 }}
            className={`rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-orange-500 transition-all`}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Bid
          </motion.button>
        </div>
      </div>
      
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 -z-10 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500"
        style={{ background: glowColor }}
      />
    </motion.div>
  );
}
