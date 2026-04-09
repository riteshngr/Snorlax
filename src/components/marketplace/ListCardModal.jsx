import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useUserData } from "../../context/Store";
import { createAuction, removeCardFromInventory } from "../../services/db";
import { TYPE_COLORS } from "../../utils/typeColors";

const DURATION_OPTIONS = [
  { label: "1 Hour", hours: 1 },
  { label: "6 Hours", hours: 6 },
  { label: "12 Hours", hours: 12 },
  { label: "24 Hours", hours: 24 },
];

/**
 * ListCardModal — Users select a card from their inventory
 * and list it for auction with a starting price and duration.
 */
export default function ListCardModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { profile, inventory } = useUserData();

  const [selectedCard, setSelectedCard] = useState(null);
  const [startingPrice, setStartingPrice] = useState("");
  const [duration, setDuration] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!selectedCard) {
      setError("Please select a card to list.");
      return;
    }

    const price = parseInt(startingPrice, 10);
    if (!price || price < 10) {
      setError("Starting price must be at least 10 credits.");
      return;
    }

    setLoading(true);
    try {
      // Create the auction document
      await createAuction({
        cardData: {
          pokemonId: selectedCard.pokemonId || selectedCard.id,
          name: selectedCard.name,
          image: selectedCard.image,
          types: selectedCard.types || [],
          attacks: selectedCard.attacks || [],
          rarity: selectedCard.rarity || "Common",
          genus: selectedCard.genus || "Unknown Pokémon",
        },
        sellerId: user.uid,
        sellerUsername: profile?.username || user.displayName || "Unknown",
        startingPrice: price,
        durationHours: duration,
      });

      // Remove the card from the seller's inventory
      if (selectedCard.docId) {
        await removeCardFromInventory(user.uid, selectedCard.docId);
      }

      onClose();
    } catch (err) {
      console.error("Failed to create auction:", err);
      setError("Failed to list card. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-purple-500/30 bg-[#0f0a1e] shadow-[0_0_60px_rgba(147,51,234,0.15)] custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0f0a1e]/95 backdrop-blur-md border-b border-purple-500/20 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              List Card for Auction
            </h2>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mt-0.5">
              Select a card from your inventory
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/80 text-gray-400 hover:text-white text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Card Selection Grid */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Select Card ({inventory.length} available)
            </label>

            {inventory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-gray-800/50 bg-gray-900/30">
                <span className="text-4xl mb-3">📦</span>
                <p className="text-sm text-gray-500">Your inventory is empty</p>
                <p className="text-xs text-gray-600 mt-1">Open packs to get cards first!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
                {inventory.map((card) => {
                  const isSelected = selectedCard?.docId === card.docId;
                  const primaryType = (card.types && card.types[0]) || "normal";

                  return (
                    <button
                      key={card.docId}
                      type="button"
                      onClick={() => setSelectedCard(card)}
                      className={`relative rounded-xl border-2 p-2 transition-all text-left ${
                        isSelected
                          ? "border-green-400 bg-green-400/10 shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                          : "border-gray-700/50 bg-gray-900/40 hover:border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] font-bold text-white z-10">
                          ✓
                        </div>
                      )}
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-16 object-contain mb-1"
                        loading="lazy"
                      />
                      <p className="text-[10px] font-bold text-white truncate capitalize">{card.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${TYPE_COLORS[primaryType] || "bg-gray-400"}`} />
                        <span className="text-[8px] font-semibold text-gray-500 uppercase">{card.rarity}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Starting Price */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Starting Price (Credits)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🪙</span>
              <input
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="Min: 10"
                min={10}
                className="w-full rounded-lg border border-gray-700 bg-gray-900/80 pl-9 pr-4 py-2.5 text-white placeholder-gray-600 outline-none transition-colors focus:border-green-500"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Auction Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setDuration(opt.hours)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                    duration === opt.hours
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                      : "border border-gray-700/50 bg-gray-900/40 text-gray-400 hover:text-white hover:border-gray-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5">
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !selectedCard || inventory.length === 0}
            className={`w-full rounded-xl py-3 font-bold text-white uppercase tracking-wider transition-all ${
              loading || !selectedCard
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Listing...
              </span>
            ) : (
              "List for Auction"
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
