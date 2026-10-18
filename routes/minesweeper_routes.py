from flask import Blueprint, render_template, jsonify, request
from games.minesweeper import create_board, DIFFICULTY_SETTINGS

minesweeper_bp = Blueprint('minesweeper', __name__)

@minesweeper_bp.route('/games/minesweeper')
def minesweeper():
    difficulty = request.args.get('difficulty', default='easy')
    settings = DIFFICULTY_SETTINGS[difficulty]
    rows = settings['rows']
    cols = settings['cols']
    mine_count = settings['mine_count']
    time = settings['time']
    board = create_board(rows, cols, mine_count)

    return render_template('minesweeper.html',
                           board=board,
                           rows=rows, 
                           cols=cols,
                           mine_count=mine_count,
                           time=time)

@minesweeper_bp.route('/api/games/minesweeper/new_board', methods=['GET'])
def new_board():
    difficulty = request.args.get('difficulty', default='easy')
    settings = DIFFICULTY_SETTINGS[difficulty]
    rows = settings['rows']
    cols = settings['cols']
    mine_count = settings['mine_count']
    time = settings['time']
    safe_first_click_row = request.args.get('safe_first_click_row', default=None, type=int)
    safe_first_click_col = request.args.get('safe_first_click_col', default=None, type=int)
    firstClick = request.args.get('firstClick', default=False, type=bool)
    safe_first_click = None
    if firstClick:   
        safe_first_click = (safe_first_click_row, safe_first_click_col)
    board = create_board(rows, cols, mine_count, safe_first_click=safe_first_click)
    return jsonify({"board": board, "rows": rows, "cols": cols, "mine_count": mine_count, "time": time, "difficulty": difficulty})