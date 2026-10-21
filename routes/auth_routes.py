from flask import (Blueprint, render_template, request, session, redirect, url_for)
from werkzeug.security import (generate_password_hash, check_password_hash)

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

    return render_template('login.html')
