function Game() {
    const gameboard;
    
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
        if (!(0 <= r && r < rows) || !(0 <= c && c < columns)) return; // oob
        if (board[r][c].getValue() != 0) return; // occupied by player token
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

    const board = Gameboard();
    const players = [{name: playerOneName, token: 1}, {name: playerTwoName, token: 2}];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = (activePlayer === players[0]) ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const playRound = (r, c) => {
        board.placeToken(r, c, getActivePlayer().token);

        /*  This is where we would check for a winner and handle that logic,
        such as a win message. */

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