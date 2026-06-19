import os
from datetime import datetime, timedelta
from typing import Optional
import pyotp
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer

# JWT Settings
SECRET_KEY = os.getenv("JWT_SECRET", "super_secret_jwt_key_bhartiya_abhilekhan_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# --- TOTP Functions ---
def generate_totp_secret() -> str:
    """Generate a random base32 TOTP secret key."""
    return pyotp.random_base32()

def get_provisioning_uri(email: str, secret: str) -> str:
    """Generate the standard otpauth URL for QR code generation."""
    return pyotp.totp.TOTP(secret).provisioning_uri(email, issuer_name="Bhartiya Abhilekhan")

def verify_totp_code(secret: str, code: str) -> bool:
    """Verify if the 6-digit code is valid for the given secret."""
    totp = pyotp.totp.TOTP(secret)
    # Allows a tolerance of 1 time step (30 seconds) backward/forward to handle clock drift
    return totp.verify(code, valid_window=1)

# --- JWT Functions ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT token with expiry."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Customer:
    """FastAPI Dependency: Extract user details from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
         raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(Customer).filter(Customer.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_admin(current_user: Customer = Depends(get_current_user)) -> Customer:
    """FastAPI Dependency: Restrict access to Admins only."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to administrative accounts only",
        )
    return current_user
