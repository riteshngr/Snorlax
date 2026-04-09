import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useAuctionListener from "../hooks/useAuctionListener";
import AuctionCard from "../components/marketplace/AuctionCard";
import BidModal from "../components/marketplace/BidModal";
import ListCardModal from "../components/marketplace/ListCardModal";
import { useAuth, useUserData } from "../context/Store";

// ─── Constants ─────────────────────────────────────────────────────────────────

const TYPE_FILTER_ICONS = {
  "All Types": "🎴", fire: "🔥", water: "💧", grass: "🌿", electric: "⚡",
  psychic: "🔮", ice: "❄️", dragon: "🐉", dark: "🌑", fairy: "✨",
  fighting: "🥊", poison: "☠️", ground: "🏜️", flying: "🕊️", bug: "🐛",
  rock: "🪨", ghost: "👻", steel: "⚙️", normal: "⭐",
};

const SORT_OPTIONS = ["Recent", "Price: Low", "Price: High", "Bids", "Rarity"];

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}


// ─── Featured Auction Hero ─────────────────────────────────────────────────────

function FeaturedAuctionHero({ auction, onBid }) {
  if (!auction) return null;

  const card = auction.cardData || {};

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
          onClick={() => onBid(auction)}
        >
          <div className="relative overflow-hidden rounded-xl border-2 border-yellow-500/40 shadow-[0_0_40px_rgba(234,179,8,0.25)]">
            <div className="absolute left-3 top-3 z-10 rounded-md bg-gradient-to-r from-yellow-500 to-amber-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg flex items-center gap-1">
              ⭐ FEATURED
            </div>
            <img
              src={card.image}
              alt={card.name}
              className="h-[280px] w-[210px] object-contain bg-gray-800/40 p-4"
            />
          </div>
          <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-r from-purple-600/10 via-amber-500/10 to-purple-600/10 blur-2xl" />
        </motion.div>

        {/* Featured Info */}
        <div className="flex-1 text-center md:text-left">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
            ── Highest Bid Auction ──
          </p>
          <h2 className="mb-1 text-3xl md:text-4xl font-black text-white tracking-tight capitalize">
            {card.name}
          </h2>
          <p className="mb-2 text-sm text-gray-500 uppercase">{card.rarity}</p>

          {/* Types */}
          {card.types && (
            <div className="mb-4 flex gap-2 justify-center md:justify-start">
              {card.types.map((t) => (
                <span key={t} className="rounded-full bg-gray-800/60 border border-gray-700/40 px-3 py-1 text-xs font-bold text-gray-300 capitalize">
                  {TYPE_FILTER_ICONS[t] || "⭐"} {t}
                </span>
              ))}
            </div>
          )}

          {/* Seller */}
          <div className="mb-5 flex items-center gap-3 justify-center md:justify-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 text-sm font-bold text-white">
              {(auction.sellerUsername || "?").substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Listed By</p>
              <p className="text-sm font-semibold text-white">{auction.sellerUsername}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-5 flex gap-6 justify-center md:justify-start">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Current Bid</p>
              <p className="text-lg font-bold text-amber-400">🪙 {(auction.currentBid || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Total Bids</p>
              <p className="text-lg font-bold text-purple-400">{auction.bidCount || 0}</p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => onBid(auction)}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3 font-bold uppercase tracking-wider text-white transition-all hover:from-amber-400 hover:to-orange-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.97]"
          >
            Place Bid
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── Skeleton Loader ────────────────────────────────────────────────────────────

function AuctionSkeleton() {
  return (
    <div className="rounded-xl border border-gray-700/30 bg-gray-800/20 animate-pulse overflow-hidden">
      <div className="h-48 bg-gray-700/20" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-32 rounded bg-gray-700/40" />
        <div className="h-3 w-20 rounded bg-gray-700/30" />
        <div className="h-8 w-full rounded-lg bg-gray-700/20" />
        <div className="h-10 w-full rounded-lg bg-gray-700/20" />
      </div>
    </div>
  );
}


// ─── Main Marketplace Component ────────────────────────────────────────────────

export default function PokemonMarketplace() {
  const { user } = useAuth();
  const { profile } = useUserData();
  const { auctions, loading } = useAuctionListener();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Types");
  const [sortBy, setSortBy] = useState("Recent");
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showListModal, setShowListModal] = useState(false);

  // Derive available types from current auctions
  const availableTypes = useMemo(() => {
    const typeSet = new Set();
    auctions.forEach((a) => {
      const types = a.cardData?.types || [];
      types.forEach((t) => typeSet.add(t));
    });
    return ["All Types", ...Array.from(typeSet).sort()];
  }, [auctions]);

  // Featured auction = highest current bid
  const featuredAuction = useMemo(() => {
    if (auctions.length === 0) return null;
    return auctions.reduce((best, a) =>
      (a.currentBid || 0) > (best.currentBid || 0) ? a : best
    , auctions[0]);
  }, [auctions]);

  // Filtered and sorted auctions
  const filteredAuctions = useMemo(() => {
    let items = auctions.filter((a) => a.id !== featuredAuction?.id);

    // Filter by type
    if (activeFilter !== "All Types") {
      items = items.filter((a) => (a.cardData?.types || []).includes(activeFilter));
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((a) => {
        const card = a.cardData || {};
        return (
          (card.name || "").toLowerCase().includes(q) ||
          (a.sellerUsername || "").toLowerCase().includes(q) ||
          (card.rarity || "").toLowerCase().includes(q) ||
          (card.types || []).some((t) => t.includes(q))
        );
      });
    }

    // Sort
    switch (sortBy) {
      case "Price: Low":
        items.sort((a, b) => (a.currentBid || 0) - (b.currentBid || 0));
        break;
      case "Price: High":
        items.sort((a, b) => (b.currentBid || 0) - (a.currentBid || 0));
        break;
      case "Bids":
        items.sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0));
        break;
      case "Rarity": {
        const order = { Mythical: 0, Legendary: 1, Ultra: 2, Epic: 3, Rare: 4, Uncommon: 5, Common: 6 };
        items.sort((a, b) => (order[a.cardData?.rarity] ?? 9) - (order[b.cardData?.rarity] ?? 9));
        break;
      }
      default:
        break;
    }

    return items;
  }, [auctions, featuredAuction, activeFilter, searchQuery, sortBy]);

  const displayName = profile?.username || user?.displayName || "Trainer";
  const userCredits = profile?.credits || 0;
  const userGems = profile?.gems || 0;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#070412]">

      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between border-b border-gray-800/50 bg-[#0a0716]/80 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-lg font-black text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]">V</div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">Poke<span className="text-purple-400">Vault</span></h1>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gray-500">Auction Marketplace</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">Live Auctions</p>
            <p className="text-sm font-black text-white">{auctions.length}</p>
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
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white cursor-pointer transition-transform hover:scale-110">
          {displayName.substring(0, 2).toUpperCase()}
        </div>
      </div>

      <div className="h-0.5 w-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-8 py-6 custom-scrollbar">

        {loading ? (
          <>
            {/* Loading skeleton */}
            <div className="mb-8 rounded-2xl border border-gray-800/30 bg-[#0a0615]/50 p-10 animate-pulse">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-[210px] h-[280px] rounded-xl bg-gray-800/40" />
                <div className="flex-1 space-y-4">
                  <div className="h-3 w-32 rounded bg-gray-800/40" />
                  <div className="h-8 w-64 rounded bg-gray-800/50" />
                  <div className="h-16 w-full max-w-md rounded bg-gray-800/30" />
                  <div className="h-12 w-48 rounded bg-gray-800/40" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
              {Array.from({ length: 8 }).map((_, i) => <AuctionSkeleton key={i} />)}
            </div>
          </>
        ) : auctions.length === 0 ? (
          /* ═══ EMPTY STATE ═══ */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="relative w-28 h-28 mb-6">
              <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
              <svg viewBox="0 0 100 100" className="relative w-full h-full text-gray-600">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="3" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
                <circle cx="50" cy="50" r="8" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-400 mb-2">No Auctions Yet</h2>
            <p className="text-sm text-gray-600 max-w-sm mb-8">
              The marketplace is empty. Be the first to list a card from your inventory and start trading!
            </p>
            <button
              onClick={() => setShowListModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 font-bold uppercase tracking-wider text-white transition-all hover:from-green-500 hover:to-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-[0.97]"
            >
              <span className="text-lg">+</span> List Your First Card
            </button>
          </div>
        ) : (
          <>
            {/* Featured Auction */}
            <FeaturedAuctionHero
              auction={featuredAuction}
              onBid={setSelectedAuction}
            />

            {/* Browse Section */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
                    Live Auctions
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Showing <span className="font-bold text-blue-400">{filteredAuctions.length}</span> auctions
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search auctions..."
                      className="w-48 md:w-56 rounded-lg border border-gray-700/50 bg-gray-900/60 py-2 pl-9 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-purple-500 focus:w-64"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-gray-700/50 bg-gray-900/60 px-3 py-2 text-sm text-gray-300 outline-none transition-colors focus:border-purple-500"
                  >
                    {SORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => setShowListModal(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-bold text-white transition-all hover:from-green-500 hover:to-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
                  >
                    <span>+</span> List Card
                  </button>
                </div>
              </div>

              {/* Type Filters */}
              <div className="mb-6 flex flex-wrap gap-2">
                {availableTypes.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                      activeFilter === filter
                        ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                        : "border border-gray-700/50 bg-gray-900/40 text-gray-400 hover:border-gray-600 hover:text-white"
                    }`}
                  >
                    <span>{TYPE_FILTER_ICONS[filter] || "⭐"}</span> {filter === "All Types" ? "All Types" : capitalize(filter)}
                  </button>
                ))}
              </div>
            </div>

            {/* ═══ AUCTION GRID ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
              <AnimatePresence mode="popLayout">
                {filteredAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    onClick={() => setSelectedAuction(auction)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filteredAuctions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="mb-4 text-5xl">🔍</span>
                <h3 className="mb-2 text-xl font-bold text-gray-400">No auctions found</h3>
                <p className="text-sm text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ MODALS ═══ */}
      <AnimatePresence>
        {selectedAuction && (
          <BidModal
            auction={selectedAuction}
            onClose={() => setSelectedAuction(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showListModal && (
          <ListCardModal
            isOpen={showListModal}
            onClose={() => setShowListModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
