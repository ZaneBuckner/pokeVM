import { Pokemon } from './model.js';
import { formatValues } from './utils.js';

const pokemonCard = document.querySelector('.pokemon-card');

//// ON WINDOW => USER REFRESHES PAGE or INITIAL LOAD
window.addEventListener('load', (e) => {
    const pokemonCard = document.querySelector('.pokemon-card');
    const cardFontSize = (pokemonCard.offsetWidth / 30).toFixed(2);

    pokemonCard.style.fontSize = `${cardFontSize}px`;
    vanillaTiltEvent();
    // guideDisplay().enable();
});


//// ON WINDOW => USER ALTERS WINDOW SIZE (desktop)
window.addEventListener('resize', (e) => {
    const cardWidth = pokemonCard.offsetWidth;
    const cardHeight = pokemonCard.offsetHeight;
    const cardFontSize = (cardWidth / 30).toFixed(2);

    pokemonCard.style.fontSize = `${cardFontSize}px`;
    // testFluidTypography(cardWidth, cardHeight, cardFontSize);
});


//// ON DOCUMENT => USER CLICKS ON DOCUMENT
document.addEventListener('click', (e) => {
    const searchIcon = document.getElementById('search-icon');
    const menuIcon = document.getElementById('menu-icon');
    const menuOptionTilt = document.querySelector('.option-tilt');
    const menuOptionParallax = document.querySelector('.option-parallax');
    const menuOptionGuide = document.querySelector('.option-guide');
    const isSearchOpen = document.querySelector('.search-dropdown').getAttribute('aria-expanded');
    const isMenuOpen = document.querySelector('.menu-dropdown').getAttribute('aria-expanded');
    const isTiltEnabled = document.querySelector('.option-tilt').getAttribute('aria-expanded');
    const isParallaxEnabled = document.querySelector('.option-parallax').getAttribute('aria-expanded');
    const isGuideEnabled = document.getElementById('guide-display').getAttribute('aria-expanded');
    const emailIcon = document.querySelector('.email-icon');

    const el = e.target;
    const elParent = e.target.parentNode;

    if (el === searchIcon)  { searchEvent().toggleSearch(isSearchOpen, isMenuOpen) };
    if (el === menuIcon)    { menuEvent().toggleMenu(isMenuOpen, isSearchOpen) };
    if (el === emailIcon)   { handleEmailAnimation() };
    // if (elParent === menuOptionTilt)        { toggleTilt(menuOptionTilt, isTiltEnabled) };
    // if (elParent === menuOptionParallax)    { toggleParallax() };
    if (elParent === menuOptionGuide)       { guideDisplay(isGuideEnabled) };
    if (elParent.classList.contains('matched-item')) { searchEvent().handleSelection(elParent) };
    if (elParent.classList.contains('option')) { menuEvent().handleSelection(elParent) };
});


/// ON DOCUMENT => USER PRESSES A KEY
document.addEventListener('keydown', (e) => paginationEvent().onKeypress(e.key));


//// ON DOCUMENT => USER SEARCH BAR INPUT
document.addEventListener('input', (e) => searchEvent().fetchSearchData(e.target.value));


//// ON CARD ELEMENT => USER CLICKS ON THE POKEMON-CARD
pokemonCard.addEventListener('click', (e) => {
    let isGuideEnabled = document.getElementById('guide-display').getAttribute('aria-expanded');
    if (isGuideEnabled) { guideDisplay().disable() }
    paginationEvent().onClick(e)
});


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


//// ENABLE OR DISABLE GUIDE FEATURE
function guideDisplay(isGuideEnabled) {
    const guideDisplay = document.getElementById('guide-display');
    isGuideEnabled === 'true' ? disableGuide() : enableGuide();

    function enableGuide() {
        guideDisplay.innerHTML = (`
            <div class="guide guide-last">
                <p>Last</p>
                <img src="./resources/icons/arrow-icon.svg">
            </div>
            <div class="guide guide-next">
                <p>Next</p>
                <img src="./resources/icons/arrow-icon.svg">
            </div>
            <div class="guide guide-random">
                <p>Random</p>
                <img src="./resources/icons/random-icon.svg">
            </div>
        `);
        guideDisplay.setAttribute('aria-expanded', 'true');
    };

    function disableGuide() {
        guideDisplay.innerHTML = '';
        guideDisplay.setAttribute('aria-expanded', 'false');
    };

    return {
        enable: enableGuide,
        disable: disableGuide
    }
};


//// TOGGLE SEARCH BAR; FETCH, RENDER, & HANDLE SEARCH RESULTS
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
    function onClick(e) {
        let x = e.clientX - e.target.offsetLeft;
        let y = e.clientY - e.target.offsetTop;

        const width = pokemonCard.offsetWidth;
        const height = pokemonCard.offsetHeight;

        const isLeftClick = x < (width * 0.33);
        const isRightClick = x > (width * 0.66);
        const isLowerCenterClick = x > (width * 0.33) && x < (width * 0.66) && y > (height * 0.50);

        if (isLeftClick)            { Pokemon.last() };
        if (isRightClick)           { Pokemon.next() };
        if (isLowerCenterClick)     { Pokemon.random() };
    };

    function onKeypress(key) {
        if (key === 'ArrowLeft')    { Pokemon.last() }
        if (key === 'ArrowRight')   { Pokemon.next() }
        if (key === ' ')            { Pokemon.random() }
    };

    return {
        onClick,
        onKeypress
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