const API_KEY = '74553deb'; 

const searchInput = document.getElementById('searchInput');
const yearInput = document.getElementById('yearInput');
const typeInput = document.getElementById('typeInput');
const searchBtn = document.getElementById('searchBtn');
const movieDetails = document.getElementById('movie-details');
const errorMessage = document.getElementById('error-message');

// First, check if there is an old history in LocalStorage.
const apiCache = JSON.parse(localStorage.getItem('movieCacheHistory')) || {}; 

document.addEventListener('DOMContentLoaded', () => {
    //up movie to the screen when F5 is pressed
    const savedData = JSON.parse(localStorage.getItem('lastSearchData'));
    
    if (savedData) {
        searchInput.value = savedData.Title;
        renderMovie(savedData); 
    }
});

searchBtn.addEventListener('click', () => triggerSearch());
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') triggerSearch();
});

function triggerSearch() {
    const title = searchInput.value.trim();
    const year = yearInput.value.trim();
    const type = typeInput.value;

    if (title) fetchMovie(title, year, type);
}

async function fetchMovie(title, year, type) {
    const cacheKey = `${title}_${year}_${type}`.toLowerCase();

    try {
        errorMessage.innerHTML = '';
        movieDetails.innerHTML = '<p class="welcome-text">Searching the database...</p>';

        if (apiCache[cacheKey]) {
            console.log("Veri Cache'den (Kalıcı Hafızadan) Geldi!");
            
            // f5 update
            localStorage.setItem('lastSearchData', JSON.stringify(apiCache[cacheKey]));
            renderMovie(apiCache[cacheKey]);
            return;
        }

        let url = `https://www.omdbapi.com/?t=${title}&apikey=${API_KEY}`;
        if (year) url += `&y=${year}`;
        if (type) url += `&type=${type}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === "False") {
            showError("Movie/Series not found. Please check your spelling or filters.");
            return;
        }

        // add movie to cache and save all history to localStorage
        apiCache[cacheKey] = data;
        localStorage.setItem('movieCacheHistory', JSON.stringify(apiCache));
        
        //save last data
        localStorage.setItem('lastSearchData', JSON.stringify(data));

        renderMovie(data);

    } catch (error) {
        showError("A network error occurred. Please check your connection.");
        console.error("API Error:", error);
    }
}


function renderMovie(data) {
    const posterUrl = data.Poster !== "N/A" ? data.Poster : "";

    movieDetails.innerHTML = `
        <div class="movie-layout">
            <div class="poster-container">
                ${posterUrl ? `<img src="${posterUrl}" alt="${data.Title} Poster" class="poster">` : `<div class="poster-placeholder">No Poster Available</div>`}
            </div>
            
            <div class="movie-info">
                <h2>${data.Title} <span>(${data.Year})</span></h2>
                
                <div class="badges">
                    <span class="badge imdb">IMDb: ${data.imdbRating}</span>
                    <span class="badge time">${data.Runtime}</span>
                </div>

                <p><strong>Genre:</strong> ${data.Genre}</p>
                <p><strong>Director:</strong> ${data.Director}</p>
                <p><strong>Cast:</strong> ${data.Actors}</p>
                
                <div class="plot">
                    <h3>Plot</h3>
                    <p>${data.Plot}</p>
                </div>
            </div>
        </div>
    `;
}

function showError(message) {
    movieDetails.innerHTML = '';
    errorMessage.innerHTML = `<p class="error-text">${message}</p>`;
}