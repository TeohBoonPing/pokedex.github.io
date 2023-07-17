import {
    processPokemon,
} from './utils.js';

export let offset = 0;
export let loadingMore = false;
export let isSearchPerformed = false;
export const fuse = new Fuse([], {
  keys: ['name'],
});

export async function fetchPokemonByName(name) {
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

export async function fetchPokemons(offset, limit) {
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

export async function fetchAndProcessPokemonData(searchInput) {
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

export async function fetchAndPopulatePokemon(limit, searchInput) {
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

      return pokemonData;
    } catch (error) {
      loadingMore = false;
      throw error;
    }
}
  
export async function fetchAndDisplayPokemonDetails(name) {
    try {
      if(!name) {
        throw new Error("No pokemon provided");
      }
  
      const pokemon = await fetchPokemonByName(name);
      createPokemonDetailsElement(pokemon);
  
    } catch (error) {
      throw error;
    }
}

export async function fetchPokemonSpecies(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch Pokémon species");
    }
    return await response.json();
}

export async function fetchPokemonEvolution(name) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new Error("Invalid name parameter");
    }
  
    try {
      const pokemonData = await fetchPokemonByName(name.toLowerCase());
  
      const speciesUrl = pokemonData.species.url;
      const speciesData = await fetchPokemonSpecies(speciesUrl);
  
      const evolutionChainUrl = speciesData.evolution_chain.url;
      const evolutionData = await fetchEvolutionChain(evolutionChainUrl);
  
      const evolutionChain = await fetchEvolutionChainSprites(evolutionData.chain);
  
      const evolution = {
        name: name,
        evolutionChain: evolutionChain,
      };
  
      return evolution;
    } catch (error) {
      console.error("Failed to fetch pokemon:", error);
      throw error;
    }
}

export async function fetchEvolutionChain(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch Pokémon evolution chain");
    }
    return await response.json();
}

export async function fetchEvolutionChainSprites(chain) {
    const evolutionChain = [];

    const fetchSprites = async (speciesName) => {
        try {
        const pokemonData = await fetchPokemonByName(speciesName);
        const spriteUrl = pokemonData.sprites?.other.home.front_default;
        return spriteUrl;
        } catch (error) {
        console.error(`Failed to fetch sprites for ${speciesName}:`, error);
        return null;
        }
    };

    const processChain = async (chain) => {
        const speciesName = chain.species.name;
        const spriteUrl = await fetchSprites(speciesName);

        evolutionChain.push({ name: speciesName, sprite: spriteUrl });

        for (const nextChain of chain.evolves_to) {
        await processChain(nextChain);
        }
    };

    await processChain(chain);

return evolutionChain;
}

export async function fetchPokemonDescriptionByName(name) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name.toLowerCase()}`);
        const speciesData = await response.json();
    
        // Find the English flavor text entry
        const englishEntry = speciesData.flavor_text_entries.find((entry) => entry.language.name === 'en');
        const description = englishEntry.flavor_text;

        return description;
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

export async function fetchPokemonGenderByName(name) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
      const speciesData = await response.json();
  
      const genderRate = speciesData.gender_rate;
      const isGenderless = genderRate === -1;
  
      const genderObj = isGenderless
        ? { "genders": { "genderless": 100 } }
        : {
            "genders": {
              "genderless": 100,
              "male": 100 - ((genderRate / 8) * 100),
              "female": (genderRate / 8) * 100
            }
        };
      return genderObj;
    } catch (error) {
      throw error;
    }
}

export async function fetchPokemonWeaknessesByName(name) {
    try {
        const response = await fetchPokemonByName(name);
        const pokemonData = await response;

        const types = pokemonData.types.map((typeSlot) => typeSlot.type.name);

        const typePromises = types.map((type) => fetch(`https://pokeapi.co/api/v2/type/${type}`));
        const typeResponses = await Promise.all(typePromises);
        const typeData = await Promise.all(typeResponses.map((typeResponse) => typeResponse.json()));
        
        const weaknesses = typeData.reduce((acc, type) => {
            const typeWeaknesses = type.damage_relations.double_damage_from.map((weakness) => weakness.name);
            return [...acc, ...typeWeaknesses];
        }, []);

        return weaknesses;
    } catch (error) {
        throw error;
    }
}

export async function fetchPokemonStrengthsByName(name) {
    try {
      const response = await fetchPokemonByName(name);
      const pokemonData = await response;
  
      const types = pokemonData.types.map((typeSlot) => typeSlot.type.name);
  
      const typePromises = types.map((type) => fetch(`https://pokeapi.co/api/v2/type/${type}`));
      const typeResponses = await Promise.all(typePromises);
      const typeData = await Promise.all(typeResponses.map((typeResponse) => typeResponse.json()));
  
      const strengths = typeData.reduce((acc, type) => {
        const typeStrengths = type.damage_relations.double_damage_to.map((strength) => strength.name);
        return [...acc, ...typeStrengths];
      }, []);
  
      return strengths;
    } catch (error) {
      throw error;
    }
}

window.fetchPokemonByName = fetchPokemonByName;
window.fetchPokemons = fetchPokemons;
window.fetchAndProcessPokemonData = fetchAndProcessPokemonData;
window.fetchAndDisplayPokemonDetails = fetchAndDisplayPokemonDetails;
window.loadingMore = loadingMore;
window.offset = offset;
window.fetchPokemonDescriptionByName = fetchPokemonDescriptionByName;
window.fetchPokemonGenderByName = fetchPokemonGenderByName;
window.fetchPokemonWeaknessesByName = fetchPokemonWeaknessesByName;
window.fetchPokemonStrengthsByName = fetchPokemonStrengthsByName;