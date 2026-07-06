from sqlalchemy.orm import Session

from app.auth_utils import generate_user_id, hash_password
from app.config import ADMIN_EMAIL, ADMIN_PASSWORD
from app.models import User, UserRole


def seed_admin(db: Session) -> None:
    existing = (
        db.query(User)
        .filter(User.email == ADMIN_EMAIL, User.role == UserRole.admin)
        .first()
    )
    if existing:
        return

    admin = User(
        id=generate_user_id(),
        email=ADMIN_EMAIL,
        hashed_password=hash_password(ADMIN_PASSWORD),
        role=UserRole.admin,
        name="IT Administrator",
        profile_complete=True,
    )
    db.add(admin)
    db.commit()
