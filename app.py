from extensions import db
from models.user import User
from models.score import Score
from flask import Flask, render_template
from routes.minesweeper_routes import minesweeper_bp 
from routes.auth_routes import auth_bp
from routes.score_routes import score_bp

app = Flask(__name__)

app.config['SECRET_KEY'] = 'tink-development-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tink.db'

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(minesweeper_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(score_bp)

@app.route('/')
def home():
    return render_template('index.html')

@app.route("/games")
def games():
    return render_template('games.html')


if __name__ == '__main__':
    app.run(debug=True, port=5001)