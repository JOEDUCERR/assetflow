from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.auth_utils import generate_user_id, require_admin, require_employee
from app.database import get_db
from app.models import Asset, AssetAction, AssetHistory, AssetStatus, User, UserRole
from app.qr_utils import generate_qr_code_base64, generate_qr_token, parse_qr_payload
from app.schemas_asset import (
    AssetActionResponse,
    AssetAssignRequest,
    AssetCreateRequest,
    AssetCreateResponse,
    AssetHistoryResponse,
    AssetResponse,
    AssetScanRequest,
    AssignedEmployeeSummary,
)

router = APIRouter(prefix="/assets", tags=["assets"])
employee_router = APIRouter(prefix="/employee", tags=["employee"])


def _asset_response(asset: Asset) -> AssetResponse:
    assigned_to = None
    if asset.assigned_to:
        assigned_to = AssignedEmployeeSummary.model_validate(asset.assigned_to)

    return AssetResponse(
        id=asset.id,
        asset_name=asset.asset_name,
        asset_location_id=asset.asset_location_id,
        asset_serial_no=asset.asset_serial_no,
        category=asset.category or "",
        manufacturer=asset.manufacturer or "",
        model=asset.model or "",
        qr_token=asset.qr_token,
        status=asset.status.value,
        assigned_to=assigned_to,
        assigned_at=asset.assigned_at,
        created_at=asset.created_at,
    )


def _record_history(
    db: Session,
    *,
    asset: Asset,
    action: AssetAction,
    performed_by: User,
    employee: User | None = None,
    notes: str | None = None,
) -> None:
    entry = AssetHistory(
        id=generate_user_id(),
        asset_id=asset.id,
        action=action,
        performed_by_id=performed_by.id,
        employee_id=employee.emp_id if employee else None,
        employee_name=employee.name if employee else None,
        notes=notes,
    )
    db.add(entry)


def _get_asset_or_404(db: Session, asset_id: str) -> Asset:
    asset = (
        db.query(Asset)
        .options(joinedload(Asset.assigned_to))
        .filter(Asset.id == asset_id)
        .first()
    )
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )
    return asset


def _get_employee_by_emp_id(db: Session, emp_id: str) -> User:
    employee = (
        db.query(User)
        .filter(User.role == UserRole.employee, User.emp_id == emp_id)
        .first()
    )
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found with that ID",
        )
    if not employee.profile_complete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee profile is incomplete",
        )
    return employee


def _get_asset_by_token(db: Session, qr_token: str) -> Asset:
    token = parse_qr_payload(qr_token)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid QR code",
        )

    asset = (
        db.query(Asset)
        .options(joinedload(Asset.assigned_to))
        .filter(Asset.qr_token == token)
        .first()
    )
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found for this QR code",
        )
    return asset


@router.post("", response_model=AssetCreateResponse, status_code=201)
def create_asset(
    payload: AssetCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Asset)
        .filter(Asset.asset_serial_no == payload.asset_serial_no)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An asset with this serial number already exists",
        )

    token = generate_qr_token()
    asset = Asset(
        id=generate_user_id(),
        asset_name=payload.asset_name,
        asset_location_id=payload.asset_location_id,
        asset_serial_no=payload.asset_serial_no,
        category=payload.category,
        manufacturer=payload.manufacturer,
        model=payload.model,
        qr_token=token,
        status=AssetStatus.available,
    )
    db.add(asset)
    db.flush()

    _record_history(
        db,
        asset=asset,
        action=AssetAction.created,
        performed_by=admin,
        notes="Asset registered in system",
    )
    db.commit()
    db.refresh(asset)

    return AssetCreateResponse(
        asset=_asset_response(asset),
        qr_code_data_url=generate_qr_code_base64(token),
    )


@router.get("", response_model=list[AssetResponse])
def list_assets(
    assigned_only: bool = False,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Asset).options(joinedload(Asset.assigned_to))
    if assigned_only:
        query = query.filter(Asset.status == AssetStatus.assigned)
    assets = query.order_by(Asset.created_at.desc()).all()
    return [_asset_response(asset) for asset in assets]


@employee_router.get("/my-assets", response_model=list[AssetResponse])
def list_my_assets(
    employee: User = Depends(require_employee),
    db: Session = Depends(get_db),
):
    assets = (
        db.query(Asset)
        .options(joinedload(Asset.assigned_to))
        .filter(
            Asset.assigned_to_id == employee.id,
            Asset.status == AssetStatus.assigned,
        )
        .order_by(Asset.assigned_at.desc())
        .all()
    )
    return [_asset_response(asset) for asset in assets]


@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: str,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return _asset_response(_get_asset_or_404(db, asset_id))


@router.get("/{asset_id}/history", response_model=list[AssetHistoryResponse])
def get_asset_history(
    asset_id: str,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    _get_asset_or_404(db, asset_id)
    entries = (
        db.query(AssetHistory)
        .options(joinedload(AssetHistory.performed_by))
        .filter(AssetHistory.asset_id == asset_id)
        .order_by(AssetHistory.created_at.desc())
        .all()
    )

    return [
        AssetHistoryResponse(
            id=entry.id,
            action=entry.action.value,
            employee_id=entry.employee_id,
            employee_name=entry.employee_name,
            notes=entry.notes,
            performed_by_email=entry.performed_by.email,
            created_at=entry.created_at,
        )
        for entry in entries
    ]


@router.get("/{asset_id}/qr")
def get_asset_qr(
    asset_id: str,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    asset = _get_asset_or_404(db, asset_id)
    return {
        "qr_code_data_url": generate_qr_code_base64(asset.qr_token),
        "qr_token": asset.qr_token,
    }


@router.post("/{asset_id}/assign", response_model=AssetActionResponse)
def manual_assign_asset(
    asset_id: str,
    payload: AssetAssignRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    asset = _get_asset_or_404(db, asset_id)
    if asset.status == AssetStatus.assigned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Asset is already assigned. Return it first.",
        )

    employee = _get_employee_by_emp_id(db, payload.emp_id)
    now = datetime.now(timezone.utc)

    asset.status = AssetStatus.assigned
    asset.assigned_to_id = employee.id
    asset.assigned_at = now

    _record_history(
        db,
        asset=asset,
        action=AssetAction.manual_assigned,
        performed_by=admin,
        employee=employee,
        notes=f"Manually assigned by admin to {employee.emp_id}",
    )
    db.commit()
    db.refresh(asset)

    return AssetActionResponse(
        message=f"Asset assigned to {employee.name} ({employee.emp_id})",
        asset=_asset_response(asset),
    )


@router.post("/{asset_id}/return", response_model=AssetActionResponse)
def manual_return_asset(
    asset_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    asset = _get_asset_or_404(db, asset_id)
    if asset.status != AssetStatus.assigned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Asset is not currently assigned",
        )

    previous_employee = asset.assigned_to
    asset.status = AssetStatus.available
    asset.assigned_to_id = None
    asset.assigned_at = None

    _record_history(
        db,
        asset=asset,
        action=AssetAction.manual_returned,
        performed_by=admin,
        employee=previous_employee,
        notes="Manually returned by admin",
    )
    db.commit()
    db.refresh(asset)

    return AssetActionResponse(
        message="Asset returned and marked as available",
        asset=_asset_response(asset),
    )


@router.post("/scan/preview", response_model=AssetResponse)
def preview_asset_by_scan(
    payload: AssetScanRequest,
    employee: User = Depends(require_employee),
    db: Session = Depends(get_db),
):
    if not employee.profile_complete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete your profile before scanning assets",
        )

    return _asset_response(_get_asset_by_token(db, payload.qr_token))


@router.post("/scan/take", response_model=AssetActionResponse)
def take_asset_by_scan(
    payload: AssetScanRequest,
    employee: User = Depends(require_employee),
    db: Session = Depends(get_db),
):
    if not employee.profile_complete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete your profile before taking assets",
        )

    asset = _get_asset_by_token(db, payload.qr_token)
    if asset.status == AssetStatus.assigned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This asset is already assigned to someone else",
        )

    now = datetime.now(timezone.utc)
    asset.status = AssetStatus.assigned
    asset.assigned_to_id = employee.id
    asset.assigned_at = now

    _record_history(
        db,
        asset=asset,
        action=AssetAction.assigned,
        performed_by=employee,
        employee=employee,
        notes="Checked out via QR scan",
    )
    db.commit()
    db.refresh(asset)

    return AssetActionResponse(
        message=f"You have taken {asset.asset_name}",
        asset=_asset_response(asset),
    )


@router.post("/scan/return", response_model=AssetActionResponse)
def return_asset_by_scan(
    payload: AssetScanRequest,
    employee: User = Depends(require_employee),
    db: Session = Depends(get_db),
):
    asset = _get_asset_by_token(db, payload.qr_token)
    if asset.status != AssetStatus.assigned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This asset is not currently assigned",
        )

    if asset.assigned_to_id != employee.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This asset is assigned to another employee",
        )

    asset.status = AssetStatus.available
    asset.assigned_to_id = None
    asset.assigned_at = None

    _record_history(
        db,
        asset=asset,
        action=AssetAction.returned,
        performed_by=employee,
        employee=employee,
        notes="Returned via QR scan",
    )
    db.commit()
    db.refresh(asset)

    return AssetActionResponse(
        message=f"You have returned {asset.asset_name}",
        asset=_asset_response(asset),
    )
