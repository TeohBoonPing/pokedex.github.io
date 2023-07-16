import { 
    fetchAndPopulatePokemon, 
} from './api.js';

import {
    limit,
    handleSearchInputChange,
    checkScrollEnd,
} from './utils.js';

const domain = window.location.pathname.split('/')[1];
const currentPageURL = window.location.pathname;

if (currentPageURL === `/${domain}/` || (currentPageURL === '/' || currentPageURL === '/index.html')) {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearchInputChange);
    window.addEventListener('scroll', checkScrollEnd);
    fetchAndPopulatePokemon(limit, "");
}

if (currentPageURL.startsWith(`/${domain}/details.html`) || currentPageURL === '/details.html') {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get("name");
    if (name) {
        fetchAndDisplayPokemonDetails(name);
    }
}