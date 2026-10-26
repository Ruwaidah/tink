const board = document.querySelector('.minesweeper-board');
let cells = document.querySelectorAll('.cell');

let rows = Number(board.dataset.rows);
let cols = Number(board.dataset.cols);
const newGameUrl = board.dataset.newGameUrl;

const flagLeft = document.querySelector('#flags-left');
const gameStatus = document.querySelector('#game-status');
const resetButton = document.querySelector('#reset-button');
const timeDisplay = document.querySelector('#time');
const difficultySelect = document.querySelector('#difficulty');
const scoreDisplay = document.querySelector("#score")
let initialTime = Number(timeDisplay.dataset.time);

const scoreUrl = board.dataset.scoreUrl;
const loggedIn = board.dataset.loggedIn === 'true';


let gameOver = false;
let firstClick = true;

let safeCellsLeft = rows * cols - Number(flagLeft.textContent);

async function revealCell(cell) {
    if (timer === null) {
        startTimer();
    }
    if (gameOver) {
        return;
    }

    if (cell.classList.contains('revealed')) {
        return;
    }

    if (cell.classList.contains('flagged')) {
        return;
    }

    if (firstClick && Number(cell.dataset.value) === -1) {
        const response = await fetch(
            `${newGameUrl}` +
            `?difficulty=${difficultySelect.value}` +
            `&safe_first_click_row=${cell.dataset.row}` +
            `&safe_first_click_col=${cell.dataset.col}`,
            {
                method: 'GET'
            }
        );

        const data = await response.json();

        cells.forEach(cell => {
            const row = Number(cell.dataset.row);
            const col = Number(cell.dataset.col);

            cell.dataset.value =
                data.board[row][col];
        });
    }

    firstClick = false;

    const value = Number(cell.dataset.value);
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    cell.classList.add('revealed');

    if (value === -1) {
        cell.textContent = '💣';
        cell.classList.add('mine-hit');
        revealAllMines();
        gameOver = true;
        gameStatus.textContent = 'Game Over';
        return;
    }
    safeCellsLeft--;

    if (value > 0) {
        cell.textContent = value;
        if (safeCellsLeft === 0) {
            handleWin();
        }
        return;
    }

    revealNeighbors(row, col);

    if (safeCellsLeft === 0) {
        handleWin();
    }
}

function revealNeighbors(row, col) {
    for (let r = Math.max(0, row - 1); r < Math.min(rows, row + 2); r++) {
        for (let c = Math.max(0, col - 1); c < Math.min(cols, col + 2); c++) {
            const neighborCell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            if (neighborCell && !neighborCell.classList.contains('revealed')) {
                if (neighborCell.dataset.value !== '-1') {
                    revealCell(neighborCell);
                }
            }
        }
    }
}

function revealAllMines() {
    cells.forEach(cell => {
        const value = Number(cell.dataset.value);
        if (value === -1) {
            cell.classList.add('revealed');
            cell.textContent = '💣';
        }
    });
}

function cellEventClick() {
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            revealCell(cell)
        })

        cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            if (gameOver) {
                return;
            }

            if (cell.classList.contains('revealed')) {
                return;
            }

            if (Number(flagLeft.textContent) <= 0 && !cell.classList.contains('flagged')) {
                return;
            }
            cell.classList.toggle('flagged');

            if (cell.classList.contains('flagged')) {
                cell.textContent = '🚩';
                flagLeft.textContent = Number(flagLeft.textContent) - 1;
            } else {
                cell.textContent = '';
                flagLeft.textContent = Number(flagLeft.textContent) + 1;
            }

        });
    })
}

cellEventClick()

resetButton.addEventListener('click', async () => {
    const selectedDifficulty = difficultySelect.value;
    const response = await fetch(`${newGameUrl}?difficulty=${selectedDifficulty}`, {
        method: 'GET'
    });

    const data = await response.json();

    cells.forEach(cell => {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);

        cell.dataset.value = data.board[row][col];
        cell.classList.remove('revealed', 'flagged', 'mine-hit');
        cell.textContent = '';
    });

    firstClick = true;
    flagLeft.textContent = Number(data.mine_count);
    safeCellsLeft = data.rows * data.cols - data.mine_count;

    gameOver = false;

    timeDisplay.textContent = initialTime;
    gameStatus.textContent = 'Game in progress';

    if (timer === null) {
        startTimer();
    }
});

let timer = null;

function startTimer() {
    timer = setInterval(() => {
        if (!gameOver && !firstClick) {
            timeDisplay.textContent =
                Number(timeDisplay.textContent) - 1;

            if (Number(timeDisplay.textContent) <= 0) {
                clearInterval(timer);
                timer = null;
                gameOver = true;
                gameStatus.textContent = "Time's up! Game Over";
            }
        }
    }, 1000);
}


difficultySelect.addEventListener('change', async () => {
    const selectedDifficulty = difficultySelect.value;

    const response = await fetch(
        `${newGameUrl}?difficulty=${selectedDifficulty}`,
        {
            method: 'GET'
        }
    );

    const data = await response.json();

    buildBoard(data);
});

function buildBoard(boardData) {
    rows = boardData.rows;
    cols = boardData.cols;

    firstClick = true;
    gameOver = false;

    scoreDisplay.textContent = 0;

    gameStatus.textContent = 'Game in progress';

    board.innerHTML = '';

    board.dataset.rows = rows;
    board.dataset.cols = cols;
    board.dataset.mines = boardData.mine_count;

    board.style.setProperty('--rows', rows);
    board.style.setProperty('--cols', cols);

    flagLeft.textContent = boardData.mine_count;

    initialTime = boardData.time;
    timeDisplay.dataset.time = boardData.time;
    timeDisplay.textContent = boardData.time;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('button');

            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.dataset.value = boardData.board[r][c];
            cell.type = 'button';

            board.appendChild(cell);
        }
    }

    cells = document.querySelectorAll('.cell');

    safeCellsLeft =
        rows * cols - boardData.mine_count;

    firstClick = true;
    gameOver = false;

    gameStatus.textContent = 'Game in progress';

    cellEventClick();
}


async function saveScore(score) {
    if (!loggedIn) {
        return;
    }

    const response = await fetch(scoreUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            difficulty: difficultySelect.value,
            score: score
        })
    })

    const data = await response.json();

    console.log(data);

}

function calculateScore() {
    const timeLeft = Number(timeDisplay.textContent);
    const difficulty = difficultySelect.value;

    let multiplier = 1;

    if (difficulty === 'medium') {
        multiplier = 2;
    } else if (difficulty === 'hard') {
        multiplier = 3;
    }

    return timeLeft * multiplier;
}

async function handleWin() {
    if (gameOver) {
        return;
    }

    gameOver = true;

    const score = calculateScore();

    scoreDisplay.textContent = score;
    gameStatus.textContent = 'You win! 🎉';

    await saveScore(score);
}