let latitude;
let longitude;
let inputCity;
let selectCity;
let searchCity;
let cityList = [];
let searchInput = $("#searchInput")

searchButton.addEventListener("click", checkCityEntry)

function checkCityEntry() {
    inputCity = searchInput.val().replace(/\s/g, "");

    if (inputCity == "") {
        alert('Please enter a city to check the weather!')

    } else {
        if (inputCity.includes(",")) {
            searchCity = inputCity.toUpperCase();
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
    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity},USA&Appid=d788f32e8b9da745fbd42aba6ed8176a&units=imperial`;
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

