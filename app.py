from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "<h1>Tink</h1>" \
    "<p>Little games. Lots of fun.</p>"


if __name__ == '__main__':
    app.run(debug=True, port=5001)