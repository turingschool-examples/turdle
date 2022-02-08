// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');

// Event Listeners
window.addEventListener('load', setGame);

guessButton.addEventListener('click', submitGuess);

// Functions
function setGame() {
  winningWord = getRandomWord();
  updateInputPermissions();
}

function getRandomWord() {
  var randomIndex = Math.floor(Math.random() * 2500);
  return words[randomIndex];
}

function updateInputPermissions() {
  for(var i = 0; i < inputs.length; i++) {
    if(!inputs[i].id.includes(`-${currentRow}-`)) {
      inputs[i].disabled = true;
    } else {
      inputs[i].disabled = false;
    }
  }
}

function submitGuess() {
  if (checkIsWord()) {
    checkGuess();
    if (checkForWin()) {
      declareWinner();
    } else {
      changeRow();
    }
  } else {
    console.log('not a word');
  }
}

function checkIsWord() {
  guess = '';
  
  for(var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      guess += inputs[i].value;
    }
  }

  return words.includes(guess);
}

function checkGuess() {
  var guessLetters = guess.split('');

  for (var i = 0; i < guessLetters.length; i++) {

    if (winningWord.split('')[i] === guessLetters[i]) {
      updateColor(i, 'correct-location');
    } else if (winningWord.includes(guessLetters[i])) {
      updateColor(i, 'wrong-location');
    } else {
      updateColor(i, 'wrong');
    }
  }

}

function updateColor(letterLocation, className) {
  var row = [];

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareWinner() {
  console.log('winner!');
}
