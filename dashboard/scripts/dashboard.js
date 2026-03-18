// AI Bazaar - Dashboard Data & Language JS
const API_BASE = "https://ai-bazaar-backend-g2yb.onrender.com";

// ── Language System ───────────────────────────────────────────────
const TRANSLATIONS = {
    en: {
        todaySales: "Today's Sales",
        monthlyRevenue: "Monthly Revenue",
        lowStock: "Low Stock Items",
        totalProducts: "Total Products",
        recentActivity: "Recent Activity",
        topSelling: "Top Selling Items",
        aiInsight: "AI Insight",
        noActivity: "No recent activity. Start recording sales!",
        noItems: "No items found. Add products to inventory!",
        saleRecorded: "Sale recorded",
        lowStockAlert: "Low stock alert",
        remaining: "remaining"
    },
    hi: {
        todaySales: "आज की बिक्री",
        monthlyRevenue: "मासिक राजस्व",
        lowStock: "कम स्टॉक",
        totalProducts: "कुल उत्पाद",
        recentActivity: "हाल की गतिविधि",
        topSelling: "सबसे ज्यादा बिकने वाले",
        aiInsight: "AI सुझाव",
        noActivity: "कोई गतिविधि नहीं। बिक्री दर्ज करें!",
        noItems: "कोई आइटम नहीं। इन्वेंटरी में उत्पाद जोड़ें!",
        saleRecorded: "बिक्री दर्ज",
        lowStockAlert: "कम स्टॉक अलर्ट",
        remaining: "बचा है"
    },
    ta: {
        todaySales: "இன்றைய விற்பனை",
        monthlyRevenue: "மாத வருவாய்",
        lowStock: "குறைந்த இருப்பு",
        totalProducts: "மொத்த பொருட்கள்",
        recentActivity: "சமீபத்திய செயல்பாடு",
        topSelling: "அதிகம் விற்பனையானவை",
        aiInsight: "AI யோசனை",
        noActivity: "செயல்பாடு இல்லை!",
        noItems: "பொருட்கள் இல்லை!",
        saleRecorded: "விற்பனை பதிவு",
        lowStockAlert: "குறைந்த இருப்பு எச்சரிக்கை",
        remaining: "மீதமுள்ளது"
    },
    gu: {
        todaySales: "આજની વેચાણ",
        monthlyRevenue: "માસિક આવક",
        lowStock: "ઓછો સ્ટોક",
        totalProducts: "કુલ ઉત્પાદનો",
        recentActivity: "તાજેતરની પ્રવૃત્તિ",
        topSelling: "સૌથી વધુ વેચાતી",
        aiInsight: "AI સૂઝ",
        noActivity: "કોઈ પ્રવૃત્તિ નથી!",
        noItems: "કોઈ આઇટમ નથી!",
        saleRecorded: "વેચાણ નોંધ્યું",
        lowStockAlert: "ઓછો સ્ટોક ચેતવણી",
        remaining: "બાકી"
    },
    te: {
        todaySales: "నేటి అమ్మకాలు",
        monthlyRevenue: "నెలవారీ ఆదాయం",
        lowStock: "తక్కువ స్టాక్",
        totalProducts: "మొత్తం ఉత్పత్తులు",
        recentActivity: "ఇటీవలి కార్యాచరణ",
        topSelling: "అత్యధికంగా అమ్ముడైనవి",
        aiInsight: "AI అంతర్దృష్టి",
        noActivity: "కార్యాచరణ లేదు!",
        noItems: "అంశాలు లేవు!",
        saleRecorded: "అమ్మకం నమోదు",
        lowStockAlert: "తక్కువ స్టాక్ హెచ్చరిక",
        remaining: "మిగిలి ఉంది"
    }
};

let currentLang = localStorage.getItem('language') || 'en';

function t(key) {
    return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['en'][key] || key;
}

function applyLanguage() {
    const cardTitles = document.querySelectorAll('.summary-card h3');
    if (cardTitles[0]) cardTitles[0].textContent = t('todaySales');
    if (cardTitles[1]) cardTitles[1].textContent = t('monthlyRevenue');
    if (cardTitles[2]) cardTitles[2].textContent = t('lowStock');
    if (cardTitles[3]) cardTitles[3].textContent = t('totalProducts');

    const activityHeader = document.querySelector('.recent-activity .chart-header h3');
    if (activityHeader) activityHeader.textContent = t('recentActivity');

    const topHeader = document.querySelector('.top-items-container .chart-header h3');
    if (topHeader) topHeader.textContent = t('topSelling');

    const insightHeader = document.querySelector('.ai-insight-card h3');
    if (insightHeader) insightHeader.textContent = t('aiInsight');
}

// ── Language Selector ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        const reverseMap = { en: 'english', hi: 'hindi', ta: 'tamil', gu: 'gujarati', te: 'telugu' };
        langSelect.value = reverseMap[currentLang] || 'english';

        langSelect.addEventListener('change', function () {
            const langMap = { english: 'en', hindi: 'hi', tamil: 'ta', gujarati: 'gu', telugu: 'te' };
            currentLang = langMap[this.value] || 'en';
            localStorage.setItem('language', currentLang);
            applyLanguage();
            loadDashboardData();
        });
    }

    loadDashboardData();
    applyLanguage();
});

// ── Fetch helper ──────────────────────────────────────────────────
async function apiFetch(path) {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

// ── Load Dashboard Data ───────────────────────────────────────────
async function loadDashboardData() {
    try {
        const [sales, inventory] = await Promise.all([
            apiFetch('/api/sales/?limit=100').catch(() => []),
            apiFetch('/api/inventory/').catch(() => [])
        ]);

        updateKPICards(sales, inventory);
        updateRecentActivity(sales);
        updateTopSellingItems(inventory);
        updateAIInsight(sales, inventory);

    } catch (err) {
        console.error('Dashboard load failed:', err);
        showFallbackData();
    }
}

// ── KPI Cards ─────────────────────────────────────────────────────
function updateKPICards(sales, inventory) {
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.created_at).toDateString() === today);
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
    const monthRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const lowStock = inventory.filter(p => p.quantity <= p.reorder_level);

    setEl('todaySales', `₹${todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);
    setEl('monthlyRevenue', `₹${monthRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);
    setEl('lowStockCount', lowStock.length);
    setEl('totalItems', inventory.length);
}

// ── Recent Activity ───────────────────────────────────────────────
function updateRecentActivity(sales) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    if (!sales || sales.length === 0) {
        activityList.innerHTML = `<p style="padding:20px;color:#999;text-align:center;">${t('noActivity')}</p>`;
        return;
    }

    activityList.innerHTML = sales.slice(0, 5).map(sale => {
        const time = new Date(sale.created_at).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit'
        });
        return `
            <div class="activity-item">
                <div class="activity-icon success">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="activity-details">
                    <p><strong>${t('saleRecorded')}</strong> — 
                    ${sale.items?.length || 0} item(s)
                    ${sale.customer_name ? ' · ' + sale.customer_name : ''}
                    · <strong>₹${sale.total.toFixed(2)}</strong></p>
                    <span class="activity-time">${time}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ── Top Selling Items ─────────────────────────────────────────────
function updateTopSellingItems(inventory) {
    const topList = document.getElementById('topItemsList');
    if (!topList) return;

    if (!inventory || inventory.length === 0) {
        topList.innerHTML = `<p style="padding:20px;color:#999;text-align:center;">${t('noItems')}</p>`;
        return;
    }

    const sorted = [...inventory]
        .sort((a, b) => (b.selling_price * b.quantity) - (a.selling_price * a.quantity))
        .slice(0, 5);

    topList.innerHTML = sorted.map((item, i) => `
        <div class="top-item">
            <div class="item-rank">${i + 1}</div>
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>${item.quantity} ${item.unit} ${t('remaining')}</p>
            </div>
            <div class="item-sales">
                <span class="sales-value">₹${item.selling_price?.toFixed(0) || 0}</span>
            </div>
        </div>
    `).join('');
}

// ── AI Insight ────────────────────────────────────────────────────
function updateAIInsight(sales, inventory) {
    const insightContent = document.getElementById('aiInsightContent');
    if (!insightContent) return;

    const lowStock = inventory.filter(p => p.quantity <= p.reorder_level);
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const insights = [];

    if (lowStock.length > 0) {
        insights.push(`<li><i class="fas fa-exclamation-triangle" style="color:#FFB74D"></i> <span>${lowStock.length} item(s) need restocking: ${lowStock.slice(0, 2).map(p => p.name).join(', ')}</span></li>`);
    }
    if (totalRevenue > 0) {
        insights.push(`<li><i class="fas fa-chart-line" style="color:#4CAF50"></i> <span>Total revenue: ₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></li>`);
    }
    if (inventory.length > 0) {
        insights.push(`<li><i class="fas fa-lightbulb" style="color:#FF6B35"></i> <span>You have ${inventory.length} products in inventory.</span></li>`);
    }
    if (insights.length === 0) {
        insights.push(`<li><i class="fas fa-lightbulb" style="color:#FF6B35"></i> <span>Add products and record sales to get AI insights!</span></li>`);
    }

    insightContent.innerHTML = `<p>Based on your data:</p><ul class="insight-list">${insights.join('')}</ul>`;
}

// ── Fallback ──────────────────────────────────────────────────────
function showFallbackData() {
    setEl('todaySales', '₹0');
    setEl('monthlyRevenue', '₹0');
    setEl('lowStockCount', '0');
    setEl('totalItems', '0');

    const activityList = document.getElementById('activityList');
    if (activityList) activityList.innerHTML = `<p style="padding:20px;color:#999;text-align:center;">${t('noActivity')}</p>`;

    const topList = document.getElementById('topItemsList');
    if (topList) topList.innerHTML = `<p style="padding:20px;color:#999;text-align:center;">${t('noItems')}</p>`;
}

function setEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}