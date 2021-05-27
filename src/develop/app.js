let latitude;
let longitude;
let city;
let cityChoice;
let cityArray = [];
let searchInput = $("#searchInput")

searchButton.addEventListener("click", checkCityEntry)

function checkCityEntry() {
    city = searchInput.val().replace(/\s/g, "");

    if (city == "") {
        alert('Please enter a city to check the weather!')

    } else {
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
    return fetch(weatherUrl)
        .then(function (response1) {
            if (response1.ok) {
                return response1.json()
            } else {
                console.log(response1);
                throw new Error('Failed to get coordinates')
            }
        })
        .then((data) => {
            latitude = data.coord.lat;
            longitude = data.coord.lon;
            console.log(latitude)
            console.log(longitude)
            return {
                latitude: data.coord.lat,
                longitude: data.coord.long
            }
        })
}

function getOneCall(input) {
    // let { latitude, longitude } = input;
    let oneCallUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&Appid=d788f32e8b9da745fbd42aba6ed8176a&units=imperial";
    return fetch(oneCallUrl)
        .then(function (response) {
            if (response.ok) {
                return response.json().then(function (data) {
                    for (let i = 1; i < 6; i++) {
                        let dayTitleCard = $(`#day${i}Title`);
                        dayTitleCard.text(dayjs.unix(data.daily[i].dt).format('ddd    MM/DD'));
                        let dayIconCard = $(`#day${i}Icon`);
                        dayIconCard.attr("src", "http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + ".png");
                        let dayDescCard = $(`#day${i}Desc`);
                        dayDescCard.html(`Lo: ${parseInt(data.daily[i].temp.min)}\xB0 F</br>Hi: ${parseInt(data.daily[i].temp.max)}\xB0 F</br>Humid: ${data.daily[i].humidity} %</br>Wind: ${data.daily[i].wind_speed} MPH `);
                    }

                    let weatherTitle = $("#weatherTitle");
                    weatherTitle.text(`5-Day Forecast: ${cityChoice}`);
                    let currentCity = $("#currentCity");
                    currentCity.text(`Current Forecast: ${cityChoice}`);
                    let curDateCard = $("#currentTitle");
                    curDateCard.text(dayjs.unix(data.current.dt).format('ddd, MMM DD, YYYY'));
                    let curIconCard = $("#currentIcon");
                    curIconCard.attr("src", "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png");
                    let curTempCard = $("#currentTemp");
                    curTempCard.text(`Temp: ${data.current.temp}`);
                    let curCondCard = $("#currentDesc");
                    curCondCard.text(`Conditions: ${data.current.weather[0].main}`);
                    let curUviCard = $("#currentUvi");
                    curUviCard.text(`UV Index: ${data.current.uvi}`);
                    let curWindCard = $("#currentWind");
                    curWindCard.text(`Wind Speed: ${data.current.wind_speed}`);
                    let curHumidCard = $("#currentHumidity");
                    curHumidCard.text(`Humidity: ${data.current.humidity}`)

                    if (parseInt(data.current.uvi) < 3) {
                        $("#currentUvi").addClass("uviGood")
                    } else if (parseInt(data.current.uvi) < 6) {
                        $("#currentUvi").addClass("uviModerate")
                    } else if (parseInt(data.current.uvi) < 8) {
                        $("#currentUvi").addClass("uviBad")

                    } else {
                        $("#currentUvi").addClass("uviExtreme")
                    }
                })
            } else {
                console.log(response);
            }
        })
};

function storeCity() {
    
    let cityArray = JSON.parse(localStorage.getItem("cityArray")) || [];

    if (cityArray.length > 10) {
        cityArray.splice(0, 1);
    }

    if (!cityArray.includes(cityChoice)) {
            cityArray.push(cityChoice)
            localStorage.setItem("cityArray", JSON.stringify(cityArray));
            cityList();
        }  
    }

function cityList() {
    let listEl = $(".list-group").empty();
    cityArray = JSON.parse(localStorage.getItem("cityArray"));
    if (cityArray) {
        for (let city of cityArray) {
                let btn = $("<button>", {
                text: city
            })

            let li = $('<li>').append(btn)
            listEl.append(li);
            btn.on ('click', function() {
                searchInput.val(city)
                checkCityEntry();

            })
        }
    }
};

cityList();

