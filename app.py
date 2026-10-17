from flask import Flask, render_template
from games.minesweeper import create_board

app = Flask(__name__)

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
                           rows=rows, 
                           cols=cols,
                           mine_count=mine_count)

if __name__ == '__main__':
    app.run(debug=True, port=5001)