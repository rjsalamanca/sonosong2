'use strict';

const omdb_api_key = '414f1f39',
    searchInput = document.getElementById('searchBarBar'),
    movieItem = document.getElementsByClassName('movie__item'),
    soundTrackContainer = document.getElementById('soundTrackContainer');

let URL = '',
    searchPressed = false,
    moviePressed = false;

function getMovies(omdbMovie) {
    const searchResults = document.getElementById('searchResults'),
        movieList = document.getElementById('movieList'),
        error = document.getElementById('noSoundTrackContainer');
    // Resets the soundtrack container elements

    document.getElementsByClassName('youtubeVideoContainer')[0].childNodes[3].src = '';
    movieList.innerHTML = '';

    // Checks if the user has soundTrackContainer displayed
    // It will be displayed if the movie has or doesnt have a soundtrack
    if(soundTrackContainer.style.display == 'block'){
        // Used time out function to wait for transition
        soundTrackContainer.style.transition = 'opacity 0.2s';
        soundTrackContainer.style.opacity = 0;

        setTimeout(() => {
            soundTrackContainer.style.display = 'none',
            document.getElementById('moviePicture-image').innerHTML = '';
            document.getElementById('soundTrackList').innerHTML = '';
        }, 200);
    }

    if(error) error.remove();

    // Empties the list to populate searches
    if(omdbMovie != undefined){
        if(omdbMovie.Search != undefined){
            // CSS Stylings for when we have movies
            searchResults.style.transition = 'opacity 1s';
            searchResults.style.opacity = 0;

            setTimeout(() => {
                searchResults.style.display = 'block';
            }, 1000);

            omdbMovie.Search.forEach(async function(movie,index) {
                // SEARCH INDIVIDUAL FULL
                let individualMovie = `http://www.omdbapi.com/?i=${movie.imdbID}&plot=full&apikey=${omdb_api_key}`;
                let response = await get(individualMovie);
                
                const load = document.getElementById('loadingIcon');

                if(load.classList.value.indexOf('loadingNow') == -1 ){
                    load.classList.add('loadingNow');
                } else {
                    document.getElementsByClassName('loadingNow')[0].style.opacity = 1;
                }

                searchInput.parentElement.classList.add('searchBar--To-Top');

                setTimeout(function(){
                    getSingleMovie(response,index);
                    document.getElementsByClassName('loadingNow')[0].style.opacity = 0;
                    searchResults.style.opacity = 1;
                }, 600);
            });
        }
    }
}

async function getSingleMovie(movie, index){
    if(movie.Runtime != 'N/A'){
        const movieLength = Number(movie.Runtime.match(/\d+/g)[0]);

        if(movieLength != null && movieLength > 60){

            let movieItems = ``,
                moviePoster = ``;

            // sets movie poster to 404 image if none is found
            if(movie.Poster == 'N/A'){
                moviePoster = './images/404Poster.jpg'
            } else {
                try{
                    let getPoster = await fetch(movie.Poster);
                    moviePoster = await getPoster.url;
                } catch {
                    moviePoster = './images/404Poster.jpg'
                }
            }    

            movieItems = `
            <li class="movie__item" id="movie${index}" value="${movie.Year}">
                <img class="movie__item-image" src="${moviePoster}">
                    <figcaption class="movie__title">${movie.Title}</figcaption>
            </li>`; 

            movieList.innerHTML += movieItems;
            searchPressed = false;

            // event listener for each movie
            Array.from(document.getElementsByClassName('movie__item')).forEach(item => {
                const mYear = item.value,
                    mTitle = item.getElementsByClassName('movie__title')[0].innerHTML,
                    mPoster = item.getElementsByClassName('movie__item-image')[0].src;

                item.addEventListener('click', async () => {
                    let wikiURL = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&origin=*&format=json&formatversion=2&titles=${mTitle}`;
                    let response = await get(wikiURL);
                    
                    if(moviePressed == false){
                        moviePressed = true;
                        getAlbum(response, wikiURL, mYear, mTitle, mPoster);
                    }
                });
            });
        }
    }
}

searchInput.addEventListener('keypress', async function(e) {
    let key = e.which || e.keyCode;

    if (key === 13) {
        let search = this.value;
        URL = `http://www.omdbapi.com/?s=${search}&plot=full&apikey=${omdb_api_key}`;

        let response = await get(URL);
        moviePressed = false;

        if(searchPressed == false){
            searchPressed = true;
            getMovies(response);
        }
    }
});