let loadingMore = false;
let offset = 0;
const limit = 20;
let isSearchPerformed = false;
const fuse = new Fuse([], {
  keys: ['name'],
});

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

async function fetchAndProcessPokemonData(searchInput, fuse) {
  if (typeof searchInput !== "string") {
    throw new Error('Invalid search input');
  }

  try {
    if (!searchInput) {
      const pokemons = await fetchPokemons(offset, limit);
      const pokemonPromises = pokemons.map(pokemon => fetchPokemonByName(pokemon.name));
      return await Promise.all(pokemonPromises);
    }

    isSearchPerformed = true;
    const pokemon = await fetchPokemonByName(searchInput);
    return pokemon ? [pokemon] : [];
  } catch (error) {
    throw error;
  }
}

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', handleSearchInputChange);

function handleSearchInputChange(event) {
  const searchQuery = event.target.value.trim().toLowerCase();
  offset = 0;
  isSearchPerformed = false;

  if (searchQuery === "") {
    clearContainer(document.getElementById("pokemon-column"));
    fetchAndPopulatePokemon(limit, null); // Fetch and populate all Pokémon
    return;
  }

  fetchAndPopulatePokemon(limit, searchQuery);

  // Remove the scroll event listener during instant search
  window.removeEventListener("scroll", checkScrollEnd);
}

async function fetchAndPopulatePokemon(limit, searchInput) {
  try {
    if (isSearchPerformed && !searchInput) {
      clearContainer(document.getElementById("pokemon-column"));
      offset = 0;
      isSearchPerformed = false;
      loadingMore = false;
      fuse.setCollection([]); // Clear the Fuse.js collection
    }

    if (typeof limit !== "number" || limit <= 0) {
      throw new Error('Invalid limit parameter');
    }

    if (searchInput && typeof searchInput !== 'string') {
      throw new Error('Invalid searchInput parameter');
    }

    loadingMore = true;

    let pokemonData = [];
    
    if (searchInput) {
      pokemonData = await fetchAndProcessPokemonData(searchInput, fuse);
    } else {
      const pokemons = await fetchPokemons(offset, limit);
      const pokemonPromises = pokemons.map(pokemon => fetchPokemonByName(pokemon.name));
      pokemonData = await Promise.all(pokemonPromises);
    }

    fuse.setCollection(pokemonData);

    const searchResults = searchInput ? fuse.search(searchInput).map(result => result.item) : pokemonData;

    const pokemonContainer = document.getElementById("pokemon-column");
    const fragment = document.createDocumentFragment();

    if (searchInput) {
      clearContainer(pokemonContainer);
      offset = 0; // Reset the offset for search results
    }

    for (const pokemon of searchResults) {
      const pokemonDiv = createPokemonElement(processPokemon(pokemon));
      fragment.appendChild(pokemonDiv);
    }

    pokemonContainer.appendChild(fragment);

    loadingMore = false;

    if (searchInput) {
      // Reset the flag after search is complete
      isSearchPerformed = false;
    } else {
      offset += limit; // Increment offset for loading more
    }
  } catch (error) {
    loadingMore = false;
    throw error;
  }
}

fetchAndPopulatePokemon(limit, "");
