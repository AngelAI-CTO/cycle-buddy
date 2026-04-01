import json
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.models import User, Partner, Signal
from app.schemas import SyncPushPayload, SyncPullResponse, PartnerSyncOut, SignalOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/sync", tags=["sync"])


def _compute_cycle_number(signal_date, partner_start_date, cycle_length):
    if not partner_start_date:
        return None
    diff_days = (signal_date - partner_start_date).days
    if diff_days < 0:
        return None
    return diff_days // cycle_length


@router.post("/push", response_model=SyncPullResponse)
async def sync_push(
    payload: SyncPushPayload,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Accept full client state. Upsert partners by (user_id, name),
    dedup signals by client_id, return full server state.
    """
    for p_data in payload.partners:
        # Find or create partner by name
        result = await db.execute(
            select(Partner).where(
                Partner.user_id == user.id, Partner.name == p_data.name
            )
        )
        partner = result.scalar_one_or_none()

        if partner:
            partner.cycle_length = p_data.cycle_length
            partner.period_length = p_data.period_length
            partner.start_date = p_data.start_date
        else:
            partner = Partner(
                name=p_data.name,
                cycle_length=p_data.cycle_length,
                period_length=p_data.period_length,
                start_date=p_data.start_date,
                user_id=user.id,
            )
            db.add(partner)
            await db.flush()  # get partner.id

        # Upsert signals
        for s_data in p_data.signals:
            existing = None
            if s_data.client_id:
                res = await db.execute(
                    select(Signal).where(Signal.client_id == s_data.client_id)
                )
                existing = res.scalar_one_or_none()

            cycle_number = _compute_cycle_number(
                s_data.date, partner.start_date, partner.cycle_length
            )

            if existing:
                existing.date = s_data.date
                existing.time = s_data.time
                existing.moods = json.dumps(s_data.moods)
                existing.text = s_data.text
                existing.has_audio = 1 if s_data.has_audio else 0
                existing.phase = s_data.phase
                existing.day_in_cycle = s_data.day_in_cycle
                existing.cycle_number = cycle_number
            else:
                signal = Signal(
                    partner_id=partner.id,
                    date=s_data.date,
                    time=s_data.time,
                    moods=json.dumps(s_data.moods),
                    text=s_data.text,
                    has_audio=1 if s_data.has_audio else 0,
                    phase=s_data.phase,
                    day_in_cycle=s_data.day_in_cycle,
                    cycle_number=cycle_number,
                    client_id=s_data.client_id,
                )
                db.add(signal)

    await db.commit()

    # Return full state
    return await _build_pull_response(user, db)


@router.get("/pull", response_model=SyncPullResponse)
async def sync_pull(
    since: datetime | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Return all partners and signals, optionally filtered by updated_at > since.
    """
    return await _build_pull_response(user, db, since=since)


async def _build_pull_response(
    user: User, db: AsyncSession, since: datetime | None = None
) -> SyncPullResponse:
    query = (
        select(Partner)
        .options(selectinload(Partner.signals))
        .where(Partner.user_id == user.id)
    )
    result = await db.execute(query)
    partners = result.scalars().all()

    partner_list = []
    for p in partners:
        signals = p.signals
        if since:
            signals = [s for s in signals if s.updated_at and s.updated_at > since]
        signals.sort(key=lambda s: (s.date, s.time or ""), reverse=True)

        partner_list.append(
            PartnerSyncOut(
                id=p.id,
                name=p.name,
                start_date=p.start_date,
                cycle_length=p.cycle_length,
                period_length=p.period_length,
                signals=[SignalOut.model_validate(s) for s in signals],
            )
        )

    return SyncPullResponse(
        partners=partner_list,
        server_timestamp=datetime.utcnow(),
    )
