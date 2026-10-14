const board = document.querySelector('.minesweeper-board');
const cells = document.querySelectorAll('.cell');

const rows = Number(board.dataset.rows);
const cols = Number(board.dataset.cols);


function revealCell(cell) {
    if (cell.classList.contains('revealed')) {
        return;
    }

    const value = Number(cell.dataset.value);
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    cell.classList.add('revealed');

    if (value === -1) {
        cell.textContent = '💣';
        return;
    }
    if (value > 0) {
        cell.textContent = value;
        return;
    }

    revealNeighbors(row, col);
}

function revealNeighbors(row, col) {
    for (let r = Math.max(0, row - 1); r <= Math.min(rows, row + 2); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(cols, col + 2); c++) {
            const neighborCell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            if (neighborCell && !neighborCell.classList.contains('revealed')) {
                if (neighborCell.dataset.value !== '-1') {
                    revealCell(neighborCell);
                }
            }
        }
    }
}

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        revealCell(cell);
    });
});

