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
    
    // Check if user is a farmer
    if (currentUser.role !== 'farmer') {
        // Wrong role, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize dashboard
    initializeDashboard();
});

function initializeDashboard() {
    // Set farmer ID in form
    document.getElementById('farmerId').value = currentUser.id;
    
    // Load data
    loadMyTokens();
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

            if (tab === 'myTokens') loadMyTokens();
            if (tab === 'audit') loadAuditTrail();
        });
    });
    
    // Setup form submission
    document.getElementById('cropForm').addEventListener('submit', registerCrop);
}

// Update mini stats
async function updateStats() {
    try {
        const response = await fetch(`${API_BASE}/tokens`);
        const data = await response.json();
        
        const myTokens = data.tokens.filter(t => t.owner_id === currentUser.id || t.owner_id.includes('FARMER'));
        const listedTokens = myTokens.filter(t => t.status === 'LISTED');
        
        document.getElementById('myTotalCrops').textContent = myTokens.length;
        document.getElementById('myTotalTokens').textContent = myTokens.length;
        document.getElementById('myListedTokens').textContent = listedTokens.length;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Register crop
async function registerCrop(e) {
    e.preventDefault();
    
    const formData = {
        crop_type: document.getElementById('cropType').value,
        quantity: parseFloat(document.getElementById('quantity').value),
        quality_grade: document.getElementById('qualityGrade').value,
        mandi_id: document.getElementById('mandiId').value,
        farmer_id: currentUser.id
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
            document.getElementById('farmerId').value = currentUser.id;
            loadMyTokens();
            updateStats();
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

// Load my tokens
async function loadMyTokens() {
    try {
        const response = await fetch(`${API_BASE}/tokens`);
        const data = await response.json();
        
        const myTokens = data.tokens.filter(t => t.owner_id === currentUser.id || t.owner_id.includes('FARMER'));
        
        const list = document.getElementById('myTokensList');
        if (myTokens.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>You haven\'t registered any crops yet. Start by registering your first crop!</p></div>';
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
                ` : token.status === 'LISTED' ? `
                    <div style="text-align: center; padding: 1rem; background: rgba(245, 158, 11, 0.1); border-radius: 8px; margin-top: 1rem;">
                        <strong style="color: #f59e0b;">Listed on Marketplace</strong>
                    </div>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading my tokens:', error);
    }
}

// List token for sale
async function listToken(tokenId, sellerId) {
    if (!confirm('List this token on the marketplace for sale?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/tokens/list`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({token_id: tokenId, seller_id: sellerId})
        });

        const data = await response.json();
        if (data.success) {
            alert('✓ Token listed successfully on the marketplace!');
            loadMyTokens();
            updateStats();
        } else {
            alert('✗ ' + data.message);
        }
    } catch (error) {
        alert('✗ Error listing token: ' + error.message);
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