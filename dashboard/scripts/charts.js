// AI Bazaar - Real-time Charts
const CHART_API = "https://ai-bazaar-backend-29o3.onrender.com";

async function chartFetch(path) {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${CHART_API}${path}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

// ── Color palette ─────────────────────────────────────────────────
const COLORS = {
    primary: '#FF6B35',
    secondary: '#2E86AB',
    success: '#4CAF50',
    warning: '#FFB74D',
    danger: '#F44336',
    purple: '#9C27B0',
    teal: '#009688'
};

let chartInstances = {};

// ── Initialize all charts ─────────────────────────────────────────
async function initAllCharts() {
    try {
        const [sales, inventory] = await Promise.all([
            chartFetch('/api/sales/?limit=200').catch(() => []),
            chartFetch('/api/inventory/').catch(() => [])
        ]);

        initSalesChart(sales);
        initTopItemsChart(inventory);
        initTrendChart(sales);
        initCategoryChart(inventory);

    } catch (err) {
        console.error('Charts load failed:', err);
        initChartsWithDemoData();
    }
}

// ── Sales Chart (last 7 days) ─────────────────────────────────────
function initSalesChart(sales) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    if (chartInstances.sales) chartInstances.sales.destroy();

    // Build last 7 days data
    const days = [], revenues = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString('en-IN', { weekday: 'short' }));
        const dayTotal = (sales || [])
            .filter(s => new Date(s.created_at).toDateString() === d.toDateString())
            .reduce((sum, s) => sum + s.total, 0);
        revenues.push(Math.round(dayTotal));
    }

    chartInstances.sales = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Daily Sales (₹)',
                data: revenues,
                borderColor: COLORS.primary,
                backgroundColor: hexToRgba(COLORS.primary, 0.1),
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: COLORS.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `₹${ctx.parsed.y.toLocaleString('en-IN')}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => '₹' + val.toLocaleString('en-IN')
                    }
                }
            }
        }
    });
}

// ── Top Items Chart (doughnut) ────────────────────────────────────
function initTopItemsChart(inventory) {
    const ctx = document.getElementById('topItemsChart');
    if (!ctx) return;

    if (chartInstances.topItems) chartInstances.topItems.destroy();

    const top5 = (inventory || [])
        .sort((a, b) => (b.selling_price * b.quantity) - (a.selling_price * a.quantity))
        .slice(0, 5);

    const labels = top5.length > 0 ? top5.map(p => p.name) : ['No data'];
    const data = top5.length > 0 ? top5.map(p => Math.round(p.selling_price * p.quantity)) : [1];
    const colors = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.purple];

    chartInstances.topItems = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 20, usePointStyle: true }
                }
            }
        }
    });
}

// ── Trend Chart (last 6 months) ───────────────────────────────────
function initTrendChart(sales) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    if (chartInstances.trend) chartInstances.trend.destroy();

    const months = [], revenues = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push(d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
        const monthTotal = (sales || [])
            .filter(s => {
                const sd = new Date(s.created_at);
                return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
            })
            .reduce((sum, s) => sum + s.total, 0);
        revenues.push(Math.round(monthTotal));
    }

    chartInstances.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Revenue (₹)',
                data: revenues,
                borderColor: COLORS.secondary,
                backgroundColor: hexToRgba(COLORS.secondary, 0.1),
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: COLORS.secondary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `₹${ctx.parsed.y.toLocaleString('en-IN')}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => '₹' + (val / 1000).toFixed(0) + 'k'
                    }
                }
            }
        }
    });
}

// ── Category Chart (bar) ──────────────────────────────────────────
function initCategoryChart(inventory) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    if (chartInstances.category) chartInstances.category.destroy();

    // Group inventory by category
    const catMap = {};
    (inventory || []).forEach(p => {
        const cat = p.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + (p.selling_price * p.quantity);
    });

    const labels = Object.keys(catMap).slice(0, 6);
    const data = labels.map(l => Math.round(catMap[l]));
    const colors = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.purple, COLORS.teal];

    chartInstances.category = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length > 0 ? labels : ['No data'],
            datasets: [{
                label: 'Stock Value (₹)',
                data: data.length > 0 ? data : [0],
                backgroundColor: colors,
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `₹${ctx.parsed.y.toLocaleString('en-IN')}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => '₹' + val.toLocaleString('en-IN')
                    }
                }
            }
        }
    });
}

// ── Auto refresh every 30 seconds ────────────────────────────────
function startAutoRefresh() {
    setInterval(async () => {
        console.log('🔄 Refreshing charts...');
        await initAllCharts();
    }, 30000);
}

// ── Demo data fallback ────────────────────────────────────────────
function initChartsWithDemoData() {
    initSalesChart([]);
    initTopItemsChart([]);
    initTrendChart([]);
    initCategoryChart([]);
}

// ── Helper ────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

// ── Export for dashboard ──────────────────────────────────────────
window.dashboardCharts = {
    initAllCharts,
    startAutoRefresh
};

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', async function () {
    await initAllCharts();
    startAutoRefresh();
});