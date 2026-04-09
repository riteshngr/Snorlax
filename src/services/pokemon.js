/**
 * pokemon.js — Service layer for fetching Pokemon data from PokeAPI.
 *
 * Exports a single function that grabs a random Pokemon
 * (IDs 1–151, the original generation) and returns the
 * fields the card generator needs.
 */

const POKEAPI_BASE = "https://pokeapi.co/api/v2/pokemon";
const POKEAPI_SPECIES_BASE = "https://pokeapi.co/api/v2/pokemon-species";

/**
 * Fetch a random Pokemon from PokeAPI along with its species data.
 * Returns an enriched object with: id, name, image, types, moves, stats, rarity info.
 */
export async function fetchRandomPokemon() {
  // Pick a random ID between 1 and 151 (Gen 1)
  const randomId = Math.floor(Math.random() * 151) + 1;

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
