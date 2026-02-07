import json
import os
from datetime import datetime
from typing import List, Dict, Any
import hashlib

# File paths - Fixed version
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "data")
CROPS_FILE = os.path.join(DATA_DIR, "crops.json")
TOKENS_FILE = os.path.join(DATA_DIR, "tokens.json")
SETTLEMENTS_FILE = os.path.join(DATA_DIR, "settlements.json")
AUDIT_LOG_FILE = os.path.join(DATA_DIR, "audit_log.json")
PRICES_FILE = os.path.join(DATA_DIR, "prices.json")

def ensure_data_dir():
    """Create data directory if it doesn't exist"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    # Initialize empty files if they don't exist
    for file_path in [CROPS_FILE, TOKENS_FILE, SETTLEMENTS_FILE, AUDIT_LOG_FILE]:
        if not os.path.exists(file_path):
            with open(file_path, 'w') as f:
                json.dump([], f)

def load_json(file_path: str) -> List[Dict]:
    """Load JSON data from file"""
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                content = f.read()
                if not content.strip():
                    return []
                return json.loads(content)
        return []
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return []

def save_json(file_path: str, data: List[Dict]):
    """Save JSON data to file"""
    try:
        if not os.path.exists(os.path.dirname(file_path)):
            os.makedirs(os.path.dirname(file_path))
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    except Exception as e:
        print(f"Error saving {file_path}: {e}")

def generate_id(prefix: str) -> str:
    """Generate unique ID with timestamp"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
    return f"{prefix}_{timestamp}"

def generate_hash(data: str) -> str:
    """Generate SHA-256 hash"""
    return hashlib.sha256(data.encode()).hexdigest()

def load_crops() -> List[Dict]:
    """Load all crop assets"""
    return load_json(CROPS_FILE)

def save_crop(crop: Dict):
    """Save a new crop asset"""
    crops = load_crops()
    crops.append(crop)
    save_json(CROPS_FILE, crops)

def load_tokens() -> List[Dict]:
    """Load all tokens"""
    return load_json(TOKENS_FILE)

def save_token(token: Dict):
    """Save a new token"""
    tokens = load_tokens()
    tokens.append(token)
    save_json(TOKENS_FILE, tokens)

def update_token(token_id: str, updates: Dict):
    """Update an existing token"""
    tokens = load_tokens()
    for i, token in enumerate(tokens):
        if token['token_id'] == token_id:
            tokens[i].update(updates)
            save_json(TOKENS_FILE, tokens)
            return True
    return False

def load_settlements() -> List[Dict]:
    """Load all settlements"""
    return load_json(SETTLEMENTS_FILE)

def save_settlement(settlement: Dict):
    """Save a new settlement"""
    settlements = load_settlements()
    settlements.append(settlement)
    save_json(SETTLEMENTS_FILE, settlements)

def load_audit_log() -> List[Dict]:
    """Load audit log"""
    return load_json(AUDIT_LOG_FILE)

def save_audit_entry(entry: Dict):
    """Save a new audit log entry"""
    log = load_audit_log()
    log.append(entry)
    save_json(AUDIT_LOG_FILE, log)

def load_prices() -> List[Dict]:
    """Load price oracle data"""
    return load_json(PRICES_FILE)

def get_price(crop_type: str, mandi_id: str) -> float:
    """Get price for a crop from oracle"""
    prices = load_prices()
    for price in prices:
        if price['crop_type'] == crop_type and price['mandi_id'] == mandi_id:
            return price['price_per_kg']
    
    # Default fallback prices
    default_prices = {
        'wheat': 22.0,
        'rice': 28.0,
        'cotton': 45.0
    }
    return default_prices.get(crop_type.lower(), 20.0)

def find_token_by_id(token_id: str) -> Dict | None:
    """Find token by ID"""
    tokens = load_tokens()
    for token in tokens:
        if token['token_id'] == token_id:
            return token
    return None

def find_crop_by_id(crop_id: str) -> Dict | None:
    """Find crop by ID"""
    crops = load_crops()
    for crop in crops:
        if crop['crop_id'] == crop_id:
            return crop
    return None