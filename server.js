const express = require('express');
const app = express();

const ip = process.env.IP || '0.0.0.0';
const port = process.env.PORT || 8000;

//Import puppeteer function
const getFlashcards = require('./index');

//Catches requests made to localhost:3000/search
app.get('/flashcards', (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    // run the function on the request to /flashcards
    getFlashcards()
        .then(results => {
            //Returns a 200 Status OK with Results JSON back to the client.
            response.status(200);
            response.json(results);
        });
});

//Catches requests made to localhost:3000/
app.get('/', (req, res) => res.send('Welcome to flashcards API'));


//Initialises the express server on the port 30000
app.listen(port, ip);