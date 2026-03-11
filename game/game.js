class NumberSumGame {
    constructor() {
        this.gridSize = 8; // Changed to 8x8 grid
        this.grid = [];
        this.targetSum = 0;
        this.selectedPositions = new Set(); // Stores "row,col" strings of currently selected cells
        this.clearedCells = new Set();    // Stores "row,col" strings of cells part of a successful sum
        this.score = 0;
        this.highestScore = this.loadHighestScore(); // Load highest score from local storage
        this.hintsRemaining = 3;
        this.difficulty = 'easy'; // Default difficulty

        // DOM elements
        this.gridElement = document.getElementById('grid-container');
        this.targetSumElement = document.getElementById('target-sum');
        this.scoreElement = document.getElementById('score');
        this.highestScoreElement = document.getElementById('highest-score'); // New element for highest score
        this.feedbackElement = document.getElementById('feedback-message');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.difficultySelector = document.getElementById('difficulty-selector');
        this.autoSuccessElement = document.getElementById('auto-success');
        this.timerElement = document.getElementById('timer');
        this.gameOverElement = document.getElementById('game-over');
        this.currentSumElement = document.getElementById('current-sum'); // New element for current sum
        this.restartGameBtn = document.getElementById('restart-game-btn'); // Get the restart button

        // Sound elements
        this.selectSound = document.getElementById('select-sound');
        this.successSound = document.getElementById('success-sound');
        this.completeSound = document.getElementById('complete-sound');

        this.currentHints = []; // Stores DOM elements of hinted cells
        this.validSolutions = []; // Stores potential solutions for the current target sum
        this.gameTimer = 600; // 10 minutes in seconds
        this.gameStartTime = null;
        this.gameActive = true;
        this.timerInterval = null;
        this.totalCells = this.gridSize * this.gridSize;
        this.lastTargetSum = 0; // To aid progressive difficulty
        this.progressiveMultiplier = 1.0; // To increase difficulty over time

        // Initialize game
        this.init();
    }

    init() {
        // Event Listeners
        this.newGameBtn.addEventListener('click', () => this.generateNewGame());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.difficultySelector.addEventListener('click', (event) => this.handleDifficultyChange(event));
        this.restartGameBtn.addEventListener('click', () => this.generateNewGame()); // Add listener for the restart button
        
        // Grid interaction setup
        this.setupGridEvents();
        
        // Generate initial game state
        this.generateNewGame();
        this.updateHighestScoreDisplay(); // Display highest score on load
    }

    setupGridEvents() {
        this.gridElement.addEventListener('click', (event) => {
            if (!this.gameActive) return; // Prevent interaction if game is over

            const cell = event.target.closest('.grid-cell');
            if (cell) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                const posKey = `${row},${col}`;
                const cellPos = { row, col };

                // Do not allow selection of already cleared cells
                if (this.clearedCells.has(posKey)) {
                    this.showFeedback('This cell has already been cleared!', 'error');
                    return;
                }

                if (this.selectedPositions.has(posKey)) {
                    // Deselect
                    this.selectedPositions.delete(posKey);
                    this.updateSelectionDisplay();
                    this.updateCurrentSumDisplay(); // Update current sum
                } else {
                    // Select, only if adjacent to an existing selection OR if it's the first cell
                    // and it's not a cleared cell
                    if (this.selectedPositions.size === 0 || this.isAdjacent(cellPos)) {
                        this.selectedPositions.add(posKey);
                        this.updateSelectionDisplay();
                        this.updateCurrentSumDisplay(); // Update current sum
                        this.checkSum(); // Check sum after selection
                    } else {
                        this.showFeedback('You can only select cells adjacent to your current selection!', 'error');
                    }
                }
            }
        });
    }

    playSound(soundElement, volume = 0.3) {
        if (soundElement) {
            soundElement.volume = volume;
            soundElement.currentTime = 0;
            soundElement.play().catch(e => {
                // Silently handle audio play failures, e.g., user hasn't interacted yet
            });
        }
    }

    startGameTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.gameStartTime = Date.now();
        this.gameActive = true;
        
        this.timerInterval = setInterval(() => {
            if (!this.gameActive) {
                clearInterval(this.timerInterval); // Ensure timer stops if game becomes inactive
                return;
            }
            
            this.gameTimer--;
            this.updateTimerDisplay();
            
            if (this.gameTimer <= 0) {
                this.endGame('Time Up!', false);
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.gameTimer / 60);
        const seconds = this.gameTimer % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        this.timerElement.textContent = timeStr;
        
        // Add visual warnings
        this.timerElement.classList.remove('warning', 'critical');
        if (this.gameTimer <= 60) {
            this.timerElement.classList.add('critical');
        } else if (this.gameTimer <= 120) {
            this.timerElement.classList.add('warning');
        }
    }

    checkGameComplete() {
        // Game is complete when all grid cells have been successfully cleared
        return this.clearedCells.size === this.totalCells;
    }

    endGame(title, isWin) {
        this.gameActive = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Calculate final stats
        const timeBonus = isWin && this.gameTimer > 0 ? this.gameTimer * 10 : 0;
        const finalScore = this.score + timeBonus;
        
        // Update highest score if current score is higher
        if (finalScore > this.highestScore) {
            this.highestScore = finalScore;
            this.saveHighestScore(this.highestScore);
            this.updateHighestScoreDisplay();
        }

        const totalTimeElapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const totalMinutes = Math.floor(totalTimeElapsed / 60);
        const totalSeconds = totalTimeElapsed % 60;
        
        // Update game over screen
        document.getElementById('game-over-title').textContent = title;
        document.getElementById('final-score').textContent = finalScore; // Display total score including bonus
        document.getElementById('base-score').textContent = this.score; // Display base score
        document.getElementById('time-bonus').textContent = timeBonus;
        document.getElementById('total-time').textContent = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
        
        // Play completion sound
        this.playSound(this.completeSound, 0.5);
        
        // Show game over screen
        this.gameOverElement.classList.add('show');
    }

    generateGrid() {
        this.grid = [];
        for (let r = 0; r < this.gridSize; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.gridSize; c++) {
                // Numbers from -9 to 9, excluding 0
                let randomNumber = Math.floor(Math.random() * 18) - 9; // Range -9 to 8
                if (randomNumber >= 0) randomNumber++; // Adjust to skip 0, so it's -9 to -1 and 1 to 9
                this.grid[r][c] = randomNumber;
            }
        }
    }

    renderGrid() {
        this.gridElement.innerHTML = '';
        this.gridElement.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`; // Ensure grid size adapts
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.textContent = this.grid[r][c];
                this.gridElement.appendChild(cell);
            }
        }
        this.updateSelectionDisplay(); // Render initial state (cleared cells, etc.)
    }

    clearSelection() {
        this.selectedPositions.clear();
        this.updateSelectionDisplay();
        this.hideFeedback();
        this.clearHints();
        this.updateCurrentSumDisplay(); // Clear current sum display
    }

    isAdjacent(cellPos) {
        // Check if `cellPos` is adjacent to *any* currently selected cell.
        // This allows for "path" selection rather than strict block/rectangle.
        for (const posKey of this.selectedPositions) {
            const [row, col] = posKey.split(',').map(Number);
            const rowDiff = Math.abs(cellPos.row - row);
            const colDiff = Math.abs(cellPos.col - col);
            
            // Adjacent if difference is 1 in exactly one direction
            if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
                return true;
            }
        }
        return false;
    }

    calculateCurrentSum() {
        let sum = 0;
        for (const posKey of this.selectedPositions) {
            const [row, col] = posKey.split(',').map(Number);
            sum += this.grid[row][col];
        }
        return sum;
    }

    updateCurrentSumDisplay() {
        if (this.selectedPositions.size === 0) {
            this.currentSumElement.textContent = '0';
        } else {
            this.currentSumElement.textContent = this.calculateCurrentSum();
        }
    }

    checkSum() {
        if (this.selectedPositions.size === 0) {
            this.hideFeedback();
            return;
        }

        const currentSum = this.calculateCurrentSum();

        if (currentSum === this.targetSum) {
            this.handleAutoSuccess();
        } else if (currentSum > this.targetSum) {
            this.showFeedback(`Sum is too high (${currentSum})! Deselect cells to reduce.`, 'error');
        } else {
            this.showFeedback(`Current sum: ${currentSum}. Keep selecting to reach ${this.targetSum}!`, 'success');
        }
    }

    showCurrentSumFeedback() {
        if (this.selectedPositions.size === 0) {
            this.hideFeedback();
            return;
        }
        const currentSum = this.calculateCurrentSum();
        this.showFeedback(`Current sum: ${currentSum}. Target: ${this.targetSum}.`, 'success');
    }

    calculatePoints() {
        let points = this.selectedPositions.size * 10;
        switch (this.difficulty) {
            case 'easy':
                points += 10;
                break;
            case 'medium':
                points += 20;
                break;
            case 'hard':
                points += 30;
                break;
        }
        return points;
    }

    updateSelectionDisplay() {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            const posKey = `${cell.dataset.row},${cell.dataset.col}`;
            cell.classList.remove('selected', 'cleared', 'hint', 'negative-number'); // Clear hint too
            
            // Add class for negative numbers for styling
            const cellValue = parseInt(cell.textContent);
            if (cellValue < 0) {
                cell.classList.add('negative-number');
            }

            if (this.clearedCells.has(posKey)) {
                cell.classList.add('cleared');
                // Already cleared cells should not be able to be selected, visually indicate
                cell.style.pointerEvents = 'none'; // Disable click for cleared cells
                cell.textContent = '✓'; // Change to checkmark for cleared cells
            } else {
                cell.style.pointerEvents = 'auto'; // Re-enable for non-cleared cells
                // Restore original number if it was cleared
                cell.textContent = this.grid[parseInt(cell.dataset.row)][parseInt(cell.dataset.col)]; 
                if (this.selectedPositions.has(posKey)) {
                    cell.classList.add('selected');
                }
            }
        });
        
        // Play selection sound only if a cell was actually selected or deselected
        // This is a simple heuristic; more complex logic would track actual changes
        if (this.selectedPositions.size > 0 || this.lastSelectedSize > 0) {
            this.playSound(this.selectSound, 0.2); 
        }
        this.lastSelectedSize = this.selectedPositions.size;
    }

    showFeedback(message, type) {
        this.feedbackElement.textContent = message;
        this.feedbackElement.classList.remove('error', 'success');
        this.feedbackElement.classList.add(type, 'show');
        
        // Hints are cleared on any action that provides feedback
        this.clearHints();
    }

    hideFeedback() {
        this.feedbackElement.classList.remove('show');
        this.feedbackElement.textContent = '';
    }

    handleAutoSuccess() {
        if (!this.gameActive) return;
        
        const points = this.calculatePoints();
        const hintPenalty = (3 - this.hintsRemaining) * 10;
        const finalPoints = Math.max(points - hintPenalty, 0); // Ensure points don't go negative
        this.score += finalPoints;
        this.scoreElement.textContent = this.score;
        
        // Play success sound
        this.playSound(this.successSound, 0.4);
        
        // Mark selected cells as cleared
        for (const posKey of this.selectedPositions) {
            this.clearedCells.add(posKey);
        }
        
        // Show auto-success message
        let message = `Perfect! +${finalPoints} points!`;
        if (hintPenalty > 0) {
            message += ` (-${hintPenalty} for hints)`;
        }
        
        this.autoSuccessElement.textContent = message;
        this.autoSuccessElement.classList.add('show');
        
        this.clearSelection(); // Clear current selection
        this.updateSelectionDisplay(); // Update visual to show cleared cells

        // Check if game is complete before generating new target
        if (this.checkGameComplete()) {
            this.endGame('Congratulations!', true);
            return;
        }
        
        // Generate new target after a short delay
        setTimeout(() => {
            this.autoSuccessElement.classList.remove('show');
            this.generateNewTarget();
        }, 1500);
    }

    generateNewTarget() {
        if (!this.gameActive) return;
        
        this.generateTargetSum(); // Generate new target sum
        this.targetSumElement.textContent = this.targetSum;
        this.updateCurrentSumDisplay(); // Update current sum display
        
        // Reset hints for new target
        this.hintsRemaining = 3;
        this.updateHintButton();
        this.hintBtn.classList.remove('disabled');
        this.hintBtn.disabled = false;
        
        // Increase progressive multiplier for next targets
        this.progressiveMultiplier += 0.05; // Slightly increase multiplier
        
        this.showFeedback(`New target: ${this.targetSum}. Find a new region!`, 'success');
    }

    generateTargetSum() {
        const solutions = [];
        
        // Find all possible rectangular regions using ONLY un-cleared cells
        for (let r1 = 0; r1 < this.gridSize; r1++) {
            for (let c1 = 0; c1 < this.gridSize; c1++) {
                for (let r2 = r1; r2 < this.gridSize; r2++) {
                    for (let c2 = c1; c2 < this.gridSize; c2++) {
                        let sum = 0;
                        let validRegion = true;
                        let cellCount = 0; // Track number of cells in the region
                        
                        // Check if all cells in this region are un-cleared
                        for (let r = r1; r <= r2; r++) {
                            for (let c = c1; c <= c2; c++) {
                                const posKey = `${r},${c}`;
                                if (this.clearedCells.has(posKey)) {
                                    validRegion = false;
                                    break;
                                }
                                sum += this.grid[r][c];
                                cellCount++;
                            }
                            if (!validRegion) break;
                        }
                        
                        // Solutions must have at least 2 cells to be a "sum" (single cell sums are too easy for most targets)
                        if (validRegion && cellCount >= 2) { 
                            solutions.push({
                                sum: sum,
                                area: cellCount, // Using cellCount as area
                                coords: { r1, c1, r2, c2 }
                            });
                        }
                    }
                }
            }
        }

        if (solutions.length === 0) {
            // If no valid solutions (e.g., all cells are cleared or no valid regions remain)
            this.endGame('No More Targets!', true); 
            return;
        }

        let filteredSolutions = solutions;
        
        // Apply progressive difficulty: try to find slightly larger sums or areas
        const minArea = Math.max(2, Math.floor(2 * this.progressiveMultiplier)); // Start from 2-cell regions, but grow
        const maxArea = Math.floor(this.gridSize * this.gridSize * 0.75); // Cap max area
        
        const areaFiltered = filteredSolutions.filter(s => s.area >= minArea && s.area <= maxArea);
        if (areaFiltered.length > 0) {
            filteredSolutions = areaFiltered;
        }

        // Further filter by difficulty level for target *selection*
        switch (this.difficulty) {
            case 'easy':
                // Prefer smaller regions (2-6 cells)
                const easyFiltered = filteredSolutions.filter(s => s.area >= 2 && s.area <= 6);
                filteredSolutions = easyFiltered.length > 0 ? easyFiltered : filteredSolutions;
                break;
            case 'medium':
                // Prefer medium regions (4-15 cells)
                const mediumFiltered = filteredSolutions.filter(s => s.area >= 4 && s.area <= 15);
                filteredSolutions = mediumFiltered.length > 0 ? mediumFiltered : filteredSolutions;
                break;
            case 'hard':
                // Prefer larger regions (8+ cells)
                const hardFiltered = filteredSolutions.filter(s => s.area >= 8);
                filteredSolutions = hardFiltered.length > 0 ? hardFiltered : filteredSolutions;
                break;
        }

        // If filtering leaves no solutions, fall back to all original solutions
        if (filteredSolutions.length === 0) {
             filteredSolutions = solutions;
        }
        
        // Pick a random valid solution from the filtered set
        const randomSolution = filteredSolutions[Math.floor(Math.random() * filteredSolutions.length)];
        this.lastTargetSum = this.targetSum; // Store current target for progressive difficulty
        this.targetSum = randomSolution.sum;
        
        // Store all valid solutions for this specific target sum (from original `solutions` list) for hints
        this.validSolutions = solutions.filter(s => s.sum === this.targetSum);
    }

    showHint() {
        if (!this.gameActive || this.hintsRemaining <= 0) {
            this.showFeedback('No hints left!', 'error');
            return;
        }

        this.hintsRemaining--;
        this.updateHintButton();
        this.clearHints(); // Clear previous hints first

        const potentialSolutions = this.validSolutions.filter(s => {
            // A solution is valid if none of its cells are already cleared OR currently selected by the player
            for (let r = s.coords.r1; r <= s.coords.r2; r++) {
                for (let c = s.coords.c1; c <= s.coords.c2; c++) {
                    const posKey = `${r},${c}`;
                    if (this.clearedCells.has(posKey) || this.selectedPositions.has(posKey)) {
                        return false;
                    }
                }
            }
            return true;
        });

        if (potentialSolutions.length > 0) {
            // Pick a random hint solution
            const hintSolution = potentialSolutions[Math.floor(Math.random() * potentialSolutions.length)];
            
            // Highlight the cells for the hint
            for (let r = hintSolution.coords.r1; r <= hintSolution.coords.r2; r++) {
                for (let c = hintSolution.coords.c1; c <= hintSolution.coords.c2; c++) {
                    const index = r * this.gridSize + c;
                    const cell = this.gridElement.children[index];
                    cell.classList.add('hint');
                    this.currentHints.push(cell); // Store for clearing
                }
            }
            this.showFeedback('Hint provided! Find the highlighted region.', 'success');
        } else {
            this.showFeedback('No valid hint could be generated for the current grid state. Try a new game or continue!', 'error');
        }

        if (this.hintsRemaining === 0) {
            this.hintBtn.classList.add('disabled');
            this.hintBtn.disabled = true;
        }
    }

    clearHints() {
        this.currentHints.forEach(cell => {
            cell.classList.remove('hint');
        });
        this.currentHints = [];
    }

    updateHintButton() {
        this.hintBtn.textContent = `Get Hint (${this.hintsRemaining})`;
        if (this.hintsRemaining <= 0) {
            this.hintBtn.classList.add('disabled');
            this.hintBtn.disabled = true;
        } else {
            this.hintBtn.classList.remove('disabled');
            this.hintBtn.disabled = false;
        }
    }

    handleDifficultyChange(event) {
        const btn = event.target.closest('.difficulty-btn');
        if (btn && !btn.classList.contains('active')) { // Only act if it's a different difficulty
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.difficulty = btn.dataset.difficulty;
            this.generateNewGame(); // Start new game with new difficulty
        }
    }

    loadHighestScore() {
        const storedScore = localStorage.getItem('numberSumHighestScore');
        return storedScore ? parseInt(storedScore) : 0;
    }

    saveHighestScore(score) {
        localStorage.setItem('numberSumHighestScore', score.toString());
    }

    updateHighestScoreDisplay() {
        this.highestScoreElement.textContent = this.highestScore;
    }

    generateNewGame() {
        // Reset all game state
        this.clearSelection();
        this.clearedCells.clear(); // Crucial: clear all previously cleared cells
        this.generateGrid();
        this.lastTargetSum = 0; // Reset for a new game
        this.progressiveMultiplier = 1.0; // Reset for a new game
        this.generateTargetSum(); // Generate first target for the new grid
        this.renderGrid(); // Render with updated grid and clearedCells
        this.targetSumElement.textContent = this.targetSum;
        this.feedbackElement.classList.remove('show');
        this.autoSuccessElement.classList.remove('show');
        this.updateCurrentSumDisplay(); // Reset current sum display

        // Reset game timer and state
        this.gameTimer = 600; // Reset to 10 minutes
        this.gameActive = true;
        this.score = 0;
        this.scoreElement.textContent = '0';
        
        // Hide game over screen
        this.gameOverElement.classList.remove('show');
        
        // Reset hints for new game
        this.hintsRemaining = 3;
        this.updateHintButton();
        
        // Restart timer
        this.startGameTimer();
        this.updateTimerDisplay(); // Initial display update
        this.updateHighestScoreDisplay(); // Ensure highest score is visible
    }
}

// Ensure the game starts only after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new NumberSumGame();
});