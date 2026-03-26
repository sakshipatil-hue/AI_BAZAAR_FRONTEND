// AI Bazaar - Inventory Manager (Backend Connected)
const INV_API = "https://ai-bazaar-backend-g2yb.onrender.com";

async function invFetch(path, options = {}) {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${INV_API}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options.headers || {})
        }
    });
    return res;
}

// ── Initialize ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    setupInventoryEvents();
    loadInventory();
});

function setupInventoryEvents() {
    // Add product button
    const addBtn = document.getElementById('addProductBtn');
    if (addBtn) addBtn.addEventListener('click', openAddModal);

    // Modal close buttons
    const closeModal = document.getElementById('closeModal');
    const cancelModal = document.getElementById('cancelModal');
    if (closeModal) closeModal.addEventListener('click', closeProductModal);
    if (cancelModal) cancelModal.addEventListener('click', closeProductModal);

    // Save product button
    const saveBtn = document.getElementById('saveProduct');
    if (saveBtn) saveBtn.addEventListener('click', saveProduct);

    // Search
    const searchInput = document.getElementById('inventorySearch');
    if (searchInput) searchInput.addEventListener('input', filterInventory);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterInventory();
        });
    });
}

// ── Load Inventory ────────────────────────────────────────────────
let allProducts = [];

async function loadInventory() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">Loading...</td></tr>';

    try {
        const res = await invFetch('/api/inventory/');
        if (res.ok) {
            allProducts = await res.json();
            renderInventory(allProducts);
            updateInventorySummary(allProducts);
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:red;">Failed to load inventory</td></tr>';
        }
    } catch (err) {
        console.error('Inventory load error:', err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:red;">Cannot connect to server</td></tr>';
    }
}

function renderInventory(products) {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#999;">No products found. Click "Add New Item" to get started!</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => {
        const status = product.quantity <= 0 ? 'Out of Stock' :
                       product.quantity <= product.reorder_level ? 'Low Stock' : 'In Stock';
        const statusClass = product.quantity <= 0 ? 'danger' :
                            product.quantity <= product.reorder_level ? 'warning' : 'success';

        return `
            <tr>
                <td>${product.name}</td>
                <td>${product.category || '—'}</td>
                <td>${product.quantity} ${product.unit}</td>
                <td>${product.reorder_level} ${product.unit}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="action-btn edit" onclick="openEditModal(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterInventory() {
    const search = document.getElementById('inventorySearch')?.value.toLowerCase() || '';
    const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';

    let filtered = allProducts.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search) ||
                           (p.category || '').toLowerCase().includes(search);
        const matchFilter = activeFilter === 'all' ? true :
                           activeFilter === 'low' ? (p.quantity <= p.reorder_level && p.quantity > 0) :
                           activeFilter === 'out' ? p.quantity <= 0 : true;
        return matchSearch && matchFilter;
    });

    renderInventory(filtered);
}

function updateInventorySummary(products) {
    const total = products.length;
    const lowStock = products.filter(p => p.quantity <= p.reorder_level && p.quantity > 0).length;
    const outOfStock = products.filter(p => p.quantity <= 0).length;
    const stockValue = products.reduce((sum, p) => sum + (p.quantity * p.purchase_price), 0);

    setElText('totalItemsCount', total);
    setElText('lowStockItems', lowStock);
    setElText('outOfStock', outOfStock);
    setElText('stockValue', `₹${stockValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);

    // Also update dashboard KPI
    setElText('totalItems', total);
    setElText('lowStockCount', lowStock);
}

// ── Modal ─────────────────────────────────────────────────────────
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productQuantity').value = '';
    document.getElementById('productUnit').value = 'piece';
    document.getElementById('productPurchasePrice').value = '';
    document.getElementById('productSellingPrice').value = '';
    document.getElementById('productGstRate').value = '5';
    document.getElementById('productReorderLevel').value = '10';

    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'flex';
}

function openEditModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productUnit').value = product.unit;
    document.getElementById('productPurchasePrice').value = product.purchase_price;
    document.getElementById('productSellingPrice').value = product.selling_price;
    document.getElementById('productGstRate').value = product.gst_rate;
    document.getElementById('productReorderLevel').value = product.reorder_level;

    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'flex';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
}

// ── Save Product ──────────────────────────────────────────────────
async function saveProduct() {
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();

    if (!name) {
        alert('Product name is required!');
        return;
    }

    const payload = {
        name: name,
        category: document.getElementById('productCategory').value.trim() || null,
        quantity: parseFloat(document.getElementById('productQuantity').value) || 0,
        unit: document.getElementById('productUnit').value || 'piece',
        purchase_price: parseFloat(document.getElementById('productPurchasePrice').value) || 0,
        selling_price: parseFloat(document.getElementById('productSellingPrice').value) || 0,
        gst_rate: parseFloat(document.getElementById('productGstRate').value) || 5,
        reorder_level: parseFloat(document.getElementById('productReorderLevel').value) || 10,
    };

    const saveBtn = document.getElementById('saveProduct');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        let res;
        if (productId) {
            res = await invFetch(`/api/inventory/${productId}`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
        } else {
            res = await invFetch('/api/inventory/', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        if (res.ok) {
            closeProductModal();
            loadInventory();
            showInvToast(productId ? 'Product updated!' : 'Product added!', 'success');
        } else {
            const err = await res.json();
            alert(err.detail || 'Failed to save product');
        }
    } catch (err) {
        alert('Cannot connect to server');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Product';
    }
}

// ── Delete Product ────────────────────────────────────────────────
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const res = await invFetch(`/api/inventory/${productId}`, { method: 'DELETE' });
        if (res.ok) {
            loadInventory();
            showInvToast('Product deleted!', 'success');
        } else {
            alert('Failed to delete product');
        }
    } catch (err) {
        alert('Cannot connect to server');
    }
}

// ── Helper ────────────────────────────────────────────────────────
function setElText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function showInvToast(message, type = 'success') {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        console.log(`[${type}] ${message}`);
    }
}
// Make functions global for onclick handlers
window.openEditModal = openEditModal;
window.deleteProduct = deleteProduct;