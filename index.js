
// ROOT MODULE
// HANDLES APP STARTUP, ROUTING, FUNCTIONS VIA MONDULES FOR FUNCTIONALITY

/*
WHY INDEX.JS
The purpose for an index.js file is to take in all the private methods from modules and make them public. Also to ensure that another module never requires a file from a separate module - ensures encapsulation.



Why Dynamic Module Imports?
* To reduce the amount of code when the page initially loads.
* To reduce the amount of code that isn't necessary to load.

[](https://dmitripavlutin.com/ecmascript-modules-dynamic-import/)
*/

const modules = {
    model: './modules/model.js',
    controller: './modules/controller.js',
    view: './modules/view.js',
    utilities: './modules/utils.js'
    // routeData: './...'
};



for (let module in modules) {
    // console.log(modules[module]);
    // import * as myFn from module[module];
    import(modules[module]);
}




// export {
//     formatValues
// }


// import moduleName from './modules/fetch-pokemon.js'


















// let granimInstance = new Granim({
//     element: '#dynamic-bg',
//     isPausedWhenNotInView: false,
//     image: {
//         source: './resources/img/backgrounds/vector-pattern.jpg',
//         blendingMode: 'difference'
//     },
//     states: {
//         "default-state": {
//             gradients: [
//                 ['#29323c', '#485563'],
//                 ['#FF6B6B', '#556270'],
//                 ['#80d3fe', '#7ea0c4'],
//                 ['#f0ab51', '#eceba3']
//             ],
//             transitionSpeed: 7000
//         }
//     }
// });



// VanillaTilt.init(document.querySelector('.tilt'), {
//     reverse: false,
//     glare: true,
//     'max-glare': 0.40
// });


const getTiltDetails = () => {
    tilt.addEventListener('tiltChange', (e) => {
        console.clear();
        let xTilt = e.detail.tiltX;
        let xPercentage = e.detail.percentageX;
        let yTilt = e.detail.tiltY;
        let yPercentage = e.detail.percentageY;
    
        console.log(`X => ${xTilt}, ${xPercentage.toFixed(2)}%`);
        console.log(`Y => ${yTilt}, ${yPercentage.toFixed(2)}%`);
        console.log((`ANGLE => ${e.detail.angle}`));
    });
};
// getTiltDetails();













/** 
 * Lazy Loader to handle all dynamic imports, if required.
 * Returns accesses to the imported modules.
 */
// const handler = (async function() {
//     // const fetchPokemon = await import(modules.fetchPokemon);
//     // const handleEvents = await import(modules.handleEvents);
//     // const renderDom = await import(modules.renderDom);
//     // const utilities = await import(modules.utilities);
// }());

// for (let module in modules) {
//     console.log(modules[module]);
// }