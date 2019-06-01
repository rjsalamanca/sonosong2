"use strict"

async function get(url) {
    try{
        let data = await fetch(url);
        return await data.json();
    } catch(err){
        console.log('error: ', err.message);
    }
    // return fetch(url)
    //     .then(function(response) {
    //         return response.json()
    //     })
    //     .then(function(data) {
    //         return data;
    //     })
    //     .catch(function(error) {
    //         return error;
    //     });
}