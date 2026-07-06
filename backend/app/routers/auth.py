from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth_utils import (
    create_access_token,
    generate_user_id,
    get_current_user,
    hash_password,
    require_employee,
    verify_password,
)
from app.database import get_db
from app.models import User, UserRole
from app.schemas import (
    AuthResponse,
    EmployeeProfileRequest,
    EmployeeProfileUpdateRequest,
    EmployeeRegisterRequest,
    LoginRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _auth_response(user: User) -> AuthResponse:
    token = create_access_token(user.id, user.role)
    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/admin/login", response_model=AuthResponse)
def admin_login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.email == payload.email, User.role == UserRole.admin)
        .first()
    )

    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return _auth_response(user)


@router.post("/employee/register", response_model=AuthResponse, status_code=201)
def employee_register(payload: EmployeeRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        id=generate_user_id(),
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=UserRole.employee,
        profile_complete=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return _auth_response(user)


@router.post("/employee/login", response_model=AuthResponse)
def employee_login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.email == payload.email, User.role == UserRole.employee)
        .first()
    )

    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return _auth_response(user)


@router.post("/employee/profile", response_model=UserResponse)
def complete_employee_profile(
    payload: EmployeeProfileRequest,
    user: User = Depends(require_employee),
    db: Session = Depends(get_db),
):
    if user.profile_complete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile is already complete. Employee ID cannot be changed.",
        )

    existing_emp = db.query(User).filter(User.emp_id == payload.emp_id).first()
    if existing_emp and existing_emp.id != user.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This employee ID is already registered",
        )

    user.name = payload.name
    user.emp_id = payload.emp_id
    user.designation = payload.designation
    user.profile_complete = True

    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)


@router.patch("/employee/profile", response_model=UserResponse)
def update_employee_profile(
    payload: EmployeeProfileUpdateRequest,
    user: User = Depends(require_employee),
    db: Session = Depends(get_db),
):
    if not user.profile_complete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete your profile before updating designation",
        )

    user.designation = payload.designation
    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
