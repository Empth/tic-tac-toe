function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function Gameboard(row, col) {
    const board = [];
    const rows = row;
    const columns = col;

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    // basically make move but generalized for 
    // different types of grid board games
    const placeToken = (r, c, playerToken) => {
        if (!(0 <= r && r < rows) || !(0 <= c && c < columns)) {
            console.log("Inputs out of bounds!")
            return; // oob
        }
        if (board[r][c].getValue() != 0) {
            console.log("Space already occupied.")
            return; // occupied by player token
        }
        board[r][c].addToken(playerToken);
    };

    const positionFree = (r, c) => board[r][c].getValue() === 0;

    // This method will be used to print our board to the console.
    // It is helpful to see what the board looks like after each turn as we play,
    // but we won't need it after we build our UI
    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()));
        console.log(boardWithCellValues);
    };

    // Here, we provide an interface for the rest of our
    // application to interact with the board
    return { getBoard, placeToken, printBoard, positionFree };
}

/*
** A Cell represents one "square" on the board and can have one of
** 0: no token is in the square,
** 1: Player 1's token,
** 2: Player 2's token
*/

function Cell() {
    let value = 0;

    // How we will retrieve the current value of this cell through closure
    const addToken = (player) => {value = player};
    const getValue = () => value;

    return { addToken, getValue }
}

/* 
** The GameController will be responsible for controlling the 
** flow and state of the game's turns, as well as whether
** anybody has won the game.
*/

function GameController(playerOneName = "Player One - X", playerTwoName = "Player Two - O") {

    const n = 3
    const board = Gameboard(n, n);
    const players = [{name: playerOneName, token: 1}, {name: playerTwoName, token: 2}];
    const oneVictory = new Array(n).fill(1);
    const twoVictory = new Array(n).fill(2);

    let activePlayer = players[0];
    let winner = null;
    let tiedGame = false;

    const switchPlayerTurn = () => {
        activePlayer = (activePlayer === players[0]) ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    // update winner to winning player or null if none
    const setWinner = () => {
        let threeCell = new Set();
        // get rows
        for (const row of board.getBoard()) {
            threeCell.add(row.map((cell) => cell.getValue()));
        }
        // get columns
        for (let i = 0; i < n; i++) {
            let col = [];
            for (let j = 0; j < n; j++) {
                col.push(board.getBoard()[j][i].getValue());  
            }
            threeCell.add(col);
        }
        // get diagonals
        let diagonalLeft = [];
        let diagonalRight = [];
        for (let i = 0; i < n; i++) {
            diagonalLeft.push(board.getBoard()[i][i].getValue());
            diagonalRight.push(board.getBoard()[n-1-i][i].getValue());
        }
        threeCell.add(diagonalLeft);
        threeCell.add(diagonalRight);

        let unoWin = false;
        let dosWin = false;
        for (const triCell of threeCell) {
            if (arraysEqual(triCell, oneVictory)) { unoWin = true; }
            if (arraysEqual(triCell, twoVictory)) { dosWin = true; }
        }

        try { if (unoWin && dosWin) { throw new Error("Can't have both players win"); } } catch (error) { console.error(`Error: ${error.message}`); }

        if (unoWin) { 
            winner = players[0]; 
        } else if (dosWin) { 
            winner = players[1]; 
        } else {
            winner = null;
        }
    };

    // Return status of tied game or not
    const setTie = () => {
        tiedGame = true;
        for (const row of board.getBoard()) {
            for (const cell of row) {
                if (cell.getValue() === 0) { 
                    tiedGame = false;
                }
            }
        } 
    }

    const getWinner = () => winner === null ? null : winner.name;

    const getTie = () => tiedGame;

    const playRound = (r, c) => {

        if (!board.positionFree(r, c)) { return; }

        board.placeToken(r, c, getActivePlayer().token); // TODO fix skip your turn on selecting filled tile

        setTie();
        setWinner();

        // Switch player turn
        switchPlayerTurn();
        printNewRound();
    }

    // Initial play game message
    printNewRound();

    // For the console version, we will only use playRound, but we will need
    // getActivePlayer for the UI version, so I'm revealing it now
    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard,
        getWinner, 
        getTie
    };
}

function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    const endgameDiv = document.querySelector('.endgame')
    const iconMap = {0: "", 1: "X", 2: "O"}
    const tupleBlacklist = new Set() // blacklist of [r, c] tuples selected

    const updateScreen = () => {
        // clear the board
        boardDiv.textContent = "";
        // clear endgame state
        endgameDiv.textContent = "";

        // get the newest version of the board and player turn

        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        // Display player's turn
        playerTurnDiv.textContent = `${activePlayer.name}'s turn...`

        // Render board squares
        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                // anything clickable should be a button!
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                // Create a data attribute to identify the row, column cell index
                // This makes it easier to pass into our `playRound` function
                cellButton.dataset.row = rowIndex;
                cellButton.dataset.column = colIndex;
                cellButton.textContent = iconMap[cell.getValue()];
                boardDiv.appendChild(cellButton);
            })
        })

        // end screen message if win or tie
        updateEndgame();
    };

    const updateEndgame = () => {
        let winner = game.getWinner();
        let tiedGame = game.getTie();
        if (winner !== null) {
            endgameDiv.textContent = `${winner} has won the game!`;
            boardDiv.removeEventListener("click", clickHandlerBoard);
        } else if (tiedGame === true) {
            endgameDiv.textContent = `Tied game.`;
            boardDiv.removeEventListener("click", clickHandlerBoard);
        }
    }

    function clickHandlerBoard(e) {
        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;
        // Make sure I've clicked a column and not the gaps in between
        if (!selectedRow || !selectedColumn) return;
        game.playRound(selectedRow, selectedColumn);

        updateScreen();
    }

    boardDiv.addEventListener("click", clickHandlerBoard);

    // Initial render
    updateScreen();

    // We don't need to return anything from this module because everything is encapsulated inside this screen controller.

}

ScreenController();