import { useState } from "react";
import PackOpening from "./PackOpening";

const PACK_COST = 500;

/**
 * CardPack — A premium booster pack component with metallic gradients
 * and shiny effects. Now deducts credits on open.
 */
export default function CardPack({ activePanel, addCardsToInventory, spendCredits, userCredits }) {
  const [isOpened, setIsOpened] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [error, setError] = useState(null);

  async function handlePackClick() {
    if (isOpened) return;
    setError(null);
    
    // Check if user has enough credits
    if (userCredits < PACK_COST) {
      setError("Not enough credits!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Deduct credits
    const success = await spendCredits(PACK_COST);
    if (!success) {
      setError("Not enough credits!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsShaking(true);
    await new Promise(r => setTimeout(r, 600)); // Dramatic shake
    setIsOpened(true);
    setIsShaking(false);
  }

  if (isOpened) {
     return <PackOpening onReset={() => setIsOpened(false)} activePanel={activePanel} addCardsToInventory={addCardsToInventory} />;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        onClick={handlePackClick}
        className={`
          relative w-72 h-[420px] rounded-xl overflow-hidden shadow-2xl
          transition-all duration-300 cursor-pointer group
          ${isShaking ? 'animate-[shake_0.2s_infinite]' : 'hover:scale-105 hover:-translate-y-2'}
        `}
      >
        <img
          src="/gacha-pack.jpg"
          alt="Gacha Pack"
          className="w-full h-full object-contain rounded-xl transition-transform duration-300"
        />

        {/* "Open Pack" Hint overlay (kept for interaction feedback) */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-white text-indigo-950 font-black px-6 py-2 rounded-full text-sm uppercase tracking-widest shadow-xl">
            Open Pack
          </span>
        </div>
      </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px) rotate(-1deg); }
            75% { transform: translateX(4px) rotate(1deg); }
          }
        `}</style>

      {/* Pack cost indicator below the pack */}
      <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5">
        <span className="text-sm">🪙</span>
        <span className="text-xs font-black text-amber-400">{PACK_COST}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">per pack</span>
      </div>

      {/* Error toast */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 animate-pulse">
          <p className="text-xs font-bold text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
