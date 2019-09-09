'use strict';

// Defining my API key along with the beginning of the API URL
const apiKey = '67Bd4ck0ehZCUIk0pgXXpiK3xP2liXNnyruiboJm'; 
const searchURL = `https://api.fda.gov/animalandveterinary/event.json`;

//This function is to take the take the search term to use as URL
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

//This takes in the query from watch form
//FDA API is frustrating as it will only take a single argument to search with along with max results
function getEvents(searchTerm, maxResults) {
    //This is where the API Key, search and limit are mapped
    const params = {
      api_key: apiKey,
      search: searchTerm,
      limit: maxResults
    };

    const queryString = formatQueryParams(params)
    //This is where everything is concatinated to create the search url
    const url = searchURL + '?' + queryString;
    
    //for debugging
    console.log(url);

    // to grab the URL along with a error catching
    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => displayResults(responseJson))
      .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
      });
  }

  function displayResults(responseJson) {
    // if there are previous results, remove them
    console.log(responseJson);
    $('#results-list').empty();
    // iterate through the items array and add them to the results table. Using nested for loops because reported animal may have been on multiple medications
    // Also, using these results fields because advised by Vet Tech that is what they look for.
    for (let i = 0; i < responseJson.results.length; i++){
      
      $('#results-list').append(
        `
        <tr>
          <td class="field" colspan="2">Report Received Date:</td>
          <td>${responseJson.results[i].original_receive_date}</td>
        </tr>
        <tr>
          <td class="field" colspan="2">Patient Disposition</td>
          <tr></tr>
          <td class="field">Species:</td> <td>${responseJson.results[i].animal.species}</td>
          <td class="field">Breed:</td> <td>${responseJson.results[i].animal.breed.breed_component}</td>
          <td class="field">Gender:</td> <td>${responseJson.results[i].animal.gender}</td>
          <td class="field">Age (years):</td> <td>${responseJson.results[i].animal.age.min}</td>
          <td class="field">Weight (kg):</td> <td>${responseJson.results[i].animal.weight.min}</td>
        </tr>
        `
        );
      $('#results-list').append(`<tr><td class="field" colspan="4">Medications used at time of report:<td></tr>`);

      for (let j = 0; j < responseJson.results[i].drug.length; j++) {
        for (let k = 0; k < responseJson.results[i].drug[j].active_ingredients.length; k++) {
          $('#results-list').append(
           `<td>${responseJson.results[i].drug[j].active_ingredients[k].name} ${responseJson.results[i].drug[j].active_ingredients[k].dose.numerator} mg</td>`
          )};
            };

      $('#results-list').append(`<tr><td class="field">Reactions:</td>`);      
        
      for (let l = 0; l < responseJson.results[i].reaction.length; l++) {
        $('#results-list').append(
          `<td>${responseJson.results[i].reaction[l].veddra_term_name}</td>`)
            };

        $('#results-list').append(
        `
        <tr>
          <td class="field">Results:</td>
          <td>${responseJson.results[i].outcome[0].medical_status}</td> 
        </tr>
        <tr class="blank_row"></tr>
        `
        )};
    //display the results section  
    $('#results').removeClass('hidden');
  };

//This function stops default behavior and takes in the user search
function watchForm() {
    $('form').submit(event => {
      event.preventDefault();
      const searchTerm = $('#js-drug-active-ingred').val();
      const maxResults = $('#js-max-results').val();
      getEvents(searchTerm, maxResults);
    });
  }
  
  //jquery to run the JS (did you remember to link to Jquery?)
  $(watchForm);