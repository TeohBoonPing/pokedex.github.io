import {
  fetchAndPopulatePokemon,
  fetchPokemonEvolution,
  fetchPokemonDescriptionByName,
  fetchPokemonGenderByName,
  fetchPokemonWeaknessesByName,
  fetchPokemonStrengthsByName,
} from './api.js'

export const limit = 9;

const pokemonTypeColors = [
  { name: "bug", color: "#7bcf00" },
  { name: "dark", color: "#5a566a" },
  { name: "dragon", color: "#0076ff" },
  { name: "electric", color: "#ffde00" },
  { name: "fairy", color: "#ff76ff" },
  { name: "fighting", color: "#ff215b" },
  { name: "fire", color: "#ff9900" },
  { name: "flying", color: "#89bdff" },
  { name: "ghost", color: "#4e6aff" },
  { name: "grass", color: "#62b957" },
  { name: "ground", color: "#ff6b0d" },
  { name: "ice", color: "#2ee4c6" },
  { name: "normal", color: "#9fa39d" },
  { name: "poison", color: "#f149ff" },
  { name: "psychic", color: "#ff6c64" },
  { name: "rock", color: "#d8bc5a" },
  { name: "steel", color: "#23a1bd" },
  { name: "water", color: "#14a8ff" },
];

function convertWeightFromHectogramsToKilograms (weightInHectograms) {
  const weightInKilograms = (weightInHectograms / 10)
  return weightInKilograms
}

function convertHeightFromDecimetersToCentimeters (heightInDecimeters) {
  const heightInCentimeters = heightInDecimeters * 10;
  return heightInCentimeters;
}

function capitalizeFirstLetter (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function initializeTooltips () {
  $(document).ready(function () {
    $('body').tooltip({ selector: '[data-toggle=tooltip]' })
  })
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
    fetchAndPopulatePokemon(1, limit, null); // Pass null as the search query parameter
    unhidePagination();
    return;
  }

  fetchAndPopulatePokemon(1, limit, searchQuery);
}

export function clearContainer(container) {
  container.innerHTML = '';
}

export function createPaginationElement(totalPages, currentPage) {
  const paginationHTML = `
    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
          <a class="page-link" href="index.html?page=${currentPage - 1}" aria-label="Previous">
            <span aria-hidden="true"><i class="fa-solid fa-chevron-left"></i></span>
          </a>
        </li>
        ${generatePageItems(totalPages, currentPage)}
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
          <a class="page-link" href="index.html?page=${currentPage + 1}" aria-label="Next">
            <span aria-hidden="true"><i class="fa-solid fa-chevron-right"></i></span>
          </a>
        </li>
      </ul>
    </nav>`;

  return paginationHTML;
}


function generatePageItems(totalPages, currentPage) {
  const maxPageItems = 3; // Maximum number of page items to display
  const ellipsisThreshold = 5; // Number of pages to trigger the ellipsis
  const maxPages = Math.min(totalPages, maxPageItems);

  let pageItemsHTML = '';

  if (currentPage > ellipsisThreshold - 2) {
    // Display ellipsis on the left side
    pageItemsHTML += `<li class="page-item"><a class="page-link" href="index.html?page=1">1</a></li>
      <li class="page-item disabled"><span class="page-link">...</span></li>`;
  }

  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(startPage + maxPages - 1, totalPages);

  if (endPage === totalPages && startPage > 1) {
    startPage = Math.max(endPage - maxPages + 1, 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageItemsHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="index.html?page=${i}">${i}</a></li>`;
  }

  if (currentPage < totalPages - 2) {
    pageItemsHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>
      <li class="page-item"><a class="page-link" href="index.html?page=${totalPages}">${totalPages}</a></li>`;
  }

  return pageItemsHTML;
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
              ${pokemon.sprites
                ? `<img src="${pokemon.sprites}" class="card-img-top sprites" alt="${pokemon.name}">`
                : `<img src="assets/image-not-found.png" class="card-img-top sprites" alt="${pokemon.name}">`
              }
            </a>
        </div>
        <div class="card-body">
            <div class="pokemon-dex-number">#${formatNumberWithLeadingZeros(pokemon.id)}</div>
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

function extractStatsFromData(data) {
  const stats = {}
  data.forEach((stat) => {
      const statName = stat.stat.name;
      const baseValue = stat.base_stat;
      stats[statName] = baseValue;
  });
  
  return stats;
}

function calculateProgressBarWidth(value, maxValue) {
  return (value / maxValue) * 100;
}

function getColourByPokemonType(type) {
  const foundType = pokemonTypeColors.find(
    pokemonType => pokemonType.name === type
  );
  return foundType ? foundType.color : null;
}

function populateProgressBar(pokemonStats, typeColour) {
  let html = '';
  const maxStatValue = Math.max(...Object.values(pokemonStats));
  for (const key in pokemonStats) {
    const progressBarWidth = calculateProgressBarWidth(pokemonStats[key], maxStatValue);
    html += `
      <label class="form-label">${key}</label>
      <div class="progress" role="progressbar" style="height: 40px">
          <div class="progress-bar" style="background-color: ${typeColour}; width: ${progressBarWidth}%;">${pokemonStats[key]}</div>
      </div> 
    `;
  }
  return html;
}

export async function createPokemonDetailsElement(pokemon) {
    const pokemonDetailsContainer = document.getElementById('pokemonDetails');
    const pokemonSprites = pokemon.sprites.other.home.front_default;
    const pokemonDescription = await fetchPokemonDescriptionByName(pokemon.name)
    const pokemonGenders = await fetchPokemonGenderByName(pokemon.name);
    const pokemonWeaknesses = await fetchPokemonWeaknessesByName(pokemon.name);
    const pokemonStrengths = await fetchPokemonStrengthsByName(pokemon.name);
    const pokemonStats = extractStatsFromData(pokemon.stats);
    const typeColour = getColourByPokemonType(pokemon.types[0].type.name);
    const evolutionData = await fetchPokemonEvolution(pokemon.name);

    pokemonDetailsContainer.innerHTML = `
    <div class="col-12 mb-5 mt-5">
      <a class="back" href="./"><i class="bi bi-arrow-left-circle-fill"></i></a>
    </div>
    <div class="col-md-12 mb-5">
      <div class="card h-100">
        <center>
          <div class="col-4">
              <div class="image-container">
                  ${pokemonSprites
                    ? `<img class="pokemon-image top-image" src="${pokemonSprites}" alt="...">
                       <img class="pokemon-image bottom-image" src="assets/pokeball.png" alt="...">
                      `
                    : `<img src="assets/image-not-found.png" class="pokemon-image bottom-image">`
                  }
              </div>
          </div>
          <div class="pokemon-dex-number mt-3">#${formatNumberWithLeadingZeros(pokemon.id)}</div>
          <div class="pokemon-name" style="background-color: ${typeColour}">${capitalizeFirstLetter(pokemon.name)}</div>
          <p class="pokemon-description">${pokemonDescription}</p>
        </center>
      </div>
    </div>
    <div class="col-md-12 col-lg-6 mb-5">
      <div class="card h-100">
        <ul class="list-group list-group-flush pokemon-details-list">
          <li class="list-group-item">
            <div class="row d-flex align-items-center">
              <div class="col-md-6">
                Gender
              </div>
              <div class="col-md-6">
                <div class="pokemon-gender d-flex flex-wrap justify-content-center">
                  ${pokemonGenders.genders.genderless ? `
                  <span>
                    <i class="gender-icon fa-solid fa-genderless" style="color: white;"></i>
                    100%
                  </span>` : ''}
                  ${pokemonGenders.genders.female ? `
                  <span>
                    <i class="gender-icon fa-solid fa-venus" style="color: pink;"></i>
                    ${pokemonGenders.genders.female}%
                  </span>` : ''}
                  ${pokemonGenders.genders.male ? `
                  <span>
                    <i class="gender-icon fa-solid fa-mars" style="color: lightblue"></i>
                    ${pokemonGenders.genders.male}%
                  </span>` : ''}
                </div>
              </div>
            </div>
          </li>
          <li class="list-group-item">
            <div class="row d-flex align-items-center">
              <div class="col-md-6">
                ${pokemonWeaknesses.length > 1 ? 'Weaknesses' : 'Weakness'}
              </div>
              <div class="col-md-6">
                <div class="d-flex flex-wrap justify-content-center">
                  ${pokemonWeaknesses.map((weakness) => `
                    <div class="icon ${weakness} p-2" data-toggle="tooltip" data-placement="left" title="${capitalizeFirstLetter(weakness)}">
                        <img class="tooltip-type" src="assets/pokemon-type-icons/${weakness}.svg"/>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </li>
          <li class="list-group-item">
            <div class="row d-flex align-items-center">
              <div class="col-md-6">
                ${pokemonStrengths.length > 1 ? 'Strengths' : 'Strength'}
              </div>
              <div class="col-md-6">
                <div class="d-flex flex-wrap justify-content-center">
                  ${pokemonStrengths.map((strength) => `
                    <div class="icon ${strength} p-2" data-toggle="tooltip" data-placement="left" title="${capitalizeFirstLetter(strength)}">
                        <img class="tooltip-type" src="assets/pokemon-type-icons/${strength}.svg"/>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="col-md-12 col-lg-6 mb-5">
      <div class="card h-100">
        <div class="card-body">
          <div class="form-group p-3 mt-2">
            ${populateProgressBar(pokemonStats, typeColour)}
          </div>
        </div>
      </div>
    </div>
   
    <div class="col-md-12 mb-5">
      <div class="card">
        <div class="card-body">
          <div class="col-md-12">
            <div class="card">
                <div class="card-body">
                  <div class="row row-cols-1 row-cols-md-5 justify-content-center align-items-center">
                  ${evolutionData.evolutionChain
                    .map((evolution, index, arr) => `
                      <div class="col-12 col-sm-12 col-md-3">
                        <div class="card">
                          <div class="text-center evolution-sprite-container" style="border-color: ${evolution.name === pokemon.name ? typeColour : 'gray'};">
                            ${evolution.sprite
                              ? `<img style="max-width:250px;" src="${evolution.sprite}" class="evolution-sprite">`
                              : `<img style="max-width:250px;" src="assets/image-not-found.png" class="evolution-sprite">`
                            }
                          </div>
                          <span class="evolution-title">${capitalizeFirstLetter(evolution.name)}</span>
                        </div>
                      </div>
                      ${index !== arr.length - 1 ? `
                        <div class="col-12 col-md-1 arrows">
                          <div class="text-center align-middle">
                            <i class="fa-solid fa-right-long evolution-arrow d-none d-md-inline" style="color: ${typeColour}"></i>
                            <i class="fa-solid fa-down-long evolution-arrow d-inline d-md-none" style="color: ${typeColour} !important"></i>
                          </div>                            
                        </div>
                      ` : ''}
                    `)
                    .join('')}
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export function showLoader(loaderWrapper) {
  loaderWrapper.removeAttribute('hidden');
}

export function hideLoader(loaderWrapper, mainContent) {
  loaderWrapper.setAttribute('hidden', '');
  mainContent.removeAttribute('hidden');
}

export function initializePage() {
  initializeTooltips();
  fetchAndPopulatePokemon(0,limit, "");
}

export function hidePagination() {
  const paginationDiv = document.getElementById("pagination");
  if (paginationDiv) {
    paginationDiv.style.display = "none";
  }
}

function unhidePagination() {
  const paginationDiv = document.getElementById("pagination");
  if (paginationDiv) {
    paginationDiv.style.display = "";
  }
}

function formatNumberWithLeadingZeros(number) {
  const formattedNumber = String(number).padStart(3, '0');
  return formattedNumber;
}