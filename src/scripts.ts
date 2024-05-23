import './styles.css';
import './assets/turdle-turtle.png';
import { words } from './words';

// Global Variables
var winningWord: string = '';
var currentRow: number = 1;
var guess: string = '';
var gamesPlayed: { solved: boolean, guesses: number }[] = [];

// Query Selectors
var inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll('input');
var guessButton: HTMLButtonElement = document.querySelector('#guess-button')!;
var keyLetters: NodeListOf<HTMLSpanElement> = document.querySelectorAll('span');
var errorMessage: HTMLSpanElement = document.querySelector('#error-message')!;
var viewRulesButton: HTMLButtonElement = document.querySelector('#rules-button')!;
var viewGameButton: HTMLButtonElement = document.querySelector('#play-button')!;
var viewStatsButton: HTMLButtonElement = document.querySelector('#stats-button')!;
var gameBoard: HTMLDivElement = document.querySelector('#game-section')!;
var letterKey: HTMLDivElement = document.querySelector('#key-section')!;
var rules: HTMLDivElement = document.querySelector('#rules-section')!;
var stats: HTMLDivElement = document.querySelector('#stats-section')!;
var gameOverBox: HTMLDivElement = document.querySelector('#game-over-section')!;
var gameOverGuessCount: HTMLSpanElement = document.querySelector('#game-over-guesses-count')!;
var gameOverGuessGrammar: HTMLSpanElement = document.querySelector('#game-over-guesses-plural')!;

// Event Listeners
window.addEventListener('load', setGame);

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('keyup', function(event: KeyboardEvent) { moveToNextInput(event) });
}

for (var i = 0; i < keyLetters.length; i++) {
  keyLetters[i].addEventListener('click', function(event: MouseEvent) { clickLetter(event as MouseEvent) });
}

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Functions
function setGame(): void {
  currentRow = 1;
  winningWord = getRandomWord();
  console.log(winningWord);
  updateInputPermissions();
}

function getRandomWord(): string {
  var randomIndex = Math.floor(Math.random() * 2500);
  return words[randomIndex];
}

function updateInputPermissions(): void {
  for(var i = 0; i < inputs.length; i++) {
    if(!inputs[i].id.includes(`-${currentRow}-`)) {
      inputs[i].disabled = true;
    } else {
      inputs[i].disabled = false;
    }
  }

  inputs[0].focus();
}

function moveToNextInput(e: KeyboardEvent): void {
  var key = e.keyCode || e.charCode;

  if( key !== 8 && key !== 46 ) {
    var indexOfNext = parseInt((e.target as HTMLInputElement).id.split('-')[2]) + 1;
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e: MouseEvent): void {
  var activeInput: HTMLInputElement | null = null;
  var activeIndex: number | null = null;

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`) && !inputs[i].value && !activeInput) {
      activeInput = inputs[i];
      activeIndex = i;
    }
  }

  if (activeInput && activeIndex !== null) {
    activeInput.value = (e.target as HTMLSpanElement).innerText;
    inputs[activeIndex + 1].focus();
  }
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
  }
}

function checkIsWord(): boolean {
  guess = '';

  for(var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      guess += inputs[i].value;
    }
  }

  return words.includes(guess);
}

function compareGuess(): void {
  var guessLetters: string[] = guess.split('');

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

function updateBoxColor(letterLocation: number, className: string): void {
  var row: HTMLInputElement[] = [];

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter: string, className: string): void {
  var keyLetter: HTMLSpanElement | null = null;

  for (var i = 0; i < keyLetters.length; i++) {
    if (keyLetters[i].innerText === letter) {
      keyLetter = keyLetters[i];
    }
  }

  if (keyLetter) {
    keyLetter.classList.add(className);
  }
}

function checkForWin(): boolean {
  return guess === winningWord;
}

function changeRow(): void {
  currentRow++;
  updateInputPermissions();
}

function declareWinner(): void {
  recordGameStats();
  changeGameOverText();
  viewGameOverMessage();
  setTimeout(startNewGame, 4000);
}

function recordGameStats(): void {
  gamesPlayed.push({ solved: true, guesses: currentRow });
}

function changeGameOverText(): void {
  gameOverGuessCount.innerText = currentRow.toString();
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add('collapsed');
  } else {
    gameOverGuessGrammar.classList.remove('collapsed');
  }
}

function startNewGame(): void {
  clearGameBoard();
  clearKey();
  setGame();
  viewGame();
  inputs[0].focus();
}

function clearGameBoard(): void {
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
    inputs[i].classList.remove('correct-location', 'wrong-location', 'wrong');
  }
}

function clearKey(): void {
  for (var i = 0; i < keyLetters.length; i++) {
    keyLetters[i].classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  }
}

// Change Page View Functions

function viewRules(): void {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame(): void {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBox.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats(): void {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}

function viewGameOverMessage(): void {
  gameOverBox.classList.remove('collapsed')
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
}

