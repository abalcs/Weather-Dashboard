// Step 1: connecting variables to the DOM and getting input
let userInput;
let pastSearch = document.querySelector('#past-search-buttons');
let currentForecast = document.querySelector('#current-forecast');
let searchHistory = document.querySelector('#searched-city');
let fiveDayForecast = document.querySelector('#five-day-forecast');
let fiveDayCity = document.querySelector('#forecast');

let formInput = document.getElementById("city-search-form");

formInput.addEventListener('submit', (e) => {
    e.preventDefault()
    userInput = document.querySelector('#city').value;
    console.log(userInput);

    getWeather()
})



let getWeather = () => { 
    // step 2: create api URL for the Api request
    let apiKey = 'd788f32e8b9da745fbd42aba6ed8176a'
    let requestURL = `http://api.openweathermap.org/data/2.5/weather?q=${userInput}&APPID=${apiKey}&units=imperial`

    // step 3: give that api key to fetch
    fetch(requestURL) 
        .then(res => {
            console.log("WAITING TO PARSE...", res) 
            return res.json()
        })
        .then(response => {
            console.log("worked...")
            // organize the response into a signle object to be passed to other functions
            let data = {
                city: userInput,
                temp: response.main.temp,
                humidity: response.main.humidity,
                wind: response.wind.speed,

                futureforcast: [
                    {
                        // day 1
                    },
                    {
                        // day 2
                    },
                    {
                        // day 3
                    }
                ]
            }
            
            // passing weather data to be displayed on DOM
            displayWeather(data);

            // data.main.temp
            // data.main.humidity
            // data.wind.speed
            // data.  uv
            

            // city name, 
            // the date, 
            // an icon representation of weather conditions, 
            // the temperature, 
            // the humidity, 
            // the wind speed, 
            // ad the UV index

            // I am presented with
             //a color that indicates whether the conditions are favorable, 
             //moderate, or severe

            // I am presented with
             //a 5-day forecast that displays the date, 
             //an icon representation of weather conditions, 
             //the temperature, 
             //the wind speed, 
             //and the humidity
        })
        .catch(e => {
            console.log("THERE WAS AN ERROR!", e)
        }) 
} 


// save data to local storage
let localStorage = () => {
    // THEN I am presented with current and future conditions for that city and that city is added to the search history
}


// step 4: append data from getWeather
let displayWeather = (weatherData) => {
    // <div class="bootstrap-card">
    //     <div class="city-name"></div>
    //     <div class="city-weather"></div> 
    //     <div class="city-humidity"></div>
    //     <div class="city-wind"></div>
    // </div>

    
    //step 4.1 : assemble the details inside the card first
    let card_city_name = document.createElement("h2");
    card_city_name = weatherData.city;






    
    // step4.2 append the card details to the actual card
    let card = document.createElement("div");
    card.classList.add("card") // give it bootstrap classes
    card.append(card_city_name);    // append details inside the card

    //step4.3 LAST append the card to the container in HTML
    let $currentWeather = document.getElementById("current-weather-container");
    $currentWeather.append(card)

}

// use local storage for this part
// I am again presented with current and future conditions for that city

