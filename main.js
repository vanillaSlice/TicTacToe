window.addEventListener('load', function () {

  'use strict';

  /*
   * DOM elements.
   */
  var modeInputElements = document.querySelectorAll('#mode input'),
    playerElements = document.getElementById('players'),
    playerXElement = playerElements.children[0],
    playerXScoreElement = playerXElement.children[1],
    playerOElement = playerElements.children[1],
    playerOScoreElement = playerOElement.children[1],
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
    hasStarted = false;
    isGameOver = false;

    // 2. Reset DOM elements
    playerOElement.classList.remove('has-turn');
    playerXElement.classList.add('has-turn');
    // replace player x element so border animation plays
    var newPlayerXElement = playerXElement.cloneNode(true);
    playerElements.replaceChild(newPlayerXElement, playerXElement);
    playerXElement = newPlayerXElement;
    playerXScoreElement = playerXElement.children[1];

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

  function computerMakeMove() {
    var index = findBestMoveIndex();

    if (mode === 'easy' || mode === 'medium') {
      index = findBestMoveIndex();
      var emptyCells = grid.reduce(function (acc, current, index) {
        if (current === '') {
          acc.push(index);
        }
        return acc;
      }, []);

      var offset = (mode === 'easy') ? 0.1 : 0.9;
      if (Math.random() > offset) {
        emptyCells.splice(emptyCells.indexOf(index), 1);
        index = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    }

    setTimeout(function () {
      makeMove(index);
    }, 1000);
  }

  function findBestMoveIndex() {
    var bestMove = [-2];
    var symbol = playerWithTurn.symbol;
    grid.forEach(function (element, index) {
      if (element === '') {
        var val = minimax(index, symbol, symbol);
        if (bestMove[0] < val) {
          bestMove[0] = val;
          bestMove[1] = index;
        }
      }
    });
    return bestMove[1];
  }

  function minimax(index, symbol, computerSymbol) {
    var points,
      nextSymbol;

    // set the symbol
    grid[index] = symbol;

    if (isGameWon(symbol)) {
      points = (symbol === computerSymbol) ? 1 : -1;
    } else if (isGridFilled()) {
      points = 0;
    } else {
      nextSymbol = (symbol === 'o') ? 'x' : 'o';
      if (nextSymbol === computerSymbol) {
        var max = -2;
        grid.forEach(function (element, index) {
          if (element === '') {
            max = Math.max(max, minimax(index, nextSymbol, computerSymbol));
          }
        });
        points = max;
      } else {
        var min = 2;
        grid.forEach(function (element, index) {
          if (element === '') {
            min = Math.min(min, minimax(index, nextSymbol, computerSymbol));
          }
        });
        points = min;
      }
    }

    // clean up
    grid[index] = '';

    return points;
  }

  function isGameWon(symbol) {
    for (var i = 0, length = winningLines.length; i < length; i++) {
      var line = winningLines[i],
        first = grid[line[0]],
        second = grid[line[1]],
        third = grid[line[2]];
      if (first === symbol && first === second && second === third) {
        return true;
      }
    }
    return false;
  }

  function isGridFilled() {
    for (var i = 0, length = grid.length; i < length; i++) {
      if (grid[i] === '') {
        return false;
      }
    }
    return true;
  }

  function makeMove(index) {
    // 1. Check move is allowed
    if (!hasStarted || isGameOver || grid[index] !== '') {
      return;
    }

    // 2. Make the move
    var symbol = playerWithTurn.symbol;
    grid[index] = symbol;
    cellElements[index].innerHTML = (symbol === 'o') ? circleTemplate : crossTemplate;

    // 3. Check if game is over, if not switch players
    if (isGameWon(playerWithTurn.symbol)) {
      playerWithTurn.score++;
      playerXScoreElement.innerText = (playerX.score === 0) ? '-' : playerX.score;
      playerOScoreElement.innerText = (playerO.score === 0) ? '-' : playerO.score;
      messageElement.innerHTML = '<p>' + symbol + ' wins</p>';
      isGameOver = true;
    } else if (isGridFilled()) {
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

  playerOElement.addEventListener('click', function () {
    if (!hasStarted) {
      playerX.type = 'computer';
      playerO.type = 'human';
      startGame();
    }
  });

  cellElements.forEach(function (element, index) {
    element.addEventListener('click', function () {
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

  // make sure we open page in a 'fresh' game state
  resetGame();

});