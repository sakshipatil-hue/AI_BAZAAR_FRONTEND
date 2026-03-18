// Main Dashboard Controller - Coordinates all dashboard modules

class Dashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.shopData = null;
        this.userData = null;
        this.modules = {};
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Dashboard...');
        
        this.checkAuth();
        this.setupEventListeners();
        this.loadUserData();
        this.loadDashboardData();
        this.initializeModules();
        this.setupToastSystem();
        
        // Set current date
        this.updateCurrentDate();
    }

    checkAuth() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }
        
        // Update UI with user info
        const userName = localStorage.getItem('user_name') || 'Ramesh Kumar';
        const userNameEl = document.querySelector('.user-name');
        if (userNameEl) userNameEl.textContent = userName;
    }

    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.switchSection(section);
            });
        });
        
        // Profile dropdown
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        
        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('active');
            });
            
            document.addEventListener('click', () => {
                profileDropdown.classList.remove('active');
            });
        }
        
        // Notification dropdown
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationDropdown = document.getElementById('notificationDropdown');
        
        if (notificationBtn && notificationDropdown) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationDropdown.classList.toggle('active');
            });
            
            // Mark all as read
            const markAllBtn = document.querySelector('.mark-all-read');
            if (markAllBtn) {
                markAllBtn.addEventListener('click', () => {
                    document.querySelectorAll('.notification-item.unread').forEach(item => {
                        item.classList.remove('unread');
                    });
                    document.querySelector('.notification-count').textContent = '0';
                });
            }
        }
        
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
        
        // Help button
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showHelp();
            });
        }
        
        // Profile menu tabs
        document.querySelectorAll('.profile-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.getAttribute('data-tab');
                this.switchProfileTab(tabId);
                
                document.querySelectorAll('.profile-menu-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        // Edit profile buttons
        const editShopBtn = document.getElementById('editShopBtn');
        if (editShopBtn) {
            editShopBtn.addEventListener('click', () => this.toggleEditMode('shop'));
        }
        
        const editPersonalBtn = document.getElementById('editPersonalBtn');
        if (editPersonalBtn) {
            editPersonalBtn.addEventListener('click', () => this.toggleEditMode('personal'));
        }
    }

    initializeModules() {
        // Initialize charts if on dashboard
        if (document.getElementById('dashboard').classList.contains('active')) {
            if (window.dashboardCharts) {
                window.dashboardCharts.initAllCharts();
            }
        }
        
        // Other modules are initialized by their own files
        console.log('✅ Dashboard modules ready');
    }

    switchSection(sectionId) {
        this.currentSection = sectionId;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            }
        });
        
        // Update sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Initialize section-specific features
            this.initSectionFeatures(sectionId);
        }
        
        // Close mobile sidebar
        const sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth <= 1024) {
            sidebar.classList.remove('active');
        }
    }

    initSectionFeatures(sectionId) {
        switch(sectionId) {
            case 'dashboard':
                if (window.dashboardCharts) {
                    setTimeout(() => window.dashboardCharts.initAllCharts(), 100);
                }
                break;
            case 'voice-entry':
                if (!window.voiceEntry) {
                    window.voiceEntry = new VoiceEntryManager();
                }
                break;
            case 'inventory':
                if (!window.inventoryManager) {
                    window.inventoryManager = new InventoryManager();
                }
                break;
            case 'billing':
                if (!window.billingManager) {
                    window.billingManager = new BillingManager();
                }
                break;
            case 'register-upload':
                if (!window.registerUpload) {
                    window.registerUpload = new RegisterUploadManager();
                }
                break;
        }
    }

    switchProfileTab(tabId) {
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`${tabId}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    toggleEditMode(section) {
        const form = section === 'shop' ? 
            document.getElementById('shopInfoForm') : 
            document.getElementById('personalInfoForm');
        
        const inputs = form.querySelectorAll('input, textarea, select');
        const isReadOnly = inputs[0].readOnly;
        
        inputs.forEach(input => {
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                input.readOnly = !isReadOnly;
            } else if (input.tagName === 'SELECT') {
                input.disabled = !isReadOnly;
            }
        });
        
        const btn = document.getElementById(section === 'shop' ? 'editShopBtn' : 'editPersonalBtn');
        if (btn) {
            btn.innerHTML = isReadOnly ? 
                '<i class="fas fa-save"></i> Save Changes' : 
                '<i class="fas fa-edit"></i> Edit Information';
        }
        
        if (!isReadOnly) {
            // Save changes
            this.saveProfileChanges(section);
        }
    }

    saveProfileChanges(section) {
        this.showToast('Changes saved successfully!', 'success');
        
        setTimeout(() => {
            this.toggleEditMode(section);
        }, 1000);
    }

    async loadUserData() {
        // Load user data from localStorage or API
        this.userData = {
            name: 'Ramesh Kumar',
            email: 'ramesh.kumar@email.com',
            phone: '9876543210',
            shopName: 'Ramesh Kirana Store',
            shopAddress: 'Gandhi Nagar, Delhi - 110031',
            gst: '07AAACR5055F1Z5'
        };
        
        // Update UI with user data
        this.updateUserUI();
    }

    updateUserUI() {
        // Update shop name in topbar
        const shopNameEl = document.querySelector('.shop-name');
        if (shopNameEl) shopNameEl.textContent = this.userData.shopName;
        
        // Update location
        const shopLocationEl = document.querySelector('.shop-location');
        if (shopLocationEl) shopLocationEl.textContent = 'Gandhi Nagar, Delhi';
        
        // Update profile section
        this.updateProfileForms();
    }

    updateProfileForms() {
        // Shop info form
        const shopName = document.getElementById('shopName');
        if (shopName) shopName.value = this.userData.shopName;
        
        const shopAddress = document.getElementById('shopAddress');
        if (shopAddress) shopAddress.value = this.userData.shopAddress;
        
        const gstNumber = document.getElementById('gstNumber');
        if (gstNumber) gstNumber.value = this.userData.gst;
        
        // Personal info form
        const personalName = document.getElementById('personalName');
        if (personalName) personalName.value = this.userData.name;
        
        const personalEmail = document.getElementById('personalEmail');
        if (personalEmail) personalEmail.value = this.userData.email;
        
        const personalPhone = document.getElementById('personalPhone');
        if (personalPhone) personalPhone.value = this.userData.phone;
    }

    async loadDashboardData() {
        this.showSectionLoading('dashboard');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update summary cards
            document.getElementById('todaySales').textContent = '5,250';
            document.getElementById('monthlyRevenue').textContent = '42,850';
            document.getElementById('lowStockCount').textContent = '7';
            document.getElementById('pendingTasks').textContent = '3';
            
            this.hideSectionLoading('dashboard');
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.hideSectionLoading('dashboard');
            this.showToast('Failed to load dashboard data', 'error');
        }
    }

    updateCurrentDate() {
        const dateEl = document.getElementById('currentDate');
        if (dateEl) {
            const now = new Date();
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            dateEl.textContent = now.toLocaleDateString('en-IN', options);
        }
    }

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_name');
        this.showToast('Logging out...', 'info');
        
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1000);
    }

    showHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'modal';
        helpModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Help & Support</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <h4>Quick Tips:</h4>
                    <ul>
                        <li>Use Voice Entry to add sales quickly</li>
                        <li>Check Inventory for low stock alerts</li>
                        <li>Upload register photos for AI analysis</li>
                        <li>Generate GST invoices in Billing section</li>
                    </ul>
                    <h4>Contact Support:</h4>
                    <p>📞 Phone: +91 98765 43210</p>
                    <p>📧 Email: support@aibazaar.com</p>
                    <p>⏰ Hours: 9 AM - 8 PM (Mon-Sat)</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="this.closest('.modal').remove()">Got it</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        setTimeout(() => helpModal.classList.add('active'), 10);
    }

    setupToastSystem() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toastContainer')) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showSectionLoading(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const loader = document.createElement('div');
        loader.className = 'section-loader';
        loader.id = `${sectionId}-loader`;
        loader.innerHTML = '<div class="spinner"></div>';
        
        section.style.position = 'relative';
        section.appendChild(loader);
    }

    hideSectionLoading(sectionId) {
        const loader = document.getElementById(`${sectionId}-loader`);
        if (loader) loader.remove();
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    
    // Add CSS for toasts and loaders
    const style = document.createElement('style');
    style.textContent = `
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        }
        
        .toast {
            background: white;
            border-radius: 8px;
            padding: 12px 20px;
            margin-bottom: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease;
            min-width: 300px;
        }
        
        .toast.success { border-left: 4px solid #4CAF50; }
        .toast.error { border-left: 4px solid #F44336; }
        .toast.warning { border-left: 4px solid #FFB74D; }
        .toast.info { border-left: 4px solid #2196F3; }
        
        .toast i { font-size: 1.25rem; }
        .toast.success i { color: #4CAF50; }
        .toast.error i { color: #F44336; }
        .toast.warning i { color: #FFB74D; }
        .toast.info i { color: #2196F3; }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .section-loader {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            border-radius: 12px;
        }
        
        .section-loader .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #FFE5DC;
            border-top: 3px solid #FF6B35;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .typing-indicator .bubble {
            display: flex;
            gap: 4px;
        }
        
        .typing-indicator .dot {
            width: 8px;
            height: 8px;
            background: #999;
            border-radius: 50%;
            animation: bounce 1.4s infinite;
        }
        
        .typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-4px); }
        }
        
        .error {
            border-color: #F44336 !important;
        }
        
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .modal.active {
            display: flex;
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-content.large {
            max-width: 800px;
        }
        
        .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid #E0E0E0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-body {
            padding: 24px;
        }
        
        .modal-footer {
            padding: 20px 24px;
            border-top: 1px solid #E0E0E0;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
        }
        
        .invoice-preview-modal {
            padding: 20px;
            background: white;
        }
        
        .invoice-preview-modal table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .invoice-preview-modal th,
        .invoice-preview-modal td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #E0E0E0;
        }
        
        .invoice-preview-modal th {
            background: #f8f9fa;
        }
        
        .grand {
            font-size: 1.2rem;
            font-weight: 600;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #E0E0E0;
        }
        
        .no-data {
            text-align: center;
            padding: 40px;
            color: #999;
        }
        
        .no-data i {
            font-size: 3rem;
            margin-bottom: 10px;
        }
    `;
    
    document.head.appendChild(style);
});