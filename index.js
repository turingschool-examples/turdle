// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
var gamesPlayed = [];

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
var gameOverBox = document.querySelector('#game-over-section');
var gameOverGuessCount = document.querySelector('#game-over-guesses-count');
var gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');

// Event Listeners
window.addEventListener('load', setGame);

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('keyup', function() { moveToNextInput(event) });
}

for (var i = 0; i < keyLetters.length; i++) {
  keyLetters[i].addEventListener('click', function() { clickLetter(event) });
}

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Functions
async function setGame() {
  currentRow = 1;
  try {
    const wordsData = await fetchWords();
    winningWord = getRandomWordFromAPI(wordsData); // Function to extract a word from the API data
    updateInputPermissions();
  } catch (error) {
    console.error('Error setting up the game:', error);
  }
}

function fetchWords() {
  return fetch('http://localhost:3001/api/v1/words')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch words from the API');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error fetching words:', error);
      throw error; // Propagate the error if any issue occurs while fetching words
    });
}

function getRandomWordFromAPI(wordsData) {
  // Modify this function based on the structure of the data received from the API
  const randomIndex = Math.floor(Math.random() * wordsData.length);
  return wordsData[randomIndex];
}

function updateInputPermissions() {
  for (var i = 0; i < inputs.length; i++) {
    if (!inputs[i].id.includes(`-${currentRow}-`)) {
      inputs[i].disabled = true;
    } else {
      inputs[i].disabled = false;
    }
  }

  // Special case to enable inputs for the 6th row even if it's the final turn
  if (currentRow === 6) {
    for (var i = 0; i < 5; i++) {
      inputs[inputs.length - 5 + i].disabled = false;
    }
  }

  inputs[0].focus();
}

function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;
  var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;

  if (key !== 8 && key !== 46 && inputs[indexOfNext]) {
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`) && !inputs[i].value && !activeInput) {
      activeInput = inputs[i];
      activeIndex = i;
    }
  }

  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (currentRow <= 6) { // Allow up to 6 guesses
    if (checkIsWord()) {
      errorMessage.innerText = '';
      compareGuess();
      if (checkForWin()) {
        setTimeout(declareWinner, 1000);
      } else if (currentRow === 6) { // Check if it's the 6th guess
        declareLoss(); // If it's the 6th guess and not a win, trigger the loss scenario
      } else {
        changeRow();
      }
    } else {
      errorMessage.innerText = 'Not a valid word. Try again!';
    }
  }
}

async function checkIsWord() {
  guess = '';

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      guess += inputs[i].value;
    }
  }

  try {
    const wordsData = await fetchWords(); // Fetch words from the API
    const wordsList = wordsData.map(word => word.word); // Assuming the API returns an array of words

    return wordsList.includes(guess); // Check if the fetched words include the user's input
  } catch (error) {
    console.error('Error fetching words:', error);
    return false; // Return false in case of an error fetching words
  }
}

function compareGuess() {
  var guessLetters = guess.split('');

  for (var i = 0; i < guessLetters.length; i++) {

    if (winningWord.includes(guessLetters[i]) && winningWord.split('')[i] !== guessLetters[i]) {
      updateBoxColor(i, 'wrong-location');
      updateKeyColor(guessLetters[i], 'wrong-location-key');
    } else if (winningWord.split('')[i] === guessLetters[i]) {
      updateBoxColor(i, 'correct-location');
      updateKeyColor(guessLetters[i], 'correct-location-key');
    } else {
      updateBoxColor(i, 'wrong');
      updateKeyColor(guessLetters[i], 'wrong-key');
    }
  }

}

function updateBoxColor(letterLocation, className) {
  var row = [];

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = null;

  for (var i = 0; i < keyLetters.length; i++) {
    if (keyLetters[i].innerText === letter) {
      keyLetter = keyLetters[i];
    }
  }

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareWinner() {
  recordGameStats();
  changeGameOverText();
  viewGameOverMessage();
  setTimeout(startNewGame, 4000);
}

function declareLoss() {
  recordGameStats(false, 6); // Store game stats for loss with 6 guesses
  displayLossMessage(); // Display loss message
  clearGameBoard(); // Clear previous guesses on the game board
  clearKey(); // Reset key letters to black color
  setGame(); // Start a new game
  viewGame(); // Show game section
  inputs[0].focus(); // Focus on the top left square of the game board
}

function displayLossMessage() {
  var messageBox = document.createElement('div');
  messageBox.classList.add('loss-message');
  messageBox.textContent = 'You lost! Try again.';
  
  // Append the message box to the body
  document.body.appendChild(messageBox);

  // Set a timeout to remove the message after 4 seconds
  setTimeout(function() {
    messageBox.remove();
  }, 4000);
}

function recordGameStats() {
  gamesPlayed.push({ solved: true, guesses: currentRow });
}

function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add('collapsed');
  } else {
    gameOverGuessGrammar.classList.remove('collapsed');
  }
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame();
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
    inputs[i].classList.remove('correct-location', 'wrong-location', 'wrong');
  }
}

function clearKey() {
  for (var i = 0; i < keyLetters.length; i++) {
    keyLetters[i].classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  }
}

// Change Page View Functions

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBox.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}

function viewGameOverMessage() {
  gameOverBox.classList.remove('collapsed')
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
}
