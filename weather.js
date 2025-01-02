const searchBar = document.querySelector('.searchbar');
const searchBtn = document.querySelector('.search-btn');
const Error = document.querySelector('.not-found');
const search = document.querySelector('.search-city');
const weatherInfo = document.querySelector('.weather-info');
const countryTxt = document.querySelector('.country-txt')
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');
const forecastItemContainer = document.querySelector('.forecast-items-container');
const suggestions = document.querySelector('.suggestions');

const apiKey = '81b2ccecfdffdc6a50996d3437f87b39';

suggestions.style.visibility = 'hidden';
searchBtn.addEventListener('click', () => {
   if(searchBar.value.trim() !== ''){
     UpdateWeatherInfo(searchBar.value);
     searchBar.value = '';
     suggestions.style.visibility = 'hidden';
     searchBar.blur();
   }
});
  
searchBar.addEventListener('keydown',(e) => {
    if(e.key === 'Enter' && searchBar.value.trim() !== ''){
        UpdateWeatherInfo(searchBar.value);
        searchBar.value = '';
        suggestions.style.visibility = 'hidden';
        searchBar.blur();
    }else {
        search.style.visibility = 'visible';
        ShowDisplaySection();
       }
});

searchBar.addEventListener("keyup", () => {
  if(searchBar.value.trim() !== '') {
    showSuggestions(searchBar.value);
    search.style.visibility = 'hidden';
    suggestions.style.visibility = 'visible';
   } else{
    suggestions.style.visibility = 'hidden';
    ShowDisplaySection();
  }
});

async function getFetchData(endPoint, city){ 
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;

    const response = await fetch(apiUrl);
    return response.json();
}

function getWeatherIconByMain(main) {
    // Map weather "main" values to appropriate icons
    const icons = {
        Thunderstorm: 'thunder.svg',
        Drizzle: 'rainy-7.svg',
        Rain: 'rainy-3.svg',
        Snow: 'snowy-6.svg',
        Mist: 'mist.svg',
        Smoke: 'mist.svg',
        Haze: 'mist.svg',
        Dust: 'mist.svg',
        Fog: 'mist.svg',
        Sand: 'mist.svg',
        Ash: 'mist.svg',
        Squall: 'mist.svg',
        Tornado: 'mist.svg',
        Clear: 'day.svg',
        Clouds: 'cloudy.svg',
    };
    return icons[main] || 'weather.svg'; // Default to unknown.svg if main value not found in icons map.
}
async function UpdateWeatherInfo(city){
    const weatherData = await getFetchData('weather', city);
    if(weatherData.cod !== 200){
        ShowDisplaySection(Error);
        return;
        }
        console.log(weatherData);

        const {
            name: country,
            main: { temp, humidity },
            weather: [{ main }],
            wind: { speed },
        } = weatherData

        countryTxt.textContent = country;
        tempTxt.textContent = `${Math.round(temp)} °C`;
        conditionTxt.textContent = main;
        humidityValueTxt.textContent = `${humidity} %`;
        const speedKmH = (speed * 3.6).toFixed(1); // Converts and rounds to 1 decimal
        windValueTxt.textContent = `${Math.round(speedKmH)} km / h`;
        const iconName = getWeatherIconByMain(main);
        weatherSummaryImg.src = `animated/${iconName}`;
        weatherSummaryImg.alt = main;
        currentDateTxt.textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
});
        await updateForecastsInfo(city);
        ShowDisplaySection(weatherInfo);
}
async function updateForecastsInfo(city){
    const forecastData = await getFetchData('forecast', city);
    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];
    forecastItemContainer.innerHTML = "";
   
    forecastData.list.forEach(forecastWeather => {
        if(forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)){
        updateForecastsItems(forecastWeather);
    }
    });
   
}
function updateForecastsItems(forecastWeather){
    const {
        dt_txt: date,
        main: { temp },
        weather: [{ main }],
    } = forecastWeather;

    const iconName = getWeatherIconByMain(main);
    const forecastItem = `
      <div class="forecast-item">
                <h5 class="forecast-item-date regular-txt">${new Date(date).toLocaleDateString('en-US', { day: 'numeric', month:'short' })}</h5>
                <img src="animated/${iconName}" class="forecast-item-img" alt="${main}">
                <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
            </div>
    `;
    forecastItemContainer.insertAdjacentHTML('beforeend',forecastItem);
}

let cities = [];

fetch('https://countriesnow.space/api/v0.1/countries')
.then(response => response.json())
.then(data => {
    cities = data.data.flatMap(country => country.cities);
    }).catch(err => console.error("Error fetching cities:",err));

function showSuggestions(value) {
    // Clear previous suggestions
    suggestions.innerHTML = "";
  
    if (value) {
      // Filter cities based on input value
      const filteredCities = cities.filter(city =>
        city.toLowerCase().startsWith(value.toLowerCase())
      );
  
      // Generate suggestion list items
     if (filteredCities.length === 0) {
            // No matches, hide suggestions
            suggestions.style.display = "none";
        } else {
            suggestions.style.display = "block"; // Show suggestions
            filteredCities.forEach(city => {
                const li = document.createElement("li");
                li.textContent = city;

                li.addEventListener("click", () => {
                    searchBar.value = city;
                    searchBar.value = ""; // Clear suggestions
                    suggestions.style.display = "none"; // Hide suggestions
                    UpdateWeatherInfo(city); // Fetch weather data
                });

                suggestions.appendChild(li);
            });
        }
    } else {
        suggestions.style.display = "none"; // Hide suggestions if input is empty
    }
}

function ShowDisplaySection(section) {
    [weatherInfo, search, Error].forEach(section => section.style.display = 'none');
    section.style.display = 'flex';
}