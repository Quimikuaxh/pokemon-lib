import PokemonMoveInfo from "./pokemonMoveInfo";

export default interface PokemonEdition {
    edition: string,
    moves: PokemonMoveInfo[]
}