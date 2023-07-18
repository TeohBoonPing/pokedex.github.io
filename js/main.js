import { 
    fetchAndPopulatePokemon, 
    fetchAndDisplayPokemonDetails
} from './api.js';

import {
    limit,
    handleSearchInputChange,
    checkScrollEnd,
    initializeTooltips,
} from './utils.js';

const domain = window.location.pathname.split('/')[1];
const currentPageURL = window.location.pathname;

const loaderWrapper = document.getElementById('wrapper');
const mainContent = document.getElementById('main');

function showLoader() {
    loaderWrapper.removeAttribute('hidden');
}

function hideLoader() {
    loaderWrapper.setAttribute('hidden', '');
    mainContent.removeAttribute('hidden');
}

function loadData(name) {
    showLoader();
    setTimeout(() => {
        hideLoader();
    }, 1000);

    initializeTooltips();

    if (currentPageURL === `/${domain}/` || currentPageURL === '/' || currentPageURL === '/index.html') {
        fetchAndPopulatePokemon(limit, "");
        window.addEventListener('scroll', checkScrollEnd);
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', handleSearchInputChange);
        }
    } else if (currentPageURL.startsWith(`/${domain}/details.html`) || currentPageURL === '/details.html') {
        if (name) {
            fetchAndDisplayPokemonDetails(name);
        } else {
            console.error("Pokemon name is missing");
        }
    }
}

const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get("name");
loadData(name);