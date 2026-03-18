// AI Bazaar - Billing JavaScript
const BILLING_API = window.API_BASE || "https://ai-bazaar-backend-g2yb.onrender.com";

document.addEventListener('DOMContentLoaded', function () {
    initBilling();
});

function initBilling() {
    const addItemRowBtn = document.getElementById('addItemRow');
    const generateBtn = document.querySelector('.generate-btn');
    const sendBtn = document.querySelector('.send-btn');

    if (addItemRowBtn) {
        addItemRowBtn.addEventListener('click', addItemRow);
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', generateInvoice);
    }

    // Add first row by default
    addItemRow();

    // Live preview update
    const customerName = document.getElementById('customerName');
    const customerPhone = document.getElementById('customerPhone');
    if (customerName) {
        customerName.addEventListener('input', updatePreview);
    }
    if (customerPhone) {
        customerPhone.addEventListener('input', updatePreview);
    }
}

let itemRowCount = 0;

function addItemRow() {
    const itemsBody = document.getElementById('invoiceItems');
    if (!itemsBody) return;

    itemRowCount++;
    const rowId = `item-row-${itemRowCount}`;

    const row = document.createElement('div');
    row.className = 'item-row';
    row.id = rowId;
    row.innerHTML = `
        <div class="item-field">
            <input type="text" placeholder="Item name" class="item-name" oninput="updateTotals()">
        </div>
        <div class="item-field">
            <input type="number" placeholder="Qty" class="item-qty" min="0" step="0.01" oninput="updateTotals()">
        </div>
        <div class="item-field">
            <input type="number" placeholder="Price ₹" class="item-price" min="0" step="0.01" oninput="updateTotals()">
        </div>
        <div class="item-field">
            <span class="item-total">₹0.00</span>
        </div>
        <div class="item-field">
            <button class="remove-row-btn" onclick="removeItemRow('${rowId}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    itemsBody.appendChild(row);
    updateTotals();
}

function removeItemRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        updateTotals();
    }
}

function updateTotals() {
    const rows = document.querySelectorAll('.item-row');
    let subtotal = 0;

    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
        const total = qty * price;
        const totalEl = row.querySelector('.item-total');
        if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
        subtotal += total;
    });

    const gst = subtotal * 0.18;
    const grandTotal = subtotal + gst;

    const subtotalEl = document.getElementById('subtotal');
    const gstEl = document.getElementById('gstAmount');
    const totalEl = document.getElementById('totalAmount');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (gstEl) gstEl.textContent = `₹${gst.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${grandTotal.toFixed(2)}`;

    updatePreview();
}

function updatePreview() {
    const customerName = document.getElementById('customerName')?.value || 'Customer Name';
    const customerPhone = document.getElementById('customerPhone')?.value || 'Phone Number';

    const previewName = document.getElementById('previewCustomerName');
    const previewPhone = document.getElementById('previewCustomerPhone');

    if (previewName) previewName.textContent = customerName;
    if (previewPhone) previewPhone.textContent = customerPhone;

    // Update preview items
    const previewBody = document.getElementById('previewItemsBody');
    if (!previewBody) return;

    const rows = document.querySelectorAll('.item-row');
    previewBody.innerHTML = '';

    rows.forEach(row => {
        const name = row.querySelector('.item-name')?.value || '';
        const qty = row.querySelector('.item-qty')?.value || '0';
        const price = row.querySelector('.item-price')?.value || '0';
        const total = (parseFloat(qty) * parseFloat(price)).toFixed(2);

        if (name) {
            previewBody.innerHTML += `
                <tr>
                    <td>${name}</td>
                    <td>${qty}</td>
                    <td>₹${price}</td>
                    <td>₹${total}</td>
                </tr>
            `;
        }
    });

    // Update preview totals
    const subtotal = parseFloat(document.getElementById('subtotal')?.textContent?.replace('₹', '') || 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    const previewSubtotal = document.getElementById('previewSubtotal');
    const previewGST = document.getElementById('previewGST');
    const previewTotal = document.getElementById('previewTotal');

    if (previewSubtotal) previewSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
    if (previewGST) previewGST.textContent = `₹${gst.toFixed(2)}`;
    if (previewTotal) previewTotal.textContent = `₹${total.toFixed(2)}`;
}

async function generateInvoice() {
    const customerName = document.getElementById('customerName')?.value;
    const customerPhone = document.getElementById('customerPhone')?.value;
    const rows = document.querySelectorAll('.item-row');

    const items = [];
    rows.forEach(row => {
        const name = row.querySelector('.item-name')?.value;
        const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
        if (name && qty > 0) {
            items.push({ name, qty, price });
        }
    });

    if (items.length === 0) {
        alert('Please add at least one item!');
        return;
    }

    // Show success message for now
    alert(`Invoice generated!\nCustomer: ${customerName || 'Walk-in'}\nItems: ${items.length}\nTotal: ${document.getElementById('totalAmount')?.textContent}`);
}