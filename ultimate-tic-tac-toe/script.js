document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const gameState = {
        currentPlayer: 'x', // 'x' for player, 'o' for computer
        activeBoardIndex: null, // null means any board is playable
        boards: Array(9).fill().map(() => Array(9).fill(null)), // 9 boards, each with 9 cells
        boardWinners: Array(9).fill(null), // Track which player won each board
        gameWinner: null, // Overall game winner
        gameOver: false
    };

    // DOM elements
    const statusMessage = document.getElementById('status-message');
    const restartButton = document.getElementById('restart-button');
    const cells = document.querySelectorAll('.cell');
    const bigBoards = document.querySelectorAll('.big-board');

    // Initialize the game
    initGame();

    // Event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    restartButton.addEventListener('click', restartGame);

    // Initialize the game
    function initGame() {
        updateBoardUI();
        updateStatusMessage();
    }

    // Handle cell click
    function handleCellClick(event) {
        if (gameState.gameOver || gameState.currentPlayer === 'o') return;

        const cell = event.target;
        const boardIndex = parseInt(cell.getAttribute('data-board'));
        const cellIndex = parseInt(cell.getAttribute('data-cell'));

        // Check if the move is valid
        if (!isValidMove(boardIndex, cellIndex)) return;

        // Make the player's move
        makeMove(boardIndex, cellIndex, gameState.currentPlayer);

        // Check for win on the small board
        checkSmallBoardWin(boardIndex);

        // Check for win on the big board (game win)
        checkGameWin();

        // Switch to computer's turn if game is not over
        if (!gameState.gameOver) {
            gameState.currentPlayer = 'o';
            updateStatusMessage();
            
            // Computer makes a move after a short delay
            setTimeout(computerMove, 700);
        }
    }

    // Check if a move is valid
    function isValidMove(boardIndex, cellIndex) {
        // If the cell is already filled
        if (gameState.boards[boardIndex][cellIndex] !== null) {
            return false;
        }

        // If a specific board is active and this is not that board
        if (gameState.activeBoardIndex !== null && boardIndex !== gameState.activeBoardIndex) {
            return false;
        }

        // If the board is already won
        if (gameState.boardWinners[boardIndex] !== null) {
            return false;
        }

        return true;
    }

    // Make a move
    function makeMove(boardIndex, cellIndex, player) {
        // Update game state
        gameState.boards[boardIndex][cellIndex] = player;

        // Update UI
        const cell = document.querySelector(`.cell[data-board="${boardIndex}"][data-cell="${cellIndex}"]`);
        cell.classList.add(player);
        cell.classList.add('disabled');

        // Set the next active board based on the cell played
        setNextActiveBoard(cellIndex);
    }

    // Set the next active board
    function setNextActiveBoard(cellIndex) {
        // If the corresponding board is already won or full, allow any board
        if (gameState.boardWinners[cellIndex] !== null || isBoardFull(cellIndex)) {
            gameState.activeBoardIndex = null;
        } else {
            gameState.activeBoardIndex = cellIndex;
        }

        updateBoardUI();
    }

    // Check if a small board is won
    function checkSmallBoardWin(boardIndex) {
        const board = gameState.boards[boardIndex];
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                // Mark this board as won by the current player
                gameState.boardWinners[boardIndex] = gameState.currentPlayer;
                
                // Update the UI to show the board as won
                const bigBoard = document.getElementById(`big-board-${boardIndex}`);
                bigBoard.classList.add(`won-${gameState.currentPlayer}`);
                
                return true;
            }
        }

        return false;
    }

    // Check if the game is won
    function checkGameWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (gameState.boardWinners[a] && 
                gameState.boardWinners[a] === gameState.boardWinners[b] && 
                gameState.boardWinners[a] === gameState.boardWinners[c]) {
                
                // Set the game winner
                gameState.gameWinner = gameState.boardWinners[a];
                gameState.gameOver = true;
                
                // Update status message
                updateStatusMessage();
                return true;
            }
        }

        // Check for a draw (all boards are either won or full)
        if (gameState.boardWinners.every((winner, index) => winner !== null || isBoardFull(index))) {
            gameState.gameOver = true;
            updateStatusMessage();
            return true;
        }

        return false;
    }

    // Computer move
    function computerMove() {
        if (gameState.gameOver) return;

        // Find all valid moves
        const validMoves = [];
        
        // If a specific board is active
        if (gameState.activeBoardIndex !== null) {
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                if (gameState.boards[gameState.activeBoardIndex][cellIndex] === null) {
                    validMoves.push({ boardIndex: gameState.activeBoardIndex, cellIndex });
                }
            }
        } 
        // If any board is playable
        else {
            for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
                // Skip boards that are already won
                if (gameState.boardWinners[boardIndex] !== null) continue;
                
                for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                    if (gameState.boards[boardIndex][cellIndex] === null) {
                        validMoves.push({ boardIndex, cellIndex });
                    }
                }
            }
        }

        // Make a strategic move if possible
        const strategicMove = findStrategicMove();
        
        if (strategicMove) {
            makeMove(strategicMove.boardIndex, strategicMove.cellIndex, 'o');
        } else if (validMoves.length > 0) {
            // Otherwise, make a random move
            const randomIndex = Math.floor(Math.random() * validMoves.length);
            const { boardIndex, cellIndex } = validMoves[randomIndex];
            makeMove(boardIndex, cellIndex, 'o');
        }

        // Check for win on the small board
        if (gameState.activeBoardIndex !== null) {
            checkSmallBoardWin(gameState.activeBoardIndex);
        } else if (strategicMove) {
            checkSmallBoardWin(strategicMove.boardIndex);
        }

        // Check for win on the big board (game win)
        checkGameWin();

        // Switch back to player's turn if game is not over
        if (!gameState.gameOver) {
            gameState.currentPlayer = 'x';
            updateStatusMessage();
        }
    }

    // Find a strategic move for the computer
    function findStrategicMove() {
        // First, try to win a board
        const winningMove = findWinningMove('o');
        if (winningMove) return winningMove;

        // Then, block the player from winning a board
        const blockingMove = findWinningMove('x');
        if (blockingMove) return blockingMove;

        // Otherwise, try to make a move that sends the player to a won or full board
        return findStrategicNextBoard();
    }

    // Find a move that would win a board
    function findWinningMove(player) {
        // Determine which boards we can play on
        const boardsToCheck = gameState.activeBoardIndex !== null 
            ? [gameState.activeBoardIndex] 
            : Array.from({ length: 9 }, (_, i) => i).filter(i => gameState.boardWinners[i] === null);

        for (const boardIndex of boardsToCheck) {
            const board = gameState.boards[boardIndex];
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
                [0, 4, 8], [2, 4, 6]             // Diagonals
            ];

            for (const pattern of winPatterns) {
                const [a, b, c] = pattern;
                // Check if we can win with this pattern
                if (board[a] === player && board[b] === player && board[c] === null) {
                    return { boardIndex, cellIndex: c };
                }
                if (board[a] === player && board[c] === player && board[b] === null) {
                    return { boardIndex, cellIndex: b };
                }
                if (board[b] === player && board[c] === player && board[a] === null) {
                    return { boardIndex, cellIndex: a };
                }
            }
        }

        return null;
    }

    // Find a strategic move that sends the player to a disadvantageous board
    function findStrategicNextBoard() {
        // Determine which boards we can play on
        const boardsToCheck = gameState.activeBoardIndex !== null 
            ? [gameState.activeBoardIndex] 
            : Array.from({ length: 9 }, (_, i) => i).filter(i => gameState.boardWinners[i] === null);

        for (const boardIndex of boardsToCheck) {
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                // If this cell is empty
                if (gameState.boards[boardIndex][cellIndex] === null) {
                    // Check if playing here would send the player to a won or full board
                    if (gameState.boardWinners[cellIndex] !== null || isBoardFull(cellIndex)) {
                        return { boardIndex, cellIndex };
                    }
                }
            }
        }

        return null;
    }

    // Check if a board is full
    function isBoardFull(boardIndex) {
        return gameState.boards[boardIndex].every(cell => cell !== null);
    }

    // Update the UI to show active boards
    function updateBoardUI() {
        // Remove active class from all boards
        bigBoards.forEach(board => {
            board.classList.remove('active');
        });

        // If a specific board is active, highlight it
        if (gameState.activeBoardIndex !== null) {
            const activeBoard = document.getElementById(`big-board-${gameState.activeBoardIndex}`);
            if (gameState.boardWinners[gameState.activeBoardIndex] === null) {
                activeBoard.classList.add('active');
            }
        } 
        // Otherwise, highlight all boards that aren't won
        else {
            bigBoards.forEach((board, index) => {
                if (gameState.boardWinners[index] === null) {
                    board.classList.add('active');
                }
            });
        }
    }

    // Update the status message
    function updateStatusMessage() {
        if (gameState.gameOver) {
            if (gameState.gameWinner) {
                statusMessage.textContent = gameState.gameWinner === 'x' 
                    ? 'You win! Congratulations!' 
                    : 'Computer wins! Better luck next time.';
            } else {
                statusMessage.textContent = "It's a draw!";
            }
        } else {
            if (gameState.currentPlayer === 'x') {
                if (gameState.activeBoardIndex !== null) {
                    statusMessage.textContent = `Your turn! Play in the highlighted board.`;
                } else {
                    statusMessage.textContent = `Your turn! You can play in any board.`;
                }
            } else {
                statusMessage.textContent = "Computer is thinking...";
            }
        }
    }

    // Restart the game
    function restartGame() {
        // Reset game state
        gameState.currentPlayer = 'x';
        gameState.activeBoardIndex = null;
        gameState.boards = Array(9).fill().map(() => Array(9).fill(null));
        gameState.boardWinners = Array(9).fill(null);
        gameState.gameWinner = null;
        gameState.gameOver = false;

        // Reset UI
        cells.forEach(cell => {
            cell.classList.remove('x', 'o', 'disabled');
        });

        bigBoards.forEach(board => {
            board.classList.remove('won-x', 'won-o');
        });

        // Update UI
        updateBoardUI();
        updateStatusMessage();
    }
});

// Made with Bob
