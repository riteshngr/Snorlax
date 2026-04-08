import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function PokeballSplash({ children }) {
  // Acts as the lock for your app. False = Closed, True = Open.
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If they scroll down with a mouse wheel, open the ball
    const handleWheel = (e) => {
      if (e.deltaY > 0 && !isOpen) {
        setIsOpen(true);
      }
    };

    // If they swipe up on a trackpad or phone, open the ball
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      const touchEndY = e.touches[0].clientY;
      if (touchStartY - touchEndY > 50 && !isOpen) {
        setIsOpen(true); 
      }
    };

    window.addEventListener("wheel", handleWheel);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isOpen]);

  const ProfessionalPokeball = () => (
    <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-2xl">
      <defs>
        <radialGradient id="redGlow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff4b4b" />
          <stop offset="80%" stopColor="#cc0000" />
          <stop offset="100%" stopColor="#8a0000" />
        </radialGradient>
        <radialGradient id="whiteGlow" cx="50%" cy="10%" r="90%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#999999" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="#1a1a1a" />
      <path d="M 4 100 A 96 96 0 0 1 196 100 Z" fill="url(#redGlow)" />
      <path d="M 4 100 A 96 96 0 0 0 196 100 Z" fill="url(#whiteGlow)" />
      <rect x="2" y="94" width="196" height="12" fill="#1a1a1a" />
      <circle cx="100" cy="100" r="30" fill="#1a1a1a" />
      <circle cx="100" cy="100" r="22" fill="#f5f5f5" stroke="#cccccc" strokeWidth="2" />
      <circle cx="100" cy="100" r="14" fill="#ffffff">
        {/* The button pulses fast when open, slow when closed */}
        <animate 
          attributeName="opacity" 
          values="0.7;1;0.7" 
          dur={isOpen ? "0.5s" : "2s"} 
          repeatCount="indefinite" 
        />
      </circle>
    </svg>
  );

  return (
    // Fixed inset-0 locks the app to the screen. overflow-hidden kills the buggy scrollbar.
    <div 
      className="fixed inset-0 h-screen w-screen overflow-hidden bg-gray-900"
      onClick={() => setIsOpen(true)} // Also lets the user just click anywhere to enter
    >
      
      {/* 1. THE ACTUAL APP */}
      {/* Fades in smoothly after a tiny delay so the ball has time to split */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute inset-0 z-10 flex h-full w-full flex-col"
      >
        {children}
      </motion.div>

      {/* 2. THE SPLITTING POKEBALL */}
      {/* Pointer events none ensures once it's open, you can click the app underneath */}
      <div className={`absolute inset-0 z-50 flex items-center justify-center ${isOpen ? 'pointer-events-none' : ''}`}>
        
        <div className="relative h-[90vw] w-[90vw] max-h-[800px] max-w-[800px] md:h-[80vh] md:w-[80vh]">
          
          {/* Top Half animates UP (-100%) when isOpen is true */}
          <motion.div
            initial={{ y: "0%" }}
            animate={{ y: isOpen ? "-100%" : "0%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
            className="absolute inset-0"
          >
            <ProfessionalPokeball />
          </motion.div>

          {/* Bottom Half animates DOWN (100%) when isOpen is true */}
          <motion.div
            initial={{ y: "0%" }}
            animate={{ y: isOpen ? "100%" : "0%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)" }}
            className="absolute inset-0"
          >
            <ProfessionalPokeball />
          </motion.div>

        </div>

      </div>
      
    </div>
  );
}