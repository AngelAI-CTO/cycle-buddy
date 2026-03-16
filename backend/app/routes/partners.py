from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.models import User, Partner, Cycle, CycleCorrection
from app.schemas import (
    PartnerCreate, PartnerUpdate, PartnerOut,
    CycleCreate, CycleOut, CycleUpdate, CycleCorrectionOut,
)
from app.services.auth_service import get_current_user
from app.services.cycle_service import calculate_current_phase, get_forecast

router = APIRouter(prefix="/api/partners", tags=["partners"])


async def _get_partner(partner_id: int, user: User, db: AsyncSession) -> Partner:
    result = await db.execute(
        select(Partner)
        .options(selectinload(Partner.cycles))
        .where(Partner.id == partner_id, Partner.user_id == user.id)
    )
    partner = result.scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return partner


@router.get("/", response_model=list[PartnerOut])
async def list_partners(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Partner).where(Partner.user_id == user.id)
    )
    return result.scalars().all()


@router.post("/", response_model=PartnerOut, status_code=201)
async def create_partner(
    data: PartnerCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    partner = Partner(**data.model_dump(), user_id=user.id)
    db.add(partner)
    await db.commit()
    await db.refresh(partner)
    return partner


@router.patch("/{partner_id}", response_model=PartnerOut)
async def update_partner(
    partner_id: int,
    data: PartnerUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    partner = await _get_partner(partner_id, user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(partner, key, value)
    await db.commit()
    await db.refresh(partner)
    return partner


@router.delete("/{partner_id}", status_code=204)
async def delete_partner(
    partner_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    partner = await _get_partner(partner_id, user, db)
    await db.delete(partner)
    await db.commit()


# --- Cycles ---

@router.post("/{partner_id}/cycles", response_model=CycleOut, status_code=201)
async def add_cycle(
    partner_id: int,
    data: CycleCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    partner = await _get_partner(partner_id, user, db)
    cycle = Cycle(start_date=data.start_date, partner_id=partner.id)
    db.add(cycle)
    await db.commit()
    await db.refresh(cycle)
    return cycle


@router.get("/{partner_id}/cycles", response_model=list[CycleOut])
async def list_cycles(
    partner_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    partner = await _get_partner(partner_id, user, db)
    result = await db.execute(
        select(Cycle).where(Cycle.partner_id == partner.id).order_by(Cycle.start_date.desc())
    )
    return result.scalars().all()


# --- Phase & Forecast ---

@router.get("/{partner_id}/status")
async def get_partner_status(
    partner_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    partner = await _get_partner(partner_id, user, db)
    if not partner.cycles:
        raise HTTPException(status_code=400, detail="No cycle data yet. Add a cycle first.")

    last_cycle = max(partner.cycles, key=lambda c: c.start_date)
    status = calculate_current_phase(
        last_period_start=last_cycle.start_date,
        cycle_length=partner.cycle_length,
        period_length=partner.period_length,
    )
    status["partner_name"] = partner.name
    return status


@router.get("/{partner_id}/forecast")
async def get_partner_forecast(
    partner_id: int,
    days: int = 14,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    partner = await _get_partner(partner_id, user, db)
    if not partner.cycles:
        raise HTTPException(status_code=400, detail="No cycle data yet. Add a cycle first.")

    last_cycle = max(partner.cycles, key=lambda c: c.start_date)
    forecast = get_forecast(
        last_period_start=last_cycle.start_date,
        cycle_length=partner.cycle_length,
        period_length=partner.period_length,
        days_ahead=min(days, 60),
    )
    return {"partner_name": partner.name, "forecast": forecast}


# --- Cycle corrections ---

@router.patch("/{partner_id}/cycles/{cycle_id}", response_model=CycleOut)
async def update_cycle(
    partner_id: int,
    cycle_id: int,
    data: CycleUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a cycle's start date and record the correction."""
    partner = await _get_partner(partner_id, user, db)
    result = await db.execute(
        select(Cycle).where(Cycle.id == cycle_id, Cycle.partner_id == partner.id)
    )
    cycle = result.scalar_one_or_none()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")

    old_date = cycle.start_date
    if old_date != data.start_date:
        correction = CycleCorrection(
            cycle_id=cycle.id,
            old_start_date=old_date,
            new_start_date=data.start_date,
            reason=data.reason,
        )
        db.add(correction)
        cycle.start_date = data.start_date
        await db.commit()
        await db.refresh(cycle)

    return cycle


@router.get("/{partner_id}/corrections", response_model=list[CycleCorrectionOut])
async def list_corrections(
    partner_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all cycle corrections for a partner, newest first."""
    partner = await _get_partner(partner_id, user, db)
    result = await db.execute(
        select(CycleCorrection)
        .join(Cycle)
        .where(Cycle.partner_id == partner.id)
        .order_by(CycleCorrection.created_at.desc())
    )
    return result.scalars().all()
