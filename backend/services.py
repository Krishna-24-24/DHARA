from datetime import datetime
from models import (
    CropAsset, CropToken, SettlementRecord, AuditLogEntry, PriceOracle,
    CropRegistrationRequest, TokenListingRequest, TradeAcceptanceRequest
)
from utils import (
    generate_id, save_crop, save_token, save_settlement, save_audit_entry,
    load_audit_log, get_price, find_token_by_id, find_crop_by_id, update_token
)
import json

class CropTokenizationService:
    """Core service for crop tokenization and settlement"""
    
    @staticmethod
    def register_crop(request: CropRegistrationRequest) -> dict:
        """Register a new crop and create its token"""
        # Create crop asset
        crop_id = generate_id(f"CROP_{request.crop_type.upper()}")
        
        crop = CropAsset(
            crop_id=crop_id,
            crop_type=request.crop_type,
            quantity=request.quantity,
            quality_grade=request.quality_grade,
            mandi_id=request.mandi_id,
            farmer_id=request.farmer_id,
            timestamp=datetime.now()
        )
        
        # Save crop
        save_crop(crop.model_dump())
        
        # Create corresponding token
        token = CropTokenizationService._create_token(crop)
        
        # Log to audit trail
        CropTokenizationService._log_event(
            event_type="CROP_REGISTERED",
            actor=request.farmer_id,
            data={
                "crop_id": crop_id,
                "crop_type": request.crop_type,
                "quantity": request.quantity,
                "quality_grade": request.quality_grade
            }
        )
        
        return {
            "success": True,
            "crop": crop.model_dump(),
            "token": token.model_dump(),
            "message": "Crop registered and tokenized successfully"
        }
    
    @staticmethod
    def _create_token(crop: CropAsset) -> CropToken:
        """Create a token for a crop asset"""
        token_id = generate_id("TOKEN")
        
        # Create audit hash
        audit_data = f"{token_id}|{crop.crop_id}|{crop.farmer_id}|{datetime.now().isoformat()}"
        audit_hash = AuditLogEntry.calculate_hash(
            "TOKEN_CREATED",
            crop.farmer_id,
            datetime.now(),
            {"crop_id": crop.crop_id},
            "0" * 64  # Genesis hash
        )
        
        token = CropToken(
            token_id=token_id,
            linked_crop_id=crop.crop_id,
            owner_id=crop.farmer_id,
            status="CREATED",
            audit_hash=audit_hash,
            created_at=datetime.now()
        )
        
        save_token(token.model_dump())
        
        # Log token creation
        CropTokenizationService._log_event(
            event_type="TOKEN_CREATED",
            actor=crop.farmer_id,
            data={
                "token_id": token_id,
                "crop_id": crop.crop_id
            }
        )
        
        return token
    
    @staticmethod
    def list_token(request: TokenListingRequest) -> dict:
        """List a token for sale"""
        token = find_token_by_id(request.token_id)
        
        if not token:
            return {"success": False, "message": "Token not found"}
        
        if token['owner_id'] != request.seller_id:
            return {"success": False, "message": "Unauthorized: You don't own this token"}
        
        if token['status'] != "CREATED":
            return {"success": False, "message": f"Token cannot be listed. Current status: {token['status']}"}
        
        # Update token status
        update_token(request.token_id, {"status": "LISTED"})
        
        # Log listing
        CropTokenizationService._log_event(
            event_type="TOKEN_LISTED",
            actor=request.seller_id,
            data={"token_id": request.token_id}
        )
        
        return {
            "success": True,
            "message": "Token listed successfully",
            "token_id": request.token_id
        }
    
    @staticmethod
    def execute_trade(request: TradeAcceptanceRequest) -> dict:
        """Execute trade and settlement"""
        token = find_token_by_id(request.token_id)
        
        if not token:
            return {"success": False, "message": "Token not found"}
        
        if token['status'] != "LISTED":
            return {"success": False, "message": f"Token not available for trade. Status: {token['status']}"}
        
        # Get linked crop
        crop = find_crop_by_id(token['linked_crop_id'])
        if not crop:
            return {"success": False, "message": "Linked crop not found"}
        
        # Get price from oracle
        price_per_kg = get_price(crop['crop_type'], crop['mandi_id'])
        total_amount = price_per_kg * crop['quantity']
        
        # Create settlement record
        settlement_id = generate_id("SETTLEMENT")
        settlement = SettlementRecord(
            settlement_id=settlement_id,
            token_id=request.token_id,
            seller_id=token['owner_id'],
            buyer_id=request.buyer_id,
            price_per_kg=price_per_kg,
            quantity=crop['quantity'],
            total_amount=total_amount,
            settlement_time=datetime.now(),
            settlement_status="COMPLETED"
        )
        
        save_settlement(settlement.model_dump())
        
        # Update token ownership and status
        update_token(request.token_id, {
            "owner_id": request.buyer_id,
            "status": "SETTLED"
        })
        
        # Log settlement
        CropTokenizationService._log_event(
            event_type="TRADE_SETTLED",
            actor=request.buyer_id,
            data={
                "token_id": request.token_id,
                "settlement_id": settlement_id,
                "seller": token['owner_id'],
                "buyer": request.buyer_id,
                "amount": total_amount
            }
        )
        
        return {
            "success": True,
            "message": "Trade executed and settled successfully",
            "settlement": settlement.model_dump(),
            "settlement_time_seconds": 0.5  # Simulated instant settlement
        }
    
    @staticmethod
    def _log_event(event_type: str, actor: str, data: dict):
        """Add entry to audit log"""
        audit_log = load_audit_log()
        
        # Get previous hash
        previous_hash = audit_log[-1]['current_hash'] if audit_log else "0" * 64
        
        event_id = generate_id("EVENT")
        timestamp = datetime.now()
        
        current_hash = AuditLogEntry.calculate_hash(
            event_type, actor, timestamp, data, previous_hash
        )
        
        entry = AuditLogEntry(
            event_id=event_id,
            event_type=event_type,
            actor=actor,
            timestamp=timestamp,
            data=data,
            previous_hash=previous_hash,
            current_hash=current_hash
        )
        
        save_audit_entry(entry.model_dump())
    
    @staticmethod
    def get_audit_trail() -> list:
        """Retrieve complete audit trail"""
        return load_audit_log()
    
    @staticmethod
    def verify_audit_integrity() -> dict:
        """Verify integrity of audit trail"""
        log = load_audit_log()
        
        if not log:
            return {"valid": True, "message": "Audit log is empty"}
        
        for i in range(1, len(log)):
            expected_prev_hash = log[i-1]['current_hash']
            actual_prev_hash = log[i]['previous_hash']
            
            if expected_prev_hash != actual_prev_hash:
                return {
                    "valid": False,
                    "message": f"Audit trail tampered at entry {i}",
                    "entry_id": log[i]['event_id']
                }
        
        return {
            "valid": True,
            "message": "Audit trail integrity verified",
            "total_entries": len(log)
        }