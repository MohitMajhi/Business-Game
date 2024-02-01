let lastRolledPlayer = 0; // Variable to track the last rolled player
let popupClosed = true; // Variable to track if the popup

async function rollDice(player) {
    const response = await fetch(`/rollDice${player}`);
    const data = await response.text();
    console.log(data);

    // Fetch the position after rolling the dice
    const playerDataResponse = await fetch(`/getPlayerData${player}`);
    const playerData = await playerDataResponse.json();
    document.getElementById(`result${player}`).innerText = `Position: ${playerData.position} - Country: ${playerData.country} - Money Available: ${playerData.money}`;

    updatePopupStatus(false);
    // Show the popup only if the player has rolled the dice
    if (playerData.position !== 0) {
        lastRolledPlayer = player;
        showPopup(`Player ${player} has rolled the dice!\n${data}`);
        // Update player data when the button is clicked
        updatePlayerData(player);
    }
}

// Function to update position, country, and Uno information in the HTML
async function updatePlayerData(player) {
    const response = await fetch(`/getPlayerData${player}`);
    const data = await response.json();
    console.log("Data received:", data);

    if (data.country === 'uno') {
        const diceSumResponse = await fetch(`/getLastRoll/${player}`);
        const diceSumNumber = await diceSumResponse.json();
        console.log(diceSumNumber.diceSum);
        await handleUno(player, diceSumNumber.diceSum);
    } else if (data.country === 'chance') {
        const diceSumResponse = await fetch(`/getLastRoll/${player}`);
        const diceSumNumber = await diceSumResponse.json();
        console.log(diceSumNumber.diceSum);
        await handleChance(player, diceSumNumber.diceSum);
    } else {
        const ticketResponse = await fetch(`/getPlayerTicketData/${player}`);
        const ticketData = await ticketResponse.json();
        console.log("Ticket Data:", ticketData);

        document.getElementById(`result${player}`).innerText = `Position: ${data.position} - Country: ${data.country} - Money available: ${data.money}`;

        if (ticketData) {
            // Show ticket information in the popup window
            showPopup(`Ticket Info for Player ${player}:\n`, ticketData);
        }
    }
}



// Function to handle Uno case and display message
async function handleUno(player, diceSum) {
    const unoResponse = await fetch(`/handleUno/${player}/${diceSum}`);
    const unoData = await unoResponse.json();
    const response = await fetch(`/getPlayerData${player}`);
    const data = await response.json();
    console.log("Data received:", data);

    console.log(unoData);

    if (unoData.message) {
        console.log("Uno Message:", unoData.message);
        // Show Uno message in the popup window
        showPopup(`Uno Message for Player ${player}:\n${unoData.message}`);
        // Update the result element as well if needed
        document.getElementById(`result${player}`).innerText = `Position: ${data.position} - Place: Uno`;
    } else {
        console.log("Error handling Uno");
    }
}

//function to handle chance
async function handleChance(player, diceSum) {
    const chanceResponse = await fetch(`/handleChance/${player}/${diceSum}`);
    const chanceData = await chanceResponse.json();
    const response = await fetch(`/getPlayerData${player}`);
    const data = await response.json();
    console.log("Data received:", data);

    console.log(chanceData);

    if (chanceData.message) {
        console.log("Chance Message:", chanceData.message);
        // Show Chance message in the popup window
        showPopup(`Chance Message for Player ${player}:\n${chanceData.message}`);
        // Update the result element as well if needed
        document.getElementById(`result${player}`).innerText = `Position: ${data.position} - Place: Chance`;
    } else {
        console.log("Error handling Chance");
    }
}

async function showPopup(message, data) {
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    const closeBtn = document.getElementById('close-btn');

    // Fetch popup status from the server
    const popupStatusResponse = await fetch('/getPopupStatus');
    const popupStatusData = await popupStatusResponse.json();

    // Check if the popup is closed
    if (popupStatusData.popupClosed) {
        return; // Do not display the popup if it's closed
    }

    // Display the popup
    popupContent.innerHTML = ''; // Clear previous content

    // Format the message for better display
    const lines = message.split('\n');
    lines.forEach((line) => {
        const p = document.createElement('p');
        p.textContent = line;
        popupContent.appendChild(p);
    });

    // Display ticket information for Silver color tickets
    if (data.Color === 'Silver') {
        const ticketInfo = document.createElement('div');
        ticketInfo.innerHTML = `
            <div class="business-ticket">
                <h2>Ticket Information</h2>
                <div class="property-details">
                    <p><strong>Color:</strong> ${data.Color}</p>
                    <p><strong>Price:</strong> ${data.Price}</p>
                </div>
                <div class="rent-details">
                    <h3>Rent Details</h3>
                    <p><strong>Rent:</strong> ${data.Rent}</p>
                </div>
                <p><strong>Bank Mortgage Value:</strong> ${data.Bank_Mortgage_Value}</p>
                <div class="pair-details">
                    <h3>Pair Details</h3>
                    <p><strong>Ticket:</strong> ${data.Pair.ticket}</p>
                    <p><strong>Price:</strong> ${data.Pair.price}</p>
                </div>
            </div>
        `;
        popupContent.appendChild(ticketInfo);
    }

    // Display Business-style ticket information for normal cities
    else
    {
    const ticketInfo = document.createElement('div');
    ticketInfo.innerHTML = `
        <div class="business-ticket">
            <h2>Ticket Information</h2>
            <div class="property-details">
                <p><strong>Color:</strong> ${data.Color}</p>
                <p><strong>Price:</strong> ${data.Price}</p>
            </div>
            <div class="rent-details">
                <h3>Rent Details</h3>
                <p><strong>Site Only:</strong> ${data.Rent.Site_Only}</p>
                <p><strong>1 House:</strong> ${data.Rent['1_House']}</p>
                <p><strong>2 Houses:</strong> ${data.Rent['2_Houses']}</p>
                <p><strong>3 Houses:</strong> ${data.Rent['3_Houses']}</p>
                <p><strong>Skyscraper:</strong> ${data.Rent.Hotel}</p>
            </div>
            <div class="construction-details">
                <h3>Construction Details</h3>
                <p><strong>Cost of Office:</strong> ${data.Construction.Cost_of_house}</p>
                <p><strong>Cost of Hotel:</strong> ${data.Construction.Cost_of_hotel}</p>
            </div>
            <p><strong>Bank Mortgage Value:</strong> ${data.Bank_Mortgage_Value}</p>
        </div>
    `;
    popupContent.appendChild(ticketInfo);
    }
    popup.style.display = 'block';

    // Close the popup when the close button is clicked
    closeBtn.onclick = function () {
        // Update the popup status on the server
        updatePopupStatus(true);
        popup.style.display = 'none';
    };

    // Close the popup when clicking outside the popup
    window.onclick = function (event) {
        if (event.target === popup) {
            // Update the popup status on the server
            updatePopupStatus(true);
            popup.style.display = 'none';
        }
    };
}

// Function to update the popup status on the server
async function updatePopupStatus(status) {
    try {
        const updatePopupStatusResponse = await fetch('/updatePopupStatus?status=' + status, {
            method: 'POST',
        });

        if (updatePopupStatusResponse.ok) {
            console.log('Popup status updated successfully');
            return status === 'true';
        } else {
            console.error('Failed to update popup status');
            return false;
        }
    } catch (error) {
        console.error('Error updating popup status:', error);
        return false;
    }
}

async function resetGame() {
    const response = await fetch('/resetGame');
    if (response.ok) {
        console.log('Game reset successfully');
        updatePlayerData(1);
        updatePlayerData(2);
        // You can add any additional logic or UI updates after resetting the game
    } else {
        console.error('Failed to reset the game');
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    // Update data when the page is loaded
    updatePlayerData(1);
    updatePlayerData(2);
});