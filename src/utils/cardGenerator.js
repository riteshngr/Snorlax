/**
 * cardGenerator.js — Utility that turns raw PokeAPI data
 * into a finished card object with attacks, power, and rarity.
 */

/**
 * Pick `count` random items from an array.
 */
function pickRandom(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Generate a random attack power between 0 and 100.
 */
function randomPower() {
  return Math.floor(Math.random() * 101);
}

/**
 * Determine card rarity based on Pokemon properties and stats.
 *
 * Rules:
 *   isMythical   → Mythical
 *   isLegendary  → Legendary
 *   BST > 600    → Ultra
 *   BST 521–600  → Epic
 *   BST 451–520  → Rare
 *   BST 351–450  → Uncommon
 *   BST <= 350   → Common
 */
function getRarity(pokemon) {
  if (pokemon.isMythical) return "Mythical";
  if (pokemon.isLegendary) return "Legendary";

  // Calculate Base Stat Total (sum of all stats)
  const bst = pokemon.stats.reduce((acc, s) => acc + s.value, 0);

  if (bst >= 600) return "Ultra";
  if (bst > 520) return "Epic";
  if (bst > 450) return "Rare";
  if (bst > 350) return "Uncommon";
  return "Common";
}

/**
 * Build a full card object from the enriched Pokemon data.
 *
 * @param {{ id, name, image, types, moves, stats, isLegendary, isMythical, genus }} pokemon
 * @returns {{ id, name, image, types, attacks, rarity, genus }}
 */
export function generateCard(pokemon) {
  // Determine rarity from intrinsic Pokemon data
  const rarity = getRarity(pokemon);

  // Pick 2 random moves
  const selectedMoves = pickRandom(pokemon.moves, 2);

  // Create attack objects with random power
  const attacks = selectedMoves.map((moveName) => ({
    name: moveName.replace(/-/g, " "),
    power: randomPower(),
  }));

  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.image,
    types: pokemon.types,
    genus: pokemon.genus,
    attacks,
    rarity,
  };
}
