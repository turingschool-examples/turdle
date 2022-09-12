
// Global Variables
let words = [];
let winningWord = '';
let currentRow = 1;
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

inputs.forEach(input => input.addEventListener('keyup', moveToNextInput)); 

keyLetters.forEach(letter => letter.addEventListener('click', clickLetter));

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// API Data
const fetchWords = fetch('http://localhost:3001/api/v1/words')
  .then(response => response.json())
  .then(data => data)
  .catch(error => alert(error));


// Functions
function setGame() {
  fetchWords.then(data => {
    words = data;
    winningWord = getRandomWord(data);
    console.log(winningWord, 'winningWord')
  })
  currentRow = 1;
  updateInputPermissions();
}

function getRandomWord(data) {
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

function updateInputPermissions() {

  inputs.forEach(input => {
    if(!input.id.includes(`-${currentRow}-`)) {
      input.disabled = true;
    } else {
      input.disabled = false;
    }
  });
  
  inputs[0].focus();
}

function moveToNextInput(e) {
  const key = e.keyCode || e.charCode;
  console.log(key, 'key')
  
  const indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
  inputs[indexOfNext].focus();
  
  if( key !== 8 && key !== 46 ) {
    console.log(e.target.id.split('-'))
    const indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    console.log(indexOfNext);
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e) {
  let activeInput = null;
  let activeIndex = null;
  
  inputs.forEach(input => {
    if (input.id.includes(`-${currentRow}-`) && !input.value && !activeInput) {
      const inputId = input.id.split('-');
      activeInput = input;
      activeIndex = parseInt(inputId[2]);
    }
  });
  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    if (checkForWin()) {
      setTimeout(declareWinner, 1000);
    } else {
      changeRow();
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
    changeRow(); 
  }
}

function checkIsWord() { 
  guess = '';

  inputs.forEach(input => {
    if(input.id.includes(`-${currentRow}-`)) {
      guess += input.value;
    }
  })

  console.log(words.includes(guess))
  return words.includes(guess);
}

function compareGuess() {
  let guessLetters = guess.split('');

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

  inputs.forEach(input => {
    if (input.id.includes(`-${currentRow}-`)) {
      row.push(input);
    }
  });

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
