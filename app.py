from flask import Flask, render_template
from routes.minesweeper_routes import minesweeper_bp    

app = Flask(__name__)

app.register_blueprint(minesweeper_bp)

@app.route('/')
def home():
    return render_template('index.html')

@app.route("/games")
def games():
    return render_template('games.html')

if __name__ == '__main__':
    app.run(debug=True, port=5001)