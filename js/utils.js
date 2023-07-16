import {
  fetchAndPopulatePokemon,
  
} from './api.js'

export const limit = 20;

export const pokemonTypeColors = [
  { name: "bug", color: "#7bcf00" },
  { name: "dark", color: "#5a566a" },
  { name: "dragon", color: "#0076ff" },
  { name: "electric", color: "#ffde00" },
  { name: "fairy", color: "#ff76ff" },
  { name: "fighting", color: "#ff215b" },
  { name: "fire", color: "#ff9900" },
  { name: "flying", color: "#89bdff" },
  { name: "ghost", color: "#4e6aff" },
  { name: "grass", color: "#1cd80e" },
  { name: "ground", color: "#ff6b0d" },
  { name: "ice", color: "#2ee4c6" },
  { name: "normal", color: "#9fa39d" },
  { name: "poison", color: "#f149ff" },
  { name: "psychic", color: "#ff6c64" },
  { name: "rock", color: "#d8bc5a" },
  { name: "steel", color: "#23a1bd" },
  { name: "water", color: "#14a8ff" },
];

export function convertWeightFromHectogramsToKilograms (weightInHectograms) {
  const weightInKilograms = (weightInHectograms / 10)
  return weightInKilograms
}

export function convertHeightFromDecimetersToCentimeters (heightInDecimeters) {
  const heightInCentimeters = heightInDecimeters * 10;
  return heightInCentimeters;
}

export function capitalizeFirstLetter (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function initializeTooltips () {
  $(document).ready(function () {
    $('body').tooltip({ selector: '[data-toggle=tooltip]' })
  })
}

export function checkScrollEnd() {
  const scrollPosition = window.innerHeight + window.pageYOffset;
  const bodyHeight = document.body.offsetHeight;

  if (scrollPosition >= bodyHeight && !loadingMore) {
    fetchAndPopulatePokemon(limit, "");
  }
}

export function processPokemon(pokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    sprites: pokemon.sprites.other.home.front_default,
    height: pokemon.height,
    weight: pokemon.weight,
    types: pokemon.types,
    stats: pokemon.stats,
  };
}

export function handleSearchInputChange(event) {
  const searchQuery = event.target.value.trim().toLowerCase();

  if (searchQuery === "") {
    clearContainer(document.getElementById("pokemon-column"));
    fetchAndPopulatePokemon(limit, null); // Fetch and populate all Pokémon
    return;
  }

  fetchAndPopulatePokemon(limit, searchQuery);

  // Remove the scroll event listener during instant search
  window.removeEventListener("scroll", checkScrollEnd);
}

export function clearContainer(container) {
  container.innerHTML = '';
}

export function createPokemonElement(pokemon) {
  const pokemonDiv = document.createElement("div");
  const pokemonWeight = convertWeightFromHectogramsToKilograms(pokemon.weight);
  const pokemonHeight = convertHeightFromDecimetersToCentimeters(pokemon.height);
  pokemonDiv.className = "col-lg-4 col-md-6 col-12";
  pokemonDiv.innerHTML = `
    <div class="shadow card">
        <div class="text-center">
            <a href='details.html?name=${pokemon.name}'>
              <img src="${pokemon.sprites}" class="card-img-top sprites" alt="${pokemon.name}">
            </a>
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
                <div class="scale"><i class="fa-solid fa-ruler-vertical"></i> ${pokemonHeight} cm </div>
            </div>
        </div>
    </div>
  `;
  return pokemonDiv;
}

export function extractStatsFromData(data) {
  const stats = {}
  data.forEach((stat) => {
      const statName = stat.stat.name;
      const baseValue = stat.base_stat;
      stats[statName] = baseValue;
  });
  
  return stats;
}

export function calculateProgressBarWidth(value, maxValue) {
  return (value / maxValue) * 100;
}

export function getProgressBarColorByValue(value) {
  const threshold = 50;
  const colorLookup = {
    'bg-danger': value < threshold,
    'bg-warning': value === threshold, 
    'bg-success': value > threshold,
  }
  
  return Object.keys(colorLookup).find(color => colorLookup[color]);
}

export function getColourByPokemonType(type) {
  const foundType = pokemonTypeColors.find(
    pokemonType => pokemonType.name === type
  );
  return foundType ? foundType.color : null;
}

export function createPokemonDetailsElement(pokemon) {
    const pokemonDetailsContainer = document.getElementById('pokemonDetails');
    const pokemonSprites = pokemon.sprites.other.home.front_default;
    const pokemonStats = extractStatsFromData(pokemon.stats);
    const maxStatValue = Math.max(...Object.values(pokemonStats));
    const typeColour = getColourByPokemonType(pokemon.types[0].type.name);
    
    pokemonDetailsContainer.innerHTML = `
    <div class="col-md-12" style="margin-top:30px; margin-bottom:30px;">
      <a class="back" href="index.html"><i class="bi bi-arrow-left-circle-fill"></i></a>
      <center>
          <div class="col-4 pokemon-profile">
              <div class="image-container">
                  <img class="pokemon-image top-image" src="${pokemonSprites}" alt="...">
                  <img class="pokemon-image bottom-image" src="assets/pokeball.png" alt="...">
              </div>
          </div>
          <div class="pokemon-name" style="background-color: ${typeColour}">${capitalizeFirstLetter(pokemon.name)}</div>
      </center>
    </div>
    <div class="col-md-12">
        <div class="card">
            <div class="card-body">
              <h5 class="card-title">Stats</h5>
                <div class="form-group" style="padding:20px;">
                  <label class="form-label">HP</label>
                  <div class="progress" role="progressbar">
                    <div class="progress-bar ${getProgressBarColorByValue(pokemonStats.hp)}" style="width: ${calculateProgressBarWidth(pokemonStats.hp, maxStatValue)}%">${pokemonStats.hp}</div>
                  </div>

                  <label class="form-label">Attack</label>
                  <div class="progress" role="progressbar">
                    <div class="progress-bar ${getProgressBarColorByValue(pokemonStats.attack)}" style="background-color:${typeColour}; width: ${calculateProgressBarWidth(pokemonStats.attack, maxStatValue)}%;">${pokemonStats.attack}</div>
                  </div>

                  <label class="form-label">Defense</label>
                  <div class="progress" role="progressbar">
                    <div class="progress-bar ${getProgressBarColorByValue(pokemonStats.defense)}" style="background-color:${typeColour}; width: ${calculateProgressBarWidth(pokemonStats.defense, maxStatValue)}%">${pokemonStats.defense}</div>
                  </div>

                  <label class="form-label">Speed</label>
                  <div class="progress" role="progressbar">
                    <div class="progress-bar ${getProgressBarColorByValue(pokemonStats.speed)}" style="background-color:${typeColour}; width: ${calculateProgressBarWidth(pokemonStats.speed, maxStatValue)}%">${pokemonStats.speed}</div>
                  </div>

                  <label class="form-label">Special Defense</label>
                  <div class="progress" role="progressbar">
                    <div class="progress-bar ${getProgressBarColorByValue(pokemonStats["special-defense"])}" style="background-color:${typeColour}; width: ${calculateProgressBarWidth(pokemonStats["special-defense"], maxStatValue)}%">${pokemonStats["special-defense"]}</div>
                  </div>

                  <label class="form-label">Special Attack</label>
                  <div class="progress" role="progressbar">
                    <div class="progress-bar ${getProgressBarColorByValue(pokemonStats["special-attack"])}" style="background-color:${typeColour}; width: ${calculateProgressBarWidth(pokemonStats["special-attack"], maxStatValue)}%">${pokemonStats["special-attack"]}</div>
                  </div>
                </div>
            </div>
        </div>
    </div>
  </div>`;
}

window.clearContainer = clearContainer;
window.createPokemonElement = createPokemonElement;
window.createPokemonDetailsElement = createPokemonDetailsElement;
window.convertWeightFromHectogramsToKilograms = convertWeightFromHectogramsToKilograms;
window.convertHeightFromDecimetersToCentimeters = convertHeightFromDecimetersToCentimeters;
window.capitalizeFirstLetter = capitalizeFirstLetter;
window.checkScrollEnd = checkScrollEnd
window.handleSearchInputChange = handleSearchInputChange;
window.limit = limit;