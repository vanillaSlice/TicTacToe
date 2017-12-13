window.addEventListener('load', function () {

  'use strict';

  /*
   * DOM elements.
   */
  var modeInputElements = document.querySelectorAll('.mode-btns .radio');
  var playersElement = document.querySelector('.players');
  var playerXElement = document.querySelector('.player-x');
  var playerXScoreElement = document.querySelector('.player-x .score');
  var playerOElement = document.querySelector('.player-o');
  var playerOScoreElement = document.querySelector('.player-o .score');
  var messageElement = document.querySelector('.message');
  var gridElement = document.querySelector('.grid');
  var maskElement = document.querySelector('.grid .mask');
  var cellElements = document.querySelectorAll('.grid .cell');
  var restartButtonElement = document.querySelector('.restart-btn');

  /*
   * SVG templates.
   */
  var crossTemplate =
    '<svg width="100" height="100">' +
    '<path class="cross-one" stroke="#545454" stroke-width="8" fill="none" d="M20,20L80,80" />' +
    '<path class="cross-two" stroke="#545454" stroke-width="8" fill="none" d="M80,20L20,80" />' +
    '</svg>';
  var circleTemplate =
    '<svg width="100" height="100">' +
    '<path class="circle" stroke="#f2ebd3" stroke-width="8" fill="none" d="M20,50a30,30 0 1,0 60,0a30,30 0 1,0 -60,0" />' +
    '</svg>';

  /*
   * Constants.
   */
  var winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  /*
   * Variables.
   */
  var mode = 'medium';
  var playerX = Player('x');
  var playerO = Player('o');
  var playerWithTurn;
  var grid;
  var hasStarted;
  var isGameOver;

  /*
   * Helpers. 
   */

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
    element.addEventListener('change', function () {
      mode = element.value;
      resetGame();
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
    playersElement.replaceChild(newPlayerXElement, playerXElement);
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
      setMessage('Start game or select player');
    }
  }

  function startGame() {
    hasStarted = true;
    setMessage(playerWithTurn.symbol + ' turn');
    if (playerWithTurn.type === 'computer') {
      computerMakeMove();
    }
  }

  function setMessage(message) {
    messageElement.innerHTML = '<p class="text">' + message + '</p>';
  }

  function computerMakeMove() {
    var index = findBestMoveIndex();

    if (mode === 'easy' || mode === 'medium') {
      var emptyCells = grid.reduce(function (acc, current, index) {
        if (current === '') {
          acc.push(index);
        }
        return acc;
      }, []);

      var threshold = (mode === 'easy') ? 0.1 : 0.9;
      if (Math.random() > threshold) {
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
      // can't make move in cell that's already filled
      if (element !== '') {
        return;
      }

      var val = minimax(index, symbol, symbol);
      if (bestMove[0] < val) {
        bestMove[0] = val;
        bestMove[1] = index;
      }
    });
    return bestMove[1];
  }

  function minimax(index, symbol, computerSymbol) {
    var points;
    var nextSymbol;

    // set the symbol
    grid[index] = symbol;

    if (isWinner(symbol)) {
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

    // clear the symbol
    grid[index] = '';

    return points;
  }

  function isWinner(symbol) {
    return winningLines.some(function (line) {
      var first = grid[line[0]];
      var second = grid[line[1]];
      var third = grid[line[2]];
      return symbol === first && first === second && second === third;
    });
  }

  function isGridFilled() {
    return grid.every(function (e) {
      return e !== '';
    });
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
    if (isWinner(playerWithTurn.symbol)) {
      playerWithTurn.score++;
      playerXScoreElement.innerText = (playerX.score === 0) ? '-' : playerX.score;
      playerOScoreElement.innerText = (playerO.score === 0) ? '-' : playerO.score;
      setMessage(symbol + ' wins');
      isGameOver = true;
    } else if (isGridFilled()) {
      setMessage('Draw');
      isGameOver = true;
    } else {
      playerWithTurn = (playerWithTurn === playerX) ? playerO : playerX;
      playerXElement.classList.toggle('has-turn');
      playerOElement.classList.toggle('has-turn');
      setMessage(playerWithTurn.symbol + ' turn');
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

  function init() {
    resetGame();
  }

  init();

});