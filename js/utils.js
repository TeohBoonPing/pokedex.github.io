function convertWeightFromHectogramsToKilograms (weightInHectograms) {
  const weightInKilograms = (weightInHectograms / 10).toFixed(2)
  return weightInKilograms
}

function convertHeightFromDecimetersToMeters (heightInDecimeters) {
  const heightInMeters = (heightInDecimeters / 10).toFixed(2)
  return heightInMeters
}

function capitalizeFirstLetter (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function initializeTooltips () {
  $(document).ready(function () {
    $('body').tooltip({ selector: '[data-toggle=tooltip]' })
  })
}

function checkScrollEnd () {
  const scrollPosition = window.innerHeight + window.pageYOffset
  const bodyHeight = document.body.offsetHeight

  if (scrollPosition >= bodyHeight) {
    fetchAndPopulatePokemon()
  }
}

function processPokemon(pokemon) {
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

function clearContainer(container) {
  container.innerHTML = '';
}

function createPokemonElement(pokemon) {
  const pokemonDiv = document.createElement("div");
  const pokemonWeight = convertWeightFromHectogramsToKilograms(pokemon.weight);
  const pokemonHeight = convertHeightFromDecimetersToMeters(pokemon.height);
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
  return pokemonDiv;
}

initializeTooltips();
window.addEventListener("scroll", checkScrollEnd);