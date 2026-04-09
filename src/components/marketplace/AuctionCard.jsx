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
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", bounce: 0.3 }}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-700/40 bg-[#0d0a1a] transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.15)]"
      onClick={onClick}
    >
      {/* Hot indicator */}
      {isHot && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider animate-pulse">
          🔥 Hot
        </div>
      )}

      {/* Rarity Badge */}
      <div className={`absolute right-3 top-3 z-10 rounded-md ${RARITY_BADGE_COLORS[card.rarity] || "bg-gray-500/80"} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg`}>
        {card.rarity}
      </div>

      {/* Card Image */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-800/30 to-transparent">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
        />
        <img
          src={card.image}
          alt={card.name}
          className="h-48 w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a1a] via-transparent to-transparent" />
      </div>

      {/* Card Info */}
      <div className="p-4">
        <h3 className="mb-1 text-sm font-bold text-white capitalize truncate">{card.name}</h3>
        
        {/* Types */}
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
          {(card.types || []).map((type) => (
            <span key={type} className="flex items-center gap-1">
              <span className={`inline-block w-2 h-2 rounded-full ${TYPE_COLORS[type] || "bg-gray-400"}`} />
              <span className="capitalize text-[10px]">{type}</span>
            </span>
          ))}
        </div>

        {/* Timer */}
        <div className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
          countdown.isExpired
            ? "border-red-500/30 bg-red-500/5"
            : countdown.hours < 1
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-gray-800/50 bg-gray-900/30"
        }`}>
          <span className="text-xs">⏱</span>
          <span className={`text-xs font-mono font-bold ${
            countdown.isExpired
              ? "text-red-400"
              : countdown.hours < 1
                ? "text-amber-400"
                : "text-gray-300"
          }`}>
            {countdown.isExpired ? "ENDED" : countdown.formatted}
          </span>
          {!countdown.isExpired && (
            <span className="text-[9px] text-gray-500 uppercase">remaining</span>
          )}
        </div>

        {/* Seller */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-[8px] font-bold text-white">
            {(auction.sellerUsername || "?").substring(0, 2).toUpperCase()}
          </div>
          <span className="text-xs text-gray-400">{auction.sellerUsername}</span>
          <span className="ml-auto text-[10px] text-gray-600">{auction.bidCount || 0} bid{(auction.bidCount || 0) !== 1 && "s"}</span>
        </div>

        {/* Current Bid / Price */}
        <div className="flex items-center justify-between rounded-lg bg-gray-900/50 border border-gray-800/50 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🪙</span>
            <span className="text-lg font-black text-amber-400">
              {(auction.currentBid || auction.startingPrice || 0).toLocaleString()}
            </span>
          </div>
          <button
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:from-amber-400 hover:to-orange-500 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Bid
          </button>
        </div>
      </div>
    </motion.div>
  );
}
