'use strict';

const api_key = 'AIzaSyB9WzlCfQKAWzLTqAsrcepelEEUT4b8NPk',
    searchResults = document.getElementById('searchResults'),
    load = document.getElementById('loadingIcon'),
    soundTrackContainer = document.getElementById('soundTrackContainer');

let searchPageCount = 0,
    searchingPage = false;

function addTrackList(listOfTracks, movieTitle, moviePoster) {
    document.getElementById('moviePicture-image').innerHTML = `
        <img src=${moviePoster} class='moviePicture-image-picture'/>
        <div class='moviePicture-image-name'>${movieTitle}</div>
    `;

    setTimeout(() => {
        soundTrackContainer.style = 'transition: opacity 1s; opacity: 1; display: block';
    },100);

    Object.keys(listOfTracks).forEach(async function (key,ind) {
        const soundtrackList = document.getElementById('soundTrackList');

        let singleTrack = `
            <li class="song__item" id="track${ind+1}">
                <span class="song__title">${ind+1}. ${listOfTracks[key].track_name}</span>
                <span class="song__length">${listOfTracks[key].length}</span>
            </li>
            <hr class="trackLine">`;

        soundtrackList.innerHTML += singleTrack;

        moviePressed = false;

        await setTimeout(()=>{
            document.getElementById(`track${ind+1}`).addEventListener('click', async function (e) {
                e.preventDefault();
                
                let wordInput = `${listOfTracks[key].track_name} ${movieTitle}`,
                    ytURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${wordInput}&key=${api_key}`,
                    bars = `
                        <span id="bars">
                            <span class="bar"></span>
                            <span class="bar"></span>
                            <span class="bar"></span>
                        </span>`;

                if(document.getElementById('bars') !=  null) document.getElementById('bars').remove();

                this.children[0].innerHTML += bars;

                let response = await get(ytURL);
                getVideoId(response);
            });
        },1);
    });
}

function getAlbum(wikiObject, wikiURL, movieYear, movieTitle, moviePoster) {
    // URL CODES : https://www.w3schools.com/tags/ref_urlencode.asp
    // array for recursion to search specific terms
    const searchURLEnding = ['%20%28film%29', '%20%20%28' + movieYear + '%20film%29', '%20%28soundtrack%29', '%3A%20Original%20Motion%20Picture%20Soundtrack','%3A%20Music%20from%20the%20Motion%20Picture','%3A%20The%20Motion%20Picture%20Soundtrack','%3A%20Highlights%20from%20the%20Motion%20Picture%20Soundtrack'];

    // Function to catch errors and change wikiURL
    // catchError scope is only for getAlbum
    let catchError = async function () {
        let rr = 
            `<div id="noSoundTrackContainer">
                <p class="noSoundTitle">
                    Never gonna give you a soundtrack 
                    <br><br> 
                    <span>(No soundtrack found)</span>
                </p>
                <iframe
                    id="noSoundTrack" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&amp;loop=1&amp;playlist=dQw4w9WgXcQ"
                    frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen="">
                </iframe>
            </div>`;

        wikiURL = wikiURL + searchURLEnding[searchPageCount];
        
        try{
            let response = await get(wikiURL);
            searchingPage = true;
            getAlbum(response, wikiURL, movieYear, movieTitle, moviePoster);
        }catch(err){
            // RESET
            searchingPage = false;
            searchPageCount = 0;

            // Removes loading and sets search results to none
            setTimeout(()=> {
                searchResults.style = `opacity: 0; display: none;`;
                load.style.opacity = 0;
                
                document.getElementById('bodyclass').innerHTML += rr;
                document.getElementById('noSoundTrackContainer').style = 'transition: opacity 1s; opacity:1;';
            }, 800);
        };
    }

    // Going through the pages which is wikiURL + searchURLEnding
    if (searchingPage) {
        console.log('LOADING')
        load.style.opacity = 1;
        searchResults.style.opacity = 0;
        searchPageCount++;
        wikiURL = wikiURL.slice(0, wikiURL.length - searchURLEnding[searchPageCount - 1].length);
    }

    if (!wikiObject.query.pages[0].missing) {
        const content = wikiObject.query.pages[0].revisions[0].content;

        let tracks = '',
            tracksSongLength = '',
            albumTracks = {};

        if (content.includes('title1')) {
            // Regex for getting song names and lengths
            tracks = content.match(/title\d+.+?(?=\n)/g).map(track => track.indexOf('[') == -1 ? track.replace(/title\d+\s*= /g, '') : track.replace(/title\d+\s*= \[+|\]+/g, ''));
            tracksSongLength = content.match(/length\d+.+?(?=\n)/g).map((songLength) => songLength.indexOf(`'`) == -1 ? songLength.replace(/length\d+\s*= /g, '') : songLength.replace(/length\d+\s*= \'+|\'+/g, ''));

            //create an object for track
            tracks.forEach((track,index) => albumTracks[`title${index + 1}`] = { 'track_name': tracks[index], 'length': tracksSongLength[index] });

            // RESET
            searchingPage = false;
            searchPageCount = 0;
            searchResults.style.opacity = 0;

            load.style.opacity = 0;
            soundTrackContainer.style.display = 'block';
            searchResults.style.display = 'none';

            addTrackList(albumTracks, movieTitle, moviePoster);
        } else {
            catchError();
        }
    } else {
        catchError();
    }
}