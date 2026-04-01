import json
from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator


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


class UserOut(BaseModel):
    id: int
    username: str

    model_config = {"from_attributes": True}


# Partner
class PartnerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    cycle_length: int = Field(default=28, ge=21, le=35)
    period_length: int = Field(default=5, ge=2, le=8)
    start_date: date | None = None


class PartnerUpdate(BaseModel):
    name: str | None = None
    cycle_length: int | None = Field(default=None, ge=21, le=35)
    period_length: int | None = Field(default=None, ge=2, le=8)
    start_date: date | None = None


class PartnerOut(BaseModel):
    id: int
    name: str
    cycle_length: int
    period_length: int
    start_date: date | None = None

    model_config = {"from_attributes": True}


# Cycle
class CycleCreate(BaseModel):
    start_date: date


class CycleOut(BaseModel):
    id: int
    start_date: date
    partner_id: int

    model_config = {"from_attributes": True}


# Signal
class SignalCreate(BaseModel):
    date: date
    time: str | None = None
    moods: list[str]
    text: str | None = None
    has_audio: bool = False
    phase: str
    day_in_cycle: int | None = None
    cycle_number: int | None = None
    client_id: str | None = None


class SignalOut(BaseModel):
    id: int
    partner_id: int
    date: date
    time: str | None
    moods: list[str]
    text: str | None
    has_audio: bool
    phase: str
    day_in_cycle: int | None
    cycle_number: int | None
    client_id: str | None
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("moods", mode="before")
    @classmethod
    def parse_moods(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    @field_validator("has_audio", mode="before")
    @classmethod
    def parse_has_audio(cls, v):
        if isinstance(v, int):
            return bool(v)
        return v


# Sync
class PartnerSyncData(BaseModel):
    name: str
    start_date: date | None = None
    cycle_length: int = Field(default=28, ge=21, le=35)
    period_length: int = Field(default=5, ge=2, le=8)
    signals: list[SignalCreate] = []


class SyncPushPayload(BaseModel):
    partners: list[PartnerSyncData]


class PartnerSyncOut(BaseModel):
    id: int
    name: str
    start_date: date | None
    cycle_length: int
    period_length: int
    signals: list[SignalOut] = []

    model_config = {"from_attributes": True}


class SyncPullResponse(BaseModel):
    partners: list[PartnerSyncOut]
    server_timestamp: datetime
