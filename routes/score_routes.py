from flask import (
    Blueprint,
    request,
    jsonify,
    session,
    render_template,
    redirect,
    url_for
)
from models.user import User
from extensions import db
from models.score import Score


score_bp = Blueprint('score', __name__)


@score_bp.route('/api/scores', methods=['POST'])
def save_score():
    if 'user_id' not in session:
        return jsonify({
            'error': 'You must be logged in to save a score.'
        }), 401

    data = request.get_json()

    difficulty = data.get('difficulty')
    score_value = data.get('score')

    if difficulty not in ['easy', 'medium', 'hard']:
        return jsonify({
            'error': 'Invalid difficulty.'
        }), 400

    if not isinstance(score_value, int):
        return jsonify({
            'error': 'Invalid score.'
        }), 400

    score = Score(
        user_id=session['user_id'],
        difficulty=difficulty,
        score=score_value
    )

    db.session.add(score)
    db.session.commit()

    return jsonify({
        'message': 'Score saved successfully!',
        'score': score_value,
        'difficulty': difficulty
    }), 201



@score_bp.route('/scores')
def scores():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    user_scores = Score.query.filter_by(
        user_id=session['user_id']
    ).order_by(
        Score.created_at.desc()
    ).all()

    easy_scores = [
        score.score
        for score in user_scores
        if score.difficulty == 'easy'
    ]

    medium_scores = [
        score.score
        for score in user_scores
        if score.difficulty == 'medium'
    ]

    hard_scores = [
        score.score
        for score in user_scores
        if score.difficulty == 'hard'
    ]

    best_scores = {
        'easy': max(easy_scores) if easy_scores else None,
        'medium': max(medium_scores) if medium_scores else None,
        'hard': max(hard_scores) if hard_scores else None
    }

    return render_template(
        'scores.html',
        scores=user_scores,
        best_scores=best_scores
    )

@score_bp.route('/leaderboard')
def leaderboard():
    easy_scores = (
        db.session.query(Score, User)
        .join(User, Score.user_id == User.id)
        .filter(Score.difficulty == 'easy')
        .order_by(Score.score.desc())
        .limit(10)
        .all()
    )

    medium_scores = (
        db.session.query(Score, User)
        .join(User, Score.user_id == User.id)
        .filter(Score.difficulty == 'medium')
        .order_by(Score.score.desc())
        .limit(10)
        .all()
    )

    hard_scores = (
        db.session.query(Score, User)
        .join(User, Score.user_id == User.id)
        .filter(Score.difficulty == 'hard')
        .order_by(Score.score.desc())
        .limit(10)
        .all()
    )

    return render_template(
        'leaderboard.html',
        easy_scores=easy_scores,
        medium_scores=medium_scores,
        hard_scores=hard_scores
    )