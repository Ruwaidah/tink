import random


def create_board(rows, cols, mine_count):
    # Create an empty board
    board = [[0 for _ in range(cols)] for _ in range(rows)]

    positions=[(row, col) for row in range(rows) for col in range(cols)]
    print(f"All positions: {positions}")  # Debugging line

    mine_positions = random.sample(positions, mine_count)
    print(f"Mine positions: {mine_positions}")  # Debugging line

    for row, col in mine_positions:
        board[row][col] = -1  # -1 represents a mine

    for row in range(rows):
        for col in range(cols):
            if board[row][col] == -1:
                continue
            # Count adjacent mines
            mine_count = 0
            for r in range(max(0, row - 1), min(rows, row + 2)):
                for c in range(max(0, col - 1), min(cols, col + 2)):
                    if board[r][c] == -1:
                        mine_count += 1
            board[row][col] = mine_count

    return board
