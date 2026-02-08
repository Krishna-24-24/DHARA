const API_BASE = 'http://localhost:8000/api';

// User state
let currentUser = {
    role: null, // 'farmer' or 'buyer'
    id: null,
    wallet: 50000 // Starting wallet balance for buyers
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('dharaUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
});

// Smooth scroll functions
function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

function scrollToDashboard() {
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
}

// Login Modal
function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('loginModal').style.display = 'none';
}

// Login as role
function loginAs(role) {
    currentUser.role = role;
    currentUser.id = role === 'farmer' ? `FARMER_${Date.now()}` : `BUYER_${Date.now()}`;
    
    // Save to localStorage
    localStorage.setItem('dharaUser', JSON.stringify(currentUser));
    
    closeLoginModal();
    showDashboard();
}

// Show dashboard based on role
function showDashboard() {
    // Hide hero section, show dashboard
    document.querySelector('.hero-section').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    // Update header
    const roleBadge = document.getElementById('userRoleBadge');
    roleBadge.textContent = currentUser.role === 'farmer' ? '🌾 Farmer' : '🛒 Buyer';
    roleBadge.className = `user-role-badge ${currentUser.role}`;
    
    // Update wallet
    updateWalletDisplay();
    
    // Show appropriate tabs
    setupTabs();
    
    // Load initial data
    if (currentUser.role === 'farmer') {
        loadMyTokens();
    } else {
        loadTokens();
        loadPurchases();
    }
    loadAuditTrail();
    
    // Scroll to dashboard
    scrollToDashboard();
}

// Setup tabs based on role
function setupTabs() {
    const tabNav = document.getElementById('tabNavigation');
    
    if (currentUser.role === 'farmer') {
        document.getElementById('farmerTabs').style.display = 'block';
        document.getElementById('buyerTabs').style.display = 'none';
        
        tabNav.innerHTML = `
            <button class="tab-btn active" data-tab="register" data-role="farmer">
                <span class="tab-icon">📝</span>
                <span>Register Crop</span>
            </button>
            <button class="tab-btn" data-tab="myTokens" data-role="farmer">
                <span class="tab-icon">🌾</span>
                <span>My Tokens</span>
            </button>
            <button class="tab-btn" data-tab="audit">
                <span class="tab-icon">🔐</span>
                <span>Audit Trail</span>
            </button>
        `;
    } else {
        document.getElementById('farmerTabs').style.display = 'none';
        document.getElementById('buyerTabs').style.display = 'block';
        
        tabNav.innerHTML = `
            <button class="tab-btn active" data-tab="marketplace" data-role="buyer">
                <span class="tab-icon">🏪</span>
                <span>Marketplace</span>
            </button>
            <button class="tab-btn" data-tab="purchases" data-role="buyer">
                <span class="tab-icon">📦</span>
                <span>My Purchases</span>
            </button>
            <button class="tab-btn" data-tab="wallet" data-role="buyer">
                <span class="tab-icon">💰</span>
                <span>Wallet</span>
            </button>
            <button class="tab-btn" data-tab="audit">
                <span class="tab-icon">🔐</span>
                <span>Audit Trail</span>
            </button>
        `;
    }
    
    // Add tab click handlers
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tab + 'Tab').classList.add('active');

            if (tab === 'marketplace') loadTokens();
            if (tab === 'purchases') loadPurchases();
            if (tab === 'myTokens') loadMyTokens();
            if (tab === 'audit') loadAuditTrail();
        });
    });
    
    // Setup form handlers
    if (currentUser.role === 'farmer') {
        document.getElementById('cropForm').addEventListener('submit', registerCrop);
    } else {
        document.getElementById('addFundsForm').addEventListener('submit', addFunds);
        document.getElementById('statusFilter').value = 'LISTED';
        document.getElementById('statusFilter').addEventListener('change', loadTokens);
    }
}

// Update wallet display
function updateWalletDisplay() {
    if (currentUser.role === 'buyer') {
        document.getElementById('walletDisplay').style.display = 'flex';
        document.getElementById('walletBalance').textContent = '₹' + currentUser.wallet.toLocaleString();
        const walletBalanceLarge = document.getElementById('walletBalanceLarge');
        if (walletBalanceLarge) {
            walletBalanceLarge.textContent = '₹' + currentUser.wallet.toLocaleString();
        }
    } else {
        document.getElementById('walletDisplay').style.display = 'none';
    }
}

// Add funds to wallet
function addFunds(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('addAmount').value);
    
    currentUser.wallet += amount;
    localStorage.setItem('dharaUser', JSON.stringify(currentUser));
    
    updateWalletDisplay();
    document.getElementById('addFundsForm').reset();
    
    alert(`✓ Successfully added ₹${amount.toLocaleString()} to your wallet!`);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('dharaUser');
        currentUser = { role: null, id: null, wallet: 50000 };
        
        document.querySelector('.hero-section').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('heroTotalCrops').textContent = data.stats.total_crops;
            document.getElementById('heroTotalVolume').textContent = '₹' + data.stats.total_settlement_volume.toFixed(0);
            document.getElementById('heroSettlements').textContent = data.stats.total_settlements;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Register crop (Farmer only)
async function registerCrop(e) {
    e.preventDefault();
    
    const formData = {
        crop_type: document.getElementById('cropType').value,
        quantity: parseFloat(document.getElementById('quantity').value),
        quality_grade: document.getElementById('qualityGrade').value,
        mandi_id: document.getElementById('mandiId').value,
        farmer_id: document.getElementById('farmerId').value || currentUser.id
    };

    try {
        const response = await fetch(`${API_BASE}/crops/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        const resultDiv = document.getElementById('registerResult');
        
        if (data.success) {
            resultDiv.className = 'result-message success';
            resultDiv.innerHTML = `
                <h3>✓ Crop Successfully Tokenized!</h3>
                <div class="result-details">
                    <p><strong>Crop ID:</strong> ${data.crop.crop_id}</p>
                    <p><strong>Token ID:</strong> ${data.token.token_id}</p>
                    <p><strong>Status:</strong> <span class="badge badge-created">${data.token.status}</span></p>
                </div>
            `;
            document.getElementById('cropForm').reset();
            loadStats();
            loadMyTokens();
        } else {
            resultDiv.className = 'result-message error';
            resultDiv.innerHTML = `<p>✗ ${data.message}</p>`;
        }
    } catch (error) {
        const resultDiv = document.getElementById('registerResult');
        resultDiv.className = 'result-message error';
        resultDiv.innerHTML = `<p>✗ Error: ${error.message}</p>`;
    }
}

// Load my tokens (Farmer only)
async function loadMyTokens() {
    try {
        const response = await fetch(`${API_BASE}/tokens`);
        const data = await response.json();
        
        const myTokens = data.tokens.filter(t => t.owner_id === currentUser.id || t.owner_id.includes('FARMER'));
        
        const list = document.getElementById('myTokensList');
        if (myTokens.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>You haven\'t registered any crops yet</p></div>';
            return;
        }

        list.innerHTML = myTokens.map(token => `
            <div class="token-card">
                <div class="token-header">
                    <span class="token-id">${token.token_id.substring(0, 20)}...</span>
                    <span class="badge badge-${token.status.toLowerCase()}">${token.status}</span>
                </div>
                <div class="token-body">
                    <div class="token-detail">
                        <span class="detail-label">Crop ID</span>
                        <span class="detail-value">${token.linked_crop_id}</span>
                    </div>
                    <div class="token-detail">
                        <span class="detail-label">Owner</span>
                        <span class="detail-value">${token.owner_id}</span>
                    </div>
                    <div class="token-detail">
                        <span class="detail-label">Created</span>
                        <span class="detail-value">${new Date(token.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                ${token.status === 'CREATED' ? `
                    <button class="btn-secondary btn-block" onclick="listToken('${token.token_id}', '${token.owner_id}')">
                        List for Sale
                    </button>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading my tokens:', error);
    }
}

// Load marketplace tokens (Buyer view)
async function loadTokens() {
    const statusFilter = document.getElementById('statusFilter');
    const status = statusFilter ? statusFilter.value : 'LISTED';
    const url = status ? `${API_BASE}/tokens/status/${status}` : `${API_BASE}/tokens`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const tokensList = document.getElementById('tokensList');
        if (data.tokens.length === 0) {
            tokensList.innerHTML = '<div class="empty-state"><p>No tokens available for purchase</p></div>';
            return;
        }

        // For each token, fetch crop details to get price
        const tokensWithPrice = await Promise.all(data.tokens.map(async (token) => {
            try {
                const cropResponse = await fetch(`${API_BASE}/crops/${token.linked_crop_id}`);
                const cropData = await cropResponse.json();
                if (cropData.success) {
                    // Get price from oracle
                    const price = await getPrice(cropData.crop.crop_type, cropData.crop.mandi_id);
                    return { ...token, crop: cropData.crop, price: price * cropData.crop.quantity };
                }
            } catch (err) {
                console.error('Error fetching crop:', err);
            }
            return { ...token, price: 0 };
        }));

        tokensList.innerHTML = tokensWithPrice.map(token => `
            <div class="token-card">
                <div class="token-header">
                    <span class="token-id">${token.token_id.substring(0, 20)}...</span>
                    <span class="badge badge-${token.status.toLowerCase()}">${token.status}</span>
                </div>
                <div class="token-body">
                    <div class="token-detail">
                        <span class="detail-label">Crop Type</span>
                        <span class="detail-value">${token.crop ? token.crop.crop_type : 'N/A'}</span>
                    </div>
                    <div class="token-detail">
                        <span class="detail-label">Quantity</span>
                        <span class="detail-value">${token.crop ? token.crop.quantity + ' kg' : 'N/A'}</span>
                    </div>
                    <div class="token-detail">
                        <span class="detail-label">Grade</span>
                        <span class="detail-value">${token.crop ? 'Grade ' + token.crop.quality_grade : 'N/A'}</span>
                    </div>
                </div>
                ${token.price > 0 ? `<div class="token-price">₹${token.price.toFixed(2)}</div>` : ''}
                ${token.status === 'LISTED' && currentUser.role === 'buyer' ? `
                    <button class="btn-purchase btn-block" onclick="purchaseToken('${token.token_id}', ${token.price})">
                        Purchase Token
                    </button>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tokens:', error);
    }
}

// Get price from backend
async function getPrice(cropType, mandiId) {
    const defaultPrices = {
        'wheat': 22,
        'rice': 28,
        'cotton': 45
    };
    return defaultPrices[cropType] || 20;
}

// List token for sale (Farmer)
async function listToken(tokenId, sellerId) {
    try {
        const response = await fetch(`${API_BASE}/tokens/list`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({token_id: tokenId, seller_id: sellerId})
        });

        const data = await response.json();
        if (data.success) {
            alert('✓ Token listed successfully!');
            loadMyTokens();
            loadStats();
        } else {
            alert('✗ ' + data.message);
        }
    } catch (error) {
        alert('✗ Error listing token');
    }
}

// Purchase token (Buyer)
async function purchaseToken(tokenId, price) {
    // Check wallet balance
    if (currentUser.wallet < price) {
        alert('✗ Insufficient funds! Please add money to your wallet.');
        return;
    }
    
    if (!confirm(`Purchase this token for ₹${price.toFixed(2)}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/settlements/execute`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                token_id: tokenId,
                buyer_id: currentUser.id
            })
        });

        const data = await response.json();
        
        if (data.success) {
            // Deduct from wallet
            currentUser.wallet -= price;
            localStorage.setItem('dharaUser', JSON.stringify(currentUser));
            updateWalletDisplay();
            
            alert(`✓ Purchase successful! ₹${price.toFixed(2)} deducted from wallet.`);
            loadStats();
            loadTokens();
            loadPurchases();
            loadAuditTrail();
        } else {
            alert('✗ ' + data.message);
        }
    } catch (error) {
        alert('✗ Error: ' + error.message);
    }
}

// Load purchases (Buyer)
async function loadPurchases() {
    try {
        const response = await fetch(`${API_BASE}/settlements`);
        const data = await response.json();
        
        const myPurchases = data.settlements.filter(s => s.buyer_id === currentUser.id);
        
        const list = document.getElementById('purchasesList');
        if (myPurchases.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>No purchases yet</p></div>';
            return;
        }

        list.innerHTML = myPurchases.map(s => `
            <div class="settlement-card">
                <div class="settlement-header">
                    <span class="settlement-id">${s.settlement_id}</span>
                    <span class="badge badge-completed">${s.settlement_status}</span>
                </div>
                <div class="settlement-flow">
                    <span class="party">${s.seller_id}</span>
                    <span class="arrow">→</span>
                    <span class="party">${s.buyer_id}</span>
                </div>
                <div class="settlement-amount">₹${s.total_amount.toFixed(2)}</div>
                <div class="settlement-meta">${s.quantity}kg @ ₹${s.price_per_kg}/kg</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading purchases:', error);
    }
}

// Load audit trail
async function loadAuditTrail() {
    try {
        const response = await fetch(`${API_BASE}/audit/trail`);
        const data = await response.json();
        
        const trail = document.getElementById('auditTrail');
        if (data.audit_trail.length === 0) {
            trail.innerHTML = '<div class="empty-state"><p>No audit events yet</p></div>';
            return;
        }

        trail.innerHTML = data.audit_trail.map((entry, idx) => `
            <div class="audit-block">
                <div class="block-number">Block #${idx + 1}</div>
                <div class="block-content">
                    <div class="block-header">
                        <span class="event-type">${entry.event_type}</span>
                        <span class="event-time">${new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="block-actor">Actor: ${entry.actor}</div>
                    <div class="block-data">${JSON.stringify(entry.data)}</div>
                    <div class="block-hash">
                        <span class="hash-label">Hash:</span>
                        <span class="hash-value">${entry.current_hash.substring(0, 32)}...</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading audit trail:', error);
    }
}

// Verify integrity
async function verifyAuditIntegrity() {
    try {
        const response = await fetch(`${API_BASE}/audit/verify`);
        const data = await response.json();
        
        const resultDiv = document.getElementById('verificationResult');
        if (data.valid) {
            resultDiv.className = 'verification-result success';
            resultDiv.innerHTML = `<p>✓ ${data.message} - ${data.total_entries} entries verified</p>`;
        } else {
            resultDiv.className = 'verification-result error';
            resultDiv.innerHTML = `<p>✗ ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Error verifying integrity:', error);
    }
}