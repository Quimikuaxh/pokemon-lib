export default interface PokemonMoveInfo {
    move: string,
    levelLearnt: number,
    accuracy?: number,
    power?: number,
    description: string,
    effect_chance: number
}