const board = document.querySelector('.minesweeper-board');
const cells = document.querySelectorAll('.cell');

const rows = Number(board.dataset.rows);
const cols = Number(board.dataset.cols);

const mineCount = document.querySelector('#mine-count');
const gameStatus = document.querySelector('#game-status');

let gameOver = false;

let safeCellsLeft = rows * cols - Number(mineCount.textContent);

function revealCell(cell) {
    if (gameOver) {
        return;
    }
    if (cell.classList.contains('revealed')) {
        return;
    }

    if (cell.classList.contains('flagged')) {
        return;
    }

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
        console.log('safeCellsLeft', safeCellsLeft);
        if (safeCellsLeft === 0) {
            gameOver = true;
            gameStatus.textContent = 'You win! 🎉';
        }
        return;
    }

    revealNeighbors(row, col);

    console.log('safeCellsLeft', safeCellsLeft);
    if (safeCellsLeft === 0) {
        gameOver = true;
        gameStatus.textContent = 'You win! 🎉';
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


cells.forEach(cell => {
    cell.addEventListener('click', () => {
        revealCell(cell);
    });

})

cells.forEach(cell => {
    cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        console.log('right click', mineCount.textContent - 1);

        if (gameOver) {
            return;
        }

        if (cell.classList.contains('revealed')) {
            return;
        }

        if (Number(mineCount.textContent) <= 0 && !cell.classList.contains('flagged')) {
            return;
        }
        cell.classList.toggle('flagged');

        if (cell.classList.contains('flagged')) {
            cell.textContent = '🚩';
            mineCount.textContent = Number(mineCount.textContent) - 1;
        } else {
            cell.textContent = '';
            mineCount.textContent = Number(mineCount.textContent) + 1;
        }

    });
})

