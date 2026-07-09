from datetime import datetime

from pydantic import BaseModel, Field


class AssetRequestCreate(BaseModel):
    category: str = Field(min_length=1, max_length=80)
    requested_asset_id: str | None = None
    purpose: str = Field(min_length=1, max_length=500)
    expected_duration: str | None = Field(default=None, max_length=120)


class AssetRequestStatusUpdate(BaseModel):
    status: str = Field(pattern="^(Approved|Rejected)$")


class AssetRequestAssetOption(BaseModel):
    id: str
    asset_name: str
    asset_serial_no: str
    category: str = ""


class AssetRequestResponse(BaseModel):
    id: str
    employee_name: str | None = None
    employee_id: str | None = None
    category: str
    requested_asset_id: str | None = None
    requested_asset_name: str | None = None
    purpose: str
    expected_duration: str | None = None
    status: str
    created_at: datetime
