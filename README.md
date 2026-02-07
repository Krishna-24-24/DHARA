# 🌾 Dhara

A regulatory-compliant digital settlement system for agricultural assets using blockchain-inspired tokenization.

## 🎯 Problem Statement

India's agricultural markets involve massive value locked in crops traded through mandis, yet farmers face:
- Slow settlements
- Opaque pricing
- Limited access to finance

This system demonstrates how tokenizing real-world agricultural assets can enable faster settlement and transparency while maintaining regulatory compliance.

## ✨ Features

- **Crop Asset Modeling**: Structured representation of crops with quality grades
- **Digital Tokenization**: One-to-one mapping between crops and tokens
- **Instant Settlement**: Simulated near-instant trade settlement (0.5s)
- **Price Oracle**: Simulated mandi price feeds
- **Audit Trail**: Tamper-evident blockchain-inspired logging
- **Compliance-First Design**: Non-speculative, settlement-only tokens

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Farmer    │────▶│  Crop Asset  │────▶│    Token    │
└─────────────┘     └──────────────┘     └─────────────┘
                            │                     │
                            ▼                     ▼
                    ┌──────────────┐      ┌─────────────┐
                    │ Price Oracle │      │  Settlement │
                    └──────────────┘      └─────────────┘
                            │                     │
                            └──────────┬──────────┘
                                       ▼
                              ┌─────────────────┐
                              │   Audit Trail   │
                              └─────────────────┘
```

## 🛠️ Tech Stack

- **Backend**: Python + FastAPI
- **Storage**: JSON files (simulated database)
- **Hashing**: SHA-256 for audit trail
- **Frontend**: HTML + CSS + Vanilla JavaScript
- **API**: RESTful architecture

## 📋 Prerequisites

- Python 3.8+
- pip (Python package manager)

## 🚀 Installation & Setup

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Initialize Data Directory

The system will automatically create the `data/` directory on first run with these files:
- `crops.json` - Registered crops
- `tokens.json` - Crop tokens
- `settlements.json` - Settlement records
- `audit_log.json` - Tamper-evident audit trail
- `prices.json` - Mandi price oracle data (pre-populated)

## ▶️ Running the Application

### Start the Backend Server

```bash
cd backend
python app.py
```

The API server will start at `http://localhost:8000`

### Open the Frontend

1. Open `frontend/index.html` in your web browser
2. Or use a simple HTTP server:

```bash
cd frontend
python -m http.server 8080
```

Then visit `http://localhost:8080`

## 📖 Usage Guide

### 1. Register a Crop

- Navigate to "Register Crop" tab
- Fill in crop details:
  - Crop Type (wheat/rice/cotton)
  - Quantity in kg
  - Quality Grade (A/B/C)
  - Mandi ID
  - Farmer ID
- Click "Register & Tokenize Crop"
- System automatically creates both crop asset and digital token

### 2. List Token for Sale

- Go to "View Tokens" tab
- Find tokens with status "CREATED"
- Click "List for Sale" button
- Token status changes to "LISTED"

### 3. Execute Settlement

- Navigate to "Execute Settlement" tab
- Enter Token ID and Buyer ID
- Click "Execute Settlement"
- System:
  - Fetches price from oracle
  - Calculates settlement amount
  - Transfers token ownership
  - Records in audit trail
  - Completes in ~0.5 seconds

### 4. View Audit Trail

- Go to "Audit Trail" tab
- See complete transaction history
- Click "Verify Integrity" to check for tampering
- Expand hash details to see cryptographic chain

## 🔌 API Endpoints

### Crops
- `POST /api/crops/register` - Register new crop
- `GET /api/crops` - Get all crops
- `GET /api/crops/{crop_id}` - Get specific crop

### Tokens
- `POST /api/tokens/list` - List token for sale
- `GET /api/tokens` - Get all tokens
- `GET /api/tokens/{token_id}` - Get specific token
- `GET /api/tokens/status/{status}` - Filter by status

### Settlements
- `POST /api/settlements/execute` - Execute trade
- `GET /api/settlements` - Get all settlements

### Audit
- `GET /api/audit/trail` - Get audit trail
- `GET /api/audit/verify` - Verify integrity

### System
- `GET /api/stats` - System statistics
- `GET /api/compliance/report` - Compliance report

## 🔒 Compliance & Regulatory Awareness

### Key Compliance Features

✅ **No Real Transactions**: All settlements are simulated  
✅ **Non-Speculative**: Tokens are settlement-only, not tradable assets  
✅ **KYC/AML Awareness**: Farmer IDs tracked throughout  
✅ **Audit Trail**: Complete tamper-evident transaction history  
✅ **Regulator Access**: Read-only audit trail for oversight  

### Regulatory Safeguards

- Tokens cannot be traded freely like cryptocurrency
- One-to-one mapping: 1 crop = 1 token = 1 settlement
- No public blockchain exposure
- Price determined by oracle, not market speculation
- Settlement-focused design

## 🧪 Testing the System

### Sample Test Flow

1. **Register Crop**:
   - Farmer: `FARMER_001`
   - Crop: Wheat, 1000kg, Grade A
   - Mandi: PUNE-MKT-01

2. **Verify Token Creation**:
   - Check "View Tokens" tab
   - Token status should be "CREATED"

3. **List Token**:
   - Click "List for Sale"
   - Status changes to "LISTED"

4. **Execute Settlement**:
   - Buyer: `TRADER_001`
   - Settlement completes instantly
   - Token status: "SETTLED"

5. **Verify Audit Trail**:
   - All events logged
   - Hash chain intact
   - No tampering detected

## 📊 System Flow

```
FARMER                    SYSTEM                      TRADER
  │                         │                           │
  │──Register Crop──────▶  │                           │
  │                         │──Create Token──▶         │
  │◀────Token Created──────│                           │
  │                         │                           │
  │──List Token─────────▶  │                           │
  │                         │──Update Status──▶        │
  │                         │                           │
  │                         │◀──Accept Trade──────────│
  │                         │──Fetch Price (Oracle)──▶ │
  │                         │──Calculate Amount──▶     │
  │                         │──Transfer Token──▶       │
  │◀──Settlement Done──────│──────Settlement Done──▶  │
  │                         │──Log Audit Entry──▶      │
```

## 🎓 Hackathon Demo Tips

### What to Emphasize

1. **Instant Settlement**: Traditional = days, This system = 0.5 seconds
2. **Transparency**: Full audit trail with tamper evidence
3. **Compliance**: Regulatory-aware design, not crypto speculation
4. **Simplicity**: No complex blockchain infrastructure needed
5. **Real Problem**: Addresses actual farmer pain points

### Demo Script

1. Show empty system (stats = 0)
2. Register 2-3 crops from different farmers
3. List tokens
4. Execute 1-2 settlements
5. Show audit trail and verify integrity
6. Highlight compliance features

### Judge Questions - Prepared Answers

**Q: Is this blockchain?**  
A: It's inspired by blockchain principles (immutability, audit trails) but focused on settlement logic, not cryptocurrency.

**Q: Is this legally compliant?**  
A: Yes - no real transactions, simulated data, non-speculative design, full audit trail for regulators.

**Q: What's the main benefit?**  
A: Reduces settlement delay from days to seconds while maintaining full transparency and compliance.

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is available

### Frontend can't connect
- Ensure backend is running on `http://localhost:8000`
- Check browser console for CORS errors
- Try different browser

### Data not persisting
- Check `data/` directory exists
- Verify file permissions
- Check disk space

## 📁 Project Structure

```
rwa-crop-tokenizer/
├── backend/
│   ├── app.py           # FastAPI application
│   ├── models.py        # Data models
│   ├── services.py      # Business logic
│   └── utils.py         # Helper functions
├── data/
│   ├── crops.json       # Crop assets
│   ├── tokens.json      # Digital tokens
│   ├── settlements.json # Settlement records
│   ├── audit_log.json   # Audit trail
│   └── prices.json      # Price oracle
├── frontend/
│   ├── index.html       # UI
│   └── style.css        # Styling
├── requirements.txt     # Dependencies
└── README.md           # This file
```

## 🚧 Future Enhancements

- Multi-signature settlement approval
- Quality verification via IoT sensors
- Integration with real mandi APIs
- Mobile app for farmers
- Advanced analytics dashboard
- Export compliance reports to PDF

## 👥 Team & Contact

Developed for FIN-001 Hackathon Challenge  
Focus: Real-World Asset Tokenization for Agriculture

## 📄 License

Educational/Hackathon Project - Not for Production Use

---

**Remember**: This is a simulation for demonstration purposes. No real money or assets are involved.