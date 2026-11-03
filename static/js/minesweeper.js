const board = document.querySelector('.minesweeper-board');

const resetButton = document.querySelector('#reset-button');
const difficultySelect = document.querySelector('#difficulty');

if (!difficultySelect.value) {
    difficultySelect.value = 'easy';
}

const flagsLeftDisplay = document.querySelector('#flags-left');
const mineCountDisplay = document.querySelector('#mineCount');

const timeDisplay = document.querySelector('#time');
const scoreDisplay = document.querySelector('#score');

const gameStatus = document.querySelector('#game-status');
const scoreMessage = document.querySelector('#score-message');

const gameContainer = document.querySelector('#gameContainer');

const newGameUrl = board.dataset.newGameUrl;
const scoreUrl = board.dataset.scoreUrl;

const loggedIn =
    board.dataset.loggedIn === 'true';


let rows = Number(board.dataset.rows);
let cols = Number(board.dataset.cols);

let mineCount =
    Number(board.dataset.mineCount);

let initialTime =
    Number(board.dataset.time);


let cells =
    document.querySelectorAll('.cell');

let safeCellsLeft =
    rows * cols - mineCount;

let flagsPlaced = 0;

let firstClick = true;
let gameOver = false;

let isLoadingBoard = false;

let timer = null;
let currentTime = initialTime;


/* =========================================
   BOARD
   ========================================= */

function buildBoard(boardData) {

    rows = boardData.length;
    cols = boardData[0].length;

    board.innerHTML = '';

    updateBoardSize();

    board.style.setProperty(
        '--cols',
        cols
    );

    board.style.gridTemplateColumns =
        `repeat(${cols}, auto)`;


    boardData.forEach((row, rowIndex) => {

        row.forEach((value, colIndex) => {

            const cell =
                document.createElement('button');

            cell.type = 'button';

            cell.classList.add('cell');

            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            cell.dataset.value = value;

            board.appendChild(cell);
        });
    });


    cells =
        document.querySelectorAll('.cell');


    safeCellsLeft =
        rows * cols - mineCount;

    flagsPlaced = 0;

    firstClick = true;
    gameOver = false;

    flagsLeftDisplay.textContent =
        mineCount;

    mineCountDisplay.textContent =
        String(mineCount).padStart(3, '0');

    scoreDisplay.textContent = '0';

    scoreMessage.textContent = '';
    gameStatus.textContent = '';

    resetButton.textContent = '🙂';

    stopTimer();

    currentTime = initialTime;

    timeDisplay.textContent =
        formatCounter(currentTime);

    cellEventClick();
}


/* =========================================
BOARD SIZE
========================================= */
function updateBoardSize() {

    board.classList.remove(
        'easy-board',
        'medium-board',
        'hard-board'
    );

    board.classList.add(
        `${difficultySelect.value}-board`
    );
}


/* =========================================
   CELL EVENTS
   ========================================= */

function cellEventClick() {

    cells.forEach((cell) => {

        cell.addEventListener(
            'click',
            () => handleCellClick(cell)
        );


        cell.addEventListener(
            'contextmenu',
            (event) => {

                event.preventDefault();

                handleFlag(cell);
            }
        );


        cell.addEventListener(
            'mousedown',
            () => {

                if (!gameOver) {
                    resetButton.textContent = '😮';
                }
            }
        );


        cell.addEventListener(
            'mouseup',
            () => {

                if (!gameOver) {
                    resetButton.textContent = '🙂';
                }
            }
        );
    });
}


/* =========================================
   CELL CLICK
   ========================================= */

async function handleCellClick(cell) {

    if (
        gameOver ||
        isLoadingBoard ||
        cell.classList.contains('revealed') ||
        cell.classList.contains('flagged')
    ) {
        return;
    }


    const row =
        Number(cell.dataset.row);

    const col =
        Number(cell.dataset.col);


    if (firstClick) {

        isLoadingBoard = true;


        const boardCreated =
            await createSafeBoard(
                row,
                col
            );


        isLoadingBoard = false;


        if (!boardCreated) {
            return;
        }


        firstClick = false;

        startTimer();


        const newCell =
            getCell(
                row,
                col
            );


        revealCell(newCell);

        checkWin();

        return;
    }


    revealCell(cell);

    checkWin();
}

/* =========================================
   SAFE FIRST CLICK
   ========================================= */

async function createSafeBoard(row, col) {

    try {

        const url =
            `${newGameUrl}` +
            `?difficulty=${difficultySelect.value}` +
            `&safe_first_click_row=${row}` +
            `&safe_first_click_col=${col}`;


        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                'Could not create board.'
            );
        }


        const data =
            await response.json();


        if (data.mine_count !== undefined) {
            mineCount =
                Number(data.mine_count);
        }


        if (data.time !== undefined) {
            initialTime =
                Number(data.time);

            currentTime =
                initialTime;
        }


        const boardData =
            data.board || data;


        rows = boardData.length;
        cols = boardData[0].length;


        board.innerHTML = '';

        updateBoardSize();

        board.style.gridTemplateColumns =
            `repeat(${cols}, auto)`;


        boardData.forEach(
            (boardRow, rowIndex) => {

                boardRow.forEach(
                    (value, colIndex) => {

                        const newCell =
                            document.createElement(
                                'button'
                            );

                        newCell.type = 'button';

                        newCell.classList.add(
                            'cell'
                        );

                        newCell.dataset.row =
                            rowIndex;

                        newCell.dataset.col =
                            colIndex;

                        newCell.dataset.value =
                            value;

                        board.appendChild(
                            newCell
                        );
                    }
                );
            }
        );


        cells =
            document.querySelectorAll(
                '.cell'
            );


        safeCellsLeft =
            rows * cols - mineCount;

        flagsPlaced = 0;


        flagsLeftDisplay.textContent =
            mineCount;

        mineCountDisplay.textContent =
            String(mineCount)
                .padStart(3, '0');


        cellEventClick();

        return true;

    } catch (error) {

        console.error(
            'Board error:',
            error
        );

        gameStatus.textContent =
            'Unable to start the game.';
        return false;
    }
}


/* =========================================
   REVEAL CELL
   ========================================= */

function revealCell(cell) {

    if (
        !cell ||
        gameOver ||
        cell.classList.contains('revealed') ||
        cell.classList.contains('flagged')
    ) {
        return;
    }


    const value =
        Number(cell.dataset.value);


    cell.classList.add('revealed');


    if (value === -1) {

        handleLoss(cell);

        return;
    }


    safeCellsLeft--;


    if (value > 0) {

        cell.textContent = value;

        cell.classList.add(
            `n-${value}`
        );

        return;
    }


    revealNeighbors(cell);
}


/* =========================================
   REVEAL EMPTY NEIGHBORS
   ========================================= */

function revealNeighbors(cell) {

    const row =
        Number(cell.dataset.row);

    const col =
        Number(cell.dataset.col);


    for (
        let rowOffset = -1;
        rowOffset <= 1;
        rowOffset++
    ) {

        for (
            let colOffset = -1;
            colOffset <= 1;
            colOffset++
        ) {

            if (
                rowOffset === 0 &&
                colOffset === 0
            ) {
                continue;
            }


            const nextRow =
                row + rowOffset;

            const nextCol =
                col + colOffset;


            if (
                nextRow < 0 ||
                nextRow >= rows ||
                nextCol < 0 ||
                nextCol >= cols
            ) {
                continue;
            }


            const neighbor =
                getCell(
                    nextRow,
                    nextCol
                );


            if (
                neighbor &&
                !neighbor.classList.contains(
                    'revealed'
                ) &&
                !neighbor.classList.contains(
                    'flagged'
                )
            ) {

                revealCell(neighbor);
            }
        }
    }
}


/* =========================================
   FLAGS
   ========================================= */

function handleFlag(cell) {

    if (
        gameOver ||
        firstClick ||
        isLoadingBoard ||
        cell.classList.contains('revealed')
    ) {
        return;
    }


    if (
        cell.classList.contains('flagged')
    ) {

        cell.classList.remove(
            'flagged'
        );

        cell.innerHTML = '';

        flagsPlaced--;

    } else {

        if (flagsPlaced >= mineCount) {
            return;
        }

        cell.classList.add(
            'flagged'
        );

        cell.innerHTML =
            '<i class="fa-solid fa-flag"></i>';

        flagsPlaced++;
    }


    const flagsLeft =
        mineCount - flagsPlaced;


    flagsLeftDisplay.textContent =
        flagsLeft;

    mineCountDisplay.textContent =
        String(flagsLeft)
            .padStart(3, '0');
}


/* =========================================
   LOSS
   ========================================= */

function handleLoss(hitCell) {

    if (gameOver) return;

    gameOver = true;

    stopTimer();


    resetButton.textContent = '😵';

    gameStatus.textContent =
        'Game Over!';


    hitCell.classList.add(
        'exploded'
    );

    hitCell.innerHTML =
        '<i class="fa-solid fa-bomb"></i>';


    playBoomSound();


    gameContainer.classList.remove(
        'shake-screen'
    );

    void gameContainer.offsetWidth;

    gameContainer.classList.add(
        'shake-screen'
    );


    createCellExplosion(
        hitCell
    );


    revealAllMines();
}


/* =========================================
   EXPLOSION POSITION
   ========================================= */

function createCellExplosion(cell) {

    const canvas =
        document.querySelector(
            '#particleCanvas'
        );


    if (!canvas) return;


    const cellRect =
        cell.getBoundingClientRect();

    const canvasRect =
        canvas.getBoundingClientRect();


    const x =
        cellRect.left -
        canvasRect.left +
        cellRect.width / 2;


    const y =
        cellRect.top -
        canvasRect.top +
        cellRect.height / 2;


    createExplosion(x, y);
}


/* =========================================
   SHOW ALL MINES
   ========================================= */

function revealAllMines() {

    cells.forEach((cell) => {

        const value =
            Number(cell.dataset.value);


        if (value === -1) {

            cell.classList.add(
                'revealed'
            );

            if (
                !cell.classList.contains(
                    'exploded'
                )
            ) {

                cell.innerHTML =
                    '<i class="fa-solid fa-bomb"></i>';
            }
        }
    });
}


/* =========================================
   WIN
   ========================================= */

function checkWin() {

    if (
        !gameOver &&
        safeCellsLeft === 0
    ) {

        handleWin();
    }
}


async function handleWin() {

    if (gameOver) return;

    gameOver = true;

    stopTimer();


    resetButton.textContent = '😎';

    mineCountDisplay.textContent =
        '000';

    flagsLeftDisplay.textContent =
        '0';


    const score =
        calculateScore();


    scoreDisplay.textContent =
        score;


    gameStatus.textContent =
        'You win! 🎉';


    await saveScore(score);
}


/* =========================================
   SCORE
   ========================================= */

function calculateScore() {

    let multiplier = 1;


    if (
        difficultySelect.value ===
        'medium'
    ) {
        multiplier = 2;
    }


    if (
        difficultySelect.value ===
        'hard'
    ) {
        multiplier = 3;
    }


    return Math.max(
        0,
        currentTime * multiplier
    );
}


async function saveScore(score) {

    if (!loggedIn) {

        scoreMessage.textContent =
            'Log in to save your score.';

        return;
    }


    try {

        const response =
            await fetch(
                scoreUrl,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify({
                            difficulty:
                                difficultySelect.value,

                            score:
                                score
                        })
                }
            );


        const data =
            await response.json();


        if (response.ok) {

            scoreMessage.textContent =
                'Score saved!';

        } else {

            scoreMessage.textContent =
                data.error ||
                'Unable to save score.';
        }

    } catch (error) {

        console.error(
            'Score error:',
            error
        );

        scoreMessage.textContent =
            'Unable to save score.';
    }
}


/* =========================================
   TIMER
   ========================================= */

function startTimer() {

    stopTimer();


    timer = setInterval(() => {

        if (
            gameOver ||
            firstClick
        ) {
            return;
        }


        currentTime--;


        if (currentTime <= 0) {

            currentTime = 0;

            timeDisplay.textContent =
                '000';

            handleTimeOut();

            return;
        }


        timeDisplay.textContent =
            formatCounter(
                currentTime
            );

    }, 1000);
}


function stopTimer() {

    if (timer) {

        clearInterval(timer);

        timer = null;
    }
}


function handleTimeOut() {

    if (gameOver) return;

    gameOver = true;

    stopTimer();

    resetButton.textContent = '😵';

    gameStatus.textContent =
        'Time is up!';

    revealAllMines();
}


function formatCounter(value) {

    return String(
        Math.max(0, value)
    ).padStart(3, '0');
}


/* =========================================
   NEW GAME
   ========================================= */

async function newGame() {

    try {

        stopTimer();


        const url =
            `${newGameUrl}` +
            `?difficulty=${difficultySelect.value}`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                'Could not create game.'
            );
        }


        const data =
            await response.json();


        if (data.mine_count !== undefined) {

            mineCount =
                Number(data.mine_count);
        }


        if (data.time !== undefined) {

            initialTime =
                Number(data.time);
        }


        const boardData =
            data.board || data;


        buildBoard(boardData);

    } catch (error) {

        console.error(
            'New game error:',
            error
        );

        gameStatus.textContent =
            'Unable to create a new game.';
    }
}


/* =========================================
   HELPERS
   ========================================= */

function getCell(row, col) {

    return board.querySelector(
        `.cell[data-row="${row}"][data-col="${col}"]`
    );
}


/* =========================================
   CONTROLS
   ========================================= */

resetButton.addEventListener(
    'click',
    newGame
);


const difficultyButtons =
    document.querySelectorAll('.difficulty-btn');


difficultyButtons.forEach((button) => {

    button.addEventListener('click', () => {

        const selectedDifficulty =
            button.dataset.difficulty;


        difficultySelect.value =
            selectedDifficulty;


        difficultyButtons.forEach((btn) => {
            btn.classList.remove('active');
        });


        button.classList.add('active');


        newGame();
    });
});


/* =========================================
   INITIAL SETUP
   ========================================= */

board.style.gridTemplateColumns =
    `repeat(${cols}, auto)`;


mineCountDisplay.textContent =
    String(mineCount)
        .padStart(3, '0');


flagsLeftDisplay.textContent =
    mineCount;


timeDisplay.textContent =
    formatCounter(initialTime);


scoreDisplay.textContent = '0';


updateBoardSize();

cellEventClick();