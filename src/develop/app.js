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

