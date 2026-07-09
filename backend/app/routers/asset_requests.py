from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.auth_utils import generate_user_id, require_admin, require_employee
from app.database import get_db
from app.models import Asset, AssetRequest, AssetRequestStatus, User
from app.schemas_request import (
    AssetRequestAssetOption,
    AssetRequestCreate,
    AssetRequestResponse,
    AssetRequestStatusUpdate,
)

router = APIRouter(prefix="/asset-requests", tags=["asset requests"])


def _request_response(request: AssetRequest) -> AssetRequestResponse:
    return AssetRequestResponse(
        id=request.id,
        employee_name=request.employee.name if request.employee else None,
        employee_id=request.employee.emp_id if request.employee else None,
        category=request.category,
        requested_asset_id=request.requested_asset_id,
        requested_asset_name=(
            request.requested_asset.asset_name if request.requested_asset else None
        ),
        purpose=request.purpose,
        expected_duration=request.expected_duration,
        status=request.status.value,
        created_at=request.created_at,
    )


@router.get("/assets", response_model=list[AssetRequestAssetOption])
def list_requestable_assets(
    _: User = Depends(require_employee),
    db: Session = Depends(get_db),
):
    assets = db.query(Asset).order_by(Asset.asset_name.asc()).all()
    return [
        AssetRequestAssetOption(
            id=asset.id,
            asset_name=asset.asset_name,
            asset_serial_no=asset.asset_serial_no,
            category=asset.category or "",
        )
        for asset in assets
    ]


@router.post("", response_model=AssetRequestResponse, status_code=201)
def create_asset_request(
    payload: AssetRequestCreate,
    employee: User = Depends(require_employee),
    db: Session = Depends(get_db),
):
    requested_asset = None
    if payload.requested_asset_id:
        requested_asset = (
            db.query(Asset).filter(Asset.id == payload.requested_asset_id).first()
        )
        if requested_asset is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requested asset not found",
            )

    request = AssetRequest(
        id=generate_user_id(),
        employee_id=employee.id,
        category=payload.category,
        requested_asset_id=requested_asset.id if requested_asset else None,
        purpose=payload.purpose,
        expected_duration=payload.expected_duration,
        status=AssetRequestStatus.pending,
    )
    db.add(request)
    db.commit()
    db.refresh(request)

    request.employee = employee
    request.requested_asset = requested_asset
    return _request_response(request)


@router.get("/mine", response_model=list[AssetRequestResponse])
def list_my_asset_requests(
    employee: User = Depends(require_employee),
    db: Session = Depends(get_db),
):
    requests = (
        db.query(AssetRequest)
        .options(
            joinedload(AssetRequest.employee),
            joinedload(AssetRequest.requested_asset),
        )
        .filter(AssetRequest.employee_id == employee.id)
        .order_by(AssetRequest.created_at.desc())
        .all()
    )
    return [_request_response(request) for request in requests]


@router.get("", response_model=list[AssetRequestResponse])
def list_asset_requests(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    requests = (
        db.query(AssetRequest)
        .options(
            joinedload(AssetRequest.employee),
            joinedload(AssetRequest.requested_asset),
        )
        .order_by(AssetRequest.created_at.desc())
        .all()
    )
    return [_request_response(request) for request in requests]


@router.patch("/{request_id}/status", response_model=AssetRequestResponse)
def update_asset_request_status(
    request_id: str,
    payload: AssetRequestStatusUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    request = (
        db.query(AssetRequest)
        .options(
            joinedload(AssetRequest.employee),
            joinedload(AssetRequest.requested_asset),
        )
        .filter(AssetRequest.id == request_id)
        .first()
    )
    if request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset request not found",
        )

    request.status = AssetRequestStatus(payload.status)
    db.commit()
    db.refresh(request)

    return _request_response(request)
