import { 
    fetchAndPopulatePokemon, 
} from './api.js';

import {
    limit,
    handleSearchInputChange,
    checkScrollEnd,
  } from './utils.js';

if(window.location.pathname === '/') {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearchInputChange);

    window.addEventListener('scroll', checkScrollEnd);
    fetchAndPopulatePokemon(limit, "");
    
}

const currentPageURL = window.location.href;

if(currentPageURL.includes("details.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get("name");
    if(name) {
        fetchAndDisplayPokemonDetails(name);
    }
}



