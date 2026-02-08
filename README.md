# 🌾 DHARA - Agricultural Settlement Platform

**Revolutionizing Agricultural Trade with Blockchain Technology**

[![Platform](https://img.shields.io/badge/Platform-Web-blue.svg)](https://github.com)
[![Tech](https://img.shields.io/badge/Tech-Blockchain-green.svg)](https://github.com)
[![Status](https://img.shields.io/badge/Status-Demo-orange.svg)](https://github.com)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)

> A regulatory-compliant digital settlement system for agricultural assets using blockchain-inspired tokenization. Enables instant settlements (0.5s vs 7-15 days) with complete traceability and farmer-buyer role separation.

---

## 🎯 Problem Statement

India's agricultural markets involve massive value locked in crops traded through mandis, yet farmers face:
- **Slow Settlements**: 7-15 day settlement periods
- **Opaque Pricing**: Lack of transparent price discovery
- **Limited Access to Finance**: Restricted working capital
- **Poor Record-Keeping**: Manual, error-prone documentation

DHARA demonstrates how tokenizing real-world agricultural assets can enable faster settlement and transparency while maintaining regulatory compliance.

---

## ✨ Features

### 🌾 Core Platform Features

- **Crop Asset Modeling**: Structured representation with quality grades (A/B/C)
- **Digital Tokenization**: One-to-one mapping between crops and tokens
- **Instant Settlement**: Near-instant trade settlement (~0.5 seconds)
- **Price Oracle**: Real-time mandi price feeds (Pune, Mumbai, Nashik)
- **Blockchain Audit Trail**: SHA-256 tamper-evident logging
- **Compliance-First Design**: Non-speculative, settlement-only tokens

### 👥 Role-Based Dashboards

- **Farmer Dashboard**: Register crops, list tokens, track inventory
- **Buyer Dashboard**: Browse marketplace, manage wallet, purchase tokens
- **Separate Pages**: Dedicated interfaces for each user role
- **Session Persistence**: LocalStorage-based authentication

### 🎨 User Experience

- **📱 Responsive Design**: Mobile, tablet, and desktop optimized
- **📖 Documentation**: Complete platform guides and API reference
- **⚖️ Legal Pages**: Privacy policy, terms, compliance information

### 🔐 Security & Compliance

- **SHA-256 Hash Chaining**: Cryptographic security
- **Immutable Records**: Tamper-evident audit trail
- **Integrity Verification**: Blockchain validation
- **KYC/AML Framework**: Compliance-ready architecture
- **💰 Wallet System**: Secure fund management for buyers

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DHARA Platform                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐         ┌──────▼──────┐      ┌──────▼──────┐
   │ Farmer  │         │    Buyer    │      │   System    │
   │Dashboard│         │  Dashboard  │      │   Admin     │
   └────┬────┘         └──────┬──────┘      └──────┬──────┘
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Frontend Layer    │
                    │  (HTML/CSS/JS)     │
                    └─────────┬──────────┘
                              │ REST API
                    ┌─────────▼──────────┐
                    │  Backend Layer     │
                    │    (FastAPI)       │
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼─────┐        ┌──────▼──────┐      ┌─────▼──────┐
   │   Crop   │        │ Settlement  │      │   Price    │
   │Tokenizer │        │   Service   │      │   Oracle   │
   └────┬─────┘        └──────┬──────┘      └─────┬──────┘
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Data Layer       │
                    │  (JSON Storage)    │
                    │  + Audit Trail     │
                    └────────────────────┘
```

---

## 🛠️ Tech Stack

- **Backend**: Python + FastAPI
- **Storage**: JSON files (simulated database)
- **Hashing**: SHA-256 for audit trail
- **Frontend**: HTML + CSS + JavaScript
- **API**: RESTful architecture
- **Persistence**: LocalStorage for sessions

---

## 📁 Project Structure

```
DHARA/
│
├── backend/
│   ├── app.py                  # FastAPI application & routes
│   ├── models.py               # Pydantic data models
│   ├── services.py             # Business logic & tokenization
│   ├── utils.py                # Helper functions
│   └── requirements.txt        # Python dependencies
│
├── data/
│   ├── audit_log.json         # Blockchain audit trail
│   ├── crops.json             # Registered crops database
│   ├── prices.json            # Mandi price oracle
│   ├── settlements.json       # Settlement records
│   └── tokens.json            # Token registry
│
├── frontend/
│   ├── buyer-dashboard.html   # Buyer interface
│   ├── buyer-script.js        # Buyer dashboard logic
│   ├── compliance.html        # Compliance information
│   ├── farmer-dashboard.html # Farmer interface
│   ├── farmer-script.js      # Farmer dashboard logic
│   ├── index.html            # Homepage with login modal
│   ├── modal.css             # Modal & theme styles
│   ├── privacy.html          # Privacy policy
│   ├── script.js             # Homepage scripts
│   ├── style.css             # Main stylesheet
│   ├── terms.html            # Terms of service
│
└── README.md                  # This file
├── requirements.txt           # requirements
```

---

## 📋 Prerequisites

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **pip** (Python package manager)
- Modern web browser (Chrome, Firefox, Edge, Safari)

---

## 🚀 Installation & Setup

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Initialize Data Directory

The system automatically creates the `data/` directory on first run with:
- `crops.json` - Registered crops
- `tokens.json` - Crop tokens
- `settlements.json` - Settlement records
- `audit_log.json` - Tamper-evident audit trail
- `prices.json` - Mandi price oracle (pre-populated)

---

## ▶️ Running the Application

### Start the Backend Server

```bash
cd backend
python app.py
```

✅ API server starts at `http://localhost:8000`

### Start the Frontend

**Option A: Simple (Double-click)**
```bash
cd frontend
# Double-click index.html
```

**Option B: HTTP Server (Recommended)**
```bash
cd frontend
python -m http.server 8080
```

✅ Frontend available at `http://localhost:8080`

---

## 📖 Usage Guide

### Quick Start

1. **🏠 Access Platform**: Open `http://localhost:8080`
2. **👤 Select Role**: Click "Get Started" → Choose Farmer or Buyer
3. **🚀 Start Trading**: Auto-redirects to role-specific dashboard

---

### 🌾 Farmer Workflow

#### 1. Register a Crop

- Navigate to **"Register Crop"** tab
- Fill in crop details:
  - **Crop Type**: Wheat / Rice / Cotton
  - **Quantity**: In kilograms
  - **Quality Grade**: A (Premium) / B (Standard) / C (Basic)
  - **Mandi ID**: PUNE-MKT-01 / MUMBAI-MKT-02 / NASHIK-MKT-03
  - **Farmer ID**: Auto-filled
- Click **"Register & Tokenize Crop"**
- System creates crop asset + digital token

#### 2. List Token for Sale

- Go to **"My Tokens"** tab
- Find tokens with status **"CREATED"**
- Click **"List for Sale"**
- Token status → **"LISTED"**
- Now visible in buyer marketplace

#### 3. Track Inventory

- View all crops in **"My Tokens"**
- Check settlement status
- Verify in **"Audit Trail"** tab

---

### 🛒 Buyer Workflow

#### 1. Setup Wallet

- Starting balance: **₹50,000** (demo)
- Navigate to **"Wallet"** tab (optional)
- Enter amount to add
- Click **"Add Funds to Wallet"**

#### 2. Browse Marketplace

- Go to **"Marketplace"** tab
- View available tokens (filter: LISTED)
- Check details: crop type, quantity, grade, price

#### 3. Execute Settlement

- Select token
- Click **"Purchase Token"**
- Confirm transaction
- Settlement completes in **~0.5 seconds** ⚡
- Wallet auto-deducts
- Ownership transferred

#### 4. View Purchase History

- Check **"My Purchases"** tab
- See all settlements
- Verify in **"Audit Trail"**

---

### 🔐 View Audit Trail

- Navigate to **"Audit Trail"** tab
- See complete transaction history
- Click **"Verify Integrity"**
- Expand hash details (SHA-256 chain)

---

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

---

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

---

## 🧪 Testing the System

### Sample Test Flow

1. **Register Crop**:
   - Farmer: `FARMER_001`
   - Crop: Wheat, 1000kg, Grade A
   - Mandi: PUNE-MKT-01

2. **Verify Token Creation**:
   - Check "My Tokens" tab
   - Token status: "CREATED"

3. **List Token**:
   - Click "List for Sale"
   - Status → "LISTED"

4. **Execute Settlement**:
   - Login as Buyer
   - Purchase token
   - Settlement completes instantly
   - Token status: "SETTLED"

5. **Verify Audit Trail**:
   - All events logged
   - Hash chain intact
   - No tampering detected

---

## 📊 System Flow

```
FARMER                    SYSTEM                      BUYER
  │                         │                          │
  │──Login (Farmer)──────▶ │                          │
  │◀──Dashboard Loaded────│                          │
  │                         │                          │
  │──Register Crop──────▶  │                          │
  │                         │──Create Token──▶        │
  │◀────Token Created──────│                          │
  │                         │                          │
  │──List Token─────────▶  │                          │
  │                         │──Update Status──▶       │
  │                         │                          │
  │                         │◀──Login (Buyer)─────────│
  │                         │──Dashboard Loaded──▶    │
  │                         │                          │
  │                         │◀──Browse Marketplace────│
  │                         │──Show Listed Tokens──▶  │
  │                         │                          │
  │                         │◀──Purchase Token────────│
  │                         │──Check Wallet Balance──▶│
  │                         │──Fetch Price (Oracle)──▶│
  │                         │──Calculate Amount──▶    │
  │                         │──Transfer Token──▶      │
  │◀──Settlement Done──────│──Settlement Done──────▶ │
  │                         │──Deduct Wallet──▶       │
  │                         │──Log Audit Entry──▶     │
```

---

## 🎨 New Features

### 🌓 Dark/Light Theme Toggle
- Click moon/sun icon (top right)
- Seamless transition
- Saved in localStorage
- Works on all pages

### 📚 Documentation & Support
- **FAQ Page**: 20+ questions, accordion UI
- **Contact Form**: Multi-category system
- **Documentation**: Complete guides
- **Legal Pages**: Privacy, Terms, Compliance

### 🎯 Role Separation
- Dedicated dashboards
- Session management
- Auto-redirect protection
- Wallet system (buyers)

### 🎨 Enhanced UX
- Support card hover colors (Blue, Green, Purple, Red)
- Mini stats in headers
- Status badges
- Empty states

---

## 🎓 Hackathon Demo Tips

### What to Emphasize

1. **Speed**: 0.5s vs 7-15 days traditional settlement
2. **Transparency**: Complete audit trail
3. **Compliance**: Regulatory-aware design
4. **Role Separation**: Farmer/Buyer experiences
5. **Real Problem**: Addresses actual farmer pain points

### Demo Script

1. Show empty system (stats = 0)
2. Login as Farmer → Register 2-3 crops
3. List tokens for sale
4. Login as Buyer → Purchase tokens
5. Show instant settlement (0.5s)
6. Verify audit trail integrity
7. Toggle Dark/Light theme
8. Highlight compliance features

---

## 🚧 Future Enhancements

- Multi-signature settlement approval
- Quality verification via IoT sensors
- Integration with real mandi APIs
- Mobile app for farmers
- Advanced analytics dashboard
- Export compliance reports to PDF
- SMS notifications
- AI-powered price prediction

---

## 👥 Team & Contact

**Developed for FIN-001 Hackathon Challenge**  
Focus: Real-World Asset Tokenization for Agriculture

**Support**:
- Phone: +91 9917361620
- Email: support@dhara.platform

---

## 📄 License

Educational/Hackathon Project - Not for Production Use

---

## ⚠️ Important Disclaimer

**This is a DEMONSTRATION platform.**

- ❌ No real money processed
- ❌ No actual crops traded
- ❌ All transactions simulated
- ❌ Not licensed for commercial use

**Remember**: This is a simulation for demonstration purposes. No real money or assets are involved.

---

<div align="center">

### 💚 Built with Love for India's Farmers 💚

**DHARA** - Empowering Agriculture through Technology

© 2026 DHARA Platform. All Rights Reserved.

</div>
