// ==========================================
// apnaVeda™ - Complete Dynamic Frontend Engine & Cart System
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

// Standard Cart Key
var cart = JSON.parse(localStorage.getItem('cart') || localStorage.getItem('apnaVeda_cart') || '[]');
window.allProductsData = [];

// DOM load hote hi real-time data sync chalu karein
document.addEventListener("DOMContentLoaded", function () {
    updateCartUI();
    listenLiveStoreProducts();
    syncLiveWebsiteSettings();
    initProductReviews();
});

// 2. DYNAMIC PRODUCTS REAL-TIME FIRESTORE LISTENER
function listenLiveStoreProducts() {
    const grid = document.getElementById("dynamic-products-grid") || document.querySelector(".products-grid");
    if (!grid) return;

    db.collection("products").onSnapshot((snapshot) => {
        let products = [];
        snapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            products.push(data);
        });

        if (products.length === 0) {
            // Agar Firestore khali ho toh default showcase load karein
            products = [
                {
                    id: "PRD101",
                    name: "Organic Moringa Leaf Powder",
                    price: 149,
                    mrp: 199,
                    badge: "Best Seller",
                    weight: "100g Stand-up Zipper Pouch",
                    stock: "in_stock",
                    image: "images/moringa.jpg",
                    desc: "Packed with 300+ vital nutrients, pure shade-dried drumstick leaves micro-pulverized."
                },
                {
                    id: "PRD102",
                    name: "Premium Fox Nuts (Makhana)",
                    price: 280,
                    mrp: 350,
                    badge: "Farm Fresh",
                    weight: "250g Pouch",
                    stock: "in_stock",
                    image: "images/makhana.jpg",
                    desc: "Handpicked jumbo size, crunchy, high-calcium and gluten-free healthy snack."
                }
            ];
        }

        window.allProductsData = products;
        localStorage.setItem('apnaVeda_products', JSON.stringify(products));
        renderProductsToGrid(products, grid);
    }, (error) => {
        console.error("Firestore Product Fetch Error: ", error);
        let fallback = JSON.parse(localStorage.getItem('apnaVeda_products') || '[]');
        if (fallback.length > 0) renderProductsToGrid(fallback, grid);
    });
}

function renderProductsToGrid(products, grid) {
    grid.innerHTML = '';
    products.forEach((p) => {
        const prodLink = `product.html?name=${encodeURIComponent(p.name)}`;
        const isOutOfStock = p.stock === 'out_of_stock';

        grid.innerHTML += `
            <div class="product-card" style="background:#fff; border-radius:10px; border:1px solid #e0e0e0; padding:16px; box-shadow:0 3px 8px rgba(0,0,0,0.05); text-align:left; position:relative;">
                <a href="${prodLink}" style="text-decoration:none; color:inherit; display:block;">
                    <div style="position:relative; border-radius:8px; overflow:hidden; margin-bottom:12px; cursor:pointer;">
                        ${p.badge ? `<span style="position:absolute; top:8px; left:8px; background:${isOutOfStock ? '#dc2626' : '#1b5e20'}; color:#fff; font-size:11px; font-weight:700; padding:4px 8px; border-radius:4px; z-index:2;">${isOutOfStock ? 'Sold Out' : p.badge}</span>` : ''}
                        <img src="${p.image || 'images/moringa.jpg'}" alt="${p.name}" style="width:100%; height:220px; object-fit:cover; display:block; transition:transform 0.3s; opacity:${isOutOfStock ? '0.6' : '1'};" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                    </div>
                    <div style="display:flex; align-items:center; gap:5px; margin-bottom:6px;">
                        <span style="color:#f59e0b; font-size:13px;">★★★★★</span>
                        <span style="font-size:12px; color:#666; font-weight:600;">4.9 (Verified)</span>
                    </div>
                    <h3 style="font-size:16px; color:#222; margin-bottom:4px; font-weight:700;">${p.name}</h3>
                    <small style="color:#666; display:block; margin-bottom:8px;">${p.weight || 'Standard Pack'}</small>
                    <div style="margin-bottom:10px;">
                        <strong style="font-size:18px; color:#1b5e20;">₹${p.price}</strong>
                        ${p.mrp ? `<del style="color:#888; font-size:13px; margin-left:8px;">₹${p.mrp}</del>` : ''}
                    </div>
                    <p style="font-size:12px; color:#555; line-height:1.4; margin-bottom:14px; min-height:34px;">${p.desc || ''}</p>
                </a>
                ${isOutOfStock ? `
                    <button type="button" disabled style="width:100%; padding:10px; background:#94a3b8; border:none; border-radius:6px; font-weight:700; cursor:not-allowed; color:#fff;">Sold Out / Out of Stock</button>
                ` : `
                    <button type="button" onclick="addToCart('${p.name.replace(/'/g, "\\'")}', ${p.price})" style="width:100%; padding:10px; background:#f9a825; border:none; border-radius:6px; font-weight:700; cursor:pointer; color:#111;">Add to Cart</button>
                `}
            </div>
        `;
    });
}

// 3. CART SYSTEM ENGINE
function addToCart(productName, price) {
    price = Number(price);
    var existingIndex = cart.findIndex(function(item) {
        return item.name === productName;
    });

    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({ name: productName, price: price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('apnaVeda_cart', JSON.stringify(cart));
    updateCartUI();
    openCart();
}

function openCart() {
    var drawer = document.getElementById("cart-drawer");
    if (drawer) drawer.classList.add("open");
}

function toggleCart() {
    var drawer = document.getElementById("cart-drawer");
    if (drawer) drawer.classList.toggle("open");
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('apnaVeda_cart', JSON.stringify(cart));
    updateCartUI();
}

function changeQuantity(index, delta) {
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + delta;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('apnaVeda_cart', JSON.stringify(cart));
        updateCartUI();
    }
}

function updateCartUI() {
    var cartCountEl = document.getElementById("cart-count");
    var cartItemsEl = document.getElementById("cart-items");
    var cartTotalEl = document.getElementById("cart-total-price");

    var totalCount = 0;
    var totalPrice = 0;

    cart.forEach(function(item) {
        var qty = item.quantity || 1;
        totalCount += qty;
        totalPrice += (item.price * qty);
    });

    if (cartCountEl) cartCountEl.innerText = totalCount;
    if (cartTotalEl) cartTotalEl.innerText = "₹" + totalPrice;

    if (cartItemsEl) {
        if (cart.length === 0) {
            cartItemsEl.innerHTML = `<p style="text-align:center; padding:30px; color:#888;">Your Cart is Empty</p>`;
            return;
        }

        var htmlContent = "";
        cart.forEach(function(item, idx) {
            var itemTotal = item.price * (item.quantity || 1);
            htmlContent += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee;">
                    <div>
                        <strong style="font-size:13px; color:#333;">${item.name}</strong><br>
                        <span style="font-size:12px; color:#2e7d32; font-weight:bold;">₹${item.price}</span>
                        <div style="display:inline-flex; align-items:center; gap:6px; margin-left:8px;">
                            <button onclick="changeQuantity(${idx}, -1)" style="padding:1px 6px; cursor:pointer;">-</button>
                            <span style="font-size:12px; font-weight:bold;">${item.quantity || 1}</span>
                            <button onclick="changeQuantity(${idx}, 1)" style="padding:1px 6px; cursor:pointer;">+</button>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:13px; font-weight:bold;">₹${itemTotal}</span><br>
                        <button onclick="removeFromCart(${idx})" style="background:none; border:none; color:#dc2626; cursor:pointer; font-size:11px;">Remove</button>
                    </div>
                </div>
            `;
        });
        cartItemsEl.innerHTML = htmlContent;
    }
}

// 4. LIVE SITE SETTINGS & BRAND SYNC (FIRESTORE CLOUD)
function syncLiveWebsiteSettings() {
    db.collection("settings").doc("homepage").onSnapshot((doc) => {
        if (!doc.exists) return;
        const s = doc.data();

        if (s.logoUrl) {
            document.querySelectorAll('.site-logo, .brand-logo img, header img').forEach(img => {
                img.src = s.logoUrl;
            });
        }

        if (s.bannerImg) {
            const heroSection = document.querySelector('.hero-banner, .hero-section');
            if (heroSection) {
                heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${s.bannerImg}')`;
            }
            const heroImg = document.querySelector('.hero-banner img, .banner img, #hero-img');
            if (heroImg) heroImg.src = s.bannerImg;
        }

        if (s.bannerTitle) {
            const heroTitle = document.querySelector('.hero-banner h1, .hero-section h1, .hero h1, #hero-title');
            if (heroTitle) heroTitle.innerText = s.bannerTitle;
        }

        const topBar = document.getElementById('announcement-bar') || document.querySelector('.top-bar');
        if (topBar) {
            if (s.annStatus === 'disabled') {
                topBar.style.display = 'none';
            } else {
                topBar.style.display = 'block';
                if (s.annBg) topBar.style.backgroundColor = s.annBg;
                if (s.annText) {
                    const textEl = topBar.querySelector('p, span') || topBar;
                    textEl.innerText = s.annText;
                }
            }
        }

        if (s.ytVideo) {
            const ytIframe = document.querySelector('#sourcing-video-iframe, .video-container iframe');
            if (ytIframe) {
                let vid = s.ytVideo;
                if (vid.includes('watch?v=')) vid = vid.split('watch?v=')[1].split('&')[0];
                if (vid.includes('youtu.be/')) vid = vid.split('youtu.be/')[1].split('?')[0];
                ytIframe.src = `https://www.youtube.com/embed/${vid}`;
            }
        }

        if (s.insta) document.querySelectorAll('a[href*="instagram"], .social-insta').forEach(a => { a.href = s.insta; a.target = "_blank"; });
        if (s.fb) document.querySelectorAll('a[href*="facebook"], .social-fb').forEach(a => { a.href = s.fb; a.target = "_blank"; });
        if (s.youtube) document.querySelectorAll('a[href*="youtube"], .social-yt').forEach(a => { a.href = s.youtube; a.target = "_blank"; });
        if (s.pin) document.querySelectorAll('a[href*="pinterest"], .social-pin').forEach(a => { a.href = s.pin; a.target = "_blank"; });
        if (s.linkedin) document.querySelectorAll('a[href*="linkedin"], .social-linkedin').forEach(a => { a.href = s.linkedin; a.target = "_blank"; });
        if (s.xTwitter) document.querySelectorAll('a[href*="twitter"], a[href*="x.com"], .social-x').forEach(a => { a.href = s.xTwitter; a.target = "_blank"; });

        if (s.footerAbout) {
            const ftAbout = document.getElementById('footer-about-text');
            if (ftAbout) ftAbout.innerText = s.footerAbout;
        }
        if (s.footerCopy) {
            const ftCopy = document.getElementById('footer-copyright-text');
            if (ftCopy) ftCopy.innerText = s.footerCopy;
        }
    });

    // Policies Sync
    db.collection("settings").doc("policies").onSnapshot((doc) => {
        if (!doc.exists) return;
        const policies = doc.data();
        const path = window.location.pathname.toLowerCase();
        let targetText = '';
        let targetTitle = '';

        if (path.includes('privacy') && policies.privacy) { targetText = policies.privacy; targetTitle = 'Privacy Policy'; }
        else if ((path.includes('terms') || path.includes('condition')) && policies.terms) { targetText = policies.terms; targetTitle = 'Terms & Conditions'; }
        else if (path.includes('refund') && policies.refund) { targetText = policies.refund; targetTitle = 'Refund, Return & Cancellation Policy'; }
        else if (path.includes('shipping') && policies.shipping) { targetText = policies.shipping; targetTitle = 'Shipping & Delivery Policy'; }

        if (targetText) {
            let box = document.getElementById('policy-dynamic-box') || document.getElementById('policy-content') || document.querySelector('.policy-content') || document.querySelector('main');
            if (box) {
                box.innerHTML = `
                    <div style="max-width: 900px; margin: 40px auto; padding: 24px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); font-family: 'Plus Jakarta Sans', sans-serif;">
                        <h1 style="color: #1b5e20; font-size: 26px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">${targetTitle}</h1>
                        <div style="white-space: pre-wrap; line-height: 1.8; font-size: 15px; color: #334155;">${targetText}</div>
                    </div>
                `;
            }
        }
    });
}

// 5. REVIEWS & RATINGS (FIRESTORE SYNC)
function initProductReviews() {
    // Reviews are loaded directly via Firestore listener
}

function renderProductReviews(productName, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    db.collection("reviews").where("productName", "==", productName).onSnapshot((snapshot) => {
        let reviews = [];
        snapshot.forEach(d => reviews.push(d.data()));

        let html = `<div style="margin-top: 25px; border-top: 1px solid #eee; padding-top: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                <h4 style="margin:0; color:#1b5e20; font-size:16px;">⭐ Verified Customer Reviews (${reviews.length})</h4>
                <button onclick="toggleReviewModal('${productName}')" style="background:#2e7d32; color:#fff; border:none; padding:7px 14px; border-radius:5px; font-weight:600; cursor:pointer; font-size:12px;">✍️ Write a Review</button>
            </div>`;

        if (reviews.length === 0) {
            html += `<p style="font-size:13px; color:#888;">No reviews yet. Be the first to share your experience!</p></div>`;
            container.innerHTML = html;
            return;
        }

        reviews.forEach(r => {
            let stars = "★".repeat(r.rating || 5) + "☆".repeat(Math.max(0, 5 - (r.rating || 5)));
            html += `
                <div style="background:#fafafa; border:1px solid #eee; border-radius:8px; padding:12px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong style="font-size:13px; color:#333;">${r.reviewerName}</strong>
                            ${r.verified ? '<span style="background:#dcfce7; color:#15803d; font-size:10px; font-weight:700; padding:2px 6px; border-radius:3px; margin-left:6px;">✓ Verified Buyer</span>' : ''}
                        </div>
                        <span style="font-size:11px; color:#888;">${r.date || ''}</span>
                    </div>
                    <div style="color:#f59e0b; font-size:14px; margin:4px 0;">${stars}</div>
                    <p style="font-size:13px; color:#555; margin:0; line-height:1.4;">${r.comment || ''}</p>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
    });
}

function submitCustomerReview(e, productName) {
    e.preventDefault();
    const name = document.getElementById('rev-cust-name').value.trim();
    const rating = Number(document.getElementById('rev-rating').value);
    const comment = document.getElementById('rev-comment').value.trim();

    if (!name || !comment) {
        alert("Please enter your name and review message.");
        return;
    }

    db.collection("reviews").add({
        productName: productName,
        reviewerName: name,
        rating: rating,
        comment: comment,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        verified: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("✓ Dhanyawad! Aapka review publish ho gaya hai.");
        const modal = document.getElementById('review-modal');
        if (modal) modal.style.display = 'none';
    }).catch(err => alert("Error: " + err.message));
}

function toggleReviewModal(productName) {
    let modal = document.getElementById('review-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'review-modal';
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:9999;";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:#fff; border-radius:10px; width:90%; max-width:420px; padding:24px; box-shadow:0 4px 20px rgba(0,0,0,0.15); position:relative;">
            <button onclick="document.getElementById('review-modal').style.display='none'" style="position:absolute; top:12px; right:12px; background:none; border:none; font-size:18px; cursor:pointer; color:#888;">✕</button>
            <h3 style="margin-top:0; color:#1b5e20; font-size:18px;">Write a Review</h3>
            <p style="font-size:12px; color:#666; margin-bottom:15px;">Product: <strong>${productName}</strong></p>
            <form onsubmit="submitCustomerReview(event, '${productName}')">
                <label style="font-size:12px; font-weight:700; color:#333; display:block; margin-bottom:4px;">Your Full Name</label>
                <input type="text" id="rev-cust-name" required placeholder="e.g. Rahul Sharma" style="width:100%; padding:9px; border:1px solid #ccc; border-radius:5px; margin-bottom:12px; box-sizing:border-box;">
                
                <label style="font-size:12px; font-weight:700; color:#333; display:block; margin-bottom:4px;">Star Rating</label>
                <select id="rev-rating" style="width:100%; padding:9px; border:1px solid #ccc; border-radius:5px; margin-bottom:12px; box-sizing:border-box;">
                    <option value="5">⭐⭐⭐⭐⭐ (5 Star - Excellent)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Star - Good)</option>
                    <option value="3">⭐⭐⭐ (3 Star - Average)</option>
                </select>

                <label style="font-size:12px; font-weight:700; color:#333; display:block; margin-bottom:4px;">Your Experience / Feedback</label>
                <textarea id="rev-comment" required rows="3" placeholder="Share your experience about product purity, packaging & taste..." style="width:100%; padding:9px; border:1px solid #ccc; border-radius:5px; margin-bottom:16px; box-sizing:border-box;"></textarea>

                <button type="submit" style="width:100%; background:#1b5e20; color:#fff; padding:11px; border:none; border-radius:6px; font-weight:700; cursor:pointer;">Submit Review</button>
            </form>
        </div>
    `;
    modal.style.display = 'flex';
}

// 6. NABL LAB CERTIFICATE VIEWER
function viewLabReport(productKey) {
    db.collection("lab_reports").get().then((snapshot) => {
        if (snapshot.empty) {
            alert("Abhi koi lab report save nahi hai!");
            return;
        }
        let reports = [];
        snapshot.forEach(doc => reports.push(doc.data()));

        const pKey = (productKey || '').toLowerCase();
        const matched = reports.find(l => ((l.product || '') + '').toLowerCase().includes(pKey)) || reports[0];
        const cert = matched.pdfLink || matched.certificate || matched.link;

        if (!cert) {
            alert("Is product ke liye certificate file available nahi hai.");
            return;
        }

        if (cert.startsWith('data:application/pdf')) {
            const pdfWindow = window.open("");
            if (pdfWindow) {
                pdfWindow.document.write(
                    `<html><head><title>NABL Lab Report - apnaVeda</title></head><body style="margin:0;padding:0;overflow:hidden;"><iframe src="${cert}" frameborder="0" style="width:100%;height:100vh;border:none;"></iframe></body></html>`
                );
            } else {
                window.location.href = cert;
            }
        } else {
            const imgWindow = window.open("");
            if (imgWindow) {
                imgWindow.document.write(
                    `<html><head><title>NABL Lab Report - apnaVeda</title><style>body{margin:0;background:#111;display:flex;justify-content:center;align-items:center;min-height:100vh;}img{max-width:95%;max-height:95vh;box-shadow:0 0 20px rgba(0,0,0,0.8);border-radius:4px;}</style></head><body><img src="${cert}" alt="NABL Lab Report"></body></html>`
                );
            } else {
                window.location.href = cert;
            }
        }
    }).catch(err => {
        alert("Certificate open error: " + err.message);
    });
}

// 7. 3% AFFILIATE REFERRAL ENGINE
function trackAffiliateReferral() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');

    if (ref && ref.trim()) {
        const partnerId = ref.trim();
        localStorage.setItem('apnaVeda_current_ref', JSON.stringify({
            partner: partnerId,
            time: Date.now()
        }));

        if (!sessionStorage.getItem('aff_clicked_' + partnerId)) {
            sessionStorage.setItem('aff_clicked_' + partnerId, 'true');
            db.collection("affiliates").doc(partnerId).set({
                clicks: firebase.firestore.FieldValue.increment(1),
                lastClickAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    }
}
window.addEventListener('DOMContentLoaded', trackAffiliateReferral);

function creditAffiliateCommission(orderTotal) {
    const rawRef = localStorage.getItem('apnaVeda_current_ref');
    if (!rawRef) return;

    try {
        const refObj = JSON.parse(rawRef);
        if (Date.now() - refObj.time < 30 * 24 * 60 * 60 * 1000) {
            const partnerId = refObj.partner;
            const comm = Math.round(orderTotal * 0.03);

            db.collection("affiliates").doc(partnerId).set({
                orders: firebase.firestore.FieldValue.increment(1),
                salesTotal: firebase.firestore.FieldValue.increment(orderTotal),
                commission: firebase.firestore.FieldValue.increment(comm),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    } catch(e) {
        console.error("Affiliate Credit Error:", e);
    }
}

// 8. LIVE SEARCH
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('auto-search-bar') || 
                        document.querySelector('input[placeholder*="Search"]') ||
                        document.querySelector('input[type="search"]');

    if (!searchInput) return;

    searchInput.addEventListener("input", function() {
        const query = this.value.toLowerCase().trim();
        const allCards = document.querySelectorAll('.product-card, .product-item, .card');

        allCards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(query) ? "" : "none";
        });
    });
});

// 9. PREPAID ONLY ENFORCEMENT
document.addEventListener("DOMContentLoaded", function () {
    const codInputs = document.querySelectorAll('input[value="COD"], input[value="cod"]');
    codInputs.forEach(input => {
        const parentLabel = input.closest('label') || input.parentElement;
        if (parentLabel) parentLabel.style.display = 'none';
    });

    const onlineInput = document.querySelector('input[value="Online"], input[value="prepaid"], input[value="upi"]');
    if (onlineInput) onlineInput.checked = true;
});

// 10. DIRECT WHATSAPP CHECKOUT & CLOUD ORDER REGISTRATION
function triggerWhatsAppCheckout(orderData) {
    const businessNumber = "919580226180";

    let itemList = "";
    if (orderData.items && orderData.items.length > 0) {
        orderData.items.forEach((item, index) => {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            itemList += `${index + 1}. *${item.name}* (Qty: ${qty}) - ₹${price * qty}\n`;
        });
    } else {
        itemList = "1. Selected apnaVeda Products\n";
    }

    const message = 
`🌿 *नया ऑर्डर - apnaVeda™ Store* 🌿
-----------------------------------
📦 *Order ID:* #${orderData.orderId}
📅 *Date:* ${new Date().toLocaleDateString('en-IN')}

👤 *ग्राहक विवरण (Customer Info):*
• *नाम:* ${orderData.name}
• *मोबाइल:* ${orderData.phone}

📍 *डिलीवरी पता (Delivery Address):*
${orderData.address}
• *पिनकोड:* ${orderData.pincode}

🛒 *आइटम्स (Cart Items):*
${itemList}
💰 *कुल राशि (Total Amount):* ₹${orderData.totalAmount}
💳 *पेमेंट मोड:* Direct UPI / WhatsApp Prepaid
-----------------------------------
_कृपया अपना UPI QR / बैंक विवरण भेजें ताकि मैं भुगतान पूरा कर सकूँ।_`;

    const encoded = encodeURIComponent(message);
    const targetUrl = `https://wa.me/${businessNumber}?text=${encoded}`;
    window.open(targetUrl, '_blank');
}

// Auto-hook on Checkout Page Form (Saves to Firestore)
document.addEventListener("DOMContentLoaded", function () {
    const checkoutForm = document.getElementById('checkout-form') || document.querySelector('form');
    
    if (checkoutForm && window.location.pathname.includes('checkout')) {
        checkoutForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nameInput = document.getElementById('cust-name') || document.querySelector('input[name="name"]');
            const phoneInput = document.getElementById('cust-phone') || document.querySelector('input[name="phone"]');
            const addrInput = document.getElementById('cust-address') || document.querySelector('input[name="address"], textarea[name="address"]');
            const pinInput = document.getElementById('cust-pin') || document.querySelector('input[name="pincode"]');

            const currentCart = JSON.parse(localStorage.getItem('cart') || localStorage.getItem('apnaVeda_cart') || '[]');
            let subtotal = 0;
            currentCart.forEach(item => {
                subtotal += (Number(item.price) || 0) * (Number(item.quantity) || 1);
            });

            const newOrder = {
                orderId: "AV" + Date.now().toString().slice(-6),
                name: nameInput ? nameInput.value.trim() : "Valued Customer",
                phone: phoneInput ? phoneInput.value.trim() : "",
                address: addrInput ? addrInput.value.trim() : "",
                pincode: pinInput ? pinInput.value.trim() : "",
                items: currentCart,
                totalAmount: subtotal,
                status: "Pending Payment (WhatsApp)",
                orderDate: new Date().toLocaleDateString('en-IN'),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // 1. Save directly to Cloud Firestore
            db.collection("orders").add(newOrder).then(() => {
                creditAffiliateCommission(subtotal);

                // Cart khali karein
                localStorage.removeItem('cart');
                localStorage.removeItem('apnaVeda_cart');
                cart = [];
                updateCartUI();

                // Direct WhatsApp trigger
                triggerWhatsAppCheckout(newOrder);
                alert("✓ ऑर्डर दर्ज हो गया है! अब विवरण की पुष्टि के लिए व्हाट्सएप खुल रहा है।");
            }).catch(err => {
                console.error("Order save error: ", err);
                triggerWhatsAppCheckout(newOrder);
            });
        });
    }
});
