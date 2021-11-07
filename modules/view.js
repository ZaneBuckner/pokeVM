import { Pokemon } from './model.js';
import { formatValues, getBackgroundGradient } from './utils.js';


export const renderDom = function () {
    // TRAITS DOM ELEMENTS
    const pokemonName = document.querySelector('.name');
    const cardContent = document.querySelector('.card-content');
    const header = document.querySelector('.header');
    const pokemonDisplay = document.querySelector('.pokemon-display');
    const banner = document.querySelector('.banner');
    const fact = document.querySelector('.fact');
    const copyright = document.querySelector('.copyright');
    // EVOLUTION DOM ELEMENTS
    const evolutionDisplay = document.querySelector('.evolution-display');
    // MOVES DOM ELEMENTS
    const movesDisplay = document.querySelector('.moves-display');
    // DAMAGE RELATIONS DOM ELEMENTS
    const damageStatsDisplay = document.querySelector('.damage-relations-wrapper');
    



    function renderTraits(traitsObj) {
        console.log('TRAITS', traitsObj);
        
        cardContent.style.backgroundImage = getBackgroundGradient(traitsObj.types);

        header.innerHTML = (`
            <h3 class="name">
                ${formatValues().name(traitsObj.name)}
            </h3>
            <h3 class="hp" >${traitsObj.hp} HP</h3>
            <div class="type-icon-wrapper">
                ${getTypeIcons(traitsObj.types)}
            </div>
        `);

        pokemonDisplay.innerHTML = (`
            <div class="display-frame">
                <img class="display-image" src="${traitsObj.image}">
            </div>
        `);

        banner.innerHTML = (`
            <div class="banner-values-wrapper">
                <h3 class="genus">${traitsObj.genus}</h3>
                <h3 class="height">${formatValues().height(traitsObj.height)}</h3>
                <h3 class="weight">${formatValues().weight(traitsObj.weight)}</h3>
            </div>
            <img class="stamp-img" src="../resources/img/first-edition-stamp.png">
        `);

        fact.innerHTML = (`
            <p>${traitsObj.uniqueFact}</p>
        `);

        copyright.innerHTML = getCopyrightHTML();

        function getTypeIcons(types) {
            let typesHTML = types.map((type, i) =>
                `<img class="type-icon" src="../resources/icons/type-icons/${types[i]}.svg">`
            );
            return typesHTML.join('')
        };

        function getCopyrightHTML() {
            const genValue = `Gen ${traitsObj.generation.value}`;
            const genRegion = `${formatValues().name(traitsObj.generation.region)}`;
            const currentId = `${traitsObj.id.toString().padStart(3, '0')}`;

            return (`
                <p>Illus. Mitsuhiro Arita</p>
                <p>&#169;98, 99, Nintendo, Creatures, GAMEFREAK</p>
                <p>&#169;1999 Wizards</p>
                <h4 class="card-generation">${genValue} ${genRegion}</h4>
                <h4 class="card-id">${currentId} / 898 &#9733;</h4>
            `);
        };
    };



    function renderEvolution(evolutionObj) {
        console.log(
            '\nEVOLUTION', evolutionObj,
            '\nCURRENT POKEMON', pokemon().current,
            '\nPREVIOUS POKEMON', pokemon().previous
        );

        evolutionDisplay.innerHTML = `${getEvolutionHTML(pokemon().current, pokemon().previous)}`;

        function pokemon() {
            const names = Object.values(evolutionObj);
            const stages = Object.keys(evolutionObj);
            const currentIndex = names.indexOf(Pokemon.name());

            return {
                current: {
                    name: names[currentIndex],
                    stage: stages[currentIndex]
                },
                previous: {
                    name: names[currentIndex - 1],
                    stage: stages[currentIndex - 1]
                }
            };
        };

        function getEvolutionHTML(current, previous) {
            const hasCommonAncestor = typeof(evolutionObj.basic) === 'object';
            const isEvolved = current.stage === 'stage1' || current.stage === 'stage2';
            const hasBabyAncestor = current.stage === 'basic' && previous.name !== 'none';
            const isSpecialPokemon = Pokemon.specialStatus();

            pokemonName.style.marginLeft = '3.5em';
            if (hasCommonAncestor) {
                if (current.name !== undefined) {
                    return (`
                        <img class="basic-stage-img" src="../resources/img/basic-stage-display.svg">
                        <p class="stage-name">DIVERGENT</p>
                    `);
                }
                return (`
                    <h3 class="evolves-from">Evolves from ${formatValues().name(evolutionObj.baby)}</h3>
                    <img class="evolved-stage-img" src="../resources/img/evolved-stage-display.svg">
                    <div class="pokemon-gif-wrapper">
                        <img class="pokemon-gif" src="${getDisplayGif(evolutionObj.baby)}">
                    </div>
                    <p class="stage-name">DIVERGENT</p>
                `);
            }
            else if (isEvolved) {
                return (`
                    <h3 class="evolves-from">Evolves from <span>${formatValues().name(previous.name)}</span></h3>
                    <img class="evolved-stage-img" src="../resources/img/evolved-stage-display.svg">
                    <div class="pokemon-gif-wrapper">
                        <img class="pokemon-gif" src="${getDisplayGif(previous.name)}">
                    </div>
                    <p class="stage-name">STAGE ${current.stage.slice(5)}</p>
                `);
            }
            else if (hasBabyAncestor) {
                return (`
                    <h3 class="evolves-from">Evolves from ${formatValues().name(previous.name)}</h3>
                    <img class="evolved-stage-img" src="../resources/img/evolved-stage-display.svg">
                    <div class="pokemon-gif-wrapper">
                        <img class="pokemon-gif" src="${getDisplayGif(previous.name)}">
                    </div>
                    <p class="stage-name">BABY</p>
                `);
            };

            pokemonName.style.marginLeft = '';
            if (isSpecialPokemon) {
                return (`
                    <img class="basic-stage-img" src="../resources/img/basic-stage-display.svg">
                    <p class="stage-name">${Pokemon.specialStatus().toUpperCase()}</p>
                `);
            }
            return (`
                <img class="basic-stage-img" src="../resources/img/basic-stage-display.svg">
                <p class="stage-name">BASIC</p>
            `);
        };

        function getDisplayGif(previousName) {
            let primary = `https://play.pokemonshowdown.com/sprites/ani/${formatValues().removeChars(previousName)}.gif`;
            let secondary = `https://play.pokemonshowdown.com/sprites/gen5ani/${formatValues().removeChars(previousName)}.gif`;
            // let tertiary = `https://www.cpokemon.com/pokes/animated/3ds/${'PREVIOUS_INDEX'}.gif`;

            return primary;
        };
    };



    function renderMoves(normalMoveObj, specialMoveObj) {
        movesDisplay.innerHTML = (`
            ${getNormalHTML(normalMoveObj)}
            ${getSpecialHTML(specialMoveObj)}
        `);

        function getNormalHTML(normalMove) {
            if (normalMove === 'none') { return '' };
            return (`
                <div class="normal-move">
                    <img class="move-type-icon" src="../resources/icons/type-icons/${normalMove.type}.svg">
                    <h3 class="move-name-text" >${formatValues().name(normalMove.name)}</h3>
                    <h3 class="move-power-text" >${normalMove.power}</h3>
                </div>
            `);
        };

        function getSpecialHTML(specialMove) {
            if (specialMove === 'none') { return '' };
            return (`
                <div class="special-move">
                    <img class="move-type-icon" src="../resources/icons/type-icons/${specialMove.type}.svg">
                    <h3 class="move-name-text">${formatValues().name(specialMove.name)}</h3>
                    <h3 class="move-power-text">${specialMove.power}</h3>
                </div>
                <h3 class="special-move-details">${specialMove.details}</h3>
            `);
        };
    };



    function renderDamageRelations(damageObj) {
        damageStatsDisplay.innerHTML = (`
            ${getWeaknessHTML(damageObj.weakness)}
            ${getResistanceHTML(damageObj.resistance)}
        `);

        function getWeaknessHTML(weakness) {
            const hasNoContent = getDoubleDamages(weakness).length === 0 && getQuadDamages(weakness).length === 0;
            if (hasNoContent) { return '' }
            return (`
                <div class="damage-relation-group">
                    <p class="relation-title">WEAK <span>AGANIST</span></p>
                    ${getDoubleDamages(weakness)}
                    ${getQuadDamages(weakness)}
                </div>
            `);

            function getDoubleDamages(weakness) {
                let doubleDamage = [];
                Object.keys(weakness).forEach(key => {
                    if (weakness[key] < 4) {
                        doubleDamage.push(`
                            <img class="damage-icon" src="../resources/icons/type-icons/${key}.svg">
                        `);
                    };
                });

                if (doubleDamage.length === 0) { return '' }
                return (`
                    <div class="damage-amount">
                        <p>2&#119909;</p>
                        <div class="damage-types">
                            ${doubleDamage.join('')}
                        </div>
                    </div>
                `);
            };

            function getQuadDamages(weakness) {
                let quadDamage = [];
                Object.keys(weakness).forEach(key => {
                    if (weakness[key] > 2) {
                        quadDamage.push(`
                            <img class="damage-icon" src="../resources/icons/type-icons/${key}.svg">
                        `);
                    };
                });

                if (quadDamage.length === 0) { return '' }
                return (`
                    <div class="damage-amount">
                        <p>4&#119909;</p>
                        <div class="damage-types">
                            ${quadDamage.join('')}
                        </div>
                    </div>
                `);
            };
        };

        function getResistanceHTML(resistance) {
            const hasNoContent = getHalfDamages(resistance).length === 0 && getQuarterDamages(resistance).length === 0;
            if (hasNoContent) { return '' }
            return (`
                <div class="damage-relation-group">
                    <p class="relation-title">RESISTANT <span>TO</span></p>
                    ${getHalfDamages(resistance)}
                    ${getQuarterDamages(resistance)}
                </div>
            `);

            function getHalfDamages(resistance) {
                let halfDamage = [];
                Object.keys(resistance).forEach(key => {
                    if (resistance[key] > 0.25) {
                        halfDamage.push(`
                            <img class="damage-icon" src="../resources/icons/type-icons/${key}.svg">
                        `);
                    };
                });

                if (halfDamage.length === 0) { return '' }
                return (`
                    <div class="damage-amount">
                        <p>&#189;&#119909;</p>
                        <div class="damage-types">
                            ${halfDamage.join('')}
                        </div>
                    </div>
                `);
            };

            function getQuarterDamages(resistance) {
                let quarterDamage = [];
                Object.keys(resistance).forEach(key => {
                    if (resistance[key] < 0.5) {
                        quarterDamage.push(`
                            <img class="damage-icon" src="../resources/icons/type-icons/${key}.svg">
                        `);
                    };
                });

                if (quarterDamage.length === 0) { return '' }
                return (`
                    <div class="damage-amount">
                        <p>&#188;&#119909;</p>
                        <div class="damage-types">
                            ${quarterDamage.join('')}
                        </div>
                    </div>
                `);
            };
        };
    };


    return {
        traits: renderTraits,
        evolution: renderEvolution,
        moves: renderMoves,
        damage: renderDamageRelations
    };
};