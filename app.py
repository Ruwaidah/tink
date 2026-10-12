from flask import Flask, render_template

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
    return render_template('minesweeper.html',
                           rows=rows, cols=cols)

if __name__ == '__main__':
    app.run(debug=True, port=5001)