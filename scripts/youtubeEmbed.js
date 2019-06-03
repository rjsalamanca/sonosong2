'use strict';

const videoDiv = document.getElementsByClassName('youtubeVideoContainer')[0];

async function getVideoId(object) {
    let count = 0;
    // Sets vidId to the first video in the search results
    let vidId = object.items[count].id.videoId;
    // If first result is not a video go to the next result
    while (vidId === undefined) {
        count++;
        vidId = object.items[count].id.videoId;
    }
    const iFrame = videoDiv.getElementsByTagName('iframe')[0];
    await iFrame.setAttribute("src", `https://www.youtube.com/embed/${vidId}`);
}