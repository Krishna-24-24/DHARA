from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal
import hashlib
import json

class CropAsset(BaseModel):
    crop_id: str
    crop_type: str  # wheat, rice, cotton
    quantity: float  # in kg
    quality_grade: Literal["A", "B", "C"]
    mandi_id: str
    farmer_id: str
    timestamp: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CropToken(BaseModel):
    token_id: str
    linked_crop_id: str
    owner_id: str
    status: Literal["CREATED", "LISTED", "SOLD", "SETTLED"]
    audit_hash: str
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SettlementRecord(BaseModel):
    settlement_id: str
    token_id: str
    seller_id: str
    buyer_id: str
    price_per_kg: float
    quantity: float
    total_amount: float
    settlement_time: datetime
    settlement_status: Literal["PENDING", "COMPLETED", "FAILED"]
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AuditLogEntry(BaseModel):
    event_id: str
    event_type: str
    actor: str
    timestamp: datetime
    data: dict
    previous_hash: str
    current_hash: str
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    
    @staticmethod
    def calculate_hash(event_type: str, actor: str, timestamp: datetime, data: dict, previous_hash: str) -> str:
        """Calculate SHA-256 hash for audit trail"""
        content = f"{event_type}|{actor}|{timestamp.isoformat()}|{json.dumps(data, sort_keys=True)}|{previous_hash}"
        return hashlib.sha256(content.encode()).hexdigest()

class PriceOracle(BaseModel):
    crop_type: str
    mandi_id: str
    price_per_kg: float
    source: str
    timestamp: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Request/Response Models for API
class CropRegistrationRequest(BaseModel):
    crop_type: str
    quantity: float
    quality_grade: Literal["A", "B", "C"]
    mandi_id: str
    farmer_id: str

class TokenListingRequest(BaseModel):
    token_id: str
    seller_id: str

class TradeAcceptanceRequest(BaseModel):
    token_id: str
    buyer_id: str