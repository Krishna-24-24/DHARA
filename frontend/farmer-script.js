// Blockchain connector
import { getContract } from "./blockchain.js";

const API_BASE = 'http://localhost:8000/api';

// User state
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {

    const savedUser = localStorage.getItem('dharaUser');

    if (!savedUser) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = JSON.parse(savedUser);

    if (currentUser.role !== 'farmer') {
        window.location.href = 'index.html';
        return;
    }

    initializeDashboard();
});

function initializeDashboard() {

    document.getElementById('farmerId').value = currentUser.id;

    loadMyTokens();
    loadAuditTrail();
    updateStats();

    document.querySelectorAll('.tab-btn').forEach(btn => {

        btn.addEventListener('click', () => {

            const tab = btn.dataset.tab;

            document.querySelectorAll('.tab-btn')
                .forEach(b => b.classList.remove('active'));

            document.querySelectorAll('.tab-content')
                .forEach(t => t.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(tab + 'Tab').classList.add('active');

            if (tab === 'myTokens') loadMyTokens();
            if (tab === 'audit') loadAuditTrail();
        });
    });

    document
        .getElementById('cropForm')
        .addEventListener('submit', registerCrop);
}


// =======================
// REGISTER CROP (BLOCKCHAIN)
// =======================

async function registerCrop(e) {

    e.preventDefault();

    const cropType = document.getElementById('cropType').value;
    const quantity = document.getElementById('quantity').value;

    // Demo pricing logic (you can change later)
    const price = quantity * 0.001;

    try {

        // Connect blockchain
        const contract = await getContract();

        // Create token on blockchain
        const tx = await contract.createAsset(
            cropType,
            ethers.parseEther(price.toString())
        );

        // Wait for confirmation
        await tx.wait();

        alert("✅ Token created on Blockchain!");

        // Save reference in backend (optional)
        await fetch(`${API_BASE}/crops/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                crop_type: cropType,
                quantity,
                farmer_id: currentUser.id,
                txHash: tx.hash
            })
        });

        loadMyTokens();
        updateStats();

    } catch (err) {

        console.error(err);

        alert("❌ Blockchain Error: " + err.message);
    }
}


// =======================
// STATS
// =======================

async function updateStats() {

    try {

        const response = await fetch(`${API_BASE}/tokens`);
        const data = await response.json();

        const myTokens = data.tokens.filter(
            t => t.owner_id === currentUser.id ||
                 t.owner_id.includes('FARMER')
        );

        const listedTokens =
            myTokens.filter(t => t.status === 'LISTED');

        document.getElementById('myTotalCrops').textContent =
            myTokens.length;

        document.getElementById('myTotalTokens').textContent =
            myTokens.length;

        document.getElementById('myListedTokens').textContent =
            listedTokens.length;

    } catch (error) {

        console.error('Error updating stats:', error);
    }
}


// =======================
// LOAD TOKENS
// =======================

async function loadMyTokens() {

    try {

        const response = await fetch(`${API_BASE}/tokens`);
        const data = await response.json();

        const myTokens = data.tokens.filter(
            t => t.owner_id === currentUser.id ||
                 t.owner_id.includes('FARMER')
        );

        const list = document.getElementById('myTokensList');

        if (myTokens.length === 0) {

            list.innerHTML =
                '<div class="empty-state">' +
                '<p>No crops yet</p>' +
                '</div>';

            return;
        }

        list.innerHTML = myTokens.map(token => `

            <div class="token-card">

                <div class="token-header">
                    <span class="token-id">
                        ${token.token_id.substring(0, 20)}...
                    </span>

                    <span class="badge badge-${token.status.toLowerCase()}">
                        ${token.status}
                    </span>
                </div>

                <div class="token-body">

                    <div class="token-detail">
                        <span class="detail-label">Crop ID</span>
                        <span class="detail-value">
                            ${token.linked_crop_id}
                        </span>
                    </div>

                    <div class="token-detail">
                        <span class="detail-label">Owner</span>
                        <span class="detail-value">
                            ${token.owner_id}
                        </span>
                    </div>

                </div>

            </div>

        `).join('');

    } catch (error) {

        console.error('Error loading tokens:', error);
    }
}


// =======================
// AUDIT TRAIL
// =======================

async function loadAuditTrail() {

    try {

        const response =
            await fetch(`${API_BASE}/audit/trail`);

        const data = await response.json();

        const trail =
            document.getElementById('auditTrail');

        if (data.audit_trail.length === 0) {

            trail.innerHTML =
                '<div class="empty-state">' +
                '<p>No audit yet</p>' +
                '</div>';

            return;
        }

        trail.innerHTML = data.audit_trail.map(entry => `

            <div class="audit-block">

                <div class="block-header">
                    ${entry.event_type}
                </div>

                <div>
                    ${new Date(entry.timestamp).toLocaleString()}
                </div>

            </div>

        `).join('');

    } catch (error) {

        console.error('Audit error:', error);
    }
}


// =======================
// LOGOUT
// =======================

function logout() {

    if (confirm('Logout?')) {

        localStorage.removeItem('dharaUser');

        window.location.href = 'index.html';
    }
}
