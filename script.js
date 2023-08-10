// ==========================
// VARIABLES
// ==========================

// City-Country pairs
const pairs = {
  melbourne: 'australia',
  beijing: 'china',
  brasilia: 'brazil',
  cairo: 'Egypt',
  madrid: 'spain',
  newyork: 'USA'
  // Add more pairs similarly
};

let totalCards;
let cards;
let flippedCards = [];
let matchedPairs = 0;
let startTime;
let timerInterval;

// ==========================
// EVENT LISTENERS
// ==========================

document.addEventListener('DOMContentLoaded', function () {
  // Initialize the game
  showIntroModal();
  generateCards(pairs);
  shuffleCards();
  adjustLayout();
  attachCardListeners();

  // Replay button functionality
  const replayButton = document.getElementById('replay');
  replayButton.onclick = function () {
    resetGameState();
  };
});

// ==========================
// GAME FUNCTIONS
// ==========================

// Display the intro modal
function showIntroModal() {
  const modal = document.getElementById('introModal');
  modal.style.display = 'block';

  const startGame = document.getElementById('startGame');
  startGame.onclick = function () {
    modal.style.display = 'none';
    startTimer();
  };
}

// Generate city and country cards
function generateCards(pairs) {
  const gameBoard = document.querySelector('.game-board');
  for (let city in pairs) {
    const country = pairs[city];
    gameBoard.appendChild(createCard(city));    // City card
    gameBoard.appendChild(createCard(country)); // Country card
  }
}

// Create a card (either city or country)
function createCard(value) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.setAttribute('data-value', value);

  const cardBack = document.createElement('div');
  cardBack.classList.add('card-back');
  cardBack.textContent = '?';
  card.appendChild(cardBack);

  const cardFront = document.createElement('div');
  cardFront.classList.add('card-front');
  cardFront.style.backgroundImage = `url('images/${value}.webp')`;
  card.appendChild(cardFront);

  return card;
}

// Shuffle the cards on the board
function shuffleCards() {
  const gameBoard = document.querySelector('.game-board');
  const cardsArray = Array.from(gameBoard.children);
  cardsArray.sort(() => Math.random() - 0.5);
  cardsArray.forEach(card => gameBoard.appendChild(card));
}

// Adjust the layout based on the number of cards
function adjustLayout() {
  cards = document.querySelectorAll('.card');
  totalCards = cards.length;
  const columns = Math.max(3, Math.ceil(Math.sqrt(totalCards)));
  const gameBoard = document.querySelector('.game-board');
  gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}

// Attach click listeners to cards
function attachCardListeners() {
  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (!card.classList.contains('flipped') && flippedCards.length < 2) {
        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
          checkMatch();
        }
      }
    });
  });
}

// Check if two flipped cards are a match
function checkMatch() {
  const card1 = flippedCards[0].getAttribute('data-value');
  const card2 = flippedCards[1].getAttribute('data-value');

  if (pairs[card1] === card2 || pairs[card2] === card1) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

// Handle matched cards
function handleMatch() {
  matchedPairs++;
  flippedCards.forEach(card => {
    card.style.animation = 'matched 0.5s';
    card.addEventListener('animationend', function () {
      card.style.animation = '';
    });
  });

  const cardFront = flippedCards[1].querySelector('.card-front');
  cardFront.addEventListener('transitionend', function onEnd() {
    if (matchedPairs === totalCards / 2) {
      showWinModal();
    }
    cardFront.removeEventListener('transitionend', onEnd);
  });

  flippedCards = [];
}

// Handle mismatched cards
function handleMismatch() {
  flippedCards.forEach(card => {
    card.style.animation = 'unmatched 0.5s alternate 2';
    card.addEventListener('animationend', function () {
      card.style.animation = '';
    });
  });

  setTimeout(() => {
    flippedCards.forEach(card => card.classList.remove('flipped'));
    flippedCards = [];
  }, 1000);
}

// Start the game timer
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

// Update the timer display
function updateTimer() {
  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  document.getElementById('timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Stop the game timer
function stopTimer() {
  clearInterval(timerInterval);
}


// Display the win modal
function showWinModal() {
  const modal = document.getElementById('winModal');
  stopTimer();

  // Show the loading spinner
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  modal.querySelector('.modal-content').prepend(spinner);

  // Calculate the elapsed time
  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Send the time to the server and get the rank
  sendTimeToServer(timeString)
    .then(data => {
      // Hide the spinner
      spinner.style.display = 'none';

      // Update the modal with the time and rank
      const timeDisplay = document.createElement('p');
      timeDisplay.textContent = `Your time: ${timeString}`;
      modal.querySelector('.modal-content').prepend(timeDisplay);

      const rankDisplay = document.createElement('p');
      rankDisplay.textContent = data.message; // Display the ranking message
      modal.querySelector('.modal-content').prepend(rankDisplay);
    })
    .catch(error => {
      // Hide the spinner and show an error message
      spinner.style.display = 'none';
      alert(`An error occurred: ${error.message}`);
    })
    .finally(() => {
      // Display the modal
      modal.style.display = 'block';
    });
}

// Send the game time to the server and get the player's rank
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

    const result = await response.json();

    // Assuming the server returns a property named 'percentile' with the player's percentile rank
    // and a 'message' property with the ranking message
    return result;
  } catch (error) {
    console.error('Error sending time:', error);
    throw error; // Re-throw the error to be caught in the calling function
  }
}


// Reset the game state
function resetGameState() {
  matchedPairs = 0;
  cards.forEach(card => card.classList.remove('flipped'));
  shuffleCards();
  startTimer();
  document.getElementById('replay').classList.add('hidden');
}

// ==========================
// FORM FUNCTIONS
// ==========================

// Validate email format
function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

// Handle form submission
const firstNameInput = document.getElementById('firstName');
const emailInput = document.getElementById('email');
const privacyPolicyCheckbox = document.getElementById('privacyPolicy');
const sendDataButton = document.getElementById('sendData');

privacyPolicyCheckbox.addEventListener('change', function () {
  sendDataButton.disabled = !this.checked;
  sendDataButton.classList.toggle('disabled-button', !this.checked);
});

sendDataButton.addEventListener('click', async function () {
  if (!isValidEmail(emailInput.value)) {
    emailInput.classList.add('input-error');
    emailInput.addEventListener('input', function() {
      emailInput.classList.remove('input-error');
    });
    return;
  }

  const data = {
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

    if (result.result === 'success') {
      handleSuccessfulSubmission();
    } else {
      alert('Failed to send data. Please try again.');
    }
  } catch (error) {
    console.error('Error sending data:', error);
    alert(`An error occurred: ${error.message}`);
  }
});

// Handle successful form submission
function handleSuccessfulSubmission() {
  document.querySelector('.game-container').style.display = 'none';
  document.getElementById('winModal').style.display = 'none';
  document.getElementById('thankYouModal').style.display = 'block';
}

// Restart the game after form submission
document.getElementById('restartGame').addEventListener('click', function () {
  document.getElementById('thankYouModal').style.display = 'none';
  document.querySelector('.game-container').style.display = 'flex';
  resetGameState();
});