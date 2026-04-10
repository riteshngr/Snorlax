import { serverTimestamp } from "firebase/firestore";

/**
 * shop.js — Configuration and logic for the rotating Stone Shop.
 */

export const RESTOCK_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes for dev

export const STONE_METADATA = {
  "fire-stone": { name: "Fire Stone", rarity: "Common", price: 200, stock: 5, emoji: "🔥" },
  "water-stone": { name: "Water Stone", rarity: "Common", price: 200, stock: 5, emoji: "💧" },
  "leaf-stone": { name: "Leaf Stone", rarity: "Common", price: 200, stock: 5, emoji: "🍃" },
  "thunder-stone": { name: "Thunder Stone", rarity: "Common", price: 250, stock: 5, emoji: "⚡" },
  "ice-stone": { name: "Ice Stone", rarity: "Rare", price: 500, stock: 3, emoji: "❄️" },
  "moon-stone": { name: "Moon Stone", rarity: "Rare", price: 550, stock: 3, emoji: "🌙" },
  "sun-stone": { name: "Sun Stone", rarity: "Rare", price: 600, stock: 3, emoji: "☀️" },
  "dusk-stone": { name: "Dusk Stone", rarity: "Legendary", price: 900, stock: 1, emoji: "🌑" },
  "dawn-stone": { name: "Dawn Stone", rarity: "Legendary", price: 1000, stock: 1, emoji: "🌅" },
  "shiny-stone": { name: "Shiny Stone", rarity: "Mythical", price: 2000, stock: 1, emoji: "✨" },
};

const POOLS = {
  Common: ["fire-stone", "water-stone", "leaf-stone", "thunder-stone"],
  Rare: ["ice-stone", "moon-stone", "sun-stone"],
  Legendary: ["dusk-stone", "dawn-stone"],
  Mythical: ["shiny-stone"],
};

/**
 * Probabilities provided by user
 * Total: 70 + 28.9 + 1 + 0.1 = 100%
 */
const BASE_CHANCES = {
  Common: 70,
  Rare: 28.9,
  Legendary: 1,
  Mythical: 0.1,
};

/**
 * Roll a random rarity based on the weights.
 * 0 – 70 → Common
 * 70 – 98.9 → Rare
 * 98.9 – 99.9 → Legendary
 * 99.9 – 100 → Mythical
 */
function rollRarity(chances = BASE_CHANCES) {
  const total = Object.values(chances).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;

  for (const [rarity, weight] of Object.entries(chances)) {
    if (roll < weight) return rarity;
    roll -= weight;
  }
  return "Common";
}

function getRandomFromPool(poolName) {
  const pool = POOLS[poolName];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Generates a stock map for ALL items in STONE_METADATA.
 * It initializes all to 0, then performs 4 universal rolls 
 * based on the rarity probabilities.
 */
export function generateShopStock() {
  // 1. Initialize all stones with 0 stock
  const stockMap = {};
  Object.keys(STONE_METADATA).forEach(id => {
    stockMap[id] = 0;
  });

  // 2. Perform 4 rolls to assign stock
  // Each roll now follows the exact global probability distribution
  for (let i = 0; i < 4; i++) {
    const rarity = rollRarity();
    const stoneId = getRandomFromPool(rarity);
    
    // Assign stock based on the metadata (Common: 5, Rare: 3, etc.)
    stockMap[stoneId] = STONE_METADATA[stoneId].stock;
  }

  return stockMap;
}
