import { getRandomInteger } from "./utils.js";

const BOARD_SIZE = 9;

const defaultConfig = {
  difficulty: "normal",
};

const DIFFICULTY_MAP = {
  easy: 70,
  normal: 50,
  hard: 30,
};

class Sudoku {
  constructor($container, config = defaultConfig) {
    this.board = this._initBoard();
    this.config = config;

    const $board = this._initGUI();
    $container.appendChild($board);

    this._startGame();
  }

  newGame() {
    this._resetGame();
  }

  solveGame() {
    this._solveSudoku();
  }

  _resetGame() {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        this.board[row][col].value = "";
        this.board[row][col].disabled = false;
      }
    }

    this._startGame();
  }

  _initBoard() {
    const board = new Array(BOARD_SIZE);
    for (let i = 0; i < board.length; i++) {
      board[i] = new Array(BOARD_SIZE);
    }
    return board;
  }

  _initGUI() {
    const $board = document.createElement("table");
    for (let i = 0; i < BOARD_SIZE; i++) {
      const tr = document.createElement("tr");
      for (let j = 0; j < BOARD_SIZE; j++) {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.maxLength = 1;
        input.addEventListener("input", (e) => {
          if (!e.target.value.match(/^[1-9]$/)) {
            input.value = "";
          }
        });

        this.board[i][j] = input;
        td.appendChild(input);
        tr.appendChild(td);
      }
      $board.appendChild(tr);
    }

    return $board;
  }

  _startGame() {
    const uniqueSet = new Set();
    while (uniqueSet.size < BOARD_SIZE) {
      uniqueSet.add(getRandomInteger(1, BOARD_SIZE).toString());
    }

    const randomArray = Array.from(uniqueSet);
    for (let i = 0; i < BOARD_SIZE; i++) {
      this.board[0][i].value = randomArray[i];
    }

    this._solveSudoku();

    const numberOfSlotsToRemove =
      BOARD_SIZE * BOARD_SIZE - DIFFICULTY_MAP[this.config.difficulty];
    this._removeRandomSlots(numberOfSlotsToRemove);

    this._disablePrefilledSlots();
  }

  _solveSudoku() {
    // for every cell in the sudoku
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        // if it's not empty
        if (this.board[row][col].value !== "") continue;

        // try every number 1 - 9
        for (let i = 1; i <= 9; i++) {
          const num = i.toString();
          if (this._isValidBoard(num, row, col)) {
            this.board[row][col].value = num;
            // continue search for that board, set true if solution is found
            if (this._solveSudoku()) return true;
          }
        }
        // solution wasn't found for any number 1 - 9 here, i.e. dead end
        // set the current cell back to empty
        this.board[row][col].value = "";
        return false;
      }
    }

    // all cells filled, must be a solution
    return true;
  }

  _isValidBoard(num, row, col) {
    // row 1 - 3 belongs to the same block row, row 4 - 6 belongs to
    // same block row, etc.
    const blockRow = Math.floor(row / 3) * 3;
    const blockCol = Math.floor(col / 3) * 3;

    // loop through every block
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (
        this.board[row][i].value === num ||
        this.board[i][col].value === num
      ) {
        return false;
      }

      const curRow = blockRow + Math.floor(i / 3);
      const curCol = blockCol + Math.floor(i % 3);
      // check the block
      if (this.board[curRow][curCol].value === num) return false;
    }
    return true;
  }

  _removeRandomSlots(count) {
    let removedCount = 0;
    while (removedCount < count) {
      const randomRow = getRandomInteger(0, BOARD_SIZE);
      const randomColumn = getRandomInteger(0, BOARD_SIZE);
      if (this.board[randomRow][randomColumn].value !== "") {
        this.board[randomRow][randomColumn].value = "";
        removedCount++;
      }
    }
  }

  _disablePrefilledSlots() {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (this.board[row][col].value === "") {
          continue;
        }
        this.board[row][col].disabled = true;
      }
    }
  }
}

if (navigator.serviceWorker) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/ServiceWorker.js")
      .then(() => console.log("service worker registered by the main thread"))
      .catch((err) => console.log(`error: ${err}`));
  });
}

const $container = document.querySelector(".container");
const game = new Sudoku($container);

const newGameButton = document.querySelector(".new-game-button");
newGameButton.addEventListener("click", () => game.newGame());

const solveButton = document.querySelector(".solve-button");
solveButton.addEventListener("click", () => game.solveGame());
