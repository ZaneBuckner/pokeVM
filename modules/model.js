import { renderDom } from './view.js';

export const Pokemon = (function () {
    let isInitiated = false;
    let id = 1;
    let currentName = '';
    let isPokemonSpecial;
    if (!isInitiated) { init(), isInitiated = true };

    //// FETCH DATA; GET DATA OBJECTS (MOVES, EVOLUTION, DAMAGE-RELATIONS); RENDER DOM
    async function fetchStrengths(query) {
        const urls = await fetchTraits(query);
        const promises = urls.map(url => fetch(url));
        Promise.all(promises).then(responses => Promise.all(responses.map(res => res.json())))
            .then(dataObjects => {

                //// PROCESS DATA OBJECTS; INVOKE METHODS ACCORDINGLY
                (function processDataObjects() {
                    let movesData = [], evolutionData = '', damageRelationsData = [];
                    dataObjects.forEach(object => {
                        const referenceKey = Object.keys(object)[0];
                        if (referenceKey === 'accuracy')            { movesData.push(object) };
                        if (referenceKey === 'baby_trigger_item')   { evolutionData = object };
                        if (referenceKey === 'damage_relations')    { damageRelationsData.push(object) };
                    });
                    
                    getMoves(movesData);
                    getEvolution(evolutionData);
                    getDamageRelations(damageRelationsData);
                })(dataObjects);

                //// BUILD NORMAL/SPECIAL MOVE OBJECTS; RENDER DOM
                function getMoves(data) {
                    renderDom().moves(
                        getNormalMove(data[0]),
                        getSpecialMove(data[1])
                    );

                    function getNormalMove(data) {
                        if (data === undefined) { return 'none' }
                        return {
                            name: data.name,
                            power: data.pp,
                            type: data.type.name
                        };
                    };

                    function getSpecialMove(data) {
                        if (data === undefined) { return 'none' }
                        return {
                            name: data.name,
                            power: data.pp,
                            type: data.type.name,
                            details: getUniqueDetails(data.flavor_text_entries)
                        };

                        function getUniqueDetails (entries) {
                            let englishEntries = [];
                            entries.forEach(entry => {
                                if (entry.language.name.includes('en')) { englishEntries.push(entry.flavor_text) };
                            });

                            let uniqueEntries = [...new Set(englishEntries)];
                            let random = Math.floor(Math.random() * uniqueEntries.length);
                            return uniqueEntries[random];
                        };
                    };
                };

                //// BUILD EVOLUTION FAMILY TREE OBJECT; RENDER DOM
                function getEvolution(data) {
                    renderDom().evolution(
                        getEvolutionObject(data.chain)
                    );

                    function getEvolutionObject(data) {
                        const hasDivergentEvolution = data.evolves_to.length > 1;
                        const hasBaby = data.is_baby;

                        if (hasDivergentEvolution) {
                            return {
                                baby: data?.species.name,
                                basic: divergentEvolution(data),
                                stage1: 'none',
                                stage2: 'none'
                            };

                            function divergentEvolution(data) {
                                return data.evolves_to.map(item => item.species.name);
                            };
                        }
                        else if (hasBaby) {
                            return {
                                baby: data?.species.name,
                                basic: data.evolves_to[0]?.species.name,
                                stage1: data.evolves_to[0]?.evolves_to[0]?.species.name,
                                stage2: data.evolves_to[0]?.evolves_to[0]?.evolves_to[0]?.species.name
                            };
                        };
                        return {
                            baby: 'none',
                            basic: data?.species.name,
                            stage1: data.evolves_to[0]?.species.name,
                            stage2: data.evolves_to[0]?.evolves_to[0]?.species.name
                        };
                    };
                };

                //// BUILD INCURRED DAMAGE STATS OBJECT; RENDER DOM
                function getDamageRelations(data) {
                    renderDom().damage(
                        getDamageObject(data)
                    );

                    function getDamageObject (data) {
                        const [halfDamage, doubleDamage] = getDamageGroups(data);
                        let resistance = {}, weakness = {};

                        halfDamage.forEach(type => {
                            if (resistance.hasOwnProperty(type)) { return resistance[type] *= 0.5 }
                            Object.assign(resistance, { [type]: 0.5 });
                        });

                        doubleDamage.forEach(type => {
                            if (weakness.hasOwnProperty(type)) { return weakness[type] *= 2 }
                            Object.assign(weakness, { [type]: 2 });
                        });

                        return { resistance, weakness };
                    };

                    function getDamageGroups (data) {
                        let noDamage = [];
                        data.forEach(object => {
                            const noDamageProp = object.damage_relations.no_damage_from;
                            noDamageProp.map(item => noDamage.push(item.name));
                        });

                        let halfDamage = [], doubleDamage = [];
                        data.forEach(type => {
                            const halfDamageProp = type.damage_relations.half_damage_from;
                            const doubleDamageProp = type.damage_relations.double_damage_from;

                            halfDamageProp.map(item => {
                                noDamage.includes(item.name) ? '' : halfDamage.push(item.name)
                            });

                            doubleDamageProp.map(item => {
                                noDamage.includes(item.name) ? '' : doubleDamage.push(item.name)
                            });
                        });

                        return [halfDamage, doubleDamage];
                    };
                };
            })
            .catch(error => console.log(error));
    };


    //// FETCH DATA; GET DATA OBJECT (TRAITS); RENDER DOM; RETURN URLS
    async function fetchTraits(query) {
        const fetchPokemon = fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        const fetchSpecies = fetch(`https://pokeapi.co/api/v2/pokemon-species/${query}`);
        const promises = [fetchPokemon, fetchSpecies];
        return Promise.all(promises).then(responses => Promise.all(responses.map(res => res.json())))
            .then(([pokemon, species]) => {
                
                //// BUILD TRAITS OBJECT; RENDER DOM; RETURN URLS
                function getTraits(data) {
                    const urls = [
                        ...getUniqueMoves(pokemon.moves),
                        species['evolution_chain'].url,
                        ...pokemon.types.map(type => type.type.url)
                    ];

                    renderDom().traits({
                        id: pokemon.id,
                        name: pokemon.name,
                        weight: pokemon.weight,
                        height: pokemon.height,
                        hp: pokemon.stats[0].base_stat,
                        genus: species.genera[7].genus,
                        evolvesFrom: species.evolves_from_species?.name,
                        types: pokemon.types.map(type => type.type.name),
                        generation: getGeneration(species.generation.name),
                        uniqueFact: getUniqueFacts(species.flavor_text_entries),
                        forms: species.varieties.map(variety => variety.pokemon.name),
                        image: pokemon.sprites.other['official-artwork'].front_default,
                        filters: {
                            mythical: species.is_mythical,
                            legendary: species.is_legendary,
                            gendered: species.has_gender_differences,
                        }
                    });

                    currentName = pokemon.name;
                    isPokemonSpecial = checkSpecialStatus(species);
                    
                    function checkSpecialStatus(species) {
                        const status = {
                            baby: species.is_baby,
                            mythical: species.is_mythical,
                            legendary: species.is_legendary
                        };

                        for (let prop in status) {
                            if (status[prop]) { return prop }
                        }
                        return '';
                    };

                    function getGeneration(generationValue) {
                        const valueRef = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'];
                        const regionRef = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar'];
                        const regionStart = [1, 152, 252, 387, 494, 650, 722, 810];
                        const regionEnd = [151, 251, 386, 493, 649, 721, 809, 898];
                        // const rangeArray = [[1, 151], [152, 251], [252, 386], [387, 493], [494, 649], [650, 721], [722, 809], [810, 898]];
                        let dataValue = generationValue.split('-')[1];
                        let indexRef = valueRef.indexOf(dataValue);

                        return {
                            value: `${indexRef + 1}`,
                            region: `${regionRef[indexRef]}`
                        };
                    };

                    function getUniqueFacts (data) {
                        const englishFacts = data.filter(entry => entry.language.name === 'en');
                        const uniqueFacts = [...new Set(englishFacts.map(fact => fact.flavor_text))];
                        const random = Math.floor(Math.random() * uniqueFacts.length);
                        return uniqueFacts[random];
                    };

                    function getUniqueMoves (data) {
                        let normal = [], special = [], limit = 10;
                        data.map(move => {
                            const method = move.version_group_details[0].move_learn_method.name;
                            const normalMove = method.includes('level-up') && normal.length < limit;
                            const specialMove = method.includes('machine') && special.length < limit;
                            if (normalMove) { normal.push(move.move.url) }
                            else if (specialMove) { special.push(move.move.url) };
                        });
                        normal = normal[Math.floor(Math.random() * normal.length)];
                        special = special[Math.floor(Math.random() * special.length)];
                        return [normal, special].filter(move => move !== undefined);
                    };

                    return urls;
                };

                return getTraits();
            })
            .catch(error => console.log(error));
    };


    //// PRIVILEGED METHODS
    function init(input) {
        input ? (id = input, fetchStrengths(id)) : fetchStrengths(id);
    };

    function getId() {
        return id;
    };

    function getName() {
        return currentName;
    };

    function getSpecialStatus() {
        return isPokemonSpecial;
    };

    function lastPokemon() {
        if (id === 1) {
            id = 898;
            return init(id);
        }
        id -= 1;
        init(id);
    };

    function nextPokemon() {
        if (id === 898) {
            id = 1;
            return init(id);
        }
        id += 1;
        init(id);
    };

    function randomPokemon() {
        let random = Math.floor(Math.random() * 898 + 1);
        id = random;
        return init(id);
    };

    return {
        init,
        id: getId,
        name: getName,
        specialStatus: getSpecialStatus,
        last: lastPokemon,
        next: nextPokemon,
        random: randomPokemon
    };
})();