import { useState } from "react";
import { motion } from "framer-motion";
import useBidding from "../../hooks/useBidding";
import { useAuth, useUserData } from "../../context/Store";
import useCountdown from "../../hooks/useCountdown";

/**
 * BidModal — Place a bid on an auction.
 *
 * Implements optimistic UI: the bid appears instantly,
 * then confirms or gracefully rejects.
 */
export default function BidModal({ auction, onClose }) {
  const { user } = useAuth();
  const { profile } = useUserData();
  const { placeBid, optimisticBid, bidStatus, bidError } = useBidding(auction?.id);
  const countdown = useCountdown(auction?.expiresAt);

  const [bidAmount, setBidAmount] = useState("");

  if (!auction) return null;

  const card = auction.cardData || {};
  const currentBid = optimisticBid?.amount || auction.currentBid || auction.startingPrice;
  const minBid = Math.ceil(currentBid * 1.1); // 10% minimum increment
  const userCredits = profile?.credits || 0;

  async function handleBid(e) {
    e.preventDefault();

    const amount = parseInt(bidAmount, 10);
    if (!amount || amount < minBid) return;

    if (amount > userCredits) return;

    await placeBid(
      amount,
      user.uid,
      profile?.username || user.displayName || "Unknown",
      auction.bidVersion || 0
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#0f0a1e] shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-white">Place a Bid</h2>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {countdown.isExpired ? "Auction Ended" : `Ends in ${countdown.formatted}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/80 text-gray-400 hover:text-white text-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Card Preview */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-800/50 bg-gray-900/40 p-4 mb-5">
            <img
              src={card.image}
              alt={card.name}
              className="w-16 h-16 object-contain"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-white capitalize truncate">{card.name}</h3>
              <p className="text-[10px] font-semibold text-gray-500 uppercase">{card.rarity}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-500">Seller:</span>
                <span className="text-[10px] font-bold text-gray-300">{auction.sellerUsername}</span>
              </div>
            </div>
          </div>

          {/* Current Bid Info */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Current Bid</p>
              <p className="text-lg font-black text-amber-400">
                🪙 {currentBid.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Min. Bid</p>
              <p className="text-lg font-black text-blue-400">
                {minBid.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Total Bids</p>
              <p className="text-lg font-black text-purple-400">
                {auction.bidCount || 0}
              </p>
            </div>
          </div>

          {/* Current bidder */}
          {auction.currentBidderUsername && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
              <span className="text-xs">👑</span>
              <span className="text-xs text-gray-400">Highest bidder:</span>
              <span className="text-xs font-bold text-amber-400">{auction.currentBidderUsername}</span>
            </div>
          )}

          {/* Bid Form */}
          <form onSubmit={handleBid} className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Your Bid (Credits) — You have 🪙 {userCredits.toLocaleString()}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🪙</span>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min: ${minBid.toLocaleString()}`}
                  min={minBid}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/80 pl-9 pr-4 py-2.5 text-white placeholder-gray-600 outline-none transition-colors focus:border-amber-500"
                  disabled={bidStatus === "pending" || countdown.isExpired}
                />
              </div>
              {parseInt(bidAmount, 10) > userCredits && (
                <p className="mt-1 text-xs text-red-400">Not enough credits.</p>
              )}
            </div>

            {/* Status Messages */}
            {bidStatus === "pending" && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                <p className="text-sm text-amber-400 font-medium">Placing your bid...</p>
              </div>
            )}

            {bidStatus === "confirmed" && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5">
                <p className="text-sm text-green-400 font-bold">✓ Bid placed successfully!</p>
              </div>
            )}

            {bidStatus === "rejected" && bidError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5">
                <p className="text-sm text-red-400 font-medium">{bidError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={
                bidStatus === "pending" ||
                countdown.isExpired ||
                !bidAmount ||
                parseInt(bidAmount, 10) < minBid ||
                parseInt(bidAmount, 10) > userCredits ||
                auction.sellerId === user?.uid
              }
              className={`w-full rounded-xl py-3 font-bold text-white uppercase tracking-wider transition-all ${
                bidStatus === "pending" || countdown.isExpired
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.98]"
              }`}
            >
              {countdown.isExpired
                ? "Auction Ended"
                : auction.sellerId === user?.uid
                  ? "Can't Bid on Own Auction"
                  : "Place Bid"
              }
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
