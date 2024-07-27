import {pokemonType} from '@customTypes/pokemonType';
import pokemonEffectiveness from '@customTypes/pokemonEffectiveness';
import individualEffectiveness from '@customTypes/individualEffectiveness';
import {pokemonType_ES} from '@customTypes/pokemonType_ES';

export class Pokemon{
    static getEffectivenesses(pokemonTypes: pokemonType[]): pokemonEffectiveness{
        const pokemonEffectivenesses = {
            "FIRE": 1, "NORMAL": 1, "WATER": 1, "GRASS": 1,
            "ELECTRIC": 1, "ICE": 1, "FIGHTING": 1, "POISON": 1,
            "GROUND": 1, "FLYING": 1, "PSYCHIC": 1, "BUG": 1,
            "ROCK": 1, "GHOST": 1, "DRAGON": 1, "DARK": 1,
            "STEEL": 1, "FAIRY": 1
        };
        const pokemonStrengths: individualEffectiveness[] = [];
        const pokemonWeaknesses: individualEffectiveness[] = [];
        const pokemonImmune: individualEffectiveness[] = [];

        for(const type of pokemonTypes){
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const typeStrengths = effectivenesses[type.toUpperCase()].strengths;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const typeWeaknesses = effectivenesses[type.toUpperCase()].weaknesses;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const typeImmune = effectivenesses[type.toUpperCase()].immune;

            for(const strength of typeStrengths){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonEffectivenesses[strength] = pokemonEffectivenesses[strength]/2;
            }
            for(const weakness of typeWeaknesses){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonEffectivenesses[weakness] = pokemonEffectivenesses[weakness]*2;
            }
            for(const immune of typeImmune){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonEffectivenesses[immune] = 0;
            }
        }

        for (const effectiveness of Object.keys(pokemonEffectivenesses)){
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if(pokemonEffectivenesses[effectiveness] > 1){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonWeaknesses.push({type:effectiveness, effectiveness:pokemonEffectivenesses[effectiveness]})
            }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            else if(pokemonEffectivenesses[effectiveness] < 1 && pokemonEffectivenesses[effectiveness] > 0){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonStrengths.push({type:effectiveness, effectiveness:pokemonEffectivenesses[effectiveness]})
            }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            else if (pokemonEffectivenesses[effectiveness] === 0){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pokemonImmune.push({type:effectiveness, effectiveness:pokemonEffectivenesses[effectiveness]})
            }
        }
        return {
            strengths: pokemonStrengths,
            weaknesses: pokemonWeaknesses,
            immune: pokemonImmune
        }
    }

    static translateType( type: string ): string{
        return pokemonType_ES[type.toUpperCase() as keyof typeof pokemonType_ES];
    }
}