let loadingMore = false;
let offset = 0;
const limit = 20;
let isSearchPerformed = false;

async function fetchPokemonByName(name) {
  if(typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Invalid name parameter");
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    
    if(!response.ok) {
      throw new Error("Pokemon does not exist");
    }
    
    return await response.json();

  } catch (error) {
    console.log("Failed to fetch pokemon, error:" + error)
    throw error;
  }
}

async function fetchPokemons(offset, limit) {
  try {

    if (typeof offset !== "number" || typeof limit !== "number") {
      throw new Error("Invalid offset or limit parameters");
    }

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`);

    if(!response.ok) {
      throw new Error("Failed to fetch Pokemon lists");
    }

    const data = await response.json();

    if(!data || !Array.isArray(data.results)) {
      throw new Error("Invalid response data");
    }

    return data.results;

  } catch (error) {
    console.log("Failed to fetch pokemon, error:" + error)
    throw error;
  }
}

async function fetchAndProcessPokemonData(searchInput) {
  if(typeof searchInput !== "string") {
    throw new Error('Invalid search input');
  }

  if (!searchInput) {
    try {
      const pokemons = await fetchPokemons(offset, limit);
      const pokemonPromises = pokemons.map(pokemon => fetchPokemonByName(pokemon.name));
      const pokemonData = await Promise.all(pokemonPromises);
      return pokemonData.map(pokemon => processPokemon(pokemon));
    } catch (error) {
      throw error;
    }
  }

  isSearchPerformed = true;
  try {
    const pokemon = await fetchPokemonByName(searchInput);
    return pokemon ? [processPokemon(pokemon)] : [];
  } catch (error) {
    throw error;
  }
}

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

searchForm.addEventListener('submit', handleSearchFormSubmit);

function handleSearchFormSubmit(event) {
  event.preventDefault();
  
  // because the name is lowercase in pokeapi
  const searchQuery = searchInput.value.trim().toLowerCase();
  offset = 0;
  isSearchPerformed = false;
  fetchAndPopulatePokemon(limit, searchQuery);  
}

async function fetchAndPopulatePokemon(limit, searchInput) {
  try {
    if (loadingMore || isSearchPerformed) {
      return;
    }

    if (typeof limit !== "number" || limit <= 0) {
      throw new Error('Invalid limit parameter');
    }

    if (searchInput && typeof searchInput !== 'string') {
      throw new Error('Invalid searchInput parameter');
    }

    loadingMore = true;

    const pokemonObj = await fetchAndProcessPokemonData(searchInput);
    const pokemonContainer = document.getElementById("pokemon-column");

    clearContainer(pokemonContainer);

    const fragment = document.createDocumentFragment();

    for (const pokemon of pokemonObj) {
      const pokemonDiv = createPokemonElement(pokemon);
      fragment.appendChild(pokemonDiv);
    }

    pokemonContainer.appendChild(fragment);

    offset += limit;
    loadingMore = false;

    if (searchInput) {
      // Reset the flag after search is complete
      isSearchPerformed = true;
    }

  } catch (error) {
    loadingMore = false;
    throw error;
  }
}

fetchAndPopulatePokemon(limit, "");

