import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ClickSparkEffect — A lightweight global effect component.
 * It listens for clicks and spawns a temporary cluster of particles.
 */
export default function ClickSparkEffect() {
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    const handleMouseDown = (e) => {
      const id = Date.now();
      const newSpark = {
        id,
        x: e.clientX,
        y: e.clientY,
      };

      setSparks((prev) => [...prev, newSpark]);

      // Automatic cleanup after 600ms
      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => s.id !== id));
      }, 600);
    };

    window.addEventListener("mousedown", handleMouseDown);
    return () => window.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {sparks.map((spark) => (
          <SparkGroup key={spark.id} x={spark.x} y={spark.y} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function SparkGroup({ x, y }) {
  // Create 8 particles for every click
  const particles = Array.from({ length: 8 });

  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
    >
      {particles.map((_, i) => {
        // Random trajectory for each particle
        const angle = (i * 45) + (Math.random() * 20); // Spread them in a circle
        const distance = 40 + Math.random() * 40;
        const tx = Math.cos((angle * Math.PI) / 180) * distance;
        const ty = Math.sin((angle * Math.PI) / 180) * distance;

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1.5, opacity: 1 }}
            animate={{ 
              x: tx, 
              y: ty, 
              scale: 0, 
              opacity: 0 
            }}
            transition={{ 
              duration: 0.5, 
              ease: "easeOut" 
            }}
            className="absolute w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            style={{ 
              backgroundColor: i % 2 === 0 ? "#ff4444" : "#ff0000" // Alternate between bright and deep red
            }}
          />
        );
      })}
    </div>
  );
}
