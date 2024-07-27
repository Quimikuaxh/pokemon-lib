import pokemonStats from "./pokemonStats";
import PokemonEdition from "./pokemonEdition";

export default interface pokemonInfo {
    name: string,
    id: number,
    types: string[],
    stats: pokemonStats,
    moves?: PokemonEdition[],
    abilities: string[],
}