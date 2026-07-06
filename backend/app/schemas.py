from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    name: str | None = None
    emp_id: str | None = None
    designation: str | None = None
    profile_complete: bool

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class EmployeeRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class EmployeeProfileRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    emp_id: str = Field(min_length=1, max_length=50)
    designation: str = Field(min_length=1, max_length=120)


class EmployeeProfileUpdateRequest(BaseModel):
    designation: str = Field(min_length=1, max_length=120)
