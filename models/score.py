from datetime import datetime
from extensions import db

class Score(db.Model):
    id=db.Column(
        db.Integer, primary_key=True
    )

    user_id=db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    difficulty = db.Column(
        db.String(20),
        nullable=False
    )

    score = db.Column(
        db.Integer,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )