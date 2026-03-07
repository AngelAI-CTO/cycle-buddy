from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    partners = relationship("Partner", back_populates="user", cascade="all, delete-orphan")


class Partner(Base):
    __tablename__ = "partners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    cycle_length = Column(Integer, default=28)  # days
    period_length = Column(Integer, default=5)   # days
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="partners")
    cycles = relationship("Cycle", back_populates="partner", cascade="all, delete-orphan")


class Cycle(Base):
    __tablename__ = "cycles"

    id = Column(Integer, primary_key=True, index=True)
    start_date = Column(Date, nullable=False)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    partner = relationship("Partner", back_populates="cycles")
