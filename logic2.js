const express = require('express');
const path = require('path');
const fs = require('fs');
const gameBoard = require(path.join(__dirname, 'gameBoard.json')).country;

const app = express();
const port = 80;
const IP_ADDRESS = '127.0.0.1';

let previous_dice_sum1=1;
let previous_dice_sum2=1;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle the roll request for Player 1
app.get('/rollDice1', (req, res) => {
    const randomNum1 = Math.floor(Math.random() * 6) + 1;
    const randomNum2 = Math.floor(Math.random() * 6) + 1;

    // Update the result in the HTML file
    const result = `Dice 1: ${randomNum1} \n Dice 2: ${randomNum2}`;
    previous_dice_sum1 = randomNum1+randomNum2;
    res.send(result);

    // Update the position in the JSON file
    updatePlayerData('player1.json', randomNum1 + randomNum2);
});

// Route to handle the roll request for Player 2
app.get('/rollDice2', (req, res) => {
    const randomNum1 = Math.floor(Math.random() * 6) + 1;
    const randomNum2 = Math.floor(Math.random() * 6) + 1;

    // Update the result in the HTML file
    const result = `Dice 1: ${randomNum1} \n Dice 2: ${randomNum2}`;
    previous_dice_sum2 = randomNum1+randomNum2;
    res.send(result);

    // Update the position in the JSON file
    updatePlayerData('player2.json', randomNum1 + randomNum2);
});

app.get('/getLastRoll/:player', (req, res) => {
    const player = req.params.player;
    if(player===1)
    res.json({ diceSum: previous_dice_sum1 });
    else
    res.json({ diceSum: previous_dice_sum2 });
})

// Function to update the position in a JSON file
function updatePlayerData(filename, roll) {
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

    // Get the element value corresponding to the new position
    const newPositionElement = gameBoard[data.position];
    console.log(newPositionElement);

    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify({ position: data.position, country: newPositionElement, money: data.money}, null, 2));
}


// Route to get the position and money from the JSON file for Player 1
app.get('/getPlayerData1', (req, res) => {
    const data = readJsonFile('player1.json');
    res.send({ position: data.position, country: data.country, money: data.money });
});

// Route to get the position and money from the JSON file for Player 2
app.get('/getPlayerData2', (req, res) => {
    const data = readJsonFile('player2.json');
    res.send({ position: data.position, country: data.country, money: data.money });
});

app.get('/getPlayerTicketData/:player', (req, res) => {
    const player = req.params.player;
    const playerFilePath = path.join(__dirname, `player${player}.json`);

    // Read player data from the JSON file
    fs.readFile(playerFilePath, 'utf8', (err, playerData) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const playerJson = JSON.parse(playerData);
        const cityName = playerJson.country;

        // Read ticket data from the JSON file
        const ticketFilePath = path.join(__dirname, 'ticketData.json');
        fs.readFile(ticketFilePath, 'utf8', (err, ticketData) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }

            const ticketJson = JSON.parse(ticketData);

            // Retrieve ticket info based on the player's current city
            const ticketInfo = ticketJson[cityName];

            if (ticketInfo) {
                res.send(ticketInfo);
            } else {
                res.status(404).send('Ticket data not found');
            }
        });
    });
});

//Handle and retrive data for UNO
app.get('/handleUno/:player/:diceSum', (req, res) => {
    const player = req.params.player;
    const diceSum = parseInt(req.params.diceSum, 10);

    if (isNaN(diceSum)) {
        res.status(400).send('Invalid dice sum');
        return;
    }

    // Read ticket data from the JSON file
    const ticketFilePath = path.join(__dirname, 'ticketData.json');
    fs.readFile(ticketFilePath, 'utf8', (err, ticketData) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const ticketJson = JSON.parse(ticketData);

        // Retrieve Uno message based on the dice sum
        const unoMessage = ticketJson.uno[`Message_${diceSum}`];

        if (unoMessage) {
            res.send({ message: unoMessage });
        } else {
            res.status(404).send('Uno message not found');
        }
    });
});

app.get('/handleChance/:player/:diceSum', (req, res) => {
    const player = req.params.player;
    const diceSum = parseInt(req.params.diceSum, 10);

    if (isNaN(diceSum)) {
        res.status(400).send('Invalid dice sum');
        return;
    }

    const chanceFilePath = path.join(__dirname, 'ticketData.json');
    fs.readFile(chanceFilePath, 'utf8', (err, chanceData) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const chanceJson = JSON.parse(chanceData);

        // Retrieve Chance message based on the dice sum
        const chanceMessage = chanceJson.chance[`Message_${diceSum}`];

        if (chanceMessage) {
            res.send({ message: chanceMessage });
        } else {
            res.status(404).send('Chance message not found');
        }
    });
});

function getPopupClosedStatus() {
    const filePath = path.join(__dirname, 'popupStatus.json');
    try {
        // Read the JSON file to get the popup status
        const rawData = fs.readFileSync(filePath);
        const popupStatus = JSON.parse(rawData);
        return popupStatus.popupClosed === true;
    } catch (error) {
        // Handle file read or JSON parse error
        console.error('Error reading popup status:', error);
        return true; // Return true by default if there's an error
    }
}

app.get('/getPopupStatus', (req, res) => {
    const popupClosedStatus = getPopupClosedStatus();
    res.json({ popupClosed: popupClosedStatus });
});

app.post('/updatePopupStatus', (req, res) => {
    const newStatus = req.query.status;

    if (newStatus !== 'true' && newStatus !== 'false') {
        return res.status(400).send('Invalid status parameter');
    }

    try {
        // Read the existing status from the JSON file
        const filePath = path.join(__dirname, 'popupStatus.json');
        const rawData = fs.readFileSync(filePath);
        const popupStatus = JSON.parse(rawData);

        // Update the status
        popupStatus.popupClosed = newStatus === 'true';

        // Write the updated status back to the file
        fs.writeFileSync(filePath, JSON.stringify(popupStatus, null, 2));

        res.send('Popup status updated successfully');
    } catch (error) {
        // Handle file read/write error or invalid JSON format
        console.error('Error updating popup status:', error);
        res.status(500).send('Internal Server Error');
    }
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