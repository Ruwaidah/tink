from flask import (Blueprint, render_template, request, session, redirect, url_for)
from werkzeug.security import (generate_password_hash, check_password_hash)
from models.score import Score

from extensions import db
from models.user import User


auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get("email", '').strip()
        password = request.form.get("password", '')
        confirm_password = request.form.get("confirm_password", '')

        if not username or not email or not password:
            return render_template(
                'register.html',
                error='All fields are required'
            )

        print(password, confirm_password)

        if password != confirm_password:
            return render_template(
                'register.html',
                error='Password do not match.'
            )

        existing_username = User.query.filter_by(
            username = username
        ).first()

        if existing_username:
            return render_template(
                'register.html',
                error = 'Username already exists.'
            )

        existing_email = User.query.filter_by(
                email = email
        ).first()

        if existing_email:
            return render_template(
                'register.html',
                error = 'Email already exist.'
            )

        user = User(
            username = username,
            email = email,
            password_hash = generate_password_hash(password)
        )

        db.session.add(user)
        db.session.commit()

        return render_template(
            'register.html',
            success = 'Acount created successfully!')

    return render_template('register.html')



@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()

        user = User.query.filter_by(email=email).first()

        if user is None:
            return render_template('login.html',
                                   error='Invalid email or password.')

        if not check_password_hash(
            user.password_hash,
            password
        ): 
            return render_template('login.html',
                                   error = 'Invalid email or password.')

        session['user_id'] = user.id
        session['username'] = user.username

        return redirect(url_for('home'))

    return render_template('login.html')


@auth_bp.route('/profile')
def profile():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    user = User.query.get(session['user_id'])

    user_scores = Score.query.filter_by(
        user_id=session['user_id']
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
        'profile.html',
        user=user,
        total_games=len(user_scores),
        best_scores=best_scores
    )


@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))