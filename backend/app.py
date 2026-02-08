from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    CropRegistrationRequest, TokenListingRequest, TradeAcceptanceRequest
)
from services import CropTokenizationService
from utils import (
    ensure_data_dir, load_crops, load_tokens, load_settlements,
    find_token_by_id, find_crop_by_id
)
from typing import List

# Initialize FastAPI app
app = FastAPI(
    title="RWA Crop Tokenizer",
    description="Blockchain-inspired settlement system for agricultural assets",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data directory on startup
@app.on_event("startup")
async def startup_event():
    ensure_data_dir()

# Health check
@app.get("/")
async def root():
    return {
        "message": "RWA Crop Tokenizer API",
        "status": "active",
        "version": "1.0.0"
    }

# === CROP ENDPOINTS ===

@app.post("/api/crops/register")
async def register_crop(request: CropRegistrationRequest):
    """Register a new crop and create its digital token"""
    try:
        result = CropTokenizationService.register_crop(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/crops")
async def get_all_crops():
    """Get all registered crops"""
    try:
        crops = load_crops()
        return {"success": True, "crops": crops, "total": len(crops)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/crops/{crop_id}")
async def get_crop(crop_id: str):
    """Get specific crop by ID"""
    try:
        crop = find_crop_by_id(crop_id)
        if not crop:
            raise HTTPException(status_code=404, detail="Crop not found")
        return {"success": True, "crop": crop}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === TOKEN ENDPOINTS ===

@app.post("/api/tokens/list")
async def list_token(request: TokenListingRequest):
    """List a token for sale"""
    try:
        result = CropTokenizationService.list_token(request)
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tokens")
async def get_all_tokens():
    """Get all tokens"""
    try:
        tokens = load_tokens()
        return {"success": True, "tokens": tokens, "total": len(tokens)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tokens/{token_id}")
async def get_token(token_id: str):
    """Get specific token by ID"""
    try:
        token = find_token_by_id(token_id)
        if not token:
            raise HTTPException(status_code=404, detail="Token not found")
        
        # Get linked crop details
        crop = find_crop_by_id(token['linked_crop_id'])
        
        return {
            "success": True,
            "token": token,
            "crop": crop
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tokens/status/{status}")
async def get_tokens_by_status(status: str):
    """Get tokens filtered by status"""
    try:
        tokens = load_tokens()
        filtered = [t for t in tokens if t['status'] == status.upper()]
        return {"success": True, "tokens": filtered, "total": len(filtered)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === SETTLEMENT ENDPOINTS ===

@app.post("/api/settlements/execute")
async def execute_settlement(request: TradeAcceptanceRequest):
    """Execute a trade and settlement"""
    try:
        result = CropTokenizationService.execute_trade(request)
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/settlements")
async def get_all_settlements():
    """Get all settlement records"""
    try:
        settlements = load_settlements()
        return {"success": True, "settlements": settlements, "total": len(settlements)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === AUDIT ENDPOINTS ===

@app.get("/api/audit/trail")
async def get_audit_trail():
    """Get complete audit trail"""
    try:
        trail = CropTokenizationService.get_audit_trail()
        return {
            "success": True,
            "audit_trail": trail,
            "total_events": len(trail)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/audit/verify")
async def verify_audit_trail():
    """Verify integrity of audit trail"""
    try:
        result = CropTokenizationService.verify_audit_integrity()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === DASHBOARD STATS ===

@app.get("/api/stats")
async def get_stats():
    """Get system statistics"""
    try:
        crops = load_crops()
        tokens = load_tokens()
        settlements = load_settlements()
        
        token_status_count = {}
        for token in tokens:
            status = token['status']
            token_status_count[status] = token_status_count.get(status, 0) + 1
        
        total_volume = sum(s['total_amount'] for s in settlements)
        
        return {
            "success": True,
            "stats": {
                "total_crops": len(crops),
                "total_tokens": len(tokens),
                "total_settlements": len(settlements),
                "token_status_breakdown": token_status_count,
                "total_settlement_volume": total_volume,
                "avg_settlement_value": total_volume / len(settlements) if settlements else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === COMPLIANCE ===

@app.get("/api/compliance/report")
async def get_compliance_report():
    """Generate compliance report"""
    try:
        audit_verification = CropTokenizationService.verify_audit_integrity()
        crops = load_crops()
        tokens = load_tokens()
        settlements = load_settlements()
        
        return {
            "success": True,
            "compliance_report": {
                "audit_trail_integrity": audit_verification,
                "total_registered_farmers": len(set(c['farmer_id'] for c in crops)),
                "total_active_tokens": len([t for t in tokens if t['status'] in ['CREATED', 'LISTED']]),
                "total_completed_settlements": len([s for s in settlements if s['settlement_status'] == 'COMPLETED']),
                "regulatory_notes": [
                    "No real financial transactions executed",
                    "All settlements are simulated",
                    "KYC/AML awareness implemented via farmer_id tracking",
                    "Full audit trail maintained with tamper-evidence",
                    "Tokens are non-speculative and settlement-only"
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
