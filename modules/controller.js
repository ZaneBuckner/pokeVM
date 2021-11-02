import { Pokemon } from './model.js';
import { formatValues } from './utils.js'


// VanillaTilt.init(document.querySelector('.tilt'), {
//     reverse: false,
//     glare: true,
//     'max-glare': 0.40
// });



//// EVENT DELEGATION => LOAD
window.addEventListener('load', (e) => {
    const pokemonCard = document.querySelector('.pokemon-card');


    const cardFontSize = (pokemonCard.offsetWidth / 30).toFixed(2);
    pokemonCard.style.fontSize = `${cardFontSize}px`;
    
    if (window.innerWidth >= 700) {
        VanillaTilt.init(document.querySelector('.tilt'), {
            reverse: false,
            glare: true,
            'max-glare': 0.40
        });
    };


});


//// EVENT DELEGATION => RESIZE
window.addEventListener('resize', (e) => {
    const pokemonCard = document.querySelector('.pokemon-card');
    const cardWidth = pokemonCard.offsetWidth;
    const cardHeight = pokemonCard.offsetHeight;
    const cardFontSize = (cardWidth / 30).toFixed(1);

    pokemonCard.style.fontSize = `${cardFontSize}px`;

    testFluidTypography(cardWidth, cardHeight, cardFontSize);
});


//// EVENT DELEGATION => DOCUMENT CLICK
document.addEventListener('click', (e) => {
    const searchIcon = document.getElementById('search-icon');
    const menuIcon = document.getElementById('menu-icon');
    const isSearchOpen = document.querySelector('.search-dropdown').getAttribute('aria-expanded');
    const isMenuOpen = document.querySelector('.menu-dropdown').getAttribute('aria-expanded');
    const isTiltOn = document.querySelector('.pokemon-card').getAttribute('aria-expanded');

    const el = e.target;
    const elParent = e.target.parentNode;

    if (el === searchIcon) { searchEvent().toggleSearch(isSearchOpen, isMenuOpen) };
    if (el === menuIcon) { menuEvent(e).toggleMenu(isMenuOpen, isSearchOpen) };
    if (elParent.classList.contains('matched-item')) { searchEvent().handleSelection(elParent) };
    if (elParent.classList.contains('option')) { menuEvent().handleSelection(elParent, isTiltOn) };
});


//// EVENT DELEGATION => POKEMON CARD CLICK
const pokemonCard = document.querySelector('.pokemon-card');
pokemonCard.addEventListener('click', (e) => {
    let x = e.clientX - e.target.offsetLeft;
    let y = e.clientY - e.target.offsetTop;

    const width = pokemonCard.offsetWidth;
    const oneThirdWidth = (width * 0.33).toFixed(0);
    const isLeftClick = x < oneThirdWidth;
    const isRightClick = x > width - oneThirdWidth;

    if (isLeftClick) { Pokemon.last() };
    if (isRightClick) { Pokemon.next() };

    let rippleEffect = document.createElement('span');
    rippleEffect.classList.add('ripple-effect');
    rippleEffect.style.left = `${x}px`;
    rippleEffect.style.top = `${y}px`;
    pokemonCard.appendChild(rippleEffect);
    
    setTimeout(() => rippleEffect.remove(), 500);
});


//// EVENT DELEGATION => INPUT
document.addEventListener('input', (e) => {
    const searchInput = document.querySelector('.search-input');
    if (e.target === searchInput) { searchEvent().fetchSearchData(e.target.value) };
});


//// EVENT DELEGATION => KEYDOWN
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { Pokemon.last() }
    if (e.key === 'ArrowRight') { Pokemon.next() }
});



function searchEvent() {
    const searchWrapper = document.querySelector('.search_wrapper');
    const searchInput = document.querySelector('.search-input');
    const searchDropdown = document.querySelector('.search-dropdown');
    const searchResults = document.querySelector('.search-results');

    //// EXPANDS OR COLLAPSES THE SEARCH INPUT
    function toggleSearch(isSearchOpen, isMenuOpen) {
        isMenuOpen === 'true' ? menuEvent().toggleMenu() : null;
        isSearchOpen === 'false' ? openSearch() : closeSearch();

        function openSearch() {
            searchWrapper.style.width = '9.5rem';
            searchInput.style.opacity = '100';
            searchInput.value = '';
            isSearchOpen = 'true';
        };

        function closeSearch() {
            searchWrapper.style.width = '1.8rem';
            searchInput.style.opacity = '0';
            searchDropdown.style.display = 'none';
            isSearchOpen = 'false';
        };

        searchDropdown.setAttribute('aria-expanded', isSearchOpen);
    };

    //// COMPARES INPUT TO A LOCALLY STORED JSON OBJECT.
    async function fetchSearchData(input) {
        try {
            const response = await fetch('../modules/data/search-data.json');
            const pokemonSet = await response.json();
            
            input.match(/[a-z]/gi) ? filterByName() : filterById();
            
            function filterByName() {
                let matches = pokemonSet.filter(pokemon => {
                    let regex = new RegExp(`^${input}`, 'gi');
                    return pokemon.name.match(regex);
                });
                renderSearchResults(matches);
            };

            function filterById() {
                let matches = pokemonSet.filter(pokemon => {
                    return (input === pokemon.id.toString()) ? pokemon : null;
                });
                renderSearchResults(matches);
            };
        }
        catch (error) { return error }
    };

    function renderSearchResults(matches) {
        searchDropdown.style.display = 'block';

        if (matches.length === 0) {
            return searchResults.innerHTML = `<h2 class="matched-none">No Matches</h2>`;
        }

        let matchedItem = matches.map(match =>
            `<div class="matched-item">
                <h2 class="matched-name" title="${match.name}">${formatValues().name(match.name)}</h2>
                <h2 class="matched-id" title="${match.id}"><span>&#8470;</span> ${match.id.toString().padStart(3, '0')}</h2>
            </div>`
        );
        searchResults.innerHTML = matchedItem.join('');
    };

    function handleSelection(elParent) {
        const children = elParent.children;
        let id;
        for (let child of children) {
            let matchedId = child.classList.contains('matched-id');
            if (matchedId) { id = child.getAttribute('title') };
        };
        console.clear();
        Pokemon.init(parseInt(id));
    }

    return {
        toggleSearch,
        fetchSearchData,
        handleSelection
    }
};



function menuEvent() {
    const menuDropdown = document.querySelector('.menu-dropdown');
    
    //// EXPANDS OR COLLAPSES THE MENU DROPDOWN
    function toggleMenu(isMenuOpen, isSearchOpen) {
        isSearchOpen === 'true' ? searchEvent().toggleSearch() : null;
        isMenuOpen === 'false' ? openMenu() : closeMenu();

        function openMenu() {
            menuDropdown.style.display = 'block';
            isMenuOpen = 'true';
        };

        function closeMenu() {
            menuDropdown.style.display = 'none';
            isMenuOpen = 'false';
        };

        menuDropdown.setAttribute('aria-expanded', isMenuOpen);
    };

    function handleSelection(elParent, isTiltOn) {
        let option = elParent.title;

        if (option === 'Filters')   { showFilters(elParent) };
        if (option === 'Tilt')      { toggleTilt(isTiltOn) };
        if (option === 'Favorites') { showFavorites(elParent) };

        function showFilters(elParent) {
            console.log(('Filters Option Selected'));
            setTimeout(function () {
                const destination = document.querySelector('.test');
                const pokemonCard = document.querySelector('.pokemon-card');
                let pokemonCardCopy = pokemonCard.cloneNode(true);
                destination.appendChild(pokemonCardCopy);
            }, 100);
        }
    
        function toggleTilt(isTiltOn) {
            console.log(isTiltOn)
            let pokemonCard = document.querySelector('.pokemon-card');            
            const tilt = document.querySelector('.tilt');

            if (isTiltOn) {
                // tilt.vanillaTilt.destroy();
                pokemonCard.classList.remove('tilt');
                isTiltOn = 'false';
                // return;
            }
            else {
                // VanillaTilt.init(tilt);
                pokemonCard.classList.add('tilt');
                isTiltOn = 'true';
            }
            // isTiltOn = true;

            // console.log('Tilt Option Selected');
            pokemonCard.setAttribute('aria-expanded', isTiltOn);
            console.log(isTiltOn);
        }
    
        function showFavorites(elParent) {
            console.log(elParent);
            console.log('Favorites Option Selected');
        }
    }

    return {
        toggleMenu,
        handleSelection
    }
};



function testFluidTypography(cardWidth, cardHeight, cardFontSize) {
    console.clear();
    const css = 'font-size: 14px; color:#7793CA';
    const htmlFontSize = window.getComputedStyle(document.documentElement).fontSize;
    const cardAspectRatio = (cardWidth / cardHeight).toFixed(3) * 100;

    // let html = window.getComputedStyle(document.documentElement).fontSize;
    // let aspectRatio = ((pokemonCard.offsetWidth / pokemonCard.offsetHeight) * 100).toFixed(2);

    // console.log(
    // `\tViewport Width: %c${window.innerWidth}px%c
    // HTML Font Size: %c${html}%c
    // Pokemon Card Aspect Ratio: %c${aspectRatio}%`,
    // css, 'color:none', css, 'color:none', css);

    console.log(`
    Viewport Width:  ${window.innerWidth}px
    HTML Font Size:  ${htmlFontSize}
    Pokemon Card:
    \tWidth:         ${cardWidth}\tpx
    \tHeight:        ${cardHeight}\tpx
    \tAspect Ratio:  ${cardAspectRatio}\t%
    \tFont Size:     ${(cardFontSize)}\tpx
    `);
};



// setTimeout(function () {
//     const destination = document.querySelector('.test');
//     const pokemonCard = document.querySelector('.pokemon-card');
//     let pokemonCardCopy = pokemonCard.cloneNode(true);
//     destination.appendChild(pokemonCardCopy);
// }, 100);
