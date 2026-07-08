from datetime import datetime, timezone

from pydantic import BaseModel, Field


class AssetCreateRequest(BaseModel):
    asset_name: str = Field(min_length=1, max_length=120)
    asset_location_id: str = Field(min_length=1, max_length=50)
    asset_serial_no: str = Field(min_length=1, max_length=80)
    category: str = Field(min_length=1, max_length=80)
    manufacturer: str = Field(min_length=1, max_length=120)
    model: str = Field(min_length=1, max_length=120)


class AssetAssignRequest(BaseModel):
    emp_id: str = Field(min_length=1, max_length=50)


class AssetScanRequest(BaseModel):
    qr_token: str = Field(min_length=1)


class AssignedEmployeeSummary(BaseModel):
    id: str
    name: str | None = None
    emp_id: str | None = None
    email: str

    model_config = {"from_attributes": True}


class AssetResponse(BaseModel):
    id: str
    asset_name: str
    asset_location_id: str
    asset_serial_no: str
    category: str = ""
    manufacturer: str = ""
    model: str = ""
    qr_token: str
    status: str
    assigned_to: AssignedEmployeeSummary | None = None
    assigned_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AssetCreateResponse(BaseModel):
    asset: AssetResponse
    qr_code_data_url: str


class AssetHistoryResponse(BaseModel):
    id: str
    action: str
    employee_id: str | None = None
    employee_name: str | None = None
    notes: str | None = None
    performed_by_email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AssetActionResponse(BaseModel):
    message: str
    asset: AssetResponse
