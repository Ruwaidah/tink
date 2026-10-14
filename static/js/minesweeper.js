const cells = document.querySelectorAll('.cell');

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const value = Number(cell.dataset.value);
        cell.classList.add('revealed');
        if (value === -1) {
            cell.textContent = '💣';
        } else if (value > 0) {
            cell.textContent = value;
        }
    });
});

