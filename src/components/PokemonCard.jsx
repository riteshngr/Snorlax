import { useState } from "react";
import { TYPE_GRADIENTS, TYPE_COLORS, TYPE_GLOWS } from "../utils/typeColors";
import AttackRow from "./AttackRow";

/**
 * PokemonCard — Displays a single generated Pokemon card.
 *
 * Props:
 *   card: { id, name, image, types, attacks, rarity }
 */

const RARITY_STYLES = {
  Common: {
    border: "border-gray-400/50",
    badge: "bg-gray-500/80 border-gray-400",
    glow: "",
  },
  Uncommon: {
    border: "border-green-500/50",
    badge: "bg-green-500/80 border-green-400",
    glow: "shadow-green-500/20 shadow-lg",
  },
  Rare: {
    border: "border-blue-500/60",
    badge: "bg-blue-600/90 border-blue-400",
    glow: "shadow-blue-500/40 shadow-xl",
  },
  Epic: {
    border: "border-purple-500",
    badge: "bg-purple-600/90 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
    glow: "shadow-purple-500/60 shadow-2xl animate-[pulse_3s_infinite]",
  },
  Legendary: {
    border: "border-transparent shadow-golden-glow shadow-2xl",
    badge: "bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 border-yellow-200 shadow-lg",
    glow: "animate-[pulse_4s_infinite]",
  },
  Mythical: {
    border: "border-transparent shadow-pink-400/50 shadow-2xl",
    badge: "bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white border-pink-200 shadow-lg",
    glow: "animate-[pulse_3s_infinite]",
  },
  Ultra: {
    border: "border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.5)]",
    badge: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-200 shadow-lg",
    glow: "shadow-cyan-400/90 shadow-[0_0_60px_rgba(34,211,238,0.6)] animate-[bounce_3s_infinite]",
  },
};

const TypeIcon = ({ type, className = "w-4 h-4" }) => {
  const icons = {
    fire: (
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.292 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    ),
    water: (
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    ),
    grass: (
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.5 0 10-2 5.5-5 8-8 8z" />
    ),
    electric: (
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    ),
    psychic: (
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    ),
    dragon: (
      <path d="M12 2L4 5v11c0 5.25 7 9 8 9s8-3.75 8-9V5l-8-3zm0 4.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5zM12 18c-2.5 0-4.5-2-4.5-4.5 0-1 .36-1.92.96-2.65L12 11l3.54-.15c.6.73.96 1.65.96 2.65 0 2.5-2 4.5-4.5 4.5z" />
    ),
    dark: (
      <path d="M12 3a9 9 0 0 0 9 9 9 9 0 1 1-9-9z" />
    ),
    fairy: (
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    ),
    ice: (
      <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07l14.14-14.14" />
    ),
    fighting: (
      <path d="M18 10V4h-6v6H6v6h6v6h6v-6h6v-6h-6z" />
    ),
    poison: (
      <circle cx="12" cy="12" r="10" />
    ),
    ground: (
      <path d="M2 12h20l-10-8-10 8zM22 12l-10 8-10-8h20z" />
    ),
    flying: (
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
    ),
    bug: (
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm-9 5c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9zm11.5 0c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5z" />
    ),
    rock: (
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    ),
    ghost: (
      <path d="M12 2c-4.97 0-9 4.03-9 9v11l3-1.5 3 1.5 3-1.5 3 1.5 3-1.5 3 1.5V11c0-4.97-4.03-9-9-9zM9 10c.83 0 1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5S8.17 10 9 10zm6 0c.83 0 1.5.67 1.5 1.5S15.83 13 15 13s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z" />
    ),
    steel: (
      <path d="M12 2L4 5v11l8 3 8-3V5l-8-3z" />
    ),
    normal: (
      <circle cx="12" cy="12" r="8" />
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {icons[type] || icons.normal}
    </svg>
  );
};

export default function PokemonCard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const primaryType = card.types[0] || "normal";
  const secondaryType = card.types[1] || primaryType;
  const gradient = TYPE_GRADIENTS[primaryType] || TYPE_GRADIENTS.normal;
  const rarityStyle = RARITY_STYLES[card.rarity] || RARITY_STYLES.Common;
  const glowColor = TYPE_GLOWS[primaryType] || TYPE_GLOWS.normal;

  return (
    <div
      className="group perspective-[1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`
          relative w-64 h-96 transition-all duration-700
          [transform-style:preserve-3d]
          group-hover:scale-105 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
          ${isFlipped ? "[transform:rotateY(180deg)]" : ""}
        `}
      >
        {/* ── FRONT ─────────────────────────────────────── */}
        <div
          className={`
            absolute inset-0 rounded-2xl overflow-hidden
            bg-gradient-to-br ${gradient}
            border-4 ${rarityStyle.border}
            backdrop-blur-md shadow-xl
            [backface-visibility:hidden]
            ${rarityStyle.glow}
            ${card.rarity === 'Mythical' ? 'holographic-shine' : ''}
          `}
        >
          {/* Custom SVG Border Overlays for High Rarity (Reliable & Premium) */}
          {(card.rarity === 'Legendary' || card.rarity === 'Mythical') && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible">
              <defs>
                <linearGradient id={`goldGrad-${card.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="50%" stopColor="#FFC300" />
                  <stop offset="100%" stopColor="#FFB000" />
                </linearGradient>
                
                <linearGradient id={`mythicGrad-${card.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C0C0C0">
                    <animate attributeName="stop-color" values="#C0C0C0;#00FFFF;#FF00FF;#FFFF00;#0000FF;#C0C0C0" dur="4s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#00FFFF">
                    <animate attributeName="stop-color" values="#00FFFF;#FF00FF;#FFFF00;#0000FF;#C0C0C0;#00FFFF" dur="4s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#C0C0C0">
                    <animate attributeName="stop-color" values="#C0C0C0;#00FFFF;#FF00FF;#FFFF00;#0000FF;#C0C0C0" dur="4s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                
                <filter id={`glow-${card.id}`}>
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <rect
                x="0" y="0" width="100%" height="100%"
                rx="16" ry="16"
                fill="none"
                stroke={card.rarity === 'Legendary' ? `url(#goldGrad-${card.id})` : `url(#mythicGrad-${card.id})`}
                strokeWidth="8"
                filter={`url(#glow-${card.id})`}
                className="opacity-90"
              />
            </svg>
          )}
          {/* Inner card frame */}
          <div className="flex flex-col h-full p-3 bg-black/10">
            {/* Header row */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 truncate">
                <div className={`${TYPE_COLORS[primaryType]} p-1 rounded-full text-white shadow-sm ring-1 ring-white/30`}>
                  <TypeIcon type={primaryType} className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-white font-black text-xl capitalize tracking-tight drop-shadow-md truncate">
                  {card.name}
                </h3>
              </div>
              <span
                className={`
                  text-[8px] font-black uppercase px-2.5 py-1 rounded-full text-white border
                  ${rarityStyle.badge}
                `}
              >
                {card.rarity}
              </span>
            </div>

            {/* Image area */}
            <div className="relative bg-black/20 rounded-xl flex items-center justify-center p-2 flex-shrink-0 h-44 border border-white/10 shadow-inner overflow-hidden">
               {/* Pattern / Aura Overlay */}
               <div className="absolute inset-0 opacity-15 pointer-events-none" 
                    style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '12px 12px' }} />
               
               {/* Radial Glow */}
               <div className="absolute inset-0 pointer-events-none" 
                    style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)` }} />

              {/* Pokéball watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <svg viewBox="0 0 100 100" className="w-40 h-40">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="4" />
                  <line x1="2" y1="50" x2="98" y2="50" stroke="white" strokeWidth="4" />
                  <circle cx="50" cy="50" r="14" fill="none" stroke="white" strokeWidth="4" />
                </svg>
              </div>
              
              <img
                src={card.image}
                alt={card.name}
                className="relative z-10 h-36 w-36 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]
                           transition-all duration-500 group-hover:scale-110 group-hover:rotate-x-6 group-hover:rotate-y-12"
              />
            </div>

            {/* Middle Bar: Types with tiny icons */}
            <div className="flex gap-2 mt-2 justify-center">
              {card.types.map((type) => (
                <div
                  key={type}
                  className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-md
                    ${TYPE_COLORS[type] || "bg-gray-400"} 
                    text-white shadow-sm border border-white/20
                  `}
                >
                  <TypeIcon type={type} className="w-2.5 h-2.5" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">{type}</span>
                </div>
              ))}
            </div>

            {/* Attacks */}
            <div className="mt-auto space-y-1.5">
              {card.attacks.map((atk, i) => (
                <AttackRow key={i} name={atk.name} power={atk.power} />
              ))}
            </div>

            {/* Footer */}
            <div className="mt-3 flex flex-col items-center gap-0.5 pointer-events-none">
              <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.1em]">
                #{String(card.id).padStart(3, "0")} · {card.genus}
              </p>
              <p className="text-white/30 text-[7px] font-bold uppercase tracking-[0.2em]">
                GEN 1 · {card.types.join(" / ")} TYPE
              </p>
            </div>
          </div>
        </div>

        {/* ── BACK ──────────────────────────────────────── */}
        <div
          className={`
            absolute inset-0 rounded-2xl overflow-hidden
            bg-gradient-to-br from-indigo-950 to-slate-900
            border-4 border-slate-800
            [backface-visibility:hidden] [transform:rotateY(180deg)]
            flex items-center justify-center shadow-2xl
          `}
        >
          <div className="text-center p-6 space-y-4">
            {/* Large Pokéball */}
            <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto opacity-40 animate-pulse">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#818cf8" strokeWidth="3" />
              <line x1="2" y1="50" x2="98" y2="50" stroke="#818cf8" strokeWidth="3" />
              <circle cx="50" cy="50" r="14" fill="none" stroke="#818cf8" strokeWidth="3" />
              <circle cx="50" cy="50" r="6" fill="#818cf8" />
            </svg>
            <div className="space-y-1">
              <p className="text-indigo-400 font-black text-xl tracking-[0.3em] uppercase">
                Snorlax
              </p>
              <div className="h-0.5 w-12 bg-indigo-500 mx-auto rounded-full" />
            </div>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase">
              Collector Edition
            </p>
          </div>
        </div>
      </div>
      <style>{`
        .shadow-golden-glow {
          box-shadow: 0 0 25px rgba(255, 215, 0, 0.4), 0 0 50px rgba(255, 176, 0, 0.2);
        }

        .holographic-shine::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            125deg,
            transparent 0%,
            transparent 30%,
            rgba(255, 255, 255, 0.3) 45%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0.3) 55%,
            transparent 70%,
            transparent 100%
          );
          background-size: 200% 200%;
          animation: shineSweep 4s infinite linear;
          pointer-events: none;
        }

        @keyframes shineSweep {
          0% { background-position: 200% 0%; }
          100% { background-position: -200% 0%; }
        }
      `}</style>
    </div>
  );
}
