async function fetchPokemonURLs() {
    try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon/");
        if (response.ok) {
            const data = await response.json();
            const pokemonData = data.results;
            const pokemonURLs = pokemonData.map(result => result.url);
            
            return pokemonURLs
        } else {
            throw new Error("Error fetching Pokemon from PokeAPI");
        }
    } catch {
        console.log(error)
    }
}

async function fetchPokemonData() {
    const pokemonObj = [];
    try {
        const urls = await fetchPokemonURLs();
        const responses = await Promise.all(
            urls.map(url => fetch(url))
        );

        const pokemonData = await Promise.all(
            responses.map(response => response.json())
        );

        pokemonData.forEach(pokemon => {
            pokemonObj.push({
                id: pokemon.id,
                name: pokemon.name,
                sprites: pokemon.sprites.other.home.front_default, // we are using this as our main image
                height: pokemon.height,
                weight: pokemon.weight,
                types: pokemon.types
            });
        })

        return pokemonObj

    } catch (error) {
        console.log(error);
    }
}

async function fetchAndPopulatePokemon() {
    try {
        const pokemonObj = await fetchPokemonData();
        const pokemonContainer = document.getElementById("pokemon-column");

        for (const pokemon of pokemonObj.sort((a,b) => a.id - b.id)) {
            const pokemonDiv = document.createElement("div");
            const pokemonWeight = convertWeightFromHectogramsToKilograms(pokemon.weight)
            const pokemonHeight = convertHeightFromDecimetersToMeters(pokemon.height)
            pokemonDiv.className = "col-lg-4 col-md-6 col-12";
            pokemonDiv.innerHTML = `
                <div class="card">
                    <div class="text-center">
                        <img src="${pokemon.sprites}" class="card-img-top sprites" alt="${pokemon.name}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title text-center">${pokemon.name}</h5>
                        <div class="d-flex flex-row justify-content-center">
                        ${pokemon.types
                            .map(type => `
                                <div class="icon ${type.type.name} p-2" data-toggle="tooltip" data-placement="left" title="${capitalizeFirstLetter(type.type.name)}">
                                    <img class="tooltip-type" src="assets/pokemon-type-icons/${type.type.name}.svg"/>
                                </div>`)
                            .join('')}
                        </div>
                        <div class="d-flex flex-row justify-content-center">
                            <div class="scale"><i class="fa-solid fa-weight-scale"></i> ${pokemonWeight} kg </div>
                            <div class="scale"><i class="fa-solid fa-ruler-vertical"></i> ${pokemonHeight} m </div>
                        </div>
                    </div>
                </div>
            `;
            pokemonContainer.appendChild(pokemonDiv);
        }
    } catch {
        console.log(error)
    }
}

function convertWeightFromHectogramsToKilograms(weightInHectograms) {
    const weightInKilograms = (weightInHectograms / 10).toFixed(2);
    return weightInKilograms;
}

function convertHeightFromDecimetersToMeters(heightInDecimeters) {
    const heightInMeters = (heightInDecimeters / 10).toFixed(2);
    return heightInMeters;
}  

function initializeTooltips() {
    $(document).ready(function() {
      $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    });
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

fetchAndPopulatePokemon();
initializeTooltips();