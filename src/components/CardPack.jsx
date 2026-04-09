import { useState } from "react";
import PackOpening from "./PackOpening";

/**
 * CardPack — A premium booster pack component with metallic gradients
 * and shiny effects.
 */
export default function CardPack({ activePanel }) {
  const [isOpened, setIsOpened] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  async function handlePackClick() {
    if (isOpened) return;
    
    setIsShaking(true);
    await new Promise(r => setTimeout(r, 600)); // Dramatic shake
    setIsOpened(true);
    setIsShaking(false);
  }

  if (isOpened) {
     return <PackOpening onReset={() => setIsOpened(false)} activePanel={activePanel} />;
  }

  return (
    <div 
      onClick={handlePackClick}
      className={`
        relative w-56 h-80 rounded-xl overflow-hidden shadow-2xl
        transition-all duration-300 cursor-pointer group
        ${isShaking ? 'animate-[shake_0.2s_infinite]' : 'hover:scale-105 hover:-translate-y-2'}
      `}
    >
      {/* Metallic Base Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-600 to-indigo-800" />
      
      {/* Shiny "Glint" Sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:animate-[glint_1.5s_infinite] pointer-events-none" />

      {/* Decorative Foil Patterns */}
      <div className="absolute inset-x-0 top-0 h-10 bg-black/20 border-b border-white/10 flex items-center justify-center">
        <div className="w-16 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Main Art Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-32 h-32 mb-6">
          {/* Stylized Pokéball Logo */}
          <div className="absolute inset-0 bg-white/10 rounded-full border-4 border-white/20 backdrop-blur-sm animate-pulse" />
          <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full text-white/80 drop-shadow-xl">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
          </svg>
        </div>

        <h2 className="text-white font-black text-2xl tracking-[0.2em] uppercase drop-shadow-lg italic">
          Snorlax
        </h2>
        <p className="text-indigo-200 text-xs font-bold tracking-[0.3em] uppercase opacity-60">
          Gacha Pack
        </p>
      </div>

      {/* Bottom Foil Detail */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-black/20 border-t border-white/10 flex items-center justify-center">
         <p className="text-white/40 text-[9px] font-bold tracking-widest uppercase">
           5 Random Cards
         </p>
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
      
      {/* "Open Pack" Hint */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-white text-indigo-950 font-black px-6 py-2 rounded-full text-sm uppercase tracking-widest shadow-xl">
          Open Pack
        </span>
      </div>

      <style>{`
        @keyframes glint {
          from { transform: translateX(-200%) skewX(-20deg); }
          to { transform: translateX(200%) skewX(-20deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px) rotate(-1deg); }
          75% { transform: translateX(4px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}
