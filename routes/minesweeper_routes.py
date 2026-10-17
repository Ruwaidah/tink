from flask import Blueprint, render_template, jsonify
from games.minesweeper import create_board

minesweeper_bp = Blueprint('minesweeper', __name__)

@minesweeper_bp.route('/games/minesweeper')
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

@minesweeper_bp.route('/api/games/minesweeper/new_board', methods=['GET'])
def new_board():
    rows = 9
    cols = 9
    mine_count = 10
    board = create_board(rows, cols, mine_count)
    return jsonify({"board": board, "rows": rows, "cols": cols, "mine_count": mine_count})