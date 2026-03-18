// Inventory Management Module - Handles inventory data, CRUD operations, search/filter

class InventoryManager {
    constructor() {
        this.items = [];
        this.filteredItems = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.categories = ['Grocery', 'Dairy', 'Beverages', 'Snacks', 'Personal Care'];
        
        this.init();
    }

    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.renderInventory();
    }

    loadSampleData() {
        // Sample inventory data
        this.items = [
            { id: 1, name: 'Atta (Flour)', category: 'Grocery', quantity: 15, unit: 'kg', minStock: 10, price: 40, supplier: 'ABC Foods' },
            { id: 2, name: 'Sugar', category: 'Grocery', quantity: 8, unit: 'kg', minStock: 10, price: 45, supplier: 'ABC Foods' },
            { id: 3, name: 'Tea Powder', category: 'Beverages', quantity: 5, unit: 'packets', minStock: 10, price: 50, supplier: 'Tea House' },
            { id: 4, name: 'Cooking Oil', category: 'Grocery', quantity: 12, unit: 'bottles', minStock: 5, price: 150, supplier: 'Oil Mills' },
            { id: 5, name: 'Rice', category: 'Grocery', quantity: 25, unit: 'kg', minStock: 15, price: 60, supplier: 'ABC Foods' },
            { id: 6, name: 'Milk', category: 'Dairy', quantity: 0, unit: 'liters', minStock: 5, price: 30, supplier: 'Dairy Farm' },
            { id: 7, name: 'Biscuits', category: 'Snacks', quantity: 30, unit: 'packets', minStock: 20, price: 10, supplier: 'Snack Co' },
            { id: 8, name: 'Soap', category: 'Personal Care', quantity: 22, unit: 'pieces', minStock: 15, price: 25, supplier: 'Health Care' },
            { id: 9, name: 'Shampoo', category: 'Personal Care', quantity: 8, unit: 'bottles', minStock: 10, price: 80, supplier: 'Health Care' },
            { id: 10, name: 'Dal', category: 'Grocery', quantity: 18, unit: 'kg', minStock: 10, price: 90, supplier: 'ABC Foods' }
        ];
        
        this.filteredItems = [...this.items];
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('inventorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentFilter = btn.getAttribute('data-filter');
                this.applyFilters();
            });
        });
        
        // Add item button
        const addBtn = document.getElementById('addItemBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddItemModal());
        }
        
        // Export button
        const exportBtn = document.getElementById('exportInventoryBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportInventory());
        }
    }

    applyFilters() {
        let filtered = [...this.items];
        
        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(this.searchTerm) ||
                item.category.toLowerCase().includes(this.searchTerm) ||
                item.supplier.toLowerCase().includes(this.searchTerm)
            );
        }
        
        // Apply status filter
        if (this.currentFilter === 'low') {
            filtered = filtered.filter(item => item.quantity <= item.minStock && item.quantity > 0);
        } else if (this.currentFilter === 'out') {
            filtered = filtered.filter(item => item.quantity <= 0);
        }
        
        this.filteredItems = filtered;
        this.renderInventory();
    }

    renderInventory() {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;
        
        if (this.filteredItems.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="no-data">
                        <i class="fas fa-box-open"></i>
                        <p>No items found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.filteredItems.map(item => {
            const status = this.getStatus(item);
            const statusClass = this.getStatusClass(status);
            
            return `
                <tr data-id="${item.id}">
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td class="${statusClass}">${item.quantity} ${item.unit}</td>
                    <td>${item.unit}</td>
                    <td>${item.minStock} ${item.unit}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                    <td>₹${item.price}/${item.unit}</td>
                    <td>
                        <button class="action-btn edit" onclick="inventoryManager.editItem(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="inventoryManager.deleteItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.updateSummary();
    }

    getStatus(item) {
        if (item.quantity <= 0) return 'Out of Stock';
        if (item.quantity <= item.minStock) return 'Low Stock';
        return 'In Stock';
    }

    getStatusClass(status) {
        switch(status) {
            case 'Out of Stock': return 'danger';
            case 'Low Stock': return 'warning';
            default: return 'success';
        }
    }

    updateSummary() {
        const totalItems = this.items.length;
        const lowStock = this.items.filter(item => item.quantity <= item.minStock && item.quantity > 0).length;
        const outOfStock = this.items.filter(item => item.quantity <= 0).length;
        const totalValue = this.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        const totalEl = document.getElementById('totalItems');
        const lowEl = document.getElementById('lowStockItems');
        const outEl = document.getElementById('outOfStock');
        const valueEl = document.querySelector('.inventory-summary .summary-card:last-child .summary-value');
        
        if (totalEl) totalEl.textContent = totalItems;
        if (lowEl) lowEl.textContent = lowStock;
        if (outEl) outEl.textContent = outOfStock;
        if (valueEl) valueEl.textContent = `₹${totalValue.toLocaleString()}`;
    }

    showAddItemModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'addItemModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New Item</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addItemForm">
                        <div class="form-group">
                            <label>Item Name *</label>
                            <input type="text" id="itemName" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Category</label>
                                <select id="itemCategory">
                                    ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Unit *</label>
                                <select id="itemUnit" required>
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                    <option value="pieces">pieces</option>
                                    <option value="bottles">bottles</option>
                                    <option value="packets">packets</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Quantity *</label>
                                <input type="number" id="itemQuantity" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label>Min Stock Level</label>
                                <input type="number" id="itemMinStock" step="0.01" value="0">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Price (₹) *</label>
                                <input type="number" id="itemPrice" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label>Supplier</label>
                                <input type="text" id="itemSupplier">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn-primary" onclick="inventoryManager.saveNewItem()">Add Item</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    saveNewItem() {
        const newItem = {
            id: this.items.length + 1,
            name: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            unit: document.getElementById('itemUnit').value,
            quantity: parseFloat(document.getElementById('itemQuantity').value) || 0,
            minStock: parseFloat(document.getElementById('itemMinStock').value) || 0,
            price: parseFloat(document.getElementById('itemPrice').value) || 0,
            supplier: document.getElementById('itemSupplier').value || 'Unknown'
        };
        
        // Validate
        if (!newItem.name) {
            this.showToast('Item name is required', 'error');
            return;
        }
        
        this.items.push(newItem);
        this.applyFilters();
        
        document.querySelector('.modal').remove();
        this.showToast('Item added successfully!', 'success');
    }

    editItem(id) {
        const item = this.items.find(i => i.id === id);
        if (!item) return;
        
        // Show edit modal (similar to add but with pre-filled values)
        this.showEditItemModal(item);
    }

    showEditItemModal(item) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'editItemModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Item</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editItemForm">
                        <div class="form-group">
                            <label>Item Name *</label>
                            <input type="text" id="editItemName" value="${item.name}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Category</label>
                                <select id="editItemCategory">
                                    ${this.categories.map(cat => 
                                        `<option value="${cat}" ${item.category === cat ? 'selected' : ''}>${cat}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Unit *</label>
                                <select id="editItemUnit" required>
                                    <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg</option>
                                    <option value="g" ${item.unit === 'g' ? 'selected' : ''}>g</option>
                                    <option value="pieces" ${item.unit === 'pieces' ? 'selected' : ''}>pieces</option>
                                    <option value="bottles" ${item.unit === 'bottles' ? 'selected' : ''}>bottles</option>
                                    <option value="packets" ${item.unit === 'packets' ? 'selected' : ''}>packets</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Quantity *</label>
                                <input type="number" id="editItemQuantity" step="0.01" value="${item.quantity}" required>
                            </div>
                            <div class="form-group">
                                <label>Min Stock Level</label>
                                <input type="number" id="editItemMinStock" step="0.01" value="${item.minStock}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Price (₹) *</label>
                                <input type="number" id="editItemPrice" step="0.01" value="${item.price}" required>
                            </div>
                            <div class="form-group">
                                <label>Supplier</label>
                                <input type="text" id="editItemSupplier" value="${item.supplier}">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn-primary" onclick="inventoryManager.updateItem(${item.id})">Update Item</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    updateItem(id) {
        const itemIndex = this.items.findIndex(i => i.id === id);
        if (itemIndex === -1) return;
        
        this.items[itemIndex] = {
            id: id,
            name: document.getElementById('editItemName').value,
            category: document.getElementById('editItemCategory').value,
            unit: document.getElementById('editItemUnit').value,
            quantity: parseFloat(document.getElementById('editItemQuantity').value) || 0,
            minStock: parseFloat(document.getElementById('editItemMinStock').value) || 0,
            price: parseFloat(document.getElementById('editItemPrice').value) || 0,
            supplier: document.getElementById('editItemSupplier').value || 'Unknown'
        };
        
        this.applyFilters();
        
        document.querySelector('.modal').remove();
        this.showToast('Item updated successfully!', 'success');
    }

    deleteItem(id) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        this.items = this.items.filter(item => item.id !== id);
        this.applyFilters();
        this.showToast('Item deleted successfully!', 'success');
    }

    exportInventory() {
        const csv = this.items.map(item => 
            `${item.name},${item.category},${item.quantity},${item.unit},${item.minStock},${item.price},${item.supplier}`
        ).join('\n');
        
        const headers = 'Name,Category,Quantity,Unit,Min Stock,Price,Supplier\n';
        const content = headers + csv;
        
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showToast('Inventory exported successfully!', 'success');
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Initialize inventory when dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('inventory')) {
        window.inventoryManager = new InventoryManager();
    }
});