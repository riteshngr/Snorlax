/**
 * AttackRow — Renders a single Pokemon attack in a game-like format.
 *
 * Props:
 *   name: Move name
 *   power: Attack power value
 */
export default function AttackRow({ name, power }) {
  return (
    <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/5 hover:bg-white/20 transition-colors group/row">
      <div className="flex items-center gap-2">
        {/* Star Icon (✦) */}
        <div className="w-5 h-5 flex items-center justify-center text-yellow-500 group-hover/row:scale-110 transition-transform drop-shadow-[0_0_5px_rgba(234,179,8,0.3)]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
             <path d="M12 2l2.4 7.6 7.6 2.4-7.6 2.4-2.4 7.6-2.4-7.6-7.6-2.4 7.6-2.4z" />
          </svg>
        </div>
        <span className="text-white font-bold text-sm capitalize truncate tracking-wide">
          {name}
        </span>
      </div>
      
      <div className="flex items-center bg-black/40 rounded px-2 py-0.5 border border-white/10 shadow-inner">
        <span className="text-yellow-400 font-black text-xs">
          {power}
        </span>
        <span className="text-white/40 text-[8px] ml-1 font-bold">PWR</span>
      </div>
    </div>
  );
}
