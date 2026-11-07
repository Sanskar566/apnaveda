// ==========================================
// apnaVeda™ - Complete Firebase Cloud Engine
// ==========================================

// 1. Firebase Configuration & Initialization
const firebaseConfig = {
  apiKey: "AIzaSyAwaWZrrvMK-ySVJLuTSZy9dPf6ZwMDNKc",
  authDomain: "apnaveda-b71dd.firebaseapp.com",
  projectId: "apnaveda-b71dd",
  storageBucket: "apnaveda-b71dd.firebasestorage.app",
  messagingSenderId: "757724960467",
  appId: "1:757724960467:web:f4bd04cb8bed1bf4a32626",
  measurementId: "G-2D4CYL9MFL"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Global cache for instant access
let globalOrders = [];
let globalCustomers = [];
let globalCashbacks = [];

// Page load hone par sabhi real-time listeners chalu karein
document.addEventListener("DOMContentLoaded", function () {
    initRealtimeListeners();
});

// 2. Main Real-time Sync Engine (Live from Firestore)
function initRealtimeListeners() {
    // A. Orders Listener
    db.collection("orders").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        globalOrders = [];
        snapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            globalOrders.push(data);
        });
        renderOrdersList();
        renderDashboardCounters();
    }, (error) => {
        console.error("Orders sync error:", error);
        fallbackLocalOrders();
    });

    // B. Customers Directory Listener
    db.collection("users").onSnapshot((snapshot) => {
        globalCustomers = [];
        snapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            globalCustomers.push(data);
        });
        renderCustomersDirectory();
        renderDashboardCounters();
    }, (error) => {
        console.error("Customers sync error:", error);
    });

    // C. Cashback Requests Listener
    db.collection("cashbacks").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        globalCashbacks = [];
        snapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            globalCashbacks.push(data);
        });
        renderCashbackRequests();
    }, (error) => {
        console.error("Cashbacks sync error:", error);
    });

    // D. Affiliates Tab Listener Hook
    const affBtn = document.querySelector('button[onclick*="tab-affiliates"]');
    if (affBtn) {
        affBtn.addEventListener('click', () => {
            setTimeout(renderAdminAffiliates, 50);
        });
    }
}

// Fallback agar Firestore offline ho
function fallbackLocalOrders() {
    globalOrders = JSON.parse(localStorage.getItem('apnaVeda_orders') || '[]');
    renderOrdersList();
    renderDashboardCounters();
}

// 3. Tab Switching Logic
function showTab(tabId, btnElement) {
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => pane.style.display = 'none');

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));

    const activePane = document.getElementById(tabId);
    if (activePane) {
        activePane.style.display = 'block';
    }

    if (btnElement) {
        btnElement.classList.add('active');
    }
}

// 4. Dashboard Counters (Orders, Revenue, Customers)
function renderDashboardCounters() {
    const statOrders = document.getElementById('stat-orders');
    if (statOrders) {
        statOrders.innerText = globalOrders.length;
    }

    let totalRevenue = 0;
    globalOrders.forEach(o => {
        if (o.status !== 'Cancelled') {
            (o.items || []).forEach(it => {
                totalRevenue += (Number(it.price) || 0) * (Number(it.quantity) || 1);
            });
            if (o.totalAmount && !o.items) {
                totalRevenue += Number(o.totalAmount) || 0;
            }
        }
    });

    const statRevenue = document.getElementById('stat-revenue');
    if (statRevenue) {
        statRevenue.innerText = "₹" + totalRevenue.toLocaleString('en-IN');
    }

    const statUsers = document.getElementById('stat-users');
    if (statUsers) {
        statUsers.innerText = globalCustomers.length;
    }
}

// 5. Orders Table & Dispatch / Courier Update (Firestore Direct)
function renderOrdersList() {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    if (globalOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888; padding: 25px;">No orders found yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    globalOrders.forEach(o => {
        const itemsTxt = (o.items || []).map(i => `${i.name || 'Product'} (x${i.quantity || 1})`).join(", ") || (o.productName || 'Direct Order');
        const status = o.status || "Confirmed";
        const orderIdentifier = o.id || o.orderId;

        tbody.innerHTML += `
            <tr>
                <td><strong>${o.orderId || orderIdentifier.slice(0, 8)}</strong></td>
                <td>
                    <strong>${o.name || 'Customer'}</strong><br>
                    <a href="https://wa.me/91${o.phone}" target="_blank" style="color: #2e7d32; font-weight: bold; text-decoration: none;">${o.phone || ''} ↗</a>
                </td>
                <td>${o.address || ''}, ${o.city || ''} - ${o.pincode || ''}</td>
                <td>${itemsTxt}</td>
                <td><span class="badge ${o.paymentMethod === 'COD' ? 'badge-pending' : 'badge-delivered'}">${o.paymentMethod || 'COD'}</span></td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:3px;">
                        <select id="st-${orderIdentifier}" style="padding:2px;">
                            <option value="Confirmed" ${status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="Shipped" ${status === 'Shipped' ? 'selected' : ''}>Shipped 🚚</option>
                            <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>Delivered 🏠</option>
                            <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>Cancelled ✕</option>
                        </select>
                        <select id="cr-${orderIdentifier}" style="padding:2px; font-size:11px;">
                            <option value="Delhivery" ${o.courierName === 'Delhivery' ? 'selected' : ''}>Delhivery</option>
                            <option value="Shiprocket" ${o.courierName === 'Shiprocket' ? 'selected' : ''}>Shiprocket</option>
                            <option value="Shree Anjani" ${o.courierName === 'Shree Anjani' ? 'selected' : ''}>Shree Anjani</option>
                            <option value="India Post" ${o.courierName === 'India Post' ? 'selected' : ''}>India Post</option>
                        </select>
                        <input type="text" id="awb-${orderIdentifier}" placeholder="AWB / Docket" value="${o.awbNumber || ''}" style="padding:2px; font-size:11px;">
                        <button onclick="saveTracking('${orderIdentifier}')" class="btn-green" style="padding:3px; font-size:11px; cursor:pointer;">Save Cloud</button>
                    </div>
                </td>
                <td>${o.orderDate || (o.createdAt ? new Date(o.createdAt.toDate ? o.createdAt.toDate() : o.createdAt).toLocaleDateString('en-IN') : 'Recent')}</td>
            </tr>
        `;
    });
}

// Courier Tracking Direct to Firestore
function saveTracking(docId) {
    const statusElem = document.getElementById(`st-${docId}`);
    const courierElem = document.getElementById(`cr-${docId}`);
    const awbElem = document.getElementById(`awb-${docId}`);

    if (!statusElem || !courierElem || !awbElem) return;

    const status = statusElem.value;
    const courier = courierElem.value;
    const awb = awbElem.value.trim();

    db.collection("orders").doc(docId).set({
        status: status,
        courierName: courier,
        awbNumber: awb,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
    .then(() => {
        alert(`✓ Order updated successfully in Firestore Cloud!`);
    })
    .catch((error) => {
        console.error("Firestore update error:", error);
        alert("Firestore error: " + error.message);
    });
}

// 6. Customers Directory & Leads
function renderCustomersDirectory() {
    const tbody = document.getElementById('customers-tbody');
    if (!tbody) return;

    const userMap = new Map();

    globalCustomers.forEach(u => {
        if (u.phone) {
            userMap.set(u.phone, {
                name: u.name || "Customer",
                phone: u.phone,
                email: u.email || "N/A",
                date: u.createdAt ? new Date(u.createdAt.toDate ? u.createdAt.toDate() : u.createdAt).toLocaleDateString('en-IN') : "Registered"
            });
        }
    });

    globalOrders.forEach(o => {
        if (o.phone && !userMap.has(o.phone)) {
            userMap.set(o.phone, {
                name: o.name || "Customer",
                phone: o.phone,
                email: o.email || "N/A",
                date: o.orderDate || "Ordered"
            });
        }
    });

    const list = Array.from(userMap.values());
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888; padding: 25px;">No customer records found yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    list.forEach((c, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${c.name}</strong></td>
                <td><a href="tel:${c.phone}" style="color: #2e7d32; font-weight: bold; text-decoration: none;">${c.phone}</a></td>
                <td>${c.email}</td>
                <td>${c.date}</td>
                <td>
                    <a href="https://wa.me/91${c.phone}?text=Namaste%20${encodeURIComponent(c.name)}" target="_blank" style="padding: 4px 8px; background: #25D366; color: white; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold;">WhatsApp ↗</a>
                </td>
            </tr>
        `;
    });
}

// Download Customer CSV
function downloadCustomerExcel() {
    const userMap = new Map();
    globalCustomers.forEach(u => {
        if (u.phone) userMap.set(u.phone, { name: u.name || "Customer", phone: u.phone, email: u.email || "", date: "Registered" });
    });
    globalOrders.forEach(o => {
        if (o.phone && !userMap.has(o.phone)) userMap.set(o.phone, { name: o.name || "Customer", phone: o.phone, email: o.email || "", date: o.orderDate || "" });
    });

    const list = Array.from(userMap.values());
    if (list.length === 0) {
        alert("No customers to export!");
        return;
    }

    let csv = "data:text/csv;charset=utf-8,Sr No,Customer Name,Mobile Number,Email,Date\n";
    list.forEach((c, i) => {
        csv += `${i + 1},"${c.name}","'${c.phone}","${c.email}","${c.date}"\n`;
    });

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `apnaVeda_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 7. Cashback Table & Actions (Cloud Connected)
function renderCashbackRequests() {
    const tbody = document.getElementById('cashback-tbody');
    if (!tbody) return;

    if (globalCashbacks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888; padding: 25px;">No cashback claims submitted yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    globalCashbacks.forEach((cl, idx) => {
        const isPaid = cl.status === 'Approved' || cl.status === 'Paid';
        const docId = cl.id || ('CB' + idx);

        tbody.innerHTML += `
            <tr>
                <td><strong>${cl.claimId || docId.slice(0, 8)}</strong></td>
                <td><span class="badge badge-used">${cl.couponCode || 'COUPON'} (USED)</span></td>
                <td><strong>${cl.name || 'Customer'}</strong><br><small>${cl.phone || ''}</small></td>
                <td><strong style="color: #1b5e20;">${cl.upiId || ''}</strong></td>
                <td>${cl.date || (cl.createdAt ? new Date(cl.createdAt.toDate ? cl.createdAt.toDate() : cl.createdAt).toLocaleDateString('en-IN') : 'Recent')}</td>
                <td><span class="badge ${isPaid ? 'badge-delivered' : 'badge-pending'}">${cl.status || 'Pending'}</span></td>
                <td>
                    ${!isPaid ? `
                        <button onclick="markCashbackPaid('${docId}')" class="btn-green" style="padding: 4px 8px; font-size: 11px; cursor:pointer;">Pay ₹30 UPI</button>
                    ` : '<span style="color:#1b5e20; font-weight:bold;">✓ Paid</span>'}
                </td>
            </tr>
        `;
    });
}

// Mark Cashback as Paid in Firestore
function markCashbackPaid(docId) {
    if (!confirm("क्या आपने इस ग्राहक को ₹30 UPI भेज दिया है?")) return;

    db.collection("cashbacks").doc(docId).set({
        status: 'Approved',
        paidAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
    .then(() => {
        alert("✓ Cashback marked as Approved in Firestore!");
    })
    .catch((err) => {
        alert("Error: " + err.message);
    });
}

// 8. Direct Hero Banner to Firestore Cloud
function uploadDirectHeroBanner(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const scale = Math.min(1, MAX_WIDTH / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

            // Save directly to Firestore Site Settings
            db.collection("settings").doc("homepage").set({
                heroBanner: compressedBase64,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }).then(() => {
                const preview = document.getElementById('hero-banner-preview-area');
                if (preview) {
                    preview.innerHTML = `
                        <img src="${compressedBase64}" style="max-height: 60px; border-radius: 4px; border: 1px solid #1b5e20; margin-top: 4px; display: block;">
                        <span style="font-size: 11px; color: #16a34a; font-weight: bold;">✓ Banner live on Firestore!</span>
                    `;
                }
                alert("✓ Hero Banner Live Firestore par update ho gaya!");
            }).catch(err => {
                alert("Banner upload error: " + err.message);
            });
        };
    };
    reader.readAsDataURL(file);
}

// 9. Direct PC se NABL Lab PDF/Image attach karne ka logic (Cloud Saved)
function uploadDirectLabDoc(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
        alert("Firestore me direct save ke liye file size 1MB se kam hona chahiye!");
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const fileData = e.target.result;
        const linkInput = document.getElementById('lab-pdf-link');
        if (linkInput) {
            linkInput.value = fileData;
        }

        const statusBox = document.getElementById('lab-upload-status');
        if (statusBox) {
            statusBox.innerHTML = `<span style="color:#16a34a; font-weight:bold;">✓ ${file.name} attached & ready to save!</span>`;
        }
    };
    reader.readAsDataURL(file);
}

// 10. Direct Lab Report Save to Firestore
function saveDirectLabReport() {
    const p = (document.getElementById('lab-product') || {}).value;
    const b = (document.getElementById('lab-batch') || {}).value;
    const l = (document.getElementById('lab-name') || {}).value;
    const s = (document.getElementById('lab-summary') || {}).value;
    const f = (document.getElementById('lab-pdf-link') || {}).value;

    if (!p || !f) {
        alert("Product name aur Document select karein!");
        return;
    }

    db.collection("lab_reports").add({
        product: p,
        batch: b || '',
        lab: l || '',
        summary: s || '',
        pdfLink: f,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("✓ NABL Lab Report Firestore Cloud me Successfully Save Ho Gayi!");
        const form = document.getElementById('lab-form');
        if (form) form.reset();
    }).catch(err => {
        alert("Error saving lab report: " + err.message);
    });
}

// 11. Affiliate Partners (Cloud Synced)
function renderAdminAffiliates() {
    const tbody = document.getElementById('admin-affiliate-tbody');
    if (!tbody) return;

    db.collection("affiliates").get().then((snapshot) => {
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:18px; color:#94a3b8;">अभी तक कोई एफिलिएट पार्टनर रजिस्टर नहीं हुआ है।</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        snapshot.forEach((doc) => {
            const p = doc.data();
            const phone = doc.id;
            const pay = p.payout || {};

            let bankInfo = '<span style="color:#94a3b8; font-size:11px;">डिटेल्स नहीं भरी</span>';
            if (pay.upi || pay.account) {
                bankInfo = `
                    <div style="font-size:11px; line-height:1.4;">
                        <strong>${pay.name || 'N/A'}</strong><br>
                        ${pay.upi ? `<span style="color:#0284c7; font-weight:bold;">UPI: ${pay.upi}</span><br>` : ''}
                        ${pay.account ? `<span>A/C: ${pay.account}</span><br><span>IFSC: ${pay.ifsc}</span>` : ''}
                    </div>
                `;
            }

            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e2e8f0';
            tr.innerHTML = `
                <td style="padding:10px;"><strong>${phone}</strong></td>
                <td style="padding:10px;">${p.clicks || 0}</td>
                <td style="padding:10px;">${p.orders || 0}</td>
                <td style="padding:10px;">₹${p.salesTotal || 0}</td>
                <td style="padding:10px; color:#16a34a; font-weight:bold; font-size:14px;">₹${p.commission || 0}</td>
                <td style="padding:10px;">${bankInfo}</td>
                <td style="padding:10px;">
                    <button type="button" style="background:#166534; color:#fff; padding:6px 12px; font-size:11px; border-radius:4px; border:none; cursor:pointer; font-weight:bold;" onclick="payAffiliateCommission('${phone}', ${p.commission || 0})">Mark as Paid</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }).catch(err => {
        console.error("Affiliate fetch error:", err);
    });
}

function payAffiliateCommission(phone, dueAmount) {
    if (dueAmount <= 0) {
        alert("इस पार्टनर का कोई कमीशन बाकी नहीं है!");
        return;
    }

    if (!confirm(`${phone} को ₹${dueAmount} का कमीशन ट्रांसफर कर दिया गया है? इसे 0 सेट करें?`)) {
        return;
    }

    db.collection("affiliates").doc(phone).set({
        commission: 0,
        lastPaidAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(() => {
        renderAdminAffiliates();
        alert(`✓ ${phone} का कमीशन सफलता पूर्वक 'Paid' मार्क कर दिया गया!`);
    }).catch(err => alert("Error: " + err.message));
}
