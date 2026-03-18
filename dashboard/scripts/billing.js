// Billing Module - Handles invoice generation, GST calculations, form validation

class BillingManager {
    constructor() {
        this.invoiceItems = [];
        this.customers = [];
        this.currentInvoice = null;
        this.gstRate = 18; // Default GST rate
        
        this.init();
    }

    init() {
        this.loadSampleCustomers();
        this.setupEventListeners();
        this.updateTotals();
    }

    loadSampleCustomers() {
        this.customers = [
            { id: 1, name: 'Rajesh Kumar', phone: '9876543210' },
            { id: 2, name: 'Priya Sharma', phone: '9876543211' },
            { id: 3, name: 'Amit Singh', phone: '9876543212' }
        ];
    }

    setupEventListeners() {
        // Add item button
        const addItemBtn = document.getElementById('addItemToInvoice');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.addInvoiceItem());
        }
        
        // Input listeners for calculations
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('item-qty') || 
                e.target.classList.contains('item-price') ||
                e.target.classList.contains('item-select')) {
                this.updateItemTotals(e.target);
            }
        });
        
        // Preview button
        const previewBtn = document.getElementById('previewInvoiceBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.previewInvoice());
        }
        
        // Generate button
        const generateBtn = document.getElementById('generateInvoiceBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateInvoice());
        }
        
        // WhatsApp button
        const whatsappBtn = document.getElementById('whatsappBtn');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => this.sendViaWhatsApp());
        }
        
        // Customer input validation
        const customerPhone = document.getElementById('customerPhone');
        if (customerPhone) {
            customerPhone.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
            });
        }
    }

    addInvoiceItem() {
        const itemsList = document.getElementById('invoiceItemsList');
        if (!itemsList) return;
        
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.innerHTML = `
            <select class="item-select">
                <option value="">Select item</option>
                ${this.getInventoryOptions()}
            </select>
            <input type="number" class="item-qty" placeholder="Qty" value="1" min="1">
            <input type="number" class="item-price" placeholder="Price" step="0.01">
            <span class="item-total">₹0.00</span>
            <button class="remove-item" onclick="this.closest('.item-row').remove(); billingManager.updateTotals();">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        itemsList.appendChild(itemRow);
        this.updateTotals();
    }

    getInventoryOptions() {
        // Get items from inventory manager if available
        if (window.inventoryManager) {
            return window.inventoryManager.items.map(item => 
                `<option value="${item.id}" data-price="${item.price}">${item.name} - ₹${item.price}/${item.unit}</option>`
            ).join('');
        }
        
        // Default options
        return `
            <option value="1" data-price="40">Atta (Flour) - ₹40/kg</option>
            <option value="2" data-price="45">Sugar - ₹45/kg</option>
            <option value="3" data-price="50">Tea Powder - ₹50/packet</option>
            <option value="4" data-price="150">Cooking Oil - ₹150/bottle</option>
            <option value="5" data-price="60">Rice - ₹60/kg</option>
        `;
    }

    updateItemTotals(input) {
        const row = input.closest('.item-row');
        if (!row) return;
        
        const select = row.querySelector('.item-select');
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        let price = parseFloat(row.querySelector('.item-price').value) || 0;
        
        // If price not entered, get from selected option
        if (price === 0 && select && select.selectedOptions[0]) {
            price = parseFloat(select.selectedOptions[0].dataset.price) || 0;
            row.querySelector('.item-price').value = price;
        }
        
        const total = qty * price;
        row.querySelector('.item-total').textContent = `₹${total.toFixed(2)}`;
        
        this.updateTotals();
    }

    updateTotals() {
        let subtotal = 0;
        
        document.querySelectorAll('.item-row').forEach(row => {
            const totalText = row.querySelector('.item-total').textContent;
            const total = parseFloat(totalText.replace('₹', '')) || 0;
            subtotal += total;
        });
        
        const gst = subtotal * (this.gstRate / 100);
        const total = subtotal + gst;
        
        document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('gstAmount').textContent = `₹${gst.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `₹${total.toFixed(2)}`;
        
        return { subtotal, gst, total };
    }

    validateForm() {
        const customerName = document.getElementById('customerName').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();
        const items = document.querySelectorAll('.item-row');
        
        let errors = [];
        
        if (!customerName) {
            errors.push('Customer name is required');
            document.getElementById('customerName').classList.add('error');
        } else {
            document.getElementById('customerName').classList.remove('error');
        }
        
        if (customerPhone && !/^\d{10}$/.test(customerPhone)) {
            errors.push('Phone number must be 10 digits');
            document.getElementById('customerPhone').classList.add('error');
        } else {
            document.getElementById('customerPhone').classList.remove('error');
        }
        
        let hasItems = false;
        items.forEach(row => {
            const select = row.querySelector('.item-select');
            const qty = parseFloat(row.querySelector('.item-qty').value);
            const price = parseFloat(row.querySelector('.item-price').value);
            
            if (select && select.value && qty > 0 && price > 0) {
                hasItems = true;
            }
        });
        
        if (!hasItems) {
            errors.push('At least one valid item is required');
        }
        
        if (errors.length > 0) {
            this.showToast(errors.join('<br>'), 'error');
            return false;
        }
        
        return true;
    }

    previewInvoice() {
        if (!this.validateForm()) return;
        
        const totals = this.updateTotals();
        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;
        
        // Create preview modal
        const previewHTML = `
            <div class="invoice-preview-modal">
                <div class="invoice-header">
                    <h2>Ramesh Kirana Store</h2>
                    <p>Gandhi Nagar, Delhi • GST: 07AAACR5055F1Z5</p>
                </div>
                <div class="invoice-customer">
                    <p><strong>Bill To:</strong> ${customerName}</p>
                    <p><strong>Phone:</strong> ${customerPhone || 'N/A'}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Invoice #:</strong> INV-${Date.now().toString().slice(-6)}</p>
                </div>
                <div class="invoice-items">
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.getPreviewItems()}
                        </tbody>
                    </table>
                </div>
                <div class="invoice-totals">
                    <div class="total-row"><span>Subtotal:</span> <span>₹${totals.subtotal.toFixed(2)}</span></div>
                    <div class="total-row"><span>GST (${this.gstRate}%):</span> <span>₹${totals.gst.toFixed(2)}</span></div>
                    <div class="total-row grand"><span>Total:</span> <span>₹${totals.total.toFixed(2)}</span></div>
                </div>
                <div class="invoice-footer">
                    <p>Thank you for your business!</p>
                </div>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>Invoice Preview</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${previewHTML}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn-primary" onclick="billingManager.generateInvoice(); this.closest('.modal').remove()">
                        Confirm & Generate
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    getPreviewItems() {
        let html = '';
        document.querySelectorAll('.item-row').forEach(row => {
            const select = row.querySelector('.item-select');
            const qty = row.querySelector('.item-qty').value;
            const price = row.querySelector('.item-price').value;
            const total = row.querySelector('.item-total').textContent;
            
            if (select && select.value && qty > 0) {
                const itemName = select.selectedOptions[0].text.split(' - ')[0];
                html += `
                    <tr>
                        <td>${itemName}</td>
                        <td>${qty}</td>
                        <td>₹${parseFloat(price).toFixed(2)}</td>
                        <td>${total}</td>
                    </tr>
                `;
            }
        });
        return html;
    }

    async generateInvoice() {
        if (!this.validateForm()) return;
        
        const totals = this.updateTotals();
        const invoiceData = {
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString(),
            customer: {
                name: document.getElementById('customerName').value,
                phone: document.getElementById('customerPhone').value
            },
            items: this.getInvoiceItems(),
            subtotal: totals.subtotal,
            gst: totals.gst,
            total: totals.total
        };
        
        this.showToast('Generating invoice...', 'info');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.currentInvoice = invoiceData;
            this.addToRecentInvoices(invoiceData);
            this.resetForm();
            this.showToast('Invoice generated successfully!', 'success');
            
        } catch (error) {
            console.error('Invoice generation failed:', error);
            this.showToast('Failed to generate invoice', 'error');
        }
    }

    getInvoiceItems() {
        const items = [];
        document.querySelectorAll('.item-row').forEach(row => {
            const select = row.querySelector('.item-select');
            const qty = parseFloat(row.querySelector('.item-qty').value);
            const price = parseFloat(row.querySelector('.item-price').value);
            
            if (select && select.value && qty > 0 && price > 0) {
                items.push({
                    name: select.selectedOptions[0].text.split(' - ')[0],
                    quantity: qty,
                    price: price,
                    total: qty * price
                });
            }
        });
        return items;
    }

    addToRecentInvoices(invoice) {
        const invoicesList = document.querySelector('.invoices-list');
        if (!invoicesList) return;
        
        const invoiceItem = document.createElement('div');
        invoiceItem.className = 'invoice-item';
        invoiceItem.innerHTML = `
            <div class="invoice-info">
                <span class="invoice-no">${invoice.invoiceNumber}</span>
                <span class="invoice-customer">${invoice.customer.name}</span>
            </div>
            <div class="invoice-amount">₹${invoice.total.toFixed(2)}</div>
            <span class="invoice-status paid">Paid</span>
        `;
        
        invoicesList.insertBefore(invoiceItem, invoicesList.firstChild);
        
        // Keep only last 5 invoices
        while (invoicesList.children.length > 5) {
            invoicesList.removeChild(invoicesList.lastChild);
        }
    }

    resetForm() {
        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('invoiceItemsList').innerHTML = '';
        this.addInvoiceItem(); // Add one empty row
        this.updateTotals();
    }

    async sendViaWhatsApp() {
        if (!this.currentInvoice && !this.validateForm()) {
            this.showToast('Please generate an invoice first', 'error');
            return;
        }
        
        const invoice = this.currentInvoice || this.getCurrentInvoiceData();
        const phone = invoice.customer.phone;
        
        if (!phone) {
            this.showToast('Customer phone number is required', 'error');
            return;
        }
        
        this.showToast('Sending via WhatsApp...', 'info');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Open WhatsApp with message
            const message = encodeURIComponent(
                `*Invoice from Ramesh Kirana Store*\n\n` +
                `Invoice No: ${invoice.invoiceNumber}\n` +
                `Date: ${new Date(invoice.date).toLocaleDateString()}\n` +
                `Customer: ${invoice.customer.name}\n\n` +
                `Total Amount: ₹${invoice.total.toFixed(2)}\n\n` +
                `Thank you for your business!`
            );
            
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
            
            this.showToast('Invoice sent via WhatsApp!', 'success');
            
        } catch (error) {
            console.error('WhatsApp send failed:', error);
            this.showToast('Failed to send via WhatsApp', 'error');
        }
    }

    getCurrentInvoiceData() {
        const totals = this.updateTotals();
        return {
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString(),
            customer: {
                name: document.getElementById('customerName').value,
                phone: document.getElementById('customerPhone').value
            },
            total: totals.total
        };
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Initialize billing when dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('billing')) {
        window.billingManager = new BillingManager();
    }
});