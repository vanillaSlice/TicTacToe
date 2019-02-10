/* eslint-disable */

/*
 * DOM Elements
 */

const modeInputElements = document.querySelectorAll('.js-mode-input');
const playersElement = document.querySelector('.js-players');
let playerXElement = document.querySelector('.js-player-x');
let playerXScoreElement = document.querySelector('.js-player-x-score');
const playerOElement = document.querySelector('.js-player-o');
const playerOScoreElement = document.querySelector('.js-player-o-score');
const messageElement = document.querySelector('.js-message');
const gridElement = document.querySelector('.js-grid');
let maskElement = document.querySelector('.js-grid-mask');
const cellElements = document.querySelectorAll('.js-cell');
const restartButtonElement = document.querySelector('.js-restart-btn');

/*
 * SVG Templates
 */

const crossTemplate = '<svg width="94" height="94">'
  + '<path class="cross-one" stroke="#545454" stroke-width="8" fill="none" d="M17,17L77,77" />'
  + '<path class="cross-two" stroke="#545454" stroke-width="8" fill="none" d="M77,17L17,77" />'
  + '</svg>';

const circleTemplate = '<svg width="94" height="94">'
  + '<path class="circle" stroke="#f2ebd3" stroke-width="8" fill="none" d="M 17 47 c 0 16.569, 13.431 30, 30 30 s 30 -13.431, 30 -30 s -13.431 -30, -30 -30 s -30 13.431, -30 30 z" />'
  + '</svg>';

/*
 * Constants
 */

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/*
 * Helpers
 */

function Player(symbol) {
  return {
    symbol,
    type: '',
    score: 0,
  };
}

/*
 * Variables
 */

let mode = 'medium';
const playerX = Player('x');
const playerO = Player('o');
let playerWithTurn;
let grid;
let hasStarted;
let isGameOver;

/*
 * Add event listeners
 */

function setMessage(message) {
  messageElement.innerHTML = `<p class="text">${message}</p>`;
}

function isWinner(symbol) {
  return winningLines.some((line) => {
    const first = grid[line[0]];
    const second = grid[line[1]];
    const third = grid[line[2]];
    return symbol === first && first === second && second === third;
  });
}

function isGridFilled() {
  return grid.every(e => e !== '');
}

function minimax(index, symbol, computerSymbol) {
  let points;
  let nextSymbol;

  // set the symbol
  grid[index] = symbol;

  if (isWinner(symbol)) {
    points = (symbol === computerSymbol) ? 1 : -1;
  } else if (isGridFilled()) {
    points = 0;
  } else {
    nextSymbol = (symbol === 'o') ? 'x' : 'o';
    if (nextSymbol === computerSymbol) {
      let max = -2;
      grid.forEach((element, i) => {
        if (element === '') {
          max = Math.max(max, minimax(i, nextSymbol, computerSymbol));
        }
      });
      points = max;
    } else {
      let min = 2;
      grid.forEach((element, i) => {
        if (element === '') {
          min = Math.min(min, minimax(i, nextSymbol, computerSymbol));
        }
      });
      points = min;
    }
  }

  // clear the symbol
  grid[index] = '';

  return points;
}

function findBestMoveIndex() {
  const bestMove = [-2];
  const { symbol } = playerWithTurn;
  grid.forEach((element, index) => {
    // can't make move in cell that's already filled
    if (element !== '') {
      return;
    }

    const val = minimax(index, symbol, symbol);
    if (bestMove[0] < val) {
      bestMove[0] = val;
      bestMove[1] = index;
    }
  });
  return bestMove[1];
}

function makeMove(index) {
  // 1. Check move is allowed
  if (!hasStarted || isGameOver || grid[index] !== '') {
    return;
  }

  // 2. Make the move
  const { symbol } = playerWithTurn;
  grid[index] = symbol;
  cellElements[index].innerHTML = (symbol === 'o') ? circleTemplate : crossTemplate;

  // 3. Check if game is over, if not switch players
  if (isWinner(playerWithTurn.symbol)) {
    playerWithTurn.score += 1;
    playerXScoreElement.innerText = (playerX.score === 0) ? '-' : playerX.score;
    playerOScoreElement.innerText = (playerO.score === 0) ? '-' : playerO.score;
    setMessage(`${symbol} wins`);
    isGameOver = true;
  } else if (isGridFilled()) {
    setMessage('Draw');
    isGameOver = true;
  } else {
    playerWithTurn = (playerWithTurn === playerX) ? playerO : playerX;
    playerXElement.classList.toggle('has-turn');
    playerOElement.classList.toggle('has-turn');
    setMessage(`${playerWithTurn.symbol} turn`);
    if (playerWithTurn.type === 'computer') {
      computerMakeMove();
    }
  }
}

function computerMakeMove() {
  let index = findBestMoveIndex();

  if (mode === 'easy' || mode === 'medium') {
    const emptyCells = grid.reduce((acc, current, i) => {
      if (current === '') {
        acc.push(i);
      }
      return acc;
    }, []);

    const threshold = (mode === 'easy') ? 0.1 : 0.9;
    if (Math.random() > threshold) {
      emptyCells.splice(emptyCells.indexOf(index), 1);
      index = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
  }

  setTimeout(() => {
    makeMove(index);
  }, 1000);
}

function startGame() {
  hasStarted = true;
  setMessage(`${playerWithTurn.symbol} turn`);
  if (playerWithTurn.type === 'computer') {
    computerMakeMove();
  }
}

function resetGame() {
  // 1. Reset variables
  playerX.type = 'human';
  playerWithTurn = playerX;
  grid = ['', '', '', '', '', '', '', '', ''];
  hasStarted = false;
  isGameOver = false;

  // 2. Reset DOM elements
  playerOElement.classList.remove('has-turn');
  playerXElement.classList.add('has-turn');

  // replace player x element so border animation plays
  const newPlayerXElement = playerXElement.cloneNode(true);
  playersElement.replaceChild(newPlayerXElement, playerXElement);
  playerXElement = newPlayerXElement;
  playerXScoreElement = playerXElement.children[1];

  // clear cells
  cellElements.forEach((element) => {
    element.innerHTML = '';
  });

  // replace mask element so grid animation plays
  const newMaskElement = maskElement.cloneNode(true);
  gridElement.replaceChild(newMaskElement, maskElement);
  maskElement = newMaskElement;

  // 3. Start game automatically if multiplayer, otherwise wait
  if (mode === 'multiplayer') {
    playerO.type = 'human';
    startGame();
  } else {
    playerO.type = 'computer';
    setMessage('Start game or select player');
  }
}

modeInputElements.forEach((element) => {
  element.addEventListener('change', () => {
    mode = element.value;
    resetGame();
  });
});

playerOElement.addEventListener('click', () => {
  if (!hasStarted) {
    playerX.type = 'computer';
    playerO.type = 'human';
    startGame();
  }
});

cellElements.forEach((element, index) => {
  element.addEventListener('click', () => {
    if (isGameOver) {
      resetGame();
      return;
    }
    if (!hasStarted) {
      startGame();
    }
    if (playerWithTurn.type === 'human') {
      makeMove(index);
    }
  });
});

restartButtonElement.addEventListener('click', resetGame);

function init() {
  resetGame();
}

init();
