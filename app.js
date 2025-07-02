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

    // This method will be used to print our board to the console.
    // It is helpful to see what the board looks like after each turn as we play,
    // but we won't need it after we build our UI
    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()));
        console.log(boardWithCellValues);
    };

    // Here, we provide an interface for the rest of our
    // application to interact with the board
    return { getBoard, placeToken, printBoard };
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

function GameController(playerOneName = "Player One (X)", playerTwoName = "Player Two (O)") {

    const n = 3
    const board = Gameboard(n, n);
    const players = [{name: playerOneName, token: 1}, {name: playerTwoName, token: 2}];
    const oneVictory = new Array(n).fill(1);
    const twoVictory = new Array(n).fill(2);

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = (activePlayer === players[0]) ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const printFinalBoard = () => {
        board.printBoard();
    }

    // declare winner or draw in console. Return true if winner or draw, false ow
    const declareWinner = () => {
        let full = getTie();
        let winner = getWinner();
        
        if (winner !== null) { 
            console.log(`${winner.name} wins!.`);
            return true;
        } else if (full) {
            console.log("Tied game, as board is full.");
            return true;
        }
        return false;
    };

    // Returns name of winner or null if none
    const getWinner = () => {
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

        if (unoWin) { return players[0]; }
        if (dosWin) { return players[1]; }

        return null;
    };

    const getTie = () => {
        for (const row of board.getBoard()) {
            for (const cell of row) {
                if (cell.getValue() === 0) { return false; }
            }
        } 
        return true;
    }

    const playRound = (r, c) => {
        board.placeToken(r, c, getActivePlayer().token); // TODO fix skip your turn on selecting filled tile

        /*  This is where we would check for a winner and handle that logic,
        such as a win message. */
        if (declareWinner()) { 
            printFinalBoard();
            return; 
        }

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
        getActivePlayer
    };
}

const game = GameController();