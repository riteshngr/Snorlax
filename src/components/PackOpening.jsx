import { useState, useEffect } from "react";
import { fetchRandomPokemon } from "../services/pokemon";
import { generateCard } from "../utils/cardGenerator";
import PokemonCard from "./PokemonCard";

const RARITY_HINTS = {
  Legendary: { letter: 'R', color: 'text-yellow-400' },
  Mythical: { letter: 'R', color: 'text-yellow-400' },
  Ultra: { letter: 'R', color: 'text-yellow-400' },
  Epic: { letter: 'P', color: 'text-purple-500' },
  Rare: { letter: 'NC', color: 'text-blue-500' },
  Uncommon: { letter: 'NJ', color: 'text-green-500' },
  Common: { letter: 'Y', color: 'text-red-500' },
};

/**
 * PackOpening — The core logic hub for the gacha reveal system.
 * 
 * Responsibilities:
 * - Generate 5 random cards on mount.
 * - Manage the orchestrated Tear -> Fan animation sequence.
 * - Handle card reveal state (flip, hover, selection).
 */
export default function PackOpening({ onReset, activePanel, addCardsToInventory }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('tearing'); // start with tear
  const [revealing, setRevealing] = useState(false);
  const [flippedIndices, setFlippedIndices] = useState(new Set());
  const [selectedIndex, setSelectedIndex] = useState(null);

  // New states for the collection animation
  const [isCollecting, setIsCollecting] = useState(false);

  /**
   * Fetch and generate cards on mount
   */
  useEffect(() => {
    async function init() {
      try {
        const pokemonList = await Promise.all([
          fetchRandomPokemon(),
          fetchRandomPokemon(),
          fetchRandomPokemon(),
          fetchRandomPokemon(),
          fetchRandomPokemon(),
        ]);
        const generatedCards = pokemonList.map(generateCard);
        setCards(generatedCards);
        
        // Wait for tear animation before showing cards
        await new Promise(r => setTimeout(r, 600));
        setStatus('revealed');
        setTimeout(() => setRevealing(true), 50);
      } catch (err) {
        console.error("Failed to fetch cards:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  /**
   * Reset selection when navigating away from the home panel
   */
  useEffect(() => {
    if (activePanel !== "home") {
      setSelectedIndex(null);
    }
  }, [activePanel]);

  const handleCardClick = (index) => {
    // If already flipped, just toggle selection
    if (flippedIndices.has(index)) {
      setSelectedIndex(prev => (prev === index ? null : index));
      return;
    }
    
    // If not flipped, flip it
    setFlippedIndices(prev => new Set([...prev, index]));
  };

  /**
   * Flip all remaining unflipped cards with a slight stagger
   */
  const handleGlobalFlip = async () => {
    if (status !== 'revealed' || isCollecting) return;
    
    const unflippedIndices = cards
      .map((_, i) => i)
      .filter(i => !flippedIndices.has(i));
    
    if (unflippedIndices.length === 0) return;

    // Flip them sequentially for a premium staggered effect
    for (const index of unflippedIndices) {
      setFlippedIndices(prev => new Set([...prev, index]));
      await new Promise(r => setTimeout(r, 100)); // 100ms stagger
    }
  };

  /**
   * Orchestrate the 4-step collection animation
   */
  const handleCollectCards = async () => {
    if (isCollecting) return;
    setIsCollecting(true);
    setSelectedIndex(null); // Deselect any card

    // Wait for the full animation sequence (800ms) plus a small buffer
    await new Promise(r => setTimeout(r, 850));

    // Trigger inventory and reset
    if (typeof addCardsToInventory === 'function') {
      addCardsToInventory(cards);
    } else {
      console.log("Adding cards to inventory:", cards);
    }
    onReset();
  };

  const rotations = ["-rotate-12", "-rotate-6", "rotate-0", "rotate-6", "rotate-12"];
  const degrees = [-12, -6, 0, 6, 12];

  return (
    <div 
      onClick={handleGlobalFlip}
      className="relative flex flex-col items-center justify-center w-full min-h-[500px]"
    >
      
      {/* ── 1. Recovery Option (Reset) ─────────────────── */}
      {status === 'revealed' && !loading && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="absolute -top-16 px-6 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest text-white/60 z-10"
        >
          ← Open Another Pack
        </button>
      )}

      {/* ── 2. The "Tear" Effect ───────────────────────── */}
      {status === 'tearing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50">
          <div className="w-56 h-40 bg-indigo-700 rounded-t-xl overflow-hidden animate-[tearTop_0.6s_ease-out_forwards] border-b-2 border-white/40 shadow-xl">
             <div className="w-full h-80 -mt-0 opacity-50 bg-gradient-to-br from-indigo-700 via-purple-600 to-indigo-800" />
          </div>
          <div className="w-56 h-40 bg-indigo-800 rounded-b-xl overflow-hidden animate-[tearBottom_0.6s_ease-out_forwards] shadow-2xl">
             <div className="w-full h-80 -mt-40 opacity-50 bg-gradient-to-br from-indigo-700 via-purple-600 to-indigo-800" />
          </div>
        </div>
      )}

      {/* ── 3. The Fan Reveal Hand ──────────────────────── */}
      {cards.length > 0 && status === 'revealed' && (
        <div className="relative w-full flex justify-center items-center py-20 overflow-visible reveal-container">
          <div className="flex -space-x-16 sm:-space-x-24 md:-space-x-32 justify-center transition-all duration-700">
            {cards.map((card, index) => {
              const isSelected = selectedIndex === index;
              const isFlipped = flippedIndices.has(index);
              const isDimmed = selectedIndex !== null && !isSelected;
              const hint = RARITY_HINTS[card.rarity] || RARITY_HINTS.Common;

              return (
                <div
                  key={`${card.id}-${index}`}
                  onClick={(e) => {
                    if (isCollecting) return;
                    e.stopPropagation();
                    handleCardClick(index);
                  }}
                  className={`
                    reveal-card-wrapper relative transition-all duration-500 ease-out cursor-pointer perspective-[1000px]
                    ${revealing ? "opacity-100" : "opacity-0 scale-50 translate-y-20"}
                    ${isSelected 
                      ? "z-[50] -translate-y-20 scale-110 shadow-[0_0_50px_rgba(255,255,255,0.2)] rotate-0" 
                      : `${rotations[index]} hover:translate-y-[-20px] hover:z-[45] hover:scale-105 z-[30]`
                    }
                    ${isDimmed ? "opacity-40 scale-90 blur-[1px]" : "opacity-100"}
                    ${isCollecting ? "collecting-card" : ""}
                  `}
                  style={{ 
                    transitionDelay: revealing && !isCollecting ? `${index * 120}ms` : '0ms',
                    "--initial-rotate": `${degrees[index]}deg`,
                    "--stack-offset": `${(2 - index) * 128}px`
                  }}
                >
                  {/* Card Flip Inner */}
                  <div className={`
                    relative w-64 h-96 transition-all duration-500 [transform-style:preserve-3d]
                    ${isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'}
                  `}>
                    
                    {/* BACKSIDE */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden bg-slate-950 border-4 border-slate-800 shadow-2xl [backface-visibility:hidden] z-10 flex flex-col items-center justify-center p-6 select-none">
                      <div className="absolute inset-0 opacity-20" style={{
                        background: 'radial-gradient(circle at center, #312e81 0%, transparent 70%), repeating-conic-gradient(from 0deg, transparent 0deg 30deg, rgba(255,255,255,0.05) 30deg 60deg)'
                      }} />
                      <h2 className="relative z-10 text-indigo-400 font-black text-2xl tracking-[0.2em] uppercase italic mb-8">
                        PokeVault
                      </h2>
                      <div className="relative z-10 w-24 h-24 mb-6">
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
                        <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full text-indigo-500 opacity-60">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
                          <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="4" />
                          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="4" />
                          <circle cx="50" cy="50" r="8" fill="currentColor" />
                        </svg>
                      </div>
                      
                      {/* TWEAKED RARITY LETTER: Centered beneath ball, 10% opacity */}
                      <div className={`relative z-10 font-black text-6xl opacity-10 italic ${hint.color}`}>
                        {hint.letter}
                      </div>

                      {!isFlipped && (
                        <p className="absolute bottom-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 animate-pulse">
                          Click to Flip
                        </p>
                      )}
                    </div>

                    {/* FRONT */}
                    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                       <PokemonCard card={card} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. Collect Cards Action ─────────────────── */}
      {flippedIndices.size === cards.length && cards.length > 0 && !isCollecting && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleCollectCards();
            }}
            className="group cursor-pointer flex flex-col items-center"
          >
            <span className="text-emerald-50/90 font-black text-sm tracking-[0.4em] uppercase transition-all duration-300 group-hover:text-white group-hover:scale-110 animate-pulse-slow active:scale-95 text-glow-pulse">
              Add to Inventory
            </span>
            {/* Subtle interactive underline */}
            <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent transition-all duration-500 mt-1" />
          </div>
        </div>
      )}

      {/* ── 5. Loading State ───────────────────────────── */}
      {loading && status === 'tearing' && (
        <div className="mt-20 flex items-center gap-3 text-white/40 animate-pulse">
           <div className="w-2 h-2 bg-indigo-500 rounded-full" />
           <p className="text-xs font-bold uppercase tracking-[0.3em]">Summoning Pokemon...</p>
        </div>
      )}

      <style>{`
        @keyframes tearTop {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-200px) rotate(-15deg); opacity: 0; }
        }
        @keyframes tearBottom {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(200px) rotate(15deg); opacity: 0; }
        }
        
        /* Interactive Sibling Dimming Scoped */
        #gacha-center-wrapper .reveal-container:has(.reveal-card-wrapper:hover) .reveal-card-wrapper:not(:hover) {
          opacity: 0.5;
          filter: brightness(0.7) blur(1px);
          transform: scale(0.95);
        }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        .animate-in {
          animation-fill-mode: forwards;
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); }
          to { transform: translate(-50%, 0); }
        }

        .text-glow-pulse {
          animation: textGlowPulse 2.5s infinite ease-in-out;
        }

        @keyframes textGlowPulse {
          0%, 100% { 
            opacity: 0.7;
            text-shadow: 0 0 10px rgba(16, 185, 129, 0), 0 0 20px rgba(16, 185, 129, 0);
          }
          50% { 
            opacity: 1;
            text-shadow: 0 0 15px rgba(16, 185, 129, 0.5), 0 0 30px rgba(16, 185, 129, 0.2);
          }
        }

        .collecting-card {
          animation: collectSequence 0.8s ease-in-out forwards !important;
          pointer-events: none;
          z-index: 100 !important;
        }

        @keyframes collectSequence {
          0% {
            transform: scale(1) rotate(var(--initial-rotate)) translateX(0) translateY(0);
            opacity: 1;
          }
          15% {
            /* Step 1: Shrink */
            transform: scale(0.9) rotate(var(--initial-rotate)) translateX(0) translateY(0);
            opacity: 1;
          }
          45% {
            /* Step 2: Stack at center */
            transform: scale(0.9) rotate(0deg) translateX(var(--stack-offset)) translateY(0);
            opacity: 1;
          }
          75% {
            /* Step 3: Slide down toward inventory */
            transform: scale(0.9) rotate(0deg) translateX(var(--stack-offset)) translateY(300px);
            opacity: 0.7;
          }
          100% {
            /* Step 4: Fade out */
            transform: scale(0.9) rotate(0deg) translateX(var(--stack-offset)) translateY(600px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
