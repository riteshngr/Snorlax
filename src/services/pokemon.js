import { SPAWN_POOLS } from "../data/rarityPools";
import { GEN1_BY_TYPE } from "../data/pokemonGroups";

const POKEAPI_BASE = "https://pokeapi.co/api/v2/pokemon";
const POKEAPI_SPECIES_BASE = "https://pokeapi.co/api/v2/pokemon-species";

/**
 * Fetch a random Pokemon from PokeAPI along with its species data.
 * RETURNS rarity first logic:
 *   1. Roll Rarity (70% Common, 28.9% Rare, 1% Legendary, 0.1% Mythical)
 *   2. Pick ID from that pool (with weather weight)
 */
export async function fetchRandomPokemon(boostedType = null) {
  // 1. Roll for Rarity Tier
  const r = Math.random() * 100;
  let poolKey = "common";
  
  if (r < 70) poolKey = "common";
  else if (r < 98.9) poolKey = "rare";
  else if (r < 99.9) poolKey = "legendary";
  else poolKey = "mythical";

  const idPool = SPAWN_POOLS[poolKey];
  let randomId;

  // 2. Pick ID from the selected pool (implementing weather boost if applicable)
  if (boostedType) {
    // Check which IDs in our current rarity pool match the boosted type
    const boostedIdsInPool = idPool.filter(id => {
        const typeGroup = GEN1_BY_TYPE[boostedType] || [];
        return typeGroup.includes(id);
    });

    if (boostedIdsInPool.length > 0) {
      // Weighted selection within the tier
      const countBoosted = boostedIdsInPool.length;
      const countNormal = idPool.length - countBoosted;
      const totalWeight = (countBoosted * 1.25) + countNormal;
      const roll = Math.random() * totalWeight;

      if (roll < countBoosted * 1.25) {
        randomId = boostedIdsInPool[Math.floor(Math.random() * boostedIdsInPool.length)];
      } else {
        const normalIdsInPool = idPool.filter(id => !boostedIdsInPool.includes(id));
        randomId = normalIdsInPool[Math.floor(Math.random() * normalIdsInPool.length)];
      }
    } else {
      randomId = idPool[Math.floor(Math.random() * idPool.length)];
    }
  } else {
    randomId = idPool[Math.floor(Math.random() * idPool.length)];
  }

  // Fetch both endpoints concurrently
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${POKEAPI_BASE}/${randomId}`),
    fetch(`${POKEAPI_SPECIES_BASE}/${randomId}`),
  ]);

  if (!pokemonRes.ok || !speciesRes.ok) {
    throw new Error(`Failed to fetch Pokemon or Species data for #${randomId}`);
  }

  const [pokemonData, speciesData] = await Promise.all([
    pokemonRes.json(),
    speciesRes.json(),
  ]);

  // Extract the English genus (e.g. "Seed Pokemon")
  const genusEntry = speciesData.genera.find((g) => g.language.name === "en");
  const speciesGenus = genusEntry ? genusEntry.genus : "Unknown Pokemon";

  return {
    id: pokemonData.id,
    name: pokemonData.name,
    image:
      pokemonData.sprites.other["official-artwork"].front_default ||
      pokemonData.sprites.front_default,
    types: pokemonData.types.map((t) => t.type.name),
    moves: pokemonData.moves.map((m) => m.move.name),
    // Stats for rarity calculation
    stats: pokemonData.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    // Rarity flags from species api
    isLegendary: speciesData.is_legendary,
    isMythical: speciesData.is_mythical,
    genus: speciesGenus,
  };
}

/**
 * Fetch a specific Pokemon by ID from PokeAPI along with its species data.
 * Used for targeted evolutions.
 */
export async function fetchPokemonById(id) {
  // Fetch both endpoints concurrently
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${POKEAPI_BASE}/${id}`),
    fetch(`${POKEAPI_SPECIES_BASE}/${id}`),
  ]);

  if (!pokemonRes.ok || !speciesRes.ok) {
    throw new Error(`Failed to fetch Pokemon or Species data for #${id}`);
  }

  const [pokemonData, speciesData] = await Promise.all([
    pokemonRes.json(),
    speciesRes.json(),
  ]);

  // Extract the English genus
  const genusEntry = speciesData.genera.find((g) => g.language.name === "en");
  const speciesGenus = genusEntry ? genusEntry.genus : "Unknown Pokemon";

  return {
    id: pokemonData.id,
    name: pokemonData.name,
    image:
      pokemonData.sprites.other["official-artwork"].front_default ||
      pokemonData.sprites.front_default,
    types: pokemonData.types.map((t) => t.type.name),
    moves: pokemonData.moves.map((m) => m.move.name),
    stats: pokemonData.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    isLegendary: speciesData.is_legendary,
    isMythical: speciesData.is_mythical,
    genus: speciesGenus,
  };
}
