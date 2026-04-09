import { useState } from "react";
import { fetchRandomPokemon } from "../services/pokemon";
import { generateCard } from "../utils/cardGenerator";
import { RevealCard } from "../components/CardPack";
import PackOpening from "../components/PackOpening";

/**
 * Gacha Page
 *
 * Lets the user "Open Pack" to generate 5 random Pokemon cards.
 * Uses a tiered animation sequence: Shake -> Tear -> Reveal.
 */
export default function Gacha() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Animation status for the pack
  // 'idle' | 'shaking' | 'tearing' | 'revealed'
  const [status, setStatus] = useState('idle');

  // Whether the reveal animation is playing for individual cards
  const [revealing, setRevealing] = useState(false);

  // Track selected card for focus mode
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);

  /**
   * Orchestrate the pack opening sequence.
   */
  async function handleOpenPack() {
    if (loading || status !== 'idle') return;

    setLoading(true);
    setError(null);
    setCards([]);
    setRevealing(false);
    setSelectedCardIndex(null);

    // Start shaking
    setStatus('shaking');

    try {
      // 1. Fetch 5 Pokemon in parallel immediately
      const fetchPromise = Promise.all([
        fetchRandomPokemon(),
        fetchRandomPokemon(),
        fetchRandomPokemon(),
        fetchRandomPokemon(),
        fetchRandomPokemon(),
      ]);

      // 2. Shake for 200ms
      await new Promise(r => setTimeout(r, 200));
      setStatus('tearing');

      // 3. Tear for 400ms (total 600ms so far)
      const [pokemonList] = await Promise.all([
        fetchPromise,
        new Promise(r => setTimeout(r, 400))
      ]);

      // 4. Generate cards
      const generatedCards = pokemonList.map(generateCard);
      setCards(generatedCards);
      setStatus('revealed');

      // 5. Trigger sequential card reveal
      setTimeout(() => setRevealing(true), 50);

    } catch (err) {
      console.error(err);
      setError("Something went wrong while opening the pack. Try again!");
      setStatus('idle');
    } finally {
      setLoading(false);
    }
  }

  function handleCardClick(index) {
    if (selectedCardIndex === index) {
      setSelectedCardIndex(null);
    } else {
      setSelectedCardIndex(index);
    }
  }

  function resetGacha() {
    setCards([]);
    setStatus('idle');
    setRevealing(false);
    setSelectedCardIndex(null);
  }

  const rotations = ["-rotate-12", "-rotate-6", "rotate-0", "rotate-6", "rotate-12"];

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 py-12 sm:py-16">
        {/* ── Header ─────────────────────────────────────── */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent mb-2">
          Gacha Pack
        </h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Open a pack to reveal <strong className="text-white">5 random Pokémon cards</strong>.
          Rarity depends on <strong className="text-white">Base Stat Total (BST)</strong> — will you pull a Mythical?
        </p>

        {/* ── Pack Opening Interaction ───────────────────── */}
        {status !== 'revealed' && (
          <PackOpening status={status} onOpen={handleOpenPack} />
        )}

        {/* ── Reset Button (Visible after opening) ───────── */}
        {status === 'revealed' && !loading && (
          <button
            onClick={resetGacha}
            className="mb-12 px-6 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest text-white/60"
          >
            ← Open Another Pack
          </button>
        )}

        {/* ── Error Message ──────────────────────────────── */}
        {error && (
          <p className="mt-6 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* ── Fan Reveal Container ───────────────────────── */}
        {cards.length > 0 && status === 'revealed' && (
          <div className="relative w-full flex justify-center items-center py-12 overflow-visible">
            <div className="flex -space-x-16 sm:-space-x-24 md:-space-x-32 justify-center transition-all duration-700">
              {cards.map((card, index) => {
                const isSelected = selectedCardIndex === index;
                const isDimmed = selectedCardIndex !== null && !isSelected;

                return (
                  <div
                    key={`${card.id}-${index}`}
                    onClick={() => handleCardClick(index)}
                    className={`
                      relative transition-all duration-500 ease-out cursor-pointer
                      ${revealing ? "opacity-100" : "opacity-0 scale-50 translate-y-20"}
                      ${isSelected
                        ? "z-50 -translate-y-16 scale-110 shadow-[0_0_40px_rgba(255,255,255,0.3)] rotate-0"
                        : `${rotations[index]} hover:translate-y-[-10px] hover:z-40`
                      }
                      ${isDimmed ? "opacity-40 scale-90" : "opacity-100"}
                    `}
                    style={{
                      transitionDelay: revealing ? `${index * 120}ms` : '0ms'
                    }}
                  >
                    <RevealCard card={card} revealing={revealing} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Loading Hint ───────────────────────────────── */}
        {loading && status === 'tearing' && (
          <div className="mt-8 flex items-center gap-3 text-white/40 animate-pulse">
            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
            <p className="text-xs font-bold uppercase tracking-[0.3em]">Revealing...</p>
          </div>
        )}

        {/* Instruction Footer */}
        {status === 'revealed' && selectedCardIndex === null && (
          <p className="mt-12 text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] animate-bounce">
            Click a card to inspect
          </p>
        )}
      </div>
    </div>
  );
}
