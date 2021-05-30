//Setting the global variables
let latitude;
let longitude;
let cityChoice;
let cityArray = [];
let searchInput = $("#searchInput")

searchButton.addEventListener("click", checkCityEntry)

function checkCityEntry() {
    //Sets search value to variable & removes the empty spaces between characters
    let city = searchInput.val().replace(/\s/g, "");

    if (city == "") {
        alert('No city? No weather!')
    } else {
        //Converts the input to uppercase, runs getOneCall function, then stores in ls
        if (city.includes(",")) {
            cityChoice = city.toUpperCase();

            getCoordinates()
                .then(() => getOneCall())
                .catch(() => alert('failed to load weather'))
            storeCity();
        } else {
            alert('Please include a two-letter US State code.');
        }
    }
};

function getCoordinates() {
    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityChoice},USA&Appid=d788f32e8b9da745fbd42aba6ed8176a&units=imperial`;
    //Retrieving data from api, converting to js
    return fetch(weatherUrl)
        .then(function (response1) {
            if (response1.ok) {
                return response1.json()
            } else {
                throw new Error('Failed to get coordinates')
            }
        })
         //Setting coordinates from api to variables & returning data as an object
        .then((data) => {
            latitude = data.coord.lat;
            longitude = data.coord.lon;
            return {
                latitude: data.coord.lat,
                longitude: data.coord.long
            }
        })
}

function getOneCall(input) {
    // Retrreving the api data from onecall & setting it to a variable
    let oneCallUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&Appid=d788f32e8b9da745fbd42aba6ed8176a&units=imperial";
    return fetch(oneCallUrl)
        .then(function (response) {
            if (response.ok) {
                // Parsing fetched data to JS then looping over 5 days to display data for the 5-day-forecast
                return response.json().then(function (data) {
                    for (let i = 1; i < 6; i++) {
                        let dayTitleCard = $(`#day${i}Title`);
                        dayTitleCard.text(dayjs.unix(data.daily[i].dt).format('ddd    MM/DD'));  //Using dayjs to display dates
                        let dayIconCard = $(`#day${i}Icon`);
                        dayIconCard.attr("src", "http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + ".png");
                        let dayDescCard = $(`#day${i}Desc`);
                        dayDescCard.html(`Lo: ${parseInt(data.daily[i].temp.min)}\xB0 F</br>Hi: ${parseInt(data.daily[i].temp.max)}\xB0 F</br>Humid: ${data.daily[i].humidity} %</br>Wind: ${data.daily[i].wind_speed} MPH `);
                    }

                    let weatherTitle = $("#weatherTitle");  //Connecting to the DOM element to set the city choice to the section title
                    weatherTitle.text(`5-Day Forecast: ${cityChoice}`);
                    let currentCity = $("#currentCity");
                    currentCity.text(`Current Forecast: ${cityChoice}`);
                    let curDateCard = $("#currentTitle");
                    curDateCard.text(dayjs.unix(data.current.dt).format('ddd, MMM DD, YYYY'));  //Using dayjs for date again
                    let curIconCard = $("#currentIcon");
                    curIconCard.attr("src", "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png");
                    let curTempCard = $("#currentTemp");
                    curTempCard.text(`Temp: ${data.current.temp}`);
                    let curCondCard = $("#currentDesc");
                    curCondCard.text(`Conditions: ${data.current.weather[0].main}`);
                    let curUviCard = $("#currentUvi");
                    curUviCard.text(`UV Index: ${data.current.uvi}`);
                    let curWindCard = $("#currentWind");
                    curWindCard.text(`Wind Speed: ${data.current.wind_speed} MPH`);
                    let curHumidCard = $("#currentHumidity");
                    curHumidCard.text(`Humidity: ${data.current.humidity}%`)
                    
                    //Setting UV to display color coding based on conditions
                    const uvi = parseInt(data.current.uvi);
                    if (uvi <=3) {
                        $("#currentUvi").addClass("uviGood")
                    } else if (uvi >3 && uvi < 6) {
                        $("#currentUvi").addClass("uviModerate")
                    } else if (uvi >= 6 && uvi <8 ) {
                        $("#currentUvi").addClass("uviBad")
                    } else {
                        $("#currentUvi").addClass("uviExtreme")
                    } 
                }) 
            } 
        })
};

function storeCity() {
    // retrieves the current array and parses it to JS
    let cityArray = JSON.parse(localStorage.getItem("cityArray")) || [];
    // when the array is more than 10 cities, push the newest search to the front and remove the 11th
    if (cityArray.length > 9) {
        cityArray.splice(0, 1);
    }
    //checks if the city is already in the array and does not push it again if so, otherwise it will
    if (!cityArray.includes(cityChoice)) {
            cityArray.push(cityChoice)
            // sets the updated array as a JSON object
            localStorage.setItem("cityArray", JSON.stringify(cityArray));
            cityList();
        }  
    }

function cityList() {
    //removes all child nodes and content from the list-group element
    let listEl = $(".list-group").empty();
    cityArray = JSON.parse(localStorage.getItem("cityArray"));
    if (cityArray) {
        for (let city of cityArray) {
                let btn = $("<button>", {
                text: city
            })
            // places the most recent searched city at the top of the displayed list
            let li = $('<li>').prepend(btn)
            listEl.prepend(li);
            btn.on ('click', function() {
                searchInput.val(city)
                checkCityEntry();

            })
        }
    }
};

cityList();

