import random

DIFFICULTY_SETTINGS = {
    'easy': {'rows': 9, 'cols': 9, 'mine_count': 10, 'time': 59},
    'medium': {'rows': 16, 'cols': 16, 'mine_count': 40, 'time': 180},
    'hard': {'rows': 16, 'cols': 30, 'mine_count': 99, 'time': 300}
}

def create_board(rows, cols, mine_count, safe_first_click=None):
    # Create an empty board
    board = [[0 for _ in range(cols)] for _ in range(rows)]

    positions=[(row, col) for row in range(rows) for col in range(cols)]
    print(f"All positions: {positions}")  # Debugging line
    if safe_first_click:
        # Remove the safe first click position from the list of possible mine positions
        positions.remove(safe_first_click)

    mine_positions = random.sample(positions, mine_count)
    print(f"Mine positions: {mine_positions}")  # Debugging line
 
    for row, col in mine_positions:
        board[row][col] = -1  # -1 represents a mine
    

    for row in range(rows):
        for col in range(cols):
            if board[row][col] == -1:
                continue
            # Count adjacent mines
            adjacent_mines = 0
            for r in range(max(0, row - 1), min(rows, row + 2)):
                for c in range(max(0, col - 1), min(cols, col + 2)):
                    if board[r][c] == -1:
                        adjacent_mines += 1
            board[row][col] = adjacent_mines

    return board
