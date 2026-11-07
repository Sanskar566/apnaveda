// Firebase Configuration & Initialization
const firebaseConfig = {
  apiKey: "AIzaSyAwaWZrrvMK-ySVJLuTSZy9dPf6ZwMDNKc",
  authDomain: "apnaveda-b71dd.firebaseapp.com",
  projectId: "apnaveda-b71dd",
  storageBucket: "apnaveda-b71dd.firebasestorage.app",
  messagingSenderId: "757724960467",
  appId: "1:757724960467:web:f4bd04cb8bed1bf4a32626",
  measurementId: "G-2D4CYL9MFL"
};

// Initialize Firebase & Firestore
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
// apnaVeda™ - Complete Admin Control Engine

// Page load hone par sabhi data render karein
document.addEventListener("DOMContentLoaded", function () {
    refreshAllAdminData();
});

// Main refresh function
function refreshAllAdminData() {
    loadDashboardCounters();
    loadOrdersList();
    loadCustomersDirectory();
    loadCashbackRequests();
}

// Tab Switching Logic
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

// 1. Dashboard Counters (Orders, Revenue, Customers)
function loadDashboardCounters() {
    const orders = JSON.parse(localStorage.getItem('apnaVeda_orders') || '[]');
    const statOrders = document.getElementById('stat-orders');
    if (statOrders) {
        statOrders.innerText = orders.length;
    }

    let totalRevenue = 0;
    orders.forEach(o => {
        if (o.status !== 'Cancelled') {
            (o.items || []).forEach(it => {
                totalRevenue += (Number(it.price) || 0) * (Number(it.quantity) || 1);
            });
        }
    });

    const statRevenue = document.getElementById('stat-revenue');
    if (statRevenue) {
        statRevenue.innerText = "₹" + totalRevenue.toLocaleString('en-IN');
    }

    const registeredUsers = JSON.parse(localStorage.getItem('apnaVeda_registered_customers') || '[]');
    const statUsers = document.getElementById('stat-users');
    if (statUsers) {
        statUsers.innerText = registeredUsers.length;
    }
}

// 2. Orders Table & Dispatch / Courier Update
function loadOrdersList() {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    const orders = JSON.parse(localStorage.getItem('apnaVeda_orders') || '[]');

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888; padding: 25px;">No orders found yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    orders.slice().reverse().forEach(o => {
        const itemsTxt = (o.items || []).map(i => `${i.name} (x${i.quantity || 1})`).join(", ");
        const status = o.status || "Confirmed";

        tbody.innerHTML += `
            <tr>
                <td><strong>${o.orderId || 'N/A'}</strong></td>
                <td>
                    <strong>${o.name || 'Customer'}</strong><br>
                    <a href="https://wa.me/91${o.phone}" target="_blank" style="color: #2e7d32; font-weight: bold; text-decoration: none;">${o.phone} ↗</a>
                </td>
                <td>${o.address || ''}, ${o.city || ''} - ${o.pincode || ''}</td>
                <td>${itemsTxt}</td>
                <td><span class="badge ${o.paymentMethod === 'COD' ? 'badge-pending' : 'badge-delivered'}">${o.paymentMethod || 'COD'}</span></td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:3px;">
                        <select id="st-${o.orderId}" style="padding:2px;">
                            <option value="Confirmed" ${status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="Shipped" ${status === 'Shipped' ? 'selected' : ''}>Shipped 🚚</option>
                            <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>Delivered 🏠</option>
                            <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>Cancelled ✕</option>
                        </select>
                        <select id="cr-${o.orderId}" style="padding:2px; font-size:11px;">
                            <option value="Delhivery" ${o.courierName === 'Delhivery' ? 'selected' : ''}>Delhivery</option>
                            <option value="Shiprocket" ${o.courierName === 'Shiprocket' ? 'selected' : ''}>Shiprocket</option>
                            <option value="Shree Anjani" ${o.courierName === 'Shree Anjani' ? 'selected' : ''}>Shree Anjani</option>
                            <option value="India Post" ${o.courierName === 'India Post' ? 'selected' : ''}>India Post</option>
                        </select>
                        <input type="text" id="awb-${o.orderId}" placeholder="AWB / Docket" value="${o.awbNumber || ''}" style="padding:2px; font-size:11px;">
                        <button onclick="saveTracking('${o.orderId}')" class="btn-green" style="padding:3px; font-size:11px;">Save</button>
                    </div>
                </td>
                <td>${o.orderDate || 'Recent'}</td>
            </tr>
        `;
    });
}

// Courier details save function
function saveTracking(orderId) {
    const status = document.getElementById(`st-${orderId}`).value;
    const courier = document.getElementById(`cr-${orderId}`).value;
    const awb = document.getElementById(`awb-${orderId}`).value.trim();

    let orders = JSON.parse(localStorage.getItem('apnaVeda_orders') || '[]');
    orders = orders.map(o => {
        if (o.orderId === orderId) {
            o.status = status;
            o.courierName = courier;
            o.awbNumber = awb;
        }
        return o;
    });

    localStorage.setItem('apnaVeda_orders', JSON.stringify(orders));
    alert(`Order ${orderId} updated successfully to: ${status} via ${courier}!`);
    refreshAllAdminData();
}

// 3. Customers Directory & Leads
function loadCustomersDirectory() {
    const tbody = document.getElementById('customers-tbody');
    if (!tbody) return;

    const regUsers = JSON.parse(localStorage.getItem('apnaVeda_registered_customers') || '[]');
    const orders = JSON.parse(localStorage.getItem('apnaVeda_orders') || '[]');

    const userMap = new Map();
    regUsers.forEach(u => {
        if (u.phone) {
            userMap.set(u.phone, {
                name: u.name || "Customer",
                phone: u.phone,
                email: u.email || "N/A",
                date: u.date || "Registered"
            });
        }
    });

    orders.forEach(o => {
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
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888; padding: 25px;">No customer records yet.</td></tr>`;
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

// Download Excel / CSV
function downloadCustomerExcel() {
    const regUsers = JSON.parse(localStorage.getItem('apnaVeda_registered_customers') || '[]');
    const orders = JSON.parse(localStorage.getItem('apnaVeda_orders') || '[]');
    const userMap = new Map();

    regUsers.forEach(u => {
        if (u.phone) userMap.set(u.phone, { name: u.name || "Customer", phone: u.phone, email: u.email || "", date: u.date || "" });
    });
    orders.forEach(o => {
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

// 4. Cashback Table & Single-Use Coupon Check
function loadCashbackRequests() {
    const tbody = document.getElementById('cashback-tbody');
    if (!tbody) return;

    const claims = JSON.parse(localStorage.getItem('apnaVeda_cashbacks') || '[]');

    if (claims.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888; padding: 25px;">No cashback claims submitted yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    claims.slice().reverse().forEach((cl, idx) => {
        const isPaid = cl.status === 'Approved';
        tbody.innerHTML += `
            <tr>
                <td><strong>${cl.claimId || ('CB' + (idx + 101))}</strong></td>
                <td><span class="badge badge-used">${cl.couponCode || 'COUPON'} (USED)</span></td>
                <td><strong>${cl.name || 'Customer'}</strong><br><small>${cl.phone || ''}</small></td>
                <td><strong style="color: #1b5e20;">${cl.upiId || ''}</strong></td>
                <td>${cl.date || 'Recent'}</td>
                <td><span class="badge ${isPaid ? 'badge-delivered' : 'badge-pending'}">${cl.status || 'Pending'}</span></td>
                <td>
                    ${!isPaid ? `
                        <button onclick="markCashbackPaid(${idx})" class="btn-green" style="padding: 4px 8px; font-size: 11px;">Pay ₹30 UPI</button>
                    ` : '<span style="color:#1b5e20; font-weight:bold;">✓ Paid</span>'}
                </td>
            </tr>
        `;
    });
}

// Mark Cashback as Paid
function markCashbackPaid(idx) {
    let claims = JSON.parse(localStorage.getItem('apnaVeda_cashbacks') || '[]');
    claims[idx].status = 'Approved';
    localStorage.setItem('apnaVeda_cashbacks', JSON.stringify(claims));
    alert("Cashback marked as Paid!");
    loadCashbackRequests();
}
// Direct PC से Hero Banner Compress और Read करने का logic
function uploadDirectHeroBanner(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200; // Banner की क्लैरिटी और स्पीड बैलेंस रखने के लिए
            const scale = Math.min(1, MAX_WIDTH / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

            const bannerInput = document.getElementById('set-banner-url') || document.querySelector('input[value*="banner"]');
            if (bannerInput) bannerInput.value = compressedBase64;

            const preview = document.getElementById('hero-banner-preview-area');
            if (preview) {
                preview.innerHTML = `
                    <img src="${compressedBase64}" style="max-height: 60px; border-radius: 4px; border: 1px solid #1b5e20; margin-top: 4px; display: block;">
                    <span style="font-size: 11px; color: #16a34a; font-weight: bold;">✓ Banner ready to save</span>
                `;
            }
        };
    };
    reader.readAsDataURL(file);
}
// Direct PC se NABL Lab PDF/Image attach karne ka logic
function uploadDirectLabDoc(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert("File size 2MB se kam hona chahiye!");
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
            statusBox.innerHTML = `<span style="color:#16a34a; font-weight:bold;">✓ ${file.name} successfully attached!</span>`;
        }
    };
    reader.readAsDataURL(file);
}
// Universal Auto-Extract NABL Report Viewer
function viewLabReport(productKey) {
    try {
        let labs = JSON.parse(localStorage.getItem('apnaVeda_labs') || 'null');
        if (!labs || labs.length === 0) {
            labs = JSON.parse(localStorage.getItem('apnaVeda_lab_reports') || '[]');
        }

        if (!labs || labs.length === 0) {
            alert("कृपया पहले एडमिन पैनल से लैब रिपोर्ट सेव करें!");
            return;
        }

        // सबसे पहली या मैचिंग रिपोर्ट चुनें
        const pKey = (productKey || '').toLowerCase();
        let item = labs.find(l => JSON.stringify(l).toLowerCase().includes(pKey)) || labs[0];

        // ऑब्जेक्ट के अंदर की हर वैल्यू में फ़ाइल/PDF ढूँढें
        let targetFile = null;
        for (let key in item) {
            let val = String(item[key] || '');
            if (val.startsWith('data:') || val.startsWith('http') || val.includes('.pdf') || val.includes('blob:') || val.includes('.jpg') || val.includes('.png')) {
                targetFile = val;
                break;
            }
        }

        // अगर ऑब्जेक्ट खुद ही स्ट्रिंग है
        if (!targetFile && typeof item === 'string' && (item.startsWith('data:') || item.startsWith('http'))) {
            targetFile = item;
        }

        if (!targetFile) {
            alert("फ़ाइल डेटा नहीं मिल सका। कृपया एडमिन पैनल से फ़ाइल दोबारा चुनकर सेव करें।");
            return;
        }

        // फ़ाइल को नए टैब/विंडो में खोलें
        if (targetFile.startsWith('data:application/pdf')) {
            const pdfWindow = window.open("");
            if (pdfWindow) {
                pdfWindow.document.write(
                    `<html><head><title>NABL Lab Certificate</title></head><body style="margin:0;"><iframe src="${targetFile}" frameborder="0" style="width:100%;height:100vh;border:none;"></iframe></body></html>`
                );
            } else {
                window.location.href = targetFile;
            }
        } else {
            const imgWindow = window.open("");
            if (imgWindow) {
                imgWindow.document.write(
                    `<html><head><title>NABL Lab Certificate</title><body style="margin:0;background:#0b0f19;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="${targetFile}" style="max-width:95%;max-height:95vh;box-shadow:0 10px 30px rgba(0,0,0,0.8);border-radius:6px;"></body></html>`
                );
            } else {
                window.location.href = targetFile;
            }
        }

    } catch (err) {
        console.error("View Error:", err);
        alert("त्रुटि: " + err.message);
    }
}
// Render Affiliate Table with Bank Details in Admin
function renderAdminAffiliates() {
    const tbody = document.getElementById('admin-affiliate-tbody');
    if (!tbody) return;

    const affData = JSON.parse(localStorage.getItem('apnaVeda_affiliates_data') || '{}');
    tbody.innerHTML = '';

    const partners = Object.keys(affData);
    if (partners.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:18px; color:#94a3b8;">अभी तक कोई एफिलिएट पार्टनर रजिस्टर नहीं हुआ है।</td></tr>';
        return;
    }

    partners.forEach(phone => {
        const p = affData[phone];
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
}

// Mark Commission as Paid
function payAffiliateCommission(phone, dueAmount) {
    if (dueAmount <= 0) {
        alert("इस पार्टनर का कोई कमीशन बाकी नहीं है!");
        return;
    }

    if (!confirm(`${phone} को ₹${dueAmount} का कमीशन ट्रांसफर कर दिया गया है? इसे 0 सेट करें?`)) {
        return;
    }

    let affData = JSON.parse(localStorage.getItem('apnaVeda_affiliates_data') || '{}');
    if (affData[phone]) {
        affData[phone].commission = 0;
        localStorage.setItem('apnaVeda_affiliates_data', JSON.stringify(affData));
        renderAdminAffiliates();
        alert(`✓ ${phone} का कमीशन सफलता पूर्वक 'Paid' मार्क कर दिया गया!`);
    }
}
// Auto-load affiliate data whenever tab button is clicked
document.addEventListener('DOMContentLoaded', () => {
    const affBtn = document.querySelector('button[onclick*="tab-affiliates"]');
    if (affBtn) {
        affBtn.addEventListener('click', () => {
            setTimeout(renderAdminAffiliates, 50);
        });
    }
});
