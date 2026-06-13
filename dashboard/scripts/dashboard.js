// AI Bazaar - Dashboard Data & Language JS
const API_BASE = " https://ai-bazaar-backend-29o3.onrender.com";

// ── Translations ──────────────────────────────────────────────────
const TRANSLATIONS = {
    en: {
        // Dashboard
        todaySales: "Today's Sales", monthlyRevenue: "Monthly Revenue",
        lowStock: "Low Stock Items", totalProducts: "Total Products",
        recentActivity: "Recent Activity", topSelling: "Top Selling Items",
        aiInsight: "AI Insight", noActivity: "No recent activity. Start recording sales!",
        noItems: "No items found. Add products to inventory!",
        saleRecorded: "Sale recorded", remaining: "remaining",

        // Inventory
        inventoryTitle: "Inventory Management",
        addNewItem: "Add New Item", searchItems: "Search items...",
        allItems: "All Items", lowStockBtn: "Low Stock", outOfStockBtn: "Out of Stock",
        itemName: "Item Name", category: "Category", currentStock: "Current Stock",
        minStock: "Min Stock", status: "Status", actions: "Actions",
        totalItems: "Total Items", stockValue: "Stock Value",
        outOfStock: "Out of Stock", inStock: "In Stock",

        // Billing
        billingTitle: "Billing & Invoices",
        newInvoice: "New Invoice", customerName: "Customer Name",
        phoneNumber: "Phone Number", addItem: "Add Item",
        subtotal: "Subtotal", gst: "GST", totalAmount: "Total Amount",
        generateInvoice: "Generate Invoice", sendWhatsApp: "Send via WhatsApp",

        // Common
        save: "Save", cancel: "Cancel", edit: "Edit", delete: "Delete",
        loading: "Loading...", search: "Search"
    },
    hi: {
        todaySales: "आज की बिक्री", monthlyRevenue: "मासिक राजस्व",
        lowStock: "कम स्टॉक", totalProducts: "कुल उत्पाद",
        recentActivity: "हाल की गतिविधि", topSelling: "सबसे ज्यादा बिकने वाले",
        aiInsight: "AI सुझाव", noActivity: "कोई गतिविधि नहीं। बिक्री दर्ज करें!",
        noItems: "कोई आइटम नहीं। इन्वेंटरी में उत्पाद जोड़ें!",
        saleRecorded: "बिक्री दर्ज", remaining: "बचा है",

        inventoryTitle: "इन्वेंटरी प्रबंधन",
        addNewItem: "नया आइटम जोड़ें", searchItems: "आइटम खोजें...",
        allItems: "सभी आइटम", lowStockBtn: "कम स्टॉक", outOfStockBtn: "स्टॉक खत्म",
        itemName: "आइटम नाम", category: "श्रेणी", currentStock: "वर्तमान स्टॉक",
        minStock: "न्यूनतम स्टॉक", status: "स्थिति", actions: "क्रियाएं",
        totalItems: "कुल आइटम", stockValue: "स्टॉक मूल्य",
        outOfStock: "स्टॉक खत्म", inStock: "स्टॉक में",

        billingTitle: "बिलिंग और चालान",
        newInvoice: "नया चालान", customerName: "ग्राहक का नाम",
        phoneNumber: "फोन नंबर", addItem: "आइटम जोड़ें",
        subtotal: "उप-योग", gst: "जीएसटी", totalAmount: "कुल राशि",
        generateInvoice: "चालान बनाएं", sendWhatsApp: "WhatsApp पर भेजें",

        save: "सहेजें", cancel: "रद्द करें", edit: "संपादित करें", delete: "हटाएं",
        loading: "लोड हो रहा है...", search: "खोजें"
    },
    ta: {
        todaySales: "இன்றைய விற்பனை", monthlyRevenue: "மாத வருவாய்",
        lowStock: "குறைந்த இருப்பு", totalProducts: "மொத்த பொருட்கள்",
        recentActivity: "சமீபத்திய செயல்பாடு", topSelling: "அதிகம் விற்பனையானவை",
        aiInsight: "AI யோசனை", noActivity: "செயல்பாடு இல்லை!",
        noItems: "பொருட்கள் இல்லை!", saleRecorded: "விற்பனை பதிவு", remaining: "மீதமுள்ளது",

        inventoryTitle: "சரக்கு மேலாண்மை",
        addNewItem: "புதிய பொருள் சேர்க்க", searchItems: "பொருட்கள் தேடு...",
        allItems: "அனைத்து பொருட்கள்", lowStockBtn: "குறைந்த இருப்பு", outOfStockBtn: "இருப்பு இல்லை",
        itemName: "பொருள் பெயர்", category: "வகை", currentStock: "தற்போதைய இருப்பு",
        minStock: "குறைந்தபட்ச இருப்பு", status: "நிலை", actions: "செயல்கள்",
        totalItems: "மொத்த பொருட்கள்", stockValue: "இருப்பு மதிப்பு",
        outOfStock: "இருப்பு இல்லை", inStock: "இருப்பில் உள்ளது",

        billingTitle: "பில்லிங் மற்றும் விலைப்பட்டியல்",
        newInvoice: "புதிய விலைப்பட்டியல்", customerName: "வாடிக்கையாளர் பெயர்",
        phoneNumber: "தொலைபேசி எண்", addItem: "பொருள் சேர்க்க",
        subtotal: "கூட்டுத்தொகை", gst: "ஜிஎஸ்டி", totalAmount: "மொத்த தொகை",
        generateInvoice: "விலைப்பட்டியல் உருவாக்கு", sendWhatsApp: "WhatsApp மூலம் அனுப்பு",

        save: "சேமி", cancel: "ரத்து", edit: "திருத்து", delete: "நீக்கு",
        loading: "ஏற்றுகிறது...", search: "தேடு"
    },
    gu: {
        todaySales: "આજની વેચાણ", monthlyRevenue: "માસિક આવક",
        lowStock: "ઓછો સ્ટોક", totalProducts: "કુલ ઉત્પાદનો",
        recentActivity: "તાજેતરની પ્રવૃત્તિ", topSelling: "સૌથી વધુ વેચાતી",
        aiInsight: "AI સૂઝ", noActivity: "કોઈ પ્રવૃત્તિ નથી!",
        noItems: "કોઈ આઇટમ નથી!", saleRecorded: "વેચાણ નોંધ્યું", remaining: "બાકી",

        inventoryTitle: "ઇન્વેન્ટરી મેનેજમેન્ટ",
        addNewItem: "નવી આઇટમ ઉમેરો", searchItems: "આઇટમ શોધો...",
        allItems: "બધી આઇટમ", lowStockBtn: "ઓછો સ્ટોક", outOfStockBtn: "સ્ટોક ખાલી",
        itemName: "આઇટમ નામ", category: "શ્રેણી", currentStock: "વર્તમાન સ્ટોક",
        minStock: "ન્યૂનતમ સ્ટોક", status: "સ્થિતિ", actions: "ક્રિયાઓ",
        totalItems: "કુલ આઇટમ", stockValue: "સ્ટોક મૂલ્ય",
        outOfStock: "સ્ટોક ખાલી", inStock: "સ્ટોકમાં",

        billingTitle: "બિલિંગ અને ઇન્વોઇસ",
        newInvoice: "નવું ઇન્વોઇસ", customerName: "ગ્રાહકનું નામ",
        phoneNumber: "ફોન નંબર", addItem: "આઇટમ ઉમેરો",
        subtotal: "પેટા-કુલ", gst: "જીએસટી", totalAmount: "કુલ રકમ",
        generateInvoice: "ઇન્વોઇસ બનાવો", sendWhatsApp: "WhatsApp પર મોકલો",

        save: "સાચવો", cancel: "રદ કરો", edit: "સંપાદિત કરો", delete: "કાઢો",
        loading: "લોડ થઈ રહ્યું છે...", search: "શોધો"
    },
    te: {
        todaySales: "నేటి అమ్మకాలు", monthlyRevenue: "నెలవారీ ఆదాయం",
        lowStock: "తక్కువ స్టాక్", totalProducts: "మొత్తం ఉత్పత్తులు",
        recentActivity: "ఇటీవలి కార్యాచరణ", topSelling: "అత్యధికంగా అమ్ముడైనవి",
        aiInsight: "AI అంతర్దృష్టి", noActivity: "కార్యాచరణ లేదు!",
        noItems: "అంశాలు లేవు!", saleRecorded: "అమ్మకం నమోదు", remaining: "మిగిలి ఉంది",

        inventoryTitle: "జాబితా నిర్వహణ",
        addNewItem: "కొత్త వస్తువు జోడించు", searchItems: "వస్తువులు వెతకండి...",
        allItems: "అన్ని వస్తువులు", lowStockBtn: "తక్కువ స్టాక్", outOfStockBtn: "స్టాక్ లేదు",
        itemName: "వస్తువు పేరు", category: "వర్గం", currentStock: "ప్రస్తుత స్టాక్",
        minStock: "కనీస స్టాక్", status: "స్థితి", actions: "చర్యలు",
        totalItems: "మొత్తం వస్తువులు", stockValue: "స్టాక్ విలువ",
        outOfStock: "స్టాక్ లేదు", inStock: "స్టాక్‌లో ఉంది",

        billingTitle: "బిల్లింగ్ మరియు ఇన్వాయిస్",
        newInvoice: "కొత్త ఇన్వాయిస్", customerName: "కస్టమర్ పేరు",
        phoneNumber: "ఫోన్ నంబర్", addItem: "వస్తువు జోడించు",
        subtotal: "ఉప-మొత్తం", gst: "జిఎస్టి", totalAmount: "మొత్తం మొత్తం",
        generateInvoice: "ఇన్వాయిస్ రూపొందించు", sendWhatsApp: "WhatsApp ద్వారా పంపు",

        save: "సేవ్ చేయి", cancel: "రద్దు చేయి", edit: "సవరించు", delete: "తొలగించు",
        loading: "లోడ్ అవుతోంది...", search: "వెతకండి"
    }
};

let currentLang = localStorage.getItem('language') || 'en';

function t(key) {
    return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['en'][key] || key;
}

function applyLanguage() {
    // Dashboard cards
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

    // Inventory section
    const invTitle = document.querySelector('#inventory .section-header h2');
    if (invTitle) invTitle.textContent = t('inventoryTitle');

    const addBtn = document.getElementById('addProductBtn');
    if (addBtn) addBtn.innerHTML = `<i class="fas fa-plus"></i> ${t('addNewItem')}`;

    const searchInput = document.getElementById('inventorySearch');
    if (searchInput) searchInput.placeholder = t('searchItems');

    // Filter buttons
    const filterBtns = document.querySelectorAll('#inventory .filter-btn');
    if (filterBtns[0]) filterBtns[0].textContent = t('allItems');
    if (filterBtns[1]) filterBtns[1].textContent = t('lowStockBtn');
    if (filterBtns[2]) filterBtns[2].textContent = t('outOfStockBtn');

    // Table headers
    const headers = document.querySelectorAll('#inventory .inventory-table thead th');
    const headerKeys = ['itemName', 'category', 'currentStock', 'minStock', 'status', 'actions'];
    headers.forEach((th, i) => {
        if (headerKeys[i]) th.textContent = t(headerKeys[i]);
    });

    // Summary cards in inventory
    const summaryCards = document.querySelectorAll('#inventory .inventory-summary .summary-card h4');
    if (summaryCards[0]) summaryCards[0].textContent = t('totalItems');
    if (summaryCards[1]) summaryCards[1].textContent = t('lowStock');
    if (summaryCards[2]) summaryCards[2].textContent = t('outOfStock');
    if (summaryCards[3]) summaryCards[3].textContent = t('stockValue');

    // Billing section
    const billingTitle = document.querySelector('#billing .section-header h2');
    if (billingTitle) billingTitle.textContent = t('billingTitle');

    const newInvoiceBtn = document.querySelector('.new-invoice-btn');
    if (newInvoiceBtn) newInvoiceBtn.innerHTML = `<i class="fas fa-plus"></i> ${t('newInvoice')}`;

    const custNameLabel = document.querySelector('label[for="customerName"]');
    if (custNameLabel) custNameLabel.textContent = t('customerName');

    const custPhoneLabel = document.querySelector('label[for="customerPhone"]');
    if (custPhoneLabel) custPhoneLabel.textContent = t('phoneNumber');

    const addItemRowBtn = document.getElementById('addItemRow');
    if (addItemRowBtn) addItemRowBtn.innerHTML = `<i class="fas fa-plus"></i> ${t('addItem')}`;

    const generateBtn = document.querySelector('.generate-btn');
    if (generateBtn) generateBtn.innerHTML = `<i class="fas fa-print"></i> ${t('generateInvoice')}`;

    const sendBtn = document.querySelector('.send-btn');
    if (sendBtn) sendBtn.innerHTML = `<i class="fab fa-whatsapp"></i> ${t('sendWhatsApp')}`;
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