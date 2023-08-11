// ==========================
// VARIABLES
// ==========================

// Define pairs of cities and their corresponding countries.
// This will be used to generate the game cards.
const pairs = {
  melbourne: 'australia',
  beijing: 'china',
  brasilia: 'brazil',
  cairo: 'Egypt',
  madrid: 'spain',
  newyork: 'USA'
  // Additional pairs can be added in a similar manner.
};

// Define game state variables.
let totalCards;          // Total number of cards in the game.
let cards;               // NodeList of all card elements.
let flippedCards = [];   // Array to store currently flipped cards.
let matchedPairs = 0;    // Counter for matched pairs.
let startTime;           // Timestamp when the game starts.
let timerInterval;       // Interval for the game timer.
let finalElapsedTime;    // Store the elapsed time when all cards are matched.

// ==========================
// EVENT LISTENERS
// ==========================

// Initialize the game once the document is fully loaded.
document.addEventListener('DOMContentLoaded', function () {
  showIntroModal();      // Display the introductory modal.
  generateCards(pairs);  // Generate game cards based on city-country pairs.
  shuffleCards();        // Randomly shuffle the cards on the game board.
  adjustLayout();        // Adjust the game board layout based on the number of cards.
  attachCardListeners(); // Attach event listeners to each card.

  // Add functionality to the replay button to reset and start a new game.
  const replayButton = document.getElementById('replay');
  replayButton.onclick = function () {
    resetGameState();
  };
});

// ==========================
// GAME FUNCTIONS
// ==========================

// Function to display the introductory modal.
function showIntroModal() {
  const modal = document.getElementById('introModal');
  modal.style.display = 'block';

  // Start the game and hide the modal when the "Start Game" button is clicked.
  const startGame = document.getElementById('startGame');
  startGame.onclick = function () {
    modal.style.display = 'none';
    startTimer();  // Start the game timer.
  };
}

// Function to generate game cards based on the provided city-country pairs.
function generateCards(pairs) {
  const gameBoard = document.querySelector('.game-board');
  for (let city in pairs) {
    const country = pairs[city];
    gameBoard.appendChild(createCard(city));    // Add city card to the game board.
    gameBoard.appendChild(createCard(country)); // Add corresponding country card to the game board.
  }
}

// Function to create a card element (either city or country).
function createCard(value) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.setAttribute('data-value', value);  // Use data-value to store the card's value (city or country).

  // Create the back side of the card.
  const cardBack = document.createElement('div');
  cardBack.classList.add('card-back');
  cardBack.textContent = '?';
  card.appendChild(cardBack);

  // Create the front side of the card with the corresponding image.
  const cardFront = document.createElement('div');
  cardFront.classList.add('card-front');
  cardFront.style.backgroundImage = `url('images/${value}.webp')`;
  card.appendChild(cardFront);

  return card;  // Return the created card element.
}

// Function to shuffle the cards on the game board.
function shuffleCards() {
  const gameBoard = document.querySelector('.game-board');
  const cardsArray = Array.from(gameBoard.children);
  cardsArray.sort(() => Math.random() - 0.5);  // Randomly sort the cards.
  cardsArray.forEach(card => gameBoard.appendChild(card));  // Append the shuffled cards back to the game board.
}

// Function to adjust the game board layout based on the number of cards.
function adjustLayout() {
  cards = document.querySelectorAll('.card');
  totalCards = cards.length;
  const columns = Math.max(3, Math.ceil(Math.sqrt(totalCards)));  // Calculate the optimal number of columns.
  const gameBoard = document.querySelector('.game-board');
  gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;  // Set the number of columns in the game board's grid.
}

// Function to attach click event listeners to each card.
function attachCardListeners() {
  cards.forEach(card => {
    card.addEventListener('click', () => {
      // Flip the card if it's not already flipped and if there are less than 2 cards currently flipped.
      if (!card.classList.contains('flipped') && flippedCards.length < 2) {
        card.classList.add('flipped');
        flippedCards.push(card);  // Add the flipped card to the flippedCards array.

        // Check for a match if two cards are flipped.
        if (flippedCards.length === 2) {
          checkMatch();
        }
      }
    });
  });
}

// Function to check if the two flipped cards are a matching pair.
function checkMatch() {
  const card1 = flippedCards[0].getAttribute('data-value');
  const card2 = flippedCards[1].getAttribute('data-value');

  // Check if the cards match based on the city-country pairs.
  if (pairs[card1] === card2 || pairs[card2] === card1) {
    handleMatch();  // Handle the matched cards.
  } else {
    handleMismatch();  // Handle the mismatched cards.
  }
}

// Function to handle the scenario when two flipped cards are a match.
function handleMatch() {
  matchedPairs++;  // Increment the matched pairs counter.
  flippedCards.forEach(card => {
    card.style.animation = 'matched 0.5s';  // Apply a matching animation to the cards.
    card.addEventListener('animationend', function () {
      card.style.animation = '';  // Remove the animation after it ends.
    });
  });

  const cardFront = flippedCards[1].querySelector('.card-front');
  cardFront.addEventListener('transitionend', function onEnd() {
    if (matchedPairs === totalCards / 2) {
      stopTimer();  // Stop the timer immediately when all cards are matched.
      finalElapsedTime = Date.now() - startTime;  // Store the elapsed time.
      // Delay the display of the win modal by 2 seconds to give the player a moment to see the matched cards.
      setTimeout(showWinModal, 2000);
    }
    cardFront.removeEventListener('transitionend', onEnd);  // Remove the event listener after it's triggered.
  });

  flippedCards = [];  // Reset the flippedCards array.
}

// Function to handle the scenario when two flipped cards are not a match.
function handleMismatch() {
  flippedCards.forEach(card => {
    card.style.animation = 'unmatched 0.5s alternate 2';  // Apply a mismatch animation to the cards.
    card.addEventListener('animationend', function () {
      card.style.animation = '';  // Remove the animation after it ends.
    });
  });

  // After a delay, flip the mismatched cards back to their original state.
  setTimeout(() => {
    flippedCards.forEach(card => card.classList.remove('flipped'));
    flippedCards = [];  // Reset the flippedCards array.
  }, 1000);
}

// Function to start the game timer.
function startTimer() {
  startTime = Date.now();  // Store the current timestamp as the start time.
  timerInterval = setInterval(updateTimer, 1000);  // Update the timer every second.
}

// Function to update the timer display.
function updateTimer() {
  const elapsed = Date.now() - startTime;  // Calculate the elapsed time.
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  document.getElementById('timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Function to stop the game timer.
function stopTimer() {
  clearInterval(timerInterval);  // Clear the timer interval.
}

// Function to display the win modal after the player matches all card pairs.
function showWinModal() {
  const modal = document.getElementById('winModal');
  stopTimer();  // Stop the timer.

  modal.style.display = 'block';  // Display the win modal.

  // Create and display a loading spinner in the modal.
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  modal.querySelector('.modal-content').prepend(spinner);

  // Use the stored finalElapsedTime to calculate the player's final game time.
  const minutes = Math.floor(finalElapsedTime / 60000);
  const seconds = Math.floor((finalElapsedTime % 60000) / 1000);
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Send the player's game time to the server to get their rank.
  sendTimeToServer(timeString)
    .then(data => {
      // Hide the loading spinner.
      spinner.style.display = 'none';

      // Update the modal with the player's game time and rank.
      const timeDisplay = document.createElement('p');
      timeDisplay.textContent = `Your time: ${timeString}`;
      timeDisplay.classList.add('green-text', 'time-display');

      const rankDisplay = document.createElement('p');
      rankDisplay.textContent = data.message;  // Display the ranking message from the server.
      rankDisplay.classList.add('green-text', 'rank-display');

      // Insert the game time and rank displays into the modal.
      const h2Element = modal.querySelector('h2');
      h2Element.insertAdjacentElement('afterend', rankDisplay);
      h2Element.insertAdjacentElement('afterend', timeDisplay);
    })
    .catch(error => {
      // If there's an error communicating with the server, hide the spinner and display an error message.
      spinner.style.display = 'none';
      alert(`An error occurred: ${error.message}`);
    });
}

// Function to send the player's game time to the server and get their rank.
async function sendTimeToServer(time) {
  try {
    const response = await fetch('https://flipcardgame-2.derrickmal123.workers.dev/', {
      method: 'POST',
      body: JSON.stringify({
        type: 'saveTime',
        time: time
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();  // Return the server's response.
  } catch (error) {
    console.error('Error sending time:', error);
    throw error;  // Re-throw the error to be caught in the calling function.
  }
}

// Function to reset the game state and start a new game.
function resetGameState() {
  matchedPairs = 0;  // Reset the matched pairs counter.
  cards.forEach(card => card.classList.remove('flipped'));  // Flip all cards back to their original state.
  shuffleCards();  // Shuffle the cards on the game board.
  startTimer();  // Start the game timer.
  document.getElementById('replay').classList.add('hidden');  // Hide the replay button.
}

// ==========================
// FORM FUNCTIONS
// ==========================

// Function to validate an email address format.
function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

// Event listeners and functions related to the game's form submission.

const firstNameInput = document.getElementById('firstName');
const emailInput = document.getElementById('email');
const privacyPolicyCheckbox = document.getElementById('privacyPolicy');
const sendDataButton = document.getElementById('sendData');

// Enable or disable the "Send Data" button based on the privacy policy checkbox.
privacyPolicyCheckbox.addEventListener('change', function () {
  sendDataButton.disabled = !this.checked;
  sendDataButton.classList.toggle('disabled-button', !this.checked);
});

// Handle the form submission.
sendDataButton.addEventListener('click', async function () {
  // Validate the email address format.
  if (!isValidEmail(emailInput.value)) {
    emailInput.classList.add('input-error');  // Highlight the email input in case of an invalid format.
    emailInput.addEventListener('input', function() {
      emailInput.classList.remove('input-error');  // Remove the highlight once the user starts typing.
    });
    return;
  }

  // Prepare the data to be sent to the server.
  const data = {
    type: "saveDetails",
    Name: firstNameInput.value,
    Email: emailInput.value
  };

  try {
    const response = await fetch('https://flipcardgame-2.derrickmal123.workers.dev/', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.result === 'Success') {
      handleSuccessfulSubmission();  // Handle the successful form submission.
    } else {
      alert('Failed to send data. Please try again.');
    }
  } catch (error) {
    console.error('Error sending data:', error);
    alert(`An error occurred: ${error.message}`);
  }
});

// Function to handle the successful form submission.
function handleSuccessfulSubmission() {
  document.querySelector('.game-container').style.display = 'none';  // Hide the game container.
  document.getElementById('winModal').style.display = 'none';  // Hide the win modal.
  document.getElementById('thankYouModal').style.display = 'block';  // Display the "Thank You" modal.
}

// Restart the game after the form is submitted.
document.getElementById('restartGame').addEventListener('click', function () {
  //document.getElementById('thankYouModal').style.display = 'none';  // Hide the "Thank You" modal.
  //document.querySelector('.game-container').style.display = 'flex';  // Display the game container.
  resetGameState();  // Reset the game state and start a new game.
  location.reload();  // Refresh the entire page.
});
