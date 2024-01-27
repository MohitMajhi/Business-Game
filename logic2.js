const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 80;
const IP_ADDRESS = '127.0.0.1';

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle the roll request for Player 1
app.get('/rollDice1', (req, res) => {
    const randomNum1 = Math.floor(Math.random() * 6) + 1;
    const randomNum2 = Math.floor(Math.random() * 6) + 1;

    // Update the result in the HTML file
    const result = `Dice 1: ${randomNum1} \n Dice 2: ${randomNum2}`;
    res.send(result);

    // Update the position in the JSON file
    updatePosition('player1.json', randomNum1 + randomNum2);
});

// Route to handle the roll request for Player 2
app.get('/rollDice2', (req, res) => {
    const randomNum1 = Math.floor(Math.random() * 6) + 1;
    const randomNum2 = Math.floor(Math.random() * 6) + 1;

    // Update the result in the HTML file
    const result = `Dice 1: ${randomNum1} \n Dice 2: ${randomNum2}`;
    res.send(result);

    // Update the position in the JSON file
    updatePosition('player2.json', randomNum1 + randomNum2);
});

// Function to update the position in a JSON file
function updatePosition(filename, roll) {
    const filePath = path.join(__dirname, filename);

    // Read the existing data
    const rawData = fs.readFileSync(filePath);
    const data = JSON.parse(rawData);

    // Update the position
    if (data.position < 36 && data.position + roll < 36) {
        data.position += roll;
    } else {
        data.position = (data.position + roll) - 36;
    }

    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}


// Route to get the position from the JSON file for Player 1
app.get('/getPosition1', (req, res) => {
    const data = readJsonFile('player1.json');
    res.send({ position: data.position });
});

// Route to get the position from the JSON file for Player 2
app.get('/getPosition2', (req, res) => {
    const data = readJsonFile('player2.json');
    res.send({ position: data.position });
});

// Function to read a JSON file
function readJsonFile(filename) {
    const filePath = path.join(__dirname, filename);
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
}

// Listen for requests
app.listen(port,IP_ADDRESS, () => {
    console.log(`Server is running at http://${IP_ADDRESS}:${port}`);
});