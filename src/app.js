let cityForm = document.querySelector('#city-search-form');
let cityInput = document.querySelector('#city');
let currentWeather = document.querySelector('#current-weather-container');
let searchedCity = document.querySelector('#searched-city');
let forecastCity = document.querySelector('#forecast');
let forecastWeather = document.querySelector('#fiveday-container');
let pastSearchButtonEl = document.querySelector("#past-search-buttons");

let cities = JSON.parse(localStorage.getItem('cities')) || [];

const apikey = 'af21e0e9978bb3a47d8af4f3f7fb7f88';
let requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apikey}`;

let formSubmitHandler = function(event) {
  event.preventDefault();
  let city = cityInput.value.trim();
  if(city) {
    getCityWeather(city);
    get5Day(city);
    if (cities.indexOf(city)=== -1) {
    cities.push(city);
    pastSearch();
    }
    
    cityInput.value = "";
    } else{
        alert("Please enter a City");
    }
    saveSearch();
    pastSearch(city);
}

let saveSearch = function(){
  localStorage.setItem("cities", JSON.stringify(cities));
};
// When button clicked, FETCH data from API for the city requested

let getCityWeather = function(city){
  let apiKey = "af21e0e9978bb3a47d8af4f3f7fb7f88"
  let apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=${apikey}`

  fetch(apiURL)
  .then(function(response){
      response.json().then(function(data){
          displayWeather(data, city);
      });
  });
};

let displayWeather = function(weather, searchCity){
  //clear old content
  currentWeather.textContent= "";  
  searchedCity.textContent=searchCity;

  //create date element
  let currentDate = document.createElement("span")
  currentDate.textContent=" (" + moment(weather.dt.value).format("MMM D, YYYY") + ") ";
  searchedCity.appendChild(currentDate);

  //create an image element
  let weatherIcon = document.createElement("img")
  weatherIcon.setAttribute("src", `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`);
  searchedCity.appendChild(weatherIcon);

  //create a span element to hold temperature data
  let temperatureEl = document.createElement("span");
  temperatureEl.textContent = "Temperature: " + weather.main.temp + " °F";
  temperatureEl.classList = "list-group-item"
 
  //create a span element to hold Humidity data
  let humidityEl = document.createElement("span");
  humidityEl.textContent = "Humidity: " + weather.main.humidity + " %";
  humidityEl.classList = "list-group-item"

  //create a span element to hold Wind data
  let windSpeedEl = document.createElement("span");
  windSpeedEl.textContent = "Wind Speed: " + weather.wind.speed + " MPH";
  windSpeedEl.classList = "list-group-item"

  //append to container
  currentWeather.appendChild(temperatureEl);

  //append to container
  currentWeather.appendChild(humidityEl);

  //append to container
  currentWeather.appendChild(windSpeedEl);

  let lat = weather.coord.lat;
  let lon = weather.coord.lon;
  getUvIndex(lat,lon)
}

let getUvIndex = function(lat,lon){
   let apiKey = "af21e0e9978bb3a47d8af4f3f7fb7f88"
   let apiURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`
   fetch(apiURL)
   .then(function(response){
       response.json().then(function(data){
           displayUvIndex(data)
       });
   });
}

let displayUvIndex = function(index){
   let uvIndexEl = document.createElement("div");
   uvIndexEl.textContent = "UV Index: "
   uvIndexEl.classList = "list-group-item"

   uvIndexValue = document.createElement("span")
   uvIndexValue.textContent = index.value

   if(index.value <=2){
       uvIndexValue.classList = "favorable"
   }else if(index.value >2 && index.value<=8){
       uvIndexValue.classList = "moderate "
   }
   else if(index.value >8){
       uvIndexValue.classList = "severe"
   };

   uvIndexEl.appendChild(uvIndexValue);

   //append index to current weather
   currentWeather.appendChild(uvIndexEl);
}

let get5Day = function(city){
   let apiKey = "af21e0e9978bb3a47d8af4f3f7fb7f88"
   let apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`

   fetch(apiURL)
   .then(function(response){
       response.json().then(function(data){
          display5Day(data);
       });
   });
};

let display5Day = function(weather){
   forecastCity.textContent = ""
   forecastWeather.textContent = "5-Day Forecast:";

   let forecast = weather.list;
       for(let i=5; i < forecast.length; i=i+8){
      let dailyForecast = forecast[i];
       
      console.log(dailyForecast.main)

      let forecastEl=document.createElement("div");
      forecastEl.classList = "card bg-primary text-light m-2";

      //create date element
      let forecastDate = document.createElement("h5")
      forecastDate.textContent= moment.unix(dailyForecast.dt).format("MMM D, YYYY");
      forecastDate.classList = "card-header text-center"
      forecastEl.appendChild(forecastDate);

      
      //create an image element
      let weatherIcon = document.createElement("img")
      weatherIcon.classList = "card-body text-center";
      weatherIcon.setAttribute("src", `https://openweathermap.org/img/wn/${dailyForecast.weather[0].icon}@2x.png`);  

      //append to forecast card
      forecastEl.appendChild(weatherIcon);
      
      //create temperature span
      let forecastTempEl=document.createElement("span");
      forecastTempEl.classList = "card-body text-center";
      forecastTempEl.textContent = dailyForecast.main.temp + " °F";

       //append to forecast card
       forecastEl.appendChild(forecastTempEl);

      let forecastHumEl=document.createElement("span");
      forecastHumEl.classList = "card-body text-center";
      forecastHumEl.textContent = dailyForecast.main.humidity + "  %";

      //append to forecast card
      forecastEl.appendChild(forecastHumEl);

       // console.log(forecastEl);
      //append to five day container
       forecastWeather.appendChild(forecastEl);
   }
}

let pastSearch = function(){
  pastSearchButtonEl.innerHTML = "";
for(let i = cities.length - 1; i >= 0; i--) {
  const cityName = cities[i];
  pastSearchEl = document.createElement("button");
  pastSearchEl.textContent = cityName;
  pastSearchEl.classList = "d-flex w-100 btn-light border p-2";
  pastSearchEl.setAttribute("data-city",cityName)
  pastSearchEl.setAttribute("type", "button");
  pastSearchEl.addEventListener('click', pastSearchHandler);
  pastSearchButtonEl.append(pastSearchEl);
 }
}

let pastSearchHandler = function(event){
   let city = event.target.getAttribute("data-city")
   if(city){
       getCityWeather(city);
       get5Day(city);
   }
}
pastSearch();
getCityWeather(cities[cities.length-1]);
get5Day(cities[cities.length-1]);
cityForm.addEventListener("submit", formSubmitHandler);
