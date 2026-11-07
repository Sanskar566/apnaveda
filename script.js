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
// apnaVeda™ - Complete Dynamic Frontend Engine & Cart System

// LocalStorage से कार्ट लोड करना
var cart = JSON.parse(localStorage.getItem('cart') || '[]');

// DOM लोड होते ही सभी एडमिन सेटिंग्स और प्रोडक्ट्स रेंडर करें
document.addEventListener("DOMContentLoaded", function () {
    updateCartUI();
    renderLiveStoreProducts();
    syncWebsiteSettingsFromAdmin();
});

// 1. DYNAMIC PRODUCTS SYNC (Moringa, Makhana & All Custom Products)
// होमपेज पर क्लिक-एबल प्रोडक्ट कार्ड्स रेंडर करना
function renderLiveStoreProducts() {
    const grid = document.getElementById("dynamic-products-grid") || document.querySelector(".products-grid");
    if (!grid) return;

    let products = JSON.parse(localStorage.getItem('apnaVeda_products'));

    if (!products || products.length === 0) {
        products = [
            {
                id: "PRD101",
                name: "Moringa Leaf Powder",
                price: 149,
                mrp: 199,
                badge: "Best Seller",
                weight: "100g Stand-up Zipper Pouch",
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
                image: "images/makhana.jpg",
                desc: "Handpicked jumbo size, crunchy, high-calcium and gluten-free healthy snack."
            }
        ];
        localStorage.setItem('apnaVeda_products', JSON.stringify(products));
    }

    grid.innerHTML = '';
    products.forEach((p) => {
        // प्रोडक्ट लिंक तैयार करना
        const prodLink = `product.html?name=${encodeURIComponent(p.name)}`;

        grid.innerHTML += `
            <div class="product-card" style="background:#fff; border-radius:10px; border:1px solid #e0e0e0; padding:16px; box-shadow:0 3px 8px rgba(0,0,0,0.05); text-align:left;">
                <a href="${prodLink}" style="text-decoration:none; color:inherit; display:block;">
                    <div style="position:relative; border-radius:8px; overflow:hidden; margin-bottom:12px; cursor:pointer;">
                        ${p.badge ? `<span style="position:absolute; top:8px; left:8px; background:#1b5e20; color:#fff; font-size:11px; font-weight:700; padding:4px 8px; border-radius:4px;">${p.badge}</span>` : ''}
                        <img src="${p.image}" alt="${p.name}" style="width:100%; height:220px; object-fit:cover; display:block; transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
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
                <button type="button" onclick="addToCart('${p.name}', ${p.price})" style="width:100%; padding:10px; background:#f9a825; border:none; border-radius:6px; font-weight:700; cursor:pointer; color:#111;">Add to Cart</button>
            </div>
        `;
    });
}

// 2. LOGO, HERO BANNER, VIDEO, FOOTER & SOCIAL LINKS SYNC
function syncWebsiteSettingsFromAdmin() {
    const s = JSON.parse(localStorage.getItem('apnaVeda_site_settings') || '{}');

    // Logo Update
    if (s.logoUrl) {
        document.querySelectorAll('.site-logo, .brand-logo img, header img').forEach(img => {
            img.src = s.logoUrl;
        });
    }

    // Hero Banner Image & Headline
    if (s.bannerImg) {
        const heroSection = document.querySelector('.hero-banner, .hero-section');
        if (heroSection) {
            heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${s.bannerImg}')`;
        }
    }
    if (s.bannerTitle) {
        const heroTitle = document.querySelector('.hero-banner h1, .hero-section h1');
        if (heroTitle) heroTitle.innerText = s.bannerTitle;
    }

    // Top Announcement Bar
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

    // YouTube Sourcing Video
    if (s.ytVideo) {
        const ytIframe = document.querySelector('#sourcing-video-iframe, .video-container iframe');
        if (ytIframe) {
            let vid = s.ytVideo;
            if (vid.includes('watch?v=')) vid = vid.split('watch?v=')[1].split('&')[0];
            if (vid.includes('youtu.be/')) vid = vid.split('youtu.be/')[1].split('?')[0];
            ytIframe.src = `https://www.youtube.com/embed/${vid}`;
        }
    }

    // Social Links
    if (s.insta) document.querySelectorAll('a.social-insta').forEach(a => a.href = s.insta);
    if (s.fb) document.querySelectorAll('a.social-fb').forEach(a => a.href = s.fb);
    if (s.youtube) document.querySelectorAll('a.social-yt').forEach(a => a.href = s.youtube);
    if (s.pin) document.querySelectorAll('a.social-pin').forEach(a => a.href = s.pin);
    if (s.linkedin) document.querySelectorAll('a.social-linkedin').forEach(a => a.href = s.linkedin);
    if (s.xTwitter) document.querySelectorAll('a.social-x').forEach(a => a.href = s.xTwitter);

    // Footer Customizer
    if (s.footerAbout) {
        const ftAbout = document.getElementById('footer-about-text');
        if (ftAbout) ftAbout.innerText = s.footerAbout;
    }
    if (s.footerCopy) {
        const ftCopy = document.getElementById('footer-copyright-text');
        if (ftCopy) ftCopy.innerText = s.footerCopy;
    }
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
    updateCartUI();
}

function changeQuantity(index, delta) {
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + delta;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
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
                            <button onclick="changeQuantity(${idx}, -1)" style="padding:1px 6px;">-</button>
                            <span style="font-size:12px; font-weight:bold;">${item.quantity || 1}</span>
                            <button onclick="changeQuantity(${idx}, 1)" style="padding:1px 6px;">+</button>
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
// ==========================================
// apnaVeda™ - Customer Reviews & Ratings Engine
// ==========================================

// 1. शुरुआती टेस्ट रिव्यूज (अगर डेटा खाली हो)
function initProductReviews() {
    let reviews = JSON.parse(localStorage.getItem('apnaVeda_reviews'));
    if (!reviews || reviews.length === 0) {
        reviews = [
            {
                productName: "Moringa Leaf Powder",
                reviewerName: "Amit Verma",
                rating: 5,
                comment: "Pure original shade-dried moringa! Energy levels me kaafi improvement dikha subah garam paani ke sath lene par.",
                date: "24 Oct 2026",
                verified: true
            },
            {
                productName: "Moringa Leaf Powder",
                reviewerName: "Pooja Sharma",
                rating: 5,
                comment: "NABL lab tested certification dekh kar order kiya tha. Packing zipper pouch me bahut fresh hai. Highly recommended!",
                date: "28 Oct 2026",
                verified: true
            },
            {
                productName: "Premium Fox Nuts (Makhana)",
                reviewerName: "Vikram Singh",
                rating: 5,
                comment: "Jumbo size makhana, bilkul crispy aur clean. Local market se kaafi behtar quality hai.",
                date: "01 Nov 2026",
                verified: true
            }
        ];
        localStorage.setItem('apnaVeda_reviews', JSON.stringify(reviews));
    }
}

// 2. किसी भी प्रोडक्ट के रिव्यूज स्क्रीन पर दिखाना
function renderProductReviews(productName, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const allReviews = JSON.parse(localStorage.getItem('apnaVeda_reviews') || '[]');
    const filtered = allReviews.filter(r => r.productName === productName);

    let html = `<div style="margin-top: 25px; border-top: 1px solid #eee; padding-top: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
            <h4 style="margin:0; color:#1b5e20; font-size:16px;">⭐ Verified Customer Reviews (${filtered.length})</h4>
            <button onclick="toggleReviewModal('${productName}')" style="background:#2e7d32; color:#fff; border:none; padding:7px 14px; border-radius:5px; font-weight:600; cursor:pointer; font-size:12px;">✍️ Write a Review</button>
        </div>`;

    if (filtered.length === 0) {
        html += `<p style="font-size:13px; color:#888;">No reviews yet. Be the first to share your experience!</p></div>`;
        container.innerHTML = html;
        return;
    }

    filtered.forEach(r => {
        let stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
        html += `
            <div style="background:#fafafa; border:1px solid #eee; border-radius:8px; padding:12px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="font-size:13px; color:#333;">${r.reviewerName}</strong>
                        ${r.verified ? '<span style="background:#dcfce7; color:#15803d; font-size:10px; font-weight:700; padding:2px 6px; border-radius:3px; margin-left:6px;">✓ Verified Buyer</span>' : ''}
                    </div>
                    <span style="font-size:11px; color:#888;">${r.date}</span>
                </div>
                <div style="color:#f59e0b; font-size:14px; margin:4px 0;">${stars}</div>
                <p style="font-size:13px; color:#555; margin:0; line-height:1.4;">${r.comment}</p>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// 3. नया कस्टमर रिव्यू सबमिट करना
function submitCustomerReview(e, productName) {
    e.preventDefault();
    const name = document.getElementById('rev-cust-name').value.trim();
    const rating = Number(document.getElementById('rev-rating').value);
    const comment = document.getElementById('rev-comment').value.trim();

    if (!name || !comment) {
        alert("Please enter your name and review message.");
        return;
    }

    const newRev = {
        productName: productName,
        reviewerName: name,
        rating: rating,
        comment: comment,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        verified: true
    };

    let reviews = JSON.parse(localStorage.getItem('apnaVeda_reviews') || '[]');
    reviews.unshift(newRev); // नया रिव्यू सबसे ऊपर दिखेगा
    localStorage.setItem('apnaVeda_reviews', JSON.stringify(reviews));

    alert("✓ Dhanyawad! Aapka review safaltapoorvak publish ho gaya hai.");
    document.getElementById('review-modal').style.display = 'none';
    location.reload();
}

// रिव्यू पॉपअप खोलने/बंद करने का फंक्शन
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

// Universal Bullet-proof Dynamic Lab Certificate Viewer
function viewLabReport(productKey) {
    try {
        // Dono sambhavit keys check karega
        let labs = JSON.parse(localStorage.getItem('apnaVeda_labs') || 'null');
        if (!labs) {
            labs = JSON.parse(localStorage.getItem('apnaVeda_lab_reports') || '[]');
        }
        
        if (!labs || labs.length === 0) {
            alert("Abhi koi lab report save nahi hai! Kripya Admin Panel (NABL Reports) se report upload karein.");
            return;
        }

        // Product key match karega ya latest (first) report uthayega
        const pKey = (productKey || '').toLowerCase();
        const matched = labs.find(l => ((l.title || l.product || '') + '').toLowerCase().includes(pKey)) || labs[0];

        // Certificate ya pdf property dhoondhega
        const cert = matched.certificate || matched.link || matched.pdf || matched.url;

        if (!cert) {
            alert("Is product ke liye certificate file available nahi hai.");
            return;
        }

        // PDF Base64 viewer
        if (cert.startsWith('data:application/pdf')) {
            const pdfWindow = window.open("");
            if (pdfWindow) {
                pdfWindow.document.write(
                    `<html><head><title>NABL Lab Report - apnaVeda</title></head><body style="margin:0;padding:0;overflow:hidden;"><iframe src="${cert}" frameborder="0" style="width:100%;height:100vh;border:none;"></iframe></body></html>`
                );
            } else {
                window.location.href = cert;
            }
        } 
        // Image Base64 / URL viewer
        else {
            const imgWindow = window.open("");
            if (imgWindow) {
                imgWindow.document.write(
                    `<html><head><title>NABL Lab Report - apnaVeda</title><style>body{margin:0;background:#111;display:flex;justify-content:center;align-items:center;min-height:100vh;}img{max-width:95%;max-height:95vh;box-shadow:0 0 20px rgba(0,0,0,0.8);border-radius:4px;}</style></head><body><img src="${cert}" alt="NABL Lab Report"></body></html>`
                );
            } else {
                window.location.href = cert;
            }
        }
    } catch (err) {
        console.error("Lab Report Open Error:", err);
        alert("Certificate open karne me error aaya: " + err.message);
    }
}
// ==========================================
// apnaVeda™ 3% Affiliate Referral Engine
// ==========================================

function trackAffiliateReferral() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');

    if (ref && ref.trim()) {
        const partnerId = ref.trim();

        // 1. 30 din ke liye active referral browser me lock karein
        localStorage.setItem('apnaVeda_current_ref', JSON.stringify({
            partner: partnerId,
            time: Date.now()
        }));

        // 2. Partner data me Click count badhayein
        let affData = JSON.parse(localStorage.getItem('apnaVeda_affiliates_data') || '{}');
        if (!affData[partnerId]) {
            affData[partnerId] = { clicks: 0, orders: 0, salesTotal: 0, commission: 0 };
        }

        // Ek session me 1 hi baar click count hoga (spam rokne ke liye)
        if (!sessionStorage.getItem('aff_clicked_' + partnerId)) {
            affData[partnerId].clicks = (affData[partnerId].clicks || 0) + 1;
            sessionStorage.setItem('aff_clicked_' + partnerId, 'true');
            localStorage.setItem('apnaVeda_affiliates_data', JSON.stringify(affData));
        }
    }
}

// Page load hote hi chalega
window.addEventListener('DOMContentLoaded', trackAffiliateReferral);

// 3% Commission Credit Function (Checkout ke waqt call hoga)
function creditAffiliateCommission(orderTotal) {
    const rawRef = localStorage.getItem('apnaVeda_current_ref');
    if (!rawRef) return;

    try {
        const refObj = JSON.parse(rawRef);
        // 30 din ki validity check (30 din = 2592000000 ms)
        if (Date.now() - refObj.time < 30 * 24 * 60 * 60 * 1000) {
            const partnerId = refObj.partner;
            let affData = JSON.parse(localStorage.getItem('apnaVeda_affiliates_data') || '{}');

            if (!affData[partnerId]) {
                affData[partnerId] = { clicks: 1, orders: 0, salesTotal: 0, commission: 0 };
            }

            // Flat 3% Commission calculation
            const comm = Math.round(orderTotal * 0.03);

            affData[partnerId].orders = (affData[partnerId].orders || 0) + 1;
            affData[partnerId].salesTotal = (affData[partnerId].salesTotal || 0) + orderTotal;
            affData[partnerId].commission = (affData[partnerId].commission || 0) + comm;

            localStorage.setItem('apnaVeda_affiliates_data', JSON.stringify(affData));
            console.log(`[Affiliate] ₹${comm} credited to partner ${partnerId}`);
        }
    } catch(e) {
        console.error("Affiliate Credit Error:", e);
    }
}
// ==========================================
// apnaVeda™ 100% Fully Automatic Live Search
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Page par maujood kisi bhi search input ko khud pakad lega
    const searchInput = document.getElementById('auto-search-bar') || 
                        document.querySelector('input[placeholder*="Search"]') ||
                        document.querySelector('input[type="search"]');

    if (!searchInput) return;

    searchInput.addEventListener("input", function() {
        const query = this.value.toLowerCase().trim();

        // 1. Agar cards seedhe HTML me bane hain
        const allCards = document.querySelectorAll(
            '.product-card, .product-item, .card, [class*="product"], [class*="card"]'
        );

        let foundAny = false;

        allCards.forEach(card => {
            // Sirf wahi elements jisme price ya title ho
            if (card.querySelector('h3, h4, .title, .price, button') || card.innerText.includes('₹')) {
                const text = card.innerText.toLowerCase();
                if (text.includes(query)) {
                    card.style.display = "";
                    foundAny = true;
                } else {
                    card.style.display = "none";
                }
            }
        });

        // 2. Agar dynamic render function chalta ho to use filter karein
        if (typeof renderProducts === 'function' && window.allProductsData) {
            const filtered = window.allProductsData.filter(p => 
                (p.name + " " + p.desc + " " + (p.badge || '')).toLowerCase().includes(query)
            );
            renderProducts(filtered);
        }
    });
});
// ==========================================
// apnaVeda™ Live Social Links Auto-Sync Engine
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    const s = JSON.parse(localStorage.getItem('apnaVeda_site_settings') || '{}');

    // Instagram Links Update
    if (s.insta) {
        document.querySelectorAll('a[href*="instagram"], .social-insta, a.insta-link').forEach(el => {
            el.href = s.insta;
            el.target = "_blank";
        });
    }

    // Facebook Links Update
    if (s.fb) {
        document.querySelectorAll('a[href*="facebook"], .social-fb, a.fb-link').forEach(el => {
            el.href = s.fb;
            el.target = "_blank";
        });
    }

    // YouTube Channel Links Update
    if (s.youtube) {
        document.querySelectorAll('a[href*="youtube.com/@"], a[href*="youtube.com/channel"], .social-yt, a.yt-link').forEach(el => {
            el.href = s.youtube;
            el.target = "_blank";
        });
    }

    // Pinterest Links Update
    if (s.pin) {
        document.querySelectorAll('a[href*="pinterest"], .social-pin, a.pin-link').forEach(el => {
            el.href = s.pin;
            el.target = "_blank";
        });
    }

    // LinkedIn Links Update
    if (s.linkedin) {
        document.querySelectorAll('a[href*="linkedin"], .social-linkedin').forEach(el => {
            el.href = s.linkedin;
            el.target = "_blank";
        });
    }

    // X (Twitter) Links Update
    if (s.xTwitter) {
        document.querySelectorAll('a[href*="x.com"], a[href*="twitter"], .social-x').forEach(el => {
            el.href = s.xTwitter;
            el.target = "_blank";
        });
    }
});
// ========================================================
// apnaVeda™ Live Store Auto-Sync (Social Links & Banner)
// ========================================================
document.addEventListener("DOMContentLoaded", function () {
    const s = JSON.parse(localStorage.getItem('apnaVeda_site_settings') || '{}');

    // 1. Hero Banner Image & Title Update
    if (s.bannerImg) {
        const heroBanner = document.querySelector('.hero-banner img, .banner img, #hero-img, .hero img');
        if (heroBanner) heroBanner.src = s.bannerImg;
    }
    if (s.bannerTitle) {
        const heroHeading = document.querySelector('.hero h1, .banner h1, #hero-title, .hero-content h2');
        if (heroHeading) heroHeading.innerText = s.bannerTitle;
    }

    // 2. Social Links Update
    if (s.insta) {
        document.querySelectorAll('a[href*="instagram"]').forEach(a => {
            a.href = s.insta;
            a.target = "_blank";
        });
    }
    if (s.fb) {
        document.querySelectorAll('a[href*="facebook"]').forEach(a => {
            a.href = s.fb;
            a.target = "_blank";
        });
    }
    if (s.youtube) {
        document.querySelectorAll('a[href*="youtube"]').forEach(a => {
            a.href = s.youtube;
            a.target = "_blank";
        });
    }
    if (s.pin) {
        document.querySelectorAll('a[href*="pinterest"]').forEach(a => {
            a.href = s.pin;
            a.target = "_blank";
        });
    }
    if (s.linkedin) {
        document.querySelectorAll('a[href*="linkedin"]').forEach(a => {
            a.href = s.linkedin;
            a.target = "_blank";
        });
    }
    if (s.xTwitter) {
        document.querySelectorAll('a[href*="x.com"], a[href*="twitter"]').forEach(a => {
            a.href = s.xTwitter;
            a.target = "_blank";
        });
    }
});
// ==========================================
// apnaVeda™ Universal Legal Policies Auto-Sync Engine
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    const policies = JSON.parse(localStorage.getItem('apnaVeda_policies') || '{}');
    const path = window.location.pathname.toLowerCase();

    let targetPolicyText = '';
    let policyTitle = '';

    if (path.includes('privacy') && policies.privacy) {
        targetPolicyText = policies.privacy;
        policyTitle = 'Privacy Policy';
    } else if ((path.includes('terms') || path.includes('condition')) && policies.terms) {
        targetPolicyText = policies.terms;
        policyTitle = 'Terms & Conditions';
    } else if (path.includes('refund') && policies.refund) {
        targetPolicyText = policies.refund;
        policyTitle = 'Refund, Return & Cancellation Policy';
    } else if (path.includes('shipping') && policies.shipping) {
        targetPolicyText = policies.shipping;
        policyTitle = 'Shipping & Delivery Policy';
    }

    if (targetPolicyText && targetPolicyText.trim() !== '') {
        // 1. Agar dedicated ID lagi ho
        let box = document.getElementById('policy-dynamic-box') || 
                  document.getElementById('policy-content') || 
                  document.querySelector('.policy-content');

        // 2. Agar koi class na mile, to Header aur Footer ke beech ka content badal dega
        if (!box) {
            box = document.querySelector('main') || document.querySelector('article');
        }

        if (box) {
            box.innerHTML = `
                <div style="max-width: 900px; margin: 40px auto; padding: 24px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); font-family: 'Plus Jakarta Sans', sans-serif;">
                    <h1 style="color: #1b5e20; font-size: 26px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">${policyTitle}</h1>
                    <div style="white-space: pre-wrap; line-height: 1.8; font-size: 15px; color: #334155;">${targetPolicyText}</div>
                </div>
            `;
        }
    }
});
// ==========================================
// apnaVeda™ Auto COD Remover (Prepaid Only Mode)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    // 1. COD wale radio button aur uske text/box ko gayab karega
    const codInputs = document.querySelectorAll('input[value="COD"], input[value="cod"]');
    codInputs.forEach(input => {
        const parentLabel = input.closest('label') || input.parentElement;
        if (parentLabel) {
            parentLabel.style.display = 'none'; // Screen se poora COD option gayab
        }
    });

    // 2. Online / Prepaid option ko automatic select (check) kar dega
    const onlineInput = document.querySelector('input[value="Online"], input[value="prepaid"], input[value="upi"]');
    if (onlineInput) {
        onlineInput.checked = true;
    }
});
// ==========================================
// apnaVeda™ Master Out of Stock Auto-Lock Engine
// ==========================================
function applyOutOfStockStatus() {
    const products = JSON.parse(localStorage.getItem('apnaVeda_products') || '[]');

    products.forEach(p => {
        if (p.stock === 'out_of_stock') {
            // Har tarah ke product boxes ko target karega
            document.querySelectorAll('.product-card, .product-item, .card, div').forEach(card => {
                const titleEl = card.querySelector('h2, h3, h4, .product-title, .title');
                
                if (titleEl && titleEl.innerText.trim().toLowerCase() === p.name.trim().toLowerCase()) {
                    // Button lock aur design change
                    const btn = card.querySelector('button, .btn-add-cart, .btn-buy, a.btn');
                    if (btn) {
                        btn.disabled = true;
                        btn.innerText = "Sold Out / Out of Stock";
                        btn.style.setProperty("background-color", "#94a3b8", "important");
                        btn.style.setProperty("color", "#ffffff", "important");
                        btn.style.setProperty("cursor", "not-allowed", "important");
                        btn.style.setProperty("border-color", "#94a3b8", "important");
                        btn.onclick = function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            alert("Kshama karein, " + p.name + " abhi Out of Stock hai!");
                        };
                    }

                    // Product image par halka blur aur Sold Out badge
                    const img = card.querySelector('img');
                    if (img) img.style.opacity = "0.6";

                    let badge = card.querySelector('.badge, .product-badge');
                    if (badge) {
                        badge.innerText = "Sold Out";
                        badge.style.setProperty("background-color", "#dc2626", "important");
                        badge.style.setProperty("color", "#ffffff", "important");
                    }
                }
            });
        }
    });
}

// Page load hone par aur dynamic render hone ke turant baad run hoga
document.addEventListener("DOMContentLoaded", function() {
    applyOutOfStockStatus();
    // 500ms aur 1s ke delay par dobara check karega taaki agar products JS se render ho rahe hon toh bhi miss na ho
    setTimeout(applyOutOfStockStatus, 500);
    setTimeout(applyOutOfStockStatus, 1200);
});
// ==========================================
// apnaVeda™ Direct WhatsApp Checkout Engine
// Target Business Number: +91 9580226180
// ==========================================
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
    
    // Naye tab / WhatsApp app mein open karega
    window.open(targetUrl, '_blank');
}
// ==========================================
// apnaVeda™ Direct WhatsApp Checkout Engine
// Target Business Number: +91 9580226180
// ==========================================
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
    
    // Naye tab / WhatsApp app mein open karega
    window.open(targetUrl, '_blank');
}
// Auto-hook on Checkout Page Form
document.addEventListener("DOMContentLoaded", function () {
    const checkoutForm = document.getElementById('checkout-form') || document.querySelector('form');
    
    if (checkoutForm && window.location.pathname.includes('checkout')) {
        checkoutForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nameInput = document.getElementById('cust-name') || document.querySelector('input[name="name"]');
            const phoneInput = document.getElementById('cust-phone') || document.querySelector('input[name="phone"]');
            const addrInput = document.getElementById('cust-address') || document.querySelector('input[name="address"], textarea[name="address"]');
            const pinInput = document.getElementById('cust-pin') || document.querySelector('input[name="pincode"]');

            const cart = JSON.parse(localStorage.getItem('apnaVeda_cart') || '[]');
            let subtotal = 0;
            cart.forEach(item => {
                subtotal += (Number(item.price) || 0) * (Number(item.quantity) || 1);
            });

            const newOrder = {
                orderId: "AV" + Date.now().toString().slice(-6),
                name: nameInput ? nameInput.value.trim() : "Valued Customer",
                phone: phoneInput ? phoneInput.value.trim() : "",
                address: addrInput ? addrInput.value.trim() : "",
                pincode: pinInput ? pinInput.value.trim() : "",
                items: cart,
                totalAmount: subtotal
            };

            // 1. Admin Panel ke liye localStorage mein order save karega
            let existingOrders = JSON.parse(localStorage.getItem('apnaVeda_orders') || '[]');
            existingOrders.unshift({
                ...newOrder,
                status: "Pending Payment (WhatsApp)",
                date: new Date().toLocaleDateString('en-IN')
            });
            localStorage.setItem('apnaVeda_orders', JSON.stringify(existingOrders));

            // 2. Cart khali karega
            localStorage.removeItem('apnaVeda_cart');

            // 3. Direct WhatsApp trigger
            triggerWhatsAppCheckout(newOrder);

            alert("✓ ऑर्डर दर्ज हो गया है! अब विवरण की पुष्टि के लिए व्हाट्सएप खुल रहा है।");
        });
    }
});
