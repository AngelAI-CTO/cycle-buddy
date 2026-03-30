from datetime import date
from pydantic import BaseModel, Field


# Auth
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Partner
class PartnerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    cycle_length: int = Field(default=28, ge=21, le=35)
    period_length: int = Field(default=5, ge=2, le=8)


class PartnerUpdate(BaseModel):
    name: str | None = None
    cycle_length: int | None = Field(default=None, ge=21, le=35)
    period_length: int | None = Field(default=None, ge=2, le=8)


class PartnerOut(BaseModel):
    id: int
    name: str
    cycle_length: int
    period_length: int

    model_config = {"from_attributes": True}


# Cycle
class CycleCreate(BaseModel):
    start_date: date


class CycleOut(BaseModel):
    id: int
    start_date: date
    partner_id: int

    model_config = {"from_attributes": True}
