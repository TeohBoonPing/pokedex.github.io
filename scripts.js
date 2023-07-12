function fetchAllPokemon() {
    fetch("https://pokeapi.co/api/v2/pokemon/")
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(out => {
            const pokemonResults = out.results;
            const pokemonURLs = [];

            pokemonResults.forEach(result => {
                pokemonURLs.push(result.url)
            });
            fetchPokemonDetails(pokemonURLs)
        });
}

function fetchPokemonDetails(urls) {

    const pokemonDetailsObj = [];

    const fetchPromises = urls.map(url =>
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(pokemonDetails => {
            console.log(pokemonDetails)
            pokemonDetailsObj.push({
                id: pokemonDetails.id,
                name: pokemonDetails.name,
                sprites: pokemonDetails.sprites.other.home.front_default,
                height: pokemonDetails.height,
                weight: pokemonDetails.weight,
                types: pokemonDetails.types
            });
        })
    );

    Promise.all(fetchPromises)
    .then(() => {
        const pokemonContainer = document.getElementById("pokemon-column");

        const pokemonTypesMapper = {
            
        }


        for (const pokemon of pokemonDetailsObj.sort((a,b) => a.id - b.id)) {
            const pokemonDiv = document.createElement("div");
            pokemonDiv.className = "col-lg pokemon-container";
            pokemonDiv.innerHTML = `
            <div class="card h-100">
                <div class="text-center"><img id="pokemon-img" src="${pokemon.sprites}"></div>
                <div class="card-body">
                <h5 class="card-title" id="pokemon-name">${pokemon.name}</h5>
                <div class="d-flex flex-row justify-content-center">
                    <div class="icon electric p-2"><img src="assets/pokemon-type-icons/electric.svg" /></div>
                    <div class="icon fighting p-2"><img src="assets/pokemon-type-icons/fighting.svg" /></div>
                </div>
                <div class="d-flex flex-row justify-content-center">
                    <div class="scale"><i class="bi bi-rulers"></i> ${pokemon.weight} kg </div>
                    <div class="scale"><i class="bi bi-rulers"></i> ${pokemon.height} cm </div>
                </div>
                </div>
                <a href="#" class="btn btn-view" style="background-color: #F2D94E;">More Details</a>
            </div>
            `;
            pokemonContainer.appendChild(pokemonDiv);
        }
    })
    .catch(error => {
        console.log("Error fetching Pokemon details:", error);
    });
}

function displayPokemon(pokemonDetails) {
    // const pokemonResults = pokemonDetails;
    // const pokemonContainer = document.getElementById("pokemon-column");
    // console.log(pokemonDetails)
    // Using the forEach() method
    // pokemonDetails.forEach(pokemon => {
    //     console.log(pokemon.name);
    //     console.log(pokemon.sprites);
    //     console.log(pokemon.height);
    //     console.log(pokemon.weight);
    // });
  

    // pokemonResults.forEach(result => {
    //     console.log(result)
    //     const pokemonDiv = document.createElement("div");
    //     pokemonDiv.className = "col-lg pokemon-container";

    //     pokemonDiv.innerHTML = `
    //     <div class="card h-100">
    //         <div class="text-center"><img id="pokemon-img" src="25.png"></div>
    //         <div class="card-body">
    //         <h5 class="card-title" id="pokemon-name">${result.name}</h5>
    //         <div class="d-flex flex-row justify-content-center">
    //             <div class="icon electric p-2"><img src="assets/pokemon-type-icons/electric.svg" /></div>
    //             <div class="icon fighting p-2"><img src="assets/pokemon-type-icons/fighting.svg" /></div>
    //         </div>
    //         <div class="d-flex flex-row justify-content-center">
    //             <div class="scale"><i class="bi bi-rulers"></i> 23 cm </div>
    //             <div class="scale"><i class="bi bi-rulers"></i> 23 kg </div>
    //         </div>
    //         </div>
    //         <a href="#" class="btn btn-view" style="background-color: #F2D94E;">More Details</a>
    //     </div>
    //     `;
    //         pokemonContainer.appendChild(pokemonDiv);
    // });
}

fetchAllPokemon();
displayPokemon();