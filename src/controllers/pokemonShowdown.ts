import pokemonStats from '../types/pokemonStats';

export class PokemonShowdown {
    static getEVsIVs(evsivs: string[], isEvs: boolean): pokemonStats{
        let res: pokemonStats;
        if(isEvs){
            res = {
                hp: 0,
                attack: 0,
                defense: 0,
                spAtk: 0,
                spDef: 0,
                speed: 0
            };
        }
        else{
            res = {
                hp: 31,
                attack: 31,
                defense: 31,
                spAtk: 31,
                spDef: 31,
                speed: 31
            };
        }
        for(const iv of evsivs){
            if(iv.includes('HP')){
                res.hp = Number(iv.replace('HP', '').trim())
            }
            else if(iv.includes('Atk')){
                res.attack = Number(iv.replace('Atk', '').trim())
            }
            else if(iv.includes('Def')){
                res.defense = Number(iv.replace('Def', '').trim())
            }
            else if(iv.includes('SpA')){
                res.spAtk = Number(iv.replace('SpA', '').trim())
            }
            else if(iv.includes('SpD')){
                res.spDef = Number(iv.replace('SpD', '').trim())
            }
            else if(iv.includes('Spe')){
                res.speed = Number(iv.replace('Spe', '').trim())
            }
        }
        return res;
    }
}