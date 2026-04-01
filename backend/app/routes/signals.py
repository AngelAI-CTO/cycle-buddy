import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.models import User, Partner, Signal
from app.schemas import SignalCreate, SignalOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/partners/{partner_id}/signals", tags=["signals"])


async def _get_partner(partner_id: int, user: User, db: AsyncSession) -> Partner:
    result = await db.execute(
        select(Partner).where(Partner.id == partner_id, Partner.user_id == user.id)
    )
    partner = result.scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return partner


def _compute_cycle_number(signal_date, partner_start_date, cycle_length):
    if not partner_start_date:
        return None
    diff_days = (signal_date - partner_start_date).days
    if diff_days < 0:
        return None
    return diff_days // cycle_length


@router.post("/", response_model=SignalOut, status_code=201)
async def create_signal(
    partner_id: int,
    data: SignalCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    partner = await _get_partner(partner_id, user, db)

    # Dedup by client_id
    if data.client_id:
        existing = await db.execute(
            select(Signal).where(Signal.client_id == data.client_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Signal already exists")

    cycle_number = _compute_cycle_number(data.date, partner.start_date, partner.cycle_length)

    signal = Signal(
        partner_id=partner.id,
        date=data.date,
        time=data.time,
        moods=json.dumps(data.moods),
        text=data.text,
        has_audio=1 if data.has_audio else 0,
        phase=data.phase,
        day_in_cycle=data.day_in_cycle,
        cycle_number=cycle_number,
        client_id=data.client_id,
    )
    db.add(signal)
    await db.commit()
    await db.refresh(signal)
    return signal


@router.get("/", response_model=list[SignalOut])
async def list_signals(
    partner_id: int,
    cycle_number: int | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    partner = await _get_partner(partner_id, user, db)
    query = select(Signal).where(Signal.partner_id == partner.id)
    if cycle_number is not None:
        query = query.where(Signal.cycle_number == cycle_number)
    query = query.order_by(Signal.date.desc(), Signal.time.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{signal_id}", response_model=SignalOut)
async def get_signal(
    partner_id: int,
    signal_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    partner = await _get_partner(partner_id, user, db)
    result = await db.execute(
        select(Signal).where(Signal.id == signal_id, Signal.partner_id == partner.id)
    )
    signal = result.scalar_one_or_none()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    return signal


@router.delete("/{signal_id}", status_code=204)
async def delete_signal(
    partner_id: int,
    signal_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    partner = await _get_partner(partner_id, user, db)
    result = await db.execute(
        select(Signal).where(Signal.id == signal_id, Signal.partner_id == partner.id)
    )
    signal = result.scalar_one_or_none()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    await db.delete(signal)
    await db.commit()
