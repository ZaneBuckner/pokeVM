
export function formatValues() {
    
    function formatName(string) {
        if (string.includes('-')) {
            let words = string.split('-');
            let map = words.map(word => {
                let upperCase = word.charAt(0).toUpperCase();
                if (word === 'm')       { return '&#9794;' }
                else if (word === 'f')  { return '&#9792;' }
                return `${upperCase}${word.slice(1)}`;
            });
            return map.join(' ');
        }
        else {
            let upperCase = string.charAt(0).toUpperCase();
            return `${upperCase}${string.slice(1)}`;
        }
    };

    function removeChars(string) {
        if (string.includes('-')) {
            return string.split('-').join('')
        }
        else {
            return string
        };
    };
    
    function formatHeight(number) {
        // 1 decimeter == 3.93701 inches
        let conversion = number * 3.93701;
        let feet = Math.floor(conversion / 12);
        let inches = Math.floor((conversion - (feet * 12)));
        return `Height: ${feet}' ${inches}"`;
    };
    
    function formatWeight(number) {
        // 1 hectogram == 0.22046 lbs
        let conversion = (number * 0.22046).toFixed(1);
        return `Weight: ${conversion} lbs.`;
    };

    return {
        name: formatName,
        removeChars,
        height: formatHeight,
        weight: formatWeight
    };
};


/**
 * @param {string[]} types - The types of a pokemon.
 * @returns {string} The CSS linear-gradient background property.
*/
export function getBackgroundGradient(types) {
    const colorReference = {
        normal: 'hsl(59, 21%, 57%)',
        fire: 'hsl(26, 85%, 56%)',
        water: 'hsl(221, 82%, 66%)',
        electric: 'hsl(48, 93%, 57%)',
        grass: 'hsl(98, 52%, 54%)',
        ice: 'hsl(177, 47%, 72%)',
        fighting: 'hsl(2, 66%, 46%)',
        poison: 'hsl(301, 45%, 44%)',
        ground: 'hsl(43, 68%, 64%)',
        flying: 'hsl(256, 81%, 76%)',
        psychic: 'hsl(342, 93%, 65%)',
        bug: 'hsl(67, 75%, 41%)',
        rock: 'hsl(50, 54%, 46%)',
        ghost: 'hsl(266, 27%, 47%)',
        dragon: 'hsl(257, 97%, 60%)',
        dark: 'hsl(24, 23%, 36%)',
        steel: 'hsl(240, 19%, 76%)',
        fairy: 'hsl(330, 50%, 68%)'
    };

    if (types.length === 2) {
        let colors = types.map(type => colorReference[`${type}`]);
        let result = `linear-gradient(45deg, ${colors[0]}, ${colors[1]})`;
        return result;
    };

    let type = types.join('');
    let targetColor = colorReference[`${type}`].match(/\d+/g);
    
    const getAnalogousArray = (targetColor) => {
        const hueVariations = [40, 20, 10, -10, -20, -40];
        let colors = hueVariations.map(value => `hsl(${targetColor[0] - value}, ${targetColor[1]}%, ${targetColor[2]}%)`);
        return `linear-gradient(45deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]}, ${colors[4]}, ${colors[5]})`;
    };

    return getAnalogousArray(targetColor);
};