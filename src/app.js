let userInput = document.querySelector('#city');
let searchBtn = document.querySelector('#button');
let pastSearch = document.querySelector('#past-search-buttons');

let currCity = document.querySelector('#searched-city');
let currentWeather = document.querySelector('#current-weather-container');

let forecastCity = document.querySelector('#forecast');
let forecastWeather = document.querySelector('#fiveday-container');

let requestURL = 'https://openweathermap.org/api/one-call-api';
console.log(requestURL)


// When button clicked, FETCH data from API for the city requested

  fetch('https://openweathermap.org/api/one-call-api')



// userInput to be appended to past-search and stored in localstorage

$('#button').on('click', function() {
  // const id = ;
  // const value = ;

  localStorage.setItem(id, value);
})

// API data to be displayed in current weather container w/ city name, date, icon representing conditions, temp, humidity, wind speed, and UV index w/ color indicator

// API data to be displayed in 5-day forecast area that shows date, icon representation of conditions, temp, wind, humidity

// Clicking a city in the search history should bring up weather report again for that city.

//Event listener for button click
searchBtn = addEventListener('click', function(event) {
  event.preventDefault();

})