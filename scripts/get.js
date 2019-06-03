"use strict"

async function get(url) {
    try{
        let data = await fetch(url);
        return await data.json();
    } catch(err){
        console.log('error: ', err.message);
    }
}