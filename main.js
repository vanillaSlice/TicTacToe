window.addEventListener('load', function () {

  'use strict';

  /*
   * DOM elements.
   */
  var modeInputElements = document.querySelectorAll('#mode input'),
    playerElements = document.getElementById('players'),
    playerXElement = document.getElementById('player-x'),
    playerXScoreElement = document.querySelector('#player-x .score'),
    playerOElement = document.getElementById('player-o'),
    playerOScoreElement = document.querySelector('#player-o .score'),
    messageElement = document.getElementById('message'),
    gridElement = document.getElementById('grid'),
    maskElement = document.getElementById('mask'),
    cellElements = document.querySelectorAll('.cell'),
    restartButtonElement = document.querySelector('#restart button');

  /*
   * SVG templates.
   */
  var crossTemplate = '<svg width="100" height="100">' +
    '<path class="cross-one" stroke="#545454" stroke-width="8" fill="none"' +
    ' d="M20,20L80,80" />' +
    '<path class="cross-two" stroke="#545454" stroke-width="8" fill="none"' +
    ' d="M80,20L20,80" />' +
    '</svg>',
    circleTemplate = '<svg width="100" height="100">' +
    '<path class="circle" stroke="#f2ebd3" stroke-width="8" fill="none"' +
    ' d="M20,50a30,30 0 1,0 60,0a30,30 0 1,0 -60,0" />' +
    '</svg>';

  /*
   * Variables.
   */
  var mode = 'medium',
    playerX = Player('x'),
    playerO = Player('o'),
    playerWithTurn,
    grid,
    movesMade,
    winningLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ],
    hasStarted,
    isGameOver;

  function Player(symbol) {
    return {
      symbol: symbol,
      type: '',
      score: 0
    };
  }

  /*
   * Add event listeners.
   */

  modeInputElements.forEach(function (element) {
    element.addEventListener('click', function () {
      if (mode !== element.value) {
        mode = element.value;
        resetGame();
      }
    });
  });

  function resetGame() {
    // 1. Reset variables
    playerX.type = 'human';
    playerWithTurn = playerX;
    grid = ['', '', '', '', '', '', '', '', ''];
    movesMade = 0;
    hasStarted = false;
    isGameOver = false;

    // 2. Reset DOM elements
    playerOElement.classList.remove('has-turn');
    playerXElement.classList.add('has-turn');
    // replace player x element so border animation plays
    var newPlayerXElement = playerXElement.cloneNode(true);
    playerElements.replaceChild(newPlayerXElement, playerXElement);
    playerXElement = newPlayerXElement;
    playerXScoreElement = document.querySelector('#player-x .score');

    // clear cells
    cellElements.forEach(function (element) {
      element.innerHTML = '';
    });

    // replace mask element so grid animation plays
    var newMaskElement = maskElement.cloneNode(true);
    gridElement.replaceChild(newMaskElement, maskElement);
    maskElement = newMaskElement;

    // 3. Start game automatically if multiplayer, otherwise wait
    if (mode === 'multiplayer') {
      playerO.type = 'human';
      startGame();
    } else {
      playerO.type = 'computer';
      messageElement.innerHTML = '<p>Start game or select player</p>';
    }
  }

  function startGame() {
    hasStarted = true;
    messageElement.innerHTML = '<p>x turn</p>';
    if (playerWithTurn.type === 'computer') {
      computerMakeMove();
    }
  }

  // finish this method
  function computerMakeMove() {
    setTimeout(function () {
      var index = parseInt(Math.random() * 8);
      while (grid[index] !== '') {
        index = parseInt(Math.random() * 8);
      }
      makeMove(index);
    }, 1000);
  }

  // finish this method
  function makeMove(index) {
    if (!hasStarted || isGameOver || grid[index] !== '') {
      return;
    }

    grid[index] = playerWithTurn.symbol;
    cellElements[index].innerHTML =
      (playerWithTurn.symbol === 'o') ? circleTemplate : crossTemplate;
    movesMade++;

    if (checkIfWon()) {
      playerWithTurn.score++;
      playerXScoreElement.innerText = (playerX.score === 0) ? '-' : playerX.score;
      playerOScoreElement.innerText = (playerO.score === 0) ? '-' : playerO.score;
      messageElement.innerHTML = '<p>' + playerWithTurn.symbol + ' wins</p>';
      isGameOver = true;
    } else if (movesMade === 9) {
      messageElement.innerHTML = '<p>Draw</p>';
      isGameOver = true;
    } else {
      playerWithTurn = (playerWithTurn === playerX) ? playerO : playerX;
      playerXElement.classList.toggle('has-turn');
      playerOElement.classList.toggle('has-turn');
      messageElement.innerHTML = '<p>' + playerWithTurn.symbol + ' turn</p>';
      if (playerWithTurn.type === 'computer') {
        computerMakeMove();
      }
    }
  }

  function checkIfWon() {
    for (var i = 0, length = winningLines.length; i < length; i++) {
      var line = winningLines[i],
        first = grid[line[0]],
        second = grid[line[1]],
        third = grid[line[2]];
      if (first !== '' && first === second && second === third) {
        return true;
      }
    }
    return false;
  }

  playerOElement.addEventListener('click', function () {
    if (!hasStarted) {
      playerX.type = 'computer';
      playerO.type = 'human';
      startGame();
    }
  });

  cellElements.forEach(function (element, index) {
    element.addEventListener('click', function () {
      if (!hasStarted) {
        startGame();
      }
      if (playerWithTurn.type === 'human') {
        makeMove(index);
      }
    });
  });

  restartButtonElement.addEventListener('click', resetGame);

  // make sure we open page in a 'fresh' game state
  resetGame();

});