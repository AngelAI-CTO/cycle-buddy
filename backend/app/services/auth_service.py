from datetime import datetime, timedelta
import hashlib
import hmac
import base64
import json
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.models import User

SECRET_KEY = os.environ.get("SECRET_KEY", "CHANGE-ME-in-production-use-env-variable")
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 30  # 30 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    return hashlib.sha256((password + SECRET_KEY).encode()).hexdigest()


def verify_password(plain: str, hashed: str) -> bool:
    return hmac.compare_digest(hash_password(plain), hashed)


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(s: str) -> bytes:
    s += "=" * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)


def _sign(msg: str) -> str:
    return _b64url_encode(hmac.new(SECRET_KEY.encode(), msg.encode(), hashlib.sha256).digest())


def create_access_token(user_id: int) -> str:
    header = _b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = _b64url_encode(json.dumps({
        "sub": str(user_id),
        "exp": int(expire.timestamp()),
    }).encode())
    signature = _sign(f"{header}.{payload}")
    return f"{header}.{payload}.{signature}"


def _decode_token(token: str) -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token")

    header, payload, signature = parts
    expected_sig = _sign(f"{header}.{payload}")
    if not hmac.compare_digest(signature, expected_sig):
        raise ValueError("Invalid signature")

    data = json.loads(_b64url_decode(payload))
    if data.get("exp", 0) < datetime.utcnow().timestamp():
        raise ValueError("Token expired")

    return data


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = _decode_token(token)
        user_id = int(payload["sub"])
    except (ValueError, KeyError, TypeError):
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user
