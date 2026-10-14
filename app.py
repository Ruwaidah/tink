import random

from flask import Flask, render_template

app = Flask(__name__)

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

@app.route('/')
def home():
    return render_template('index.html')

@app.route("/games")
def games():
    return render_template('games.html')

@app.route("/games/minesweeper")
def minesweeper():
    rows = 9
    cols = 9
    mine_count = 10
    board = create_board(rows, cols, mine_count)

    return render_template('minesweeper.html',
                           board=board,
                           rows=rows, cols=cols)

if __name__ == '__main__':
    app.run(debug=True, port=5001)