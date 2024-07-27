import axios from 'axios';
import pokemonStats from '@customTypes/pokemonStats';
import pokemonInfo from '@customTypes/pokemonInfo';
import pokemonMove from '@customTypes/pokemonMove';
import { ObjectType } from '@customTypes/objectType';
import { imagePosition } from '@customTypes/imagePosition';
import { generation } from '@customTypes/generation';
import PokemonEdition from '@customTypes/pokemonEdition';
import PokemonMoveInfo from '@customTypes/pokemonMoveInfo';
import { Time } from '@quimikuaxh/common';

export class Pokeapi {
    private static API_URL = 'https://pokeapi.co/api/v2';
    private static POKEMON_LIST_URL = Pokeapi.API_URL + '/pokemon/?offset=0&limit=9999';
    private static POKEMON_VARIETY_URL = Pokeapi.API_URL + '/pokemon';

    /**
     * @description Gets an array with all the existing Pokémon names
     * @returns Array with all the existing Pokémon names
     */
    static async getPokemonListFromAPI(): Promise<string[]>{
        const pokemonList: string[] = [];

        const result = await axios.get(this.POKEMON_LIST_URL);
        const data = await result.data;

        for(const pokemon of data.results){
            pokemonList.push(pokemon.name);
        }
        return pokemonList
    }

    /**
     * @description Returns Pokémon variety info.
     * @param pokemon - Pokémon variety name
     * @returns Pokémon info, including name, id, types, stats, moves and abilities
     */
    static async getPokemonVarietyInfo(pokemon: string): Promise<pokemonInfo>{
        // eslint-disable-next-line no-console
        const varietyResult = await axios.get(`${this.POKEMON_VARIETY_URL}/${pokemon}`);
        const varietyData = await varietyResult.data;

        const pokemonSpecies = await axios.get(varietyData.species.url);
        const speciesData = await pokemonSpecies.data;
        const id = speciesData.id;

        const types = this.getTypes(varietyData);
        const stats = this.getStats(varietyData);

        const moves = await this.getPokemonMoves(varietyResult);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const abilities: string[] = varietyData.abilities.map((ability) =>  {
            return ability.ability.name;
        })

        const res = {
            name: varietyData.name,
            id: id,
            types: types,
            stats: stats,
            moves: moves,
            abilities: abilities,
        };
        return res;
    }

    private static getTypes(data: ObjectType): string[] {
        const types = [];
        for(const type of data.types) {
            types.push(type.type.name as string)
        }
        return types;
    }

    private static getVarieties(data: ObjectType): string[] {
        const varieties = [];
        for(const variety of data.varieties) {
            varieties.push(variety.pokemon.url as string)
        }
        return varieties;
    }

    private static getStats(data: ObjectType): pokemonStats {
        const stats = {} as pokemonStats
        for(const stat of data.stats){
            switch(stat.stat.name){
                case 'hp': {
                    stats.hp = stat.base_stat;
                    break;
                }
                case 'attack': {
                    stats.attack = stat.base_stat;
                    break;
                }
                case 'defense': {
                    stats.defense = stat.base_stat;
                    break;
                }
                case 'special-attack': {
                    stats.spAtk = stat.base_stat;
                    break;
                }
                case 'special-defense': {
                    stats.spDef = stat.base_stat;
                    break;
                }
                case 'speed': {
                    stats.speed = stat.base_stat;
                    break;
                }
                default: {
                    // eslint-disable-next-line no-console
                    console.error('ERROR: A not valid stat has been received.')
                }
            }
        }
        return stats;
    }

    private static async getPokemonMoves(pokemon: ObjectType): Promise<PokemonEdition[]>{
        const movesByEdition: ObjectType[] = [];
        const editionList: string[] = [];
        const res: PokemonEdition[] = [];

        //First, we obtain the pokémon with the list of moves it can learn
        const data = pokemon.data;
        const moves = data.moves;
        const promises = [];
        let count = 0;

        //For each move, we get its info and each version in which the pokémon can learn the move
        for(const move of moves) {
            const moveURL = move.move.url;

            const moveName = move.move.name;
            const editions = move.version_group_details;

            // To not saturate PokeAPI, each 40 requests we establish a wait
            if(++count === 40) {
                count = 0;
                await Time.sleep(1000);
            }

            promises.push(this.getAsyncPokemonMove(moveName, editions, moveURL));
        }

        const movesAfterPromise = await Promise.all(promises);
        for (const move of movesAfterPromise){
            for(const moveByEdition of move){
                const edition = moveByEdition.edition;
                if(!editionList.includes(edition)){
                    editionList.push(edition);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    movesByEdition[edition] = []
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                movesByEdition[edition].push(moveByEdition.data);
            }
        }

        for(const edition of editionList){
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const editionMoves: PokemonMoveInfo[] = movesByEdition[edition];
            res.push({
                edition: edition,
                moves: editionMoves,
            })
        }
        return res;
    }

    // function used to get the moves asynchronously
    private static async getAsyncPokemonMove(name: string, editions: ObjectType, url: string): Promise<pokemonMove[]>{
        const res: pokemonMove[] = [];
        //Now we are getting the move info
        const moveInfo = await axios.get(url);
        const moveData = await moveInfo.data;

        const effectChance = moveData.effect_chance == null ? 0 : moveData.effect_chance;
        let description = moveData.effect_entries[moveData.effect_entries.length-1]?.effect;
        description = description?.replace('$effect_chance%', effectChance);
        //If accuracy or power are null, it takes no effect on the move
        const accuracy = moveData.accuracy == null ? 101 : moveData.accuracy;
        const power = moveData.power == null ? 0 : moveData.power;

        editions.forEach((edition: ObjectType) => {
            const editionName = edition.version_group.name
            const levelLearnt = edition.level_learned_at == null ? 0 : edition.level_learned_at;

            res.push({
                edition: editionName,
                data: {
                    'move': name,
                    'levelLearnt': levelLearnt,
                    'accuracy': accuracy,
                    'power': power,
                    'description': description,
                    'effect_chance': effectChance
                }
            });
        });
        return res;
    }

    static async getImageURL(name: string, gen: number, game: string, animated: boolean,
                             front: boolean, female: boolean, shiny: boolean): Promise<string>{
        const image_position = this.getImagePosition(front, female, shiny)
        const result = await axios.get(this.API_URL + '/'+ name);
        const data = await result.data;
        return animated ? data['sprites']['versions'][generation[gen]][game]['animated'][imagePosition[image_position]]
            : data['sprites']['versions'][generation[gen]][game][imagePosition[image_position]];
    }

    private static getImagePosition(front: boolean, female: boolean, shiny: boolean): imagePosition{
        switch(true){
            case (front && female && shiny): {
                return imagePosition.front_shiny_female;
            }
            case (front && !female && shiny): {
                return imagePosition.front_shiny;
            }
            case (front && !female && !shiny): {
                return imagePosition.front_default;
            }
            case (front && female && !shiny): {
                return imagePosition.front_female;
            }
            case (!front && female && shiny): {
                return imagePosition.back_shiny_female;
            }
            case (!front && !female && shiny): {
                return imagePosition.back_shiny;
            }
            case (!front && !female && !shiny): {
                return imagePosition.back_default;
            }
            case (!front && female && !shiny): {
                return imagePosition.back_female;
            }
            default: return imagePosition.front_default;
        }
    }
}