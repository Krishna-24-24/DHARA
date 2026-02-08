const API_BASE = 'http://localhost:8000/api';

// User state
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('dharaUser');
    if (!savedUser) {
        // Not logged in, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(savedUser);
    
    // Check if user is a buyer
    if (currentUser.role !== 'buyer') {
        // Wrong role, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize dashboard
    initializeDashboard();
});

function initializeDashboard() {
    // Update wallet display
    updateWalletDisplay();
    
    // Load data
    loadTokens();
    loadPurchases();
    loadAuditTrail();
    updateStats();
    
    // Setup tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tab + 'Tab').classList.add('active');

            if (tab === 'marketplace') loadTokens();
            if (tab === 'purchases') loadPurchases();
            if (tab === 'audit') loadAuditTrail();
        });
    });
    
    // Setup form submission
    document.getElementById('addFundsForm').addEventListener('submit', addFunds);
    
    // Setup filter
    document.getElementById('statusFilter').value = 'LISTED';
    document.getElementById('statusFilter').addEventListener('change', loadTokens);
}

// Update wallet display
function updateWalletDisplay() {
    document.getElementById('walletBalance').textContent = '₹' + currentUser.wallet.toLocaleString();
    const walletBalanceLarge = document.getElementById('walletBalanceLarge');
    if (walletBalanceLarge) {
        walletBalanceLarge.textContent = '₹' + currentUser.wallet.toLocaleString();
    }
}

// Update mini stats
async function updateStats() {
    try {
        const [tokensResponse, settlementsResponse] = await Promise.all([
            fetch(`${API_BASE}/tokens/status/LISTED`),
            fetch(`${API_BASE}/settlements`)
        ]);
        
        const tokensData = await tokensResponse.json();
        const settlementsData = await settlementsResponse.json();
        
        const myPurchasesList = settlementsData.settlements.filter(s => s.buyer_id === currentUser.id);
        const totalSpent = myPurchasesList.reduce((sum, s) => sum + s.total_amount, 0);
        
        document.getElementById('availableTokens').textContent = tokensData.tokens.length;
        document.getElementById('myPurchases').textContent = myPurchasesList.length;
        document.getElementById('totalSpent').textContent = '₹' + totalSpent.toLocaleString();
    } catch (error) {
        console.error('Error updating stats:', error);
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
    
    const resultDiv = document.getElementById('walletResult');
    resultDiv.className = 'result-message success';
    resultDiv.innerHTML = `<p>✓ Successfully added ₹${amount.toLocaleString()} to your wallet!</p>`;
    
    setTimeout(() => {
        resultDiv.innerHTML = '';
        resultDiv.className = '';
    }, 3000);
}

// Load marketplace tokens
async function loadTokens() {
    const statusFilter = document.getElementById('statusFilter');
    const status = statusFilter ? statusFilter.value : 'LISTED';
    const url = status ? `${API_BASE}/tokens/status/${status}` : `${API_BASE}/tokens`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const tokensList = document.getElementById('tokensList');
        if (data.tokens.length === 0) {
            tokensList.innerHTML = '<div class="empty-state"><p>No tokens available for purchase at the moment</p></div>';
            return;
        }

        // For each token, fetch crop details to get price
        const tokensWithPrice = await Promise.all(data.tokens.map(async (token) => {
            try {
                const cropResponse = await fetch(`${API_BASE}/crops/${token.linked_crop_id}`);
                const cropData = await cropResponse.json();
                if (cropData.success) {
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
                        <span class="detail-value">${token.crop ? token.crop.crop_type.toUpperCase() : 'N/A'}</span>
                    </div>
                    <div class="token-detail">
                        <span class="detail-label">Quantity</span>
                        <span class="detail-value">${token.crop ? token.crop.quantity + ' kg' : 'N/A'}</span>
                    </div>
                    <div class="token-detail">
                        <span class="detail-label">Grade</span>
                        <span class="detail-value">${token.crop ? 'Grade ' + token.crop.quality_grade : 'N/A'}</span>
                    </div>
                    <div class="token-detail">
                        <span class="detail-label">Location</span>
                        <span class="detail-value">${token.crop ? token.crop.mandi_id : 'N/A'}</span>
                    </div>
                </div>
                ${token.price > 0 ? `<div class="token-price">₹${token.price.toLocaleString()}</div>` : ''}
                ${token.status === 'LISTED' ? `
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

// Purchase token
async function purchaseToken(tokenId, price) {
    // Check wallet balance
    if (currentUser.wallet < price) {
        alert('✗ Insufficient funds! Please add money to your wallet.\n\nRequired: ₹' + price.toLocaleString() + '\nYour Balance: ₹' + currentUser.wallet.toLocaleString());
        return;
    }
    
    if (!confirm(`Purchase this token for ₹${price.toLocaleString()}?`)) {
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
            
            alert(`✓ Purchase successful!\n\n₹${price.toLocaleString()} deducted from wallet.\nNew Balance: ₹${currentUser.wallet.toLocaleString()}`);
            loadTokens();
            loadPurchases();
            loadAuditTrail();
            updateStats();
        } else {
            alert('✗ Purchase failed: ' + data.message);
        }
    } catch (error) {
        alert('✗ Error: ' + error.message);
    }
}

// Load purchases
async function loadPurchases() {
    try {
        const response = await fetch(`${API_BASE}/settlements`);
        const data = await response.json();
        
        const myPurchases = data.settlements.filter(s => s.buyer_id === currentUser.id);
        
        const list = document.getElementById('purchasesList');
        if (myPurchases.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>No purchases yet. Browse the marketplace to get started!</p></div>';
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
                    <span class="party">${s.buyer_id} (You)</span>
                </div>
                <div class="settlement-amount">₹${s.total_amount.toLocaleString()}</div>
                <div class="settlement-meta">${s.quantity}kg @ ₹${s.price_per_kg}/kg • ${new Date(s.settlement_time).toLocaleDateString()}</div>
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

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('dharaUser');
        window.location.href = 'index.html';
    }
}