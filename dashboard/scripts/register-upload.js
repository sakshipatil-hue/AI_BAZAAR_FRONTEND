// Register Upload Module - Handles file upload, image preview, AI processing simulation

class RegisterUploadManager {
    constructor() {
        this.uploadedFile = null;
        this.previewUrl = null;
        this.analysisResults = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // Upload area click
        const uploadArea = document.getElementById('uploadArea');
        const registerUpload = document.getElementById('registerUpload');
        const selectFileBtn = document.getElementById('selectFileBtn');
        
        if (uploadArea && registerUpload) {
            uploadArea.addEventListener('click', () => {
                registerUpload.click();
            });
            
            if (selectFileBtn) {
                selectFileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    registerUpload.click();
                });
            }
            
            registerUpload.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files[0]);
            });
        }
        
        // Close preview button
        const closePreview = document.querySelector('.close-preview');
        if (closePreview) {
            closePreview.addEventListener('click', () => {
                this.resetUpload();
            });
        }
        
        // Analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.startAnalysis();
            });
        }
        
        // Import data button
        const importBtn = document.getElementById('importDataBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importToDashboard();
            });
        }
        
        // Download report button
        const downloadBtn = document.getElementById('downloadReportBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadReport();
            });
        }
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('drag-over');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('drag-over');
            });
        });
        
        uploadArea.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            this.handleFileSelect(file);
        });
    }

    handleFileSelect(file) {
        if (!file) return;
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            this.showToast('Please upload a valid image (JPG, PNG) or PDF file', 'error');
            return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('File size must be less than 10MB', 'error');
            return;
        }
        
        this.uploadedFile = file;
        
        // Create preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewUrl = e.target.result;
                this.showPreview();
            };
            reader.readAsDataURL(file);
        } else {
            // PDF file - show icon instead
            this.previewUrl = 'pdf-icon';
            this.showPreview();
        }
        
        this.showToast(`File "${file.name}" selected`, 'success');
    }

    showPreview() {
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('uploadPreview').style.display = 'block';
        
        const previewImage = document.getElementById('previewImage');
        if (previewImage) {
            if (this.previewUrl === 'pdf-icon') {
                previewImage.innerHTML = `
                    <div class="pdf-preview">
                        <i class="fas fa-file-pdf"></i>
                        <p>${this.uploadedFile.name}</p>
                    </div>
                `;
            } else {
                previewImage.innerHTML = `<img src="${this.previewUrl}" alt="Preview">`;
            }
        }
    }

    resetUpload() {
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('uploadPreview').style.display = 'none';
        document.getElementById('analysisProgress').style.display = 'none';
        document.getElementById('analysisResults').style.display = 'none';
        
        document.getElementById('registerUpload').value = '';
        this.uploadedFile = null;
        this.previewUrl = null;
        this.analysisResults = null;
    }

    startAnalysis() {
        if (!this.uploadedFile) {
            this.showToast('Please select a file first', 'error');
            return;
        }
        
        // Hide preview, show progress
        document.getElementById('uploadPreview').style.display = 'none';
        document.getElementById('analysisProgress').style.display = 'block';
        
        // Simulate AI analysis with progress bar
        this.simulateAnalysis();
    }

    simulateAnalysis() {
        const progressFill = document.getElementById('analysisProgressFill');
        const progressText = document.querySelector('.progress-text');
        let progress = 0;
        
        const stages = [
            { progress: 20, text: 'Reading image...' },
            { progress: 40, text: 'Extracting text...' },
            { progress: 60, text: 'Identifying items...' },
            { progress: 80, text: 'Calculating totals...' },
            { progress: 100, text: 'Generating insights...' }
        ];
        
        const interval = setInterval(() => {
            progress += 2;
            progressFill.style.width = progress + '%';
            
            // Update stage text
            stages.forEach(stage => {
                if (progress >= stage.progress && progress < stage.progress + 10) {
                    progressText.textContent = stage.text;
                }
            });
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    this.showResults();
                }, 500);
            }
        }, 100);
    }

    showResults() {
        // Hide progress, show results
        document.getElementById('analysisProgress').style.display = 'none';
        document.getElementById('analysisResults').style.display = 'block';
        
        // Generate mock analysis results
        this.analysisResults = {
            totalSales: 42850,
            transactions: 156,
            topItems: ['Atta (Flour)', 'Sugar', 'Tea Powder'],
            bestDay: 'Saturday',
            regularCustomers: 28,
            insights: [
                'Stock up on tea powder - selling fast!',
                'Morning hours (9-11 AM) are your peak sales time',
                '28 regular customers identified - consider loyalty program',
                'Average transaction value: ₹275',
                'Weekend sales are 40% higher than weekdays'
            ],
            items: [
                { name: 'Atta', quantity: 52, revenue: 4160 },
                { name: 'Sugar', quantity: 38, revenue: 2280 },
                { name: 'Tea Powder', quantity: 25, revenue: 1875 },
                { name: 'Cooking Oil', quantity: 18, revenue: 2700 },
                { name: 'Rice', quantity: 15, revenue: 1200 }
            ]
        };
        
        // Populate results
        this.populateResults();
    }

    populateResults() {
        if (!this.analysisResults) return;
        
        const results = this.analysisResults;
        
        // Update result cards
        const resultCards = document.querySelectorAll('.result-card');
        if (resultCards.length >= 4) {
            resultCards[0].querySelector('.result-value').textContent = `₹${results.totalSales.toLocaleString()}`;
            resultCards[1].querySelector('.result-value').textContent = results.transactions;
            resultCards[2].querySelector('.result-value').textContent = results.topItems.join(', ');
            resultCards[3].querySelector('.result-value').textContent = results.bestDay;
        }
        
        // Update insights list
        const insightsList = document.querySelector('.result-insights ul');
        if (insightsList) {
            insightsList.innerHTML = results.insights.map(insight => 
                `<li><i class="fas fa-check"></i> ${insight}</li>`
            ).join('');
        }
    }

    async importToDashboard() {
        if (!this.analysisResults) {
            this.showToast('No analysis results to import', 'error');
            return;
        }
        
        this.showToast('Importing data to dashboard...', 'info');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update dashboard data
            if (window.dashboard) {
                // Update sales data
                const todaySales = document.getElementById('todaySales');
                if (todaySales) {
                    todaySales.textContent = this.analysisResults.totalSales;
                }
                
                // Refresh inventory with detected items
                if (window.dashboard.loadInventoryData) {
                    window.dashboard.loadInventoryData();
                }
                
                // Switch to dashboard view
                window.dashboard.switchSection('dashboard');
            }
            
            this.showToast('Data imported successfully!', 'success');
            this.resetUpload();
            
        } catch (error) {
            console.error('Import failed:', error);
            this.showToast('Failed to import data', 'error');
        }
    }

    downloadReport() {
        if (!this.analysisResults) {
            this.showToast('No analysis results to download', 'error');
            return;
        }
        
        // Create report content
        const report = `
            AI BAZAAR - REGISTER ANALYSIS REPORT
            ====================================
            Date: ${new Date().toLocaleDateString()}
            
            SUMMARY
            -------
            Total Sales: ₹${this.analysisResults.totalSales}
            Transactions: ${this.analysisResults.transactions}
            Best Day: ${this.analysisResults.bestDay}
            Regular Customers: ${this.analysisResults.regularCustomers}
            
            TOP SELLING ITEMS
            -----------------
            ${this.analysisResults.items.map(item => 
                `${item.name}: ${item.quantity} units (₹${item.revenue})`
            ).join('\n')}
            
            AI INSIGHTS
            -----------
            ${this.analysisResults.insights.join('\n')}
            
            Generated by AI Bazaar - Your Smart Shop Assistant
        `;
        
        // Create download link
        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `register-analysis-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showToast('Report downloaded successfully!', 'success');
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Initialize register upload when dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('register-upload')) {
        window.registerUpload = new RegisterUploadManager();
    }
});