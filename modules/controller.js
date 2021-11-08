import { Pokemon } from './model.js';
import { formatValues } from './utils.js';

const pokemonCard = document.querySelector('.pokemon-card');

//// ON WINDOW => USER REFRESHES PAGE or INITIAL LOAD
window.addEventListener('load', (e) => {
    const pokemonCard = document.querySelector('.pokemon-card');
    const cardFontSize = (pokemonCard.offsetWidth / 30).toFixed(2);

    pokemonCard.style.fontSize = `${cardFontSize}px`;
    vanillaTiltEvent();
});


//// ON WINDOW => USER ALTERS WINDOW SIZE (desktop)
window.addEventListener('resize', (e) => {
    const cardWidth = pokemonCard.offsetWidth;
    const cardHeight = pokemonCard.offsetHeight;
    const cardFontSize = (cardWidth / 30).toFixed(2);

    pokemonCard.style.fontSize = `${cardFontSize}px`;
    // testFluidTypography(cardWidth, cardHeight, cardFontSize);
});


//// EVENT DELEGATION => DOCUMENT CLICK
document.addEventListener('click', (e) => {
    const searchIcon = document.getElementById('search-icon');
    const menuIcon = document.getElementById('menu-icon');
    const isSearchOpen = document.querySelector('.search-dropdown').getAttribute('aria-expanded');
    const isMenuOpen = document.querySelector('.menu-dropdown').getAttribute('aria-expanded');
    const emailIcon = document.querySelector('.email-icon');

    const el = e.target;
    const elParent = e.target.parentNode;

    if (el === searchIcon)  { searchEvent().toggleSearch(isSearchOpen, isMenuOpen) };
    if (el === menuIcon)    { menuEvent().toggleMenu(isMenuOpen, isSearchOpen) };
    if (el === emailIcon)   { handleEmailAnimation() }
    if (elParent.classList.contains('matched-item')) { searchEvent().handleSelection(elParent) };
    if (elParent.classList.contains('option')) { menuEvent().handleSelection(elParent) };
});


/// ON DOCUMENT => USER PRESSES A KEY
document.addEventListener('keydown', (e) => paginationEvent().withKeypress(e.key));


//// EVENT DELEGATION => INPUT
document.addEventListener('input', (e) => searchEvent().fetchSearchData(e.target.value));


//// ON CARD ELEMENT => USER CLICKS ON THE POKEMON-CARD
pokemonCard.addEventListener('click', (e) => paginationEvent().withClick(e));



//// TOGGLE SEARCH BAR; FETCH, RENDER, & HANDLE SEARCH RESULTS
function searchEvent() {
    const searchWrapper = document.querySelector('.search_wrapper');
    const searchInput = document.querySelector('.search-input');
    const searchDropdown = document.querySelector('.search-dropdown');
    const searchResults = document.querySelector('.search-results');

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

    function handleSelection(elParent) {
        let option = elParent.title;

        if (option === 'Tilt')      { toggleTilt() };
        if (option === 'Parallax')  { toggleParallax() };
        if (option === 'Filters')   { showFilters() };

        function toggleTilt() {
            let isTiltEnabled = document.querySelector('.option-tilt').getAttribute('aria-expanded');
            
            if (isTiltEnabled === 'true') {
                vanillaTiltEvent().disableTilt();
                isTiltEnabled = 'false';
            }
            else {
                vanillaTiltEvent().enableTilt();
                isTiltEnabled = 'true';
            };

            document.querySelector('.option-tilt').setAttribute('aria-expanded', isTiltEnabled);
        };
        
        function toggleParallax() {
            let isParallaxEnabled = document.querySelector('.option-parallax').getAttribute('aria-expanded');

            if (isParallaxEnabled === 'true') {
                vanillaTiltEvent().disableParallax();
                isParallaxEnabled = 'false';
            }
            else {
                vanillaTiltEvent().enableParallax();
                isParallaxEnabled = 'true';
            }
            
            document.querySelector('.option-parallax').setAttribute('aria-expanded', isParallaxEnabled);
        };

        function showFilters() {
            console.log(`DISPLAY FILTERS`)
        };

        // function showFilters(elParent) {
        //     console.log(('Filters Option Selected'));
        //     setTimeout(function () {
        //         const destination = document.querySelector('.test');
        //         const pokemonCard = document.querySelector('.pokemon-card');
        //         let pokemonCardCopy = pokemonCard.cloneNode(true);
        //         destination.appendChild(pokemonCardCopy);
        //     }, 100);
        // }
    
        // function showFavorites(elParent) {
        //     console.log(elParent);
        //     console.log('Favorites Option Selected');
        // }
    };

    return {
        toggleMenu,
        handleSelection
    };
};


function vanillaTiltEvent() {
    const tiltElement = document.querySelector('.tilt');
    const preserveElements = document.querySelectorAll('.preserve');
    let isTiltEnabled = document.querySelector('.option-tilt').getAttribute('aria-expanded');
    let isParallaxEnabled = document.querySelector('.option-parallax').getAttribute('aria-expanded');

    if (window.innerWidth >= 700 && isTiltEnabled === 'false' && isParallaxEnabled === 'false') {
        enableTilt();
        enableParallax();
    };

    if (window.innerWidth < 700 && isTiltEnabled === 'true' && isParallaxEnabled === 'true') {
        disableTilt();
        disableParallax();
    };
        
    function enableTilt() {
        VanillaTilt.init(tiltElement, {
            reverse: false,
            glare: true,
            'max-glare': 0.40
        });
        isTiltEnabled = 'true';
    };

    function disableTilt() {
        tiltElement.vanillaTilt.destroy();
        isTiltEnabled = 'false';
    };

    function enableParallax() {
        preserveElements.forEach(element => {
            element.style.transformStyle = 'preserve-3d';
        });
        isParallaxEnabled = 'true';
    };
    
    function disableParallax() {
        preserveElements.forEach(element => {
            element.style.transformStyle = '';
        });
        isParallaxEnabled = 'false';
    };
    
    document.querySelector('.option-tilt').setAttribute('aria-expanded', isTiltEnabled);
    document.querySelector('.option-parallax').setAttribute('aria-expanded', isParallaxEnabled);
    
    return {
        enableTilt,
        disableTilt,
        enableParallax,
        disableParallax
    };
}


function paginationEvent() {
    function withClick(e) {
        let x = e.clientX - e.target.offsetLeft;
        let y = e.clientY - e.target.offsetTop;

        const width = pokemonCard.offsetWidth;
        const oneThirdWidth = (width * 0.33).toFixed(0);
        const isLeftClick = x < oneThirdWidth;
        const isRightClick = x > width - oneThirdWidth;

        if (isLeftClick) { Pokemon.last() };
        if (isRightClick) { Pokemon.next() };
    };

    function withKeypress(key) {
        console.log(key)
        if (key === 'ArrowLeft')    { Pokemon.last() }
        if (key === 'ArrowRight')   { Pokemon.next() }
    };

    return {
        withClick,
        withKeypress
    };
};


function testFluidTypography(cardWidth, cardHeight, cardFontSize) {
    console.clear();
    const htmlFontSize = window.getComputedStyle(document.documentElement).fontSize;
    const cardAspectRatio = (cardWidth / cardHeight).toFixed(3) * 100;

    console.log(`
    Viewport Width:  ${window.innerWidth}px
    HTML Font Size:  ${htmlFontSize}
    Pokemon Card:
    \tWidth:         ${cardWidth} \t\tpx
    \tHeight:        ${cardHeight} \t\tpx
    \tAspect Ratio:  ${cardAspectRatio} \t%
    \tFont Size:     ${(cardFontSize)}  \tpx
    `);
};


function handleEmailAnimation() {
    const emailText = document.querySelector('.email-text');
    emailText.style.display = 'block';
    emailText.classList.add('slide-out-animation');
};



//// FOR IMPLEMENTING FAVORITE CARDS
// setTimeout(function () {
//     const destination = document.querySelector('.test');
//     const pokemonCard = document.querySelector('.pokemon-card');
//     let pokemonCardCopy = pokemonCard.cloneNode(true);
//     destination.appendChild(pokemonCardCopy);
// }, 100);