function displayResults(data, isToday) {
    const day = isToday ? 'Today' : 'Tomorrow';
    const resultsElement = document.getElementById('results');
    // Clear previous results if it's a new search for 'Today'
    if (isToday) {
        resultsElement.innerHTML = '';
    }
    resultsElement.innerHTML += `
        <h3>${day}</h3>
        <p>Sunrise: ${new Date(data.sunrise).toLocaleTimeString()}</p>
        <p>Sunset: ${new Date(data.sunset).toLocaleTimeString()}</p>
        <p>Dawn: ${new Date(data.civil_twilight_begin).toLocaleTimeString()}</p>
        <p>Dusk: ${new Date(data.civil_twilight_end).toLocaleTimeString()}</p>
        <p>Day Length: ${data.day_length}</p>
        <p>Solar Noon: ${new Date(data.solar_noon).toLocaleTimeString()}</p>
        <p>Time Zone: ${data.timezone_id}</p>
    `;
}

function displayError(message) {
    const resultsElement = document.getElementById('results');
    resultsElement.innerHTML = `<p class="error">${message}</p>`;
}

function fetchSunriseSunset(lat, lng, isToday = true) {
    const date = isToday ? new Date() : new Date(Date.now() + 86400000);
    const dateString = date.toISOString().split('T')[0];

    fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${dateString}&formatted=0`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                displayResults(data.results, isToday);
                if (isToday) {
                    // Fetch for tomorrow after displaying today's data
                    fetchSunriseSunset(lat, lng, false);
                }
            } else {
                displayError('Unable to fetch sunrise and sunset data.');
            }
        })
        .catch(error => {
            displayError('An error occurred: ' + error.message);
        });
}

function searchLocation() {
    const locationInput = document.getElementById('locationInput').value;
    if (!locationInput) {
        displayError('Please enter a location');
        return;
    }

    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationInput)}&key=eb95fd16ccea426db9ff7071674f4002`)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry;
                fetchSunriseSunset(lat, lng);
            } else {
                displayError('Unable to find the location.');
            }
        })
        .catch(error => {
            displayError('An error occurred during geocoding: ' + error.message);
        });
}

document.getElementById('getCurrentLocation').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            fetchSunriseSunset(position.coords.latitude, position.coords.longitude);
        }, function(error) {
            displayError('Geolocation error: ' + error.message);
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    } else {
        displayError('Geolocation is not supported by this browser.');
    }
});

document.getElementById('presetLocations').addEventListener('change', function() {
    const cities = {
        "New York": { lat: 40.7128, lng: -74.0060 },
        "London": { lat: 51.5074, lng: -0.1278 },
        "Tokyo": { lat: 35.6895, lng: 139.6917 },
        "Sydney": { lat: -33.8688, lng: 151.2093 },
        "Cairo": { lat: 30.0444, lng: 31.2357 },
        "Chicago": { lat: 41.8781, lng: -87.6298 }
    };
    const selectedCity = this.value;
    if (selectedCity && cities[selectedCity]) {
        const { lat, lng } = cities[selectedCity];
        fetchSunriseSunset(lat, lng);
    }
});

document.getElementById('searchLocation').addEventListener('click', searchLocation);
