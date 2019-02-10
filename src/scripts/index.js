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
let gridMaskElement = document.querySelector('.js-grid-mask');
const cellElements = document.querySelectorAll('.js-cell');
const restartBtnElement = document.querySelector('.js-restart-btn');

/*
 * SVG Templates
 */

const crossTemplate = '<svg width="94" height="94">'
  + '<path class="cross-one" stroke="#545454" stroke-width="8" fill="none" d="M17,17L77,77" />'
  + '<path class="cross-two" stroke="#545454" stroke-width="8" fill="none" d="M77,17L17,77" />'
  + '</svg>';

const circleTemplate = '<svg width="94" height="94">'
  + '<path class="circle" stroke="#f2ebd3" stroke-width="8" fill="none" d="M17,47c0,16.569,13.431,30,30,30,s30,-13.431,30-30s-13.431,-30,-30,-30s-30,13.431,-30,30z" />'
  + '</svg>';

/*
 * Winning Combinations
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
 * Players
 */

class Player {
  constructor(symbol) {
    this.symbol = symbol;
    this.type = '';
    this.score = 0;
  }
}

const playerX = new Player('x');
const playerO = new Player('o');

/*
 * State
 */

let mode = 'medium';
let playerWithTurn;
let grid;
let hasStarted;
let isGameOver;

/*
 * Functions
 */

function setMessage(message) {
  messageElement.innerHTML = `<p class="text">${message}</p>`;
}

function isWinner(symbol) {
  return winningLines.some((line) => {
    const first = grid[line[0]];
    const second = grid[line[1]];
    const third = grid[line[2]];
    return symbol === first && symbol === second && symbol === third;
  });
}

function isGridFilled() {
  return grid.every(e => e !== '');
}

function getCellSymbol(index) {
  return grid[index];
}

function setCellSymbol(index, symbol) {
  grid[index] = symbol;
}

function drawCellSymbol(index) {
  cellElements[index].innerHTML = getCellSymbol(index) === 'o' ? circleTemplate : crossTemplate;
}

function clearCellSymbol(index) {
  grid[index] = '';
}

function isCellOccupied(index) {
  return grid[index] !== '';
}

function resetState() {
  playerX.type = 'human';
  playerWithTurn = playerX;
  grid = ['', '', '', '', '', '', '', '', ''];
  hasStarted = false;
  isGameOver = false;
}

function highlightPlayerElementWithTurn() {
  if (playerWithTurn === playerX) {
    playerXElement.classList.add('has-turn');
    playerOElement.classList.remove('has-turn');
  } else {
    playerXElement.classList.remove('has-turn');
    playerOElement.classList.add('has-turn');
  }
}

// we do this so the border animation plays
function replacePlayerXElement() {
  const newPlayerXElement = playerXElement.cloneNode(true);
  playersElement.replaceChild(newPlayerXElement, playerXElement);
  playerXElement = newPlayerXElement;
  [, playerXScoreElement] = playerXElement.children;
}

function clearCellElements() {
  cellElements.forEach((e) => {
    e.innerHTML = '';
  });
}

// we do this so the grid animation plays
function replaceGridMaskElement() {
  const newGridMaskElement = gridMaskElement.cloneNode(true);
  gridElement.replaceChild(newGridMaskElement, gridMaskElement);
  gridMaskElement = newGridMaskElement;
}

function resetDomElements() {
  highlightPlayerElementWithTurn();
  replacePlayerXElement();
  clearCellElements();
  replaceGridMaskElement();
}

function minimax(index, symbol, computerSymbol) {
  setCellSymbol(index, symbol);

  if (isWinner(symbol)) {
    clearCellSymbol(index);
    return symbol === computerSymbol ? 1 : -1;
  }

  if (isGridFilled()) {
    clearCellSymbol(index);
    return 0;
  }

  let points;
  const nextSymbol = symbol === 'o' ? 'x' : 'o';

  if (nextSymbol === computerSymbol) {
    points = grid.reduce((max, cur, i) => (cur === '' ? Math.max(max, minimax(i, nextSymbol, computerSymbol)) : max), -2);
  } else {
    points = grid.reduce((min, cur, i) => (cur === '' ? Math.min(min, minimax(i, nextSymbol, computerSymbol)) : min), 2);
  }

  clearCellSymbol(index);

  return points;
}

function findBestMoveIndex() {
  const bestMove = { points: -2 };
  const { symbol } = playerWithTurn;

  grid.forEach((_, index) => {
    if (isCellOccupied(index)) {
      return;
    }

    const points = minimax(index, symbol, symbol);
    if (bestMove.points < points) {
      bestMove.points = points;
      bestMove.index = index;
    }
  });

  return bestMove.index;
}

function isMoveAllowed(index) {
  return hasStarted && !isGameOver && grid[index] === '';
}

function makeMove(index) {
  if (!isMoveAllowed(index)) {
    return;
  }

  const { symbol } = playerWithTurn;

  setCellSymbol(index, symbol);
  drawCellSymbol(index);

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
    highlightPlayerElementWithTurn();
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
  resetState();
  resetDomElements();

  // 3. Start game automatically if multiplayer, otherwise wait
  if (mode === 'multiplayer') {
    playerO.type = 'human';
    startGame();
  } else {
    playerO.type = 'computer';
    setMessage('Start game or select player');
  }
}

function handleModeChange(e) {
  mode = e.target.value;
  resetGame();
}

function handlePlayerOElementClick() {
  if (hasStarted) {
    return;
  }

  playerX.type = 'computer';
  playerO.type = 'human';
  startGame();
}

function handleCellElementClick(index) {
  return () => {
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
  };
}

/*
 * Initialise
 */

modeInputElements.forEach(e => e.addEventListener('change', handleModeChange));
playerOElement.addEventListener('click', handlePlayerOElementClick);
cellElements.forEach((e, i) => e.addEventListener('click', handleCellElementClick(i)));
restartBtnElement.addEventListener('click', resetGame);
resetGame();
