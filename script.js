let firstQuoteLoading = true;
const queryParams = new URLSearchParams(window.location.search);
const tag = queryParams.get('tag');
const author = queryParams.get('author');

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;



// determining the maxLength for the quote
let quoteBox = document.querySelector('#quote-box');
let authorBox = document.querySelector('#author');
let quoteStyles = window.getComputedStyle(quoteBox);

/* Get the x and y padding values for the quote box */
let xPadding = parseInt(quoteStyles.paddingLeft) + parseInt(quoteStyles.paddingRight); 
let yPadding = parseInt(quoteStyles.paddingTop) + parseInt(quoteStyles.paddingBottom);

/* Get the x and y size values for the author element */
let xAuthor = parseInt(authorBox.offsetWidth);
let yAuthor = parseInt(authorBox.offsetHeight);

/* Add the author element x and y size to the quote box padding values */
let xNewPadding = xPadding + xAuthor;
let yNewPadding = yPadding + yAuthor;

let quoteDiv = document.querySelector('#quote');
let quoteFontSize = parseInt(window.getComputedStyle(quoteDiv).getPropertyValue('font-size'));

let maxQuoteLength = ((WIDTH-xNewPadding) * (HEIGHT-yNewPadding)) / (quoteFontSize * quoteFontSize);

// freeing memory
quoteBox = null; authorBox = null; quoteStyles = null;
xPadding = null; yPadding = null;
xAuthor = null; yAuthor = null;
xNewPadding = null; yNewPadding = null;
quoteDiv = null; quoteFontSize = null;



let quote_api = `https://api.quotable.io/random?maxLength=${maxQuoteLength}`;

// Getting quotes using tag (if available)
if (tag) {
    fetch('https://api.quotable.io/tags')
        .then(response => response.json())
        .then(data => {
            const supportedTags = data.map(tag => tag.name.toLowerCase());
            console.log(supportedTags);

            if (supportedTags.includes(tag.toLowerCase())) {
                quote_api += `&tags=${tag}`;
            }
        })
        .catch(error => console.error(error));
}

// Getting quotes using author (if available)
if (author) {
    fetch(`https://api.quotable.io/search/authors?query=${author}`)
        .then(response => response.json())
        .then(data => {
            const author_name = data["results"][0]["name"];
            quote_api += `&author=${author_name}`;
        })
        .catch(error => console.error(error));
}

function hideLoader() {
    document.querySelector('.ring').remove(); // Remove the loading screen
    document.querySelector('#background-image').style.display = 'block'; // Display the background image
}

async function getQuote() {
    // Create a Promise that resolves after the quote box has faded out
    return new Promise((resolve) => {
        document.getElementById('quote-box').style.opacity = 0; // Quote has faded

        document.getElementById("sound-toggle-button").style.display = "block"; // Display sound toggle button when quotes have faded
        setTimeout(() => {
            resolve();
        }, 1000); // Fade out transition duration is 1 second
    })
        .then(() => {
            return fetch(quote_api)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('quote').innerHTML = `"${data.content}"`;
                    document.getElementById('author').innerHTML = `- ${data.author}`;
                    return getRandomImage(); // Return the Promise from getRandomImage()
                });
        });
}

function getRandomImage() {
    let seed = Math.random();

    let unsplashUrl = `https://source.unsplash.com/collection/1319040,627564/${WIDTH}x${HEIGHT}/?random=${seed}`;

    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => {
            document.getElementById('background-image').src = img.src;
            resolve();
        };
        img.onerror = (error) => {
            reject(error);
        };
        img.src = unsplashUrl;
    });
}

function updateQuote() {
    getQuote().then(() => {
        // Quote box has completely faded out, now update the quote

        document.getElementById("sound-toggle-button").style.display = "none"; // Hide sound toggle button when a new quote loads

        document.getElementById('quote-box').style.opacity = 1; // Box with new content and fade it back in

        // Calculate the length of the quote and adjust the interval accordingly
        const quoteLength = document.getElementById('quote').innerHTML.length;
        const interval = Math.max(quoteLength * 100, 5000); // Minimum interval of 5 seconds, with an extra delay based on quote length

        // executes only once when the first quote has been fetched/loaded
        if (firstQuoteLoading) {
            hideLoader();
            firstQuoteLoading = false;
        }

        setTimeout(updateQuote, interval); // Schedule the next quote update based on the calculated interval
    });
}

updateQuote();
