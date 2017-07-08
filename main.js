window.addEventListener('load', function () {

  'use strict';

  /*
   * DOM elements.
   */
  var playerOneElement = document.getElementById('player-one'),
    playerTwoElement = document.getElementById('player-two'),
    playerOneScoreElement = playerOneElement.querySelector('.score'),
    playerTwoScoreElement = playerTwoElement.querySelector('.score'),
    cellElements = document.querySelectorAll('.cell');

  /*
   * Variables.
   */
  var numberOfPlayers,
    playerOne = Player(),
    playerTwo = Player(),
    playerWithTurn,
    grid,
    winninglines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

  function Player(symbol, type) {
    return {
      symbol: symbol,
      type: type,
      score: 0
    }
  }

  /*
   * Add event listeners.
   */
  document.getElementById('new-game').addEventListener('click', startNewGame);

  function startNewGame() {
    numberOfPlayers = parseInt(document.querySelector('.number-of-players:checked').value);

    // determine player types
    if (numberOfPlayers === 0) {
      playerOne.type = 'computer';
      playerTwo.type = 'computer';
    } else if (numberOfPlayers === 1) {
      playerOne.type = 'human';
      playerTwo.type = 'computer';
    } else if (numberOfPlayers === 2) {
      playerOne.type = 'human';
      playerTwo.type = 'human';
    }

    // determine player symbols
    playerOne.symbol = 'x'; // fix these
    playerTwo.symbol = 'o';

    // reset player scores
    playerOne.score = 0;
    playerTwo.score = 0;

    startNewRound();
  }

  function startNewRound() {
    // Determine player with turn
    playerWithTurn = playerOne; // fix this

    resetGrid();
    updateDOM();
  }

  function resetGrid() {
    grid = ['', '', '', '', '', '', '', '', ''];
  }

  function updateDOM() {
    // 1. Update score elements
    playerOneScoreElement.innerText = playerOne.score;
    playerTwoScoreElement.innerText = playerTwo.score;

    // 2. Update cell elements
    cellElements.forEach(function (element, index) {
      element.innerHTML = grid[index];
    });
  }

  // add cell click event listener
  cellElements.forEach(function (element, index) {
    element.addEventListener('click', function () {
      if (grid[index] === '') {
        grid[index] = playerWithTurn.symbol;
        updateDOM();
        switchPlayerWithTurn();
      }
    });
  });

  function switchPlayerWithTurn() {
    playerWithTurn = (playerWithTurn === playerOne) ? playerTwo : playerOne;
  }

  startNewGame();

});

// shape svgs
// <svg height="100" width="100">
//   <path class="circle" stroke="#f2ebd3" stroke-width="8" fill="none" d="M20,50a30,30 0 1,0 60,0a30,30 0 1,0 -60,0" />
// </svg>

// <svg height="100 " width="100 ">
//   <path class="cross-1 " stroke="#545454 " stroke-width="8 " fill="none " d="M20,20L80,80 " />
//   <path class="cross-2 " stroke="#545454 " stroke-width="8 " fill="none " d="M80,20L20,80 " />
// </svg>