// Register Upload Module - AI Bazaar with Groq Vision OCR

const SCAN_API = "https://ai-bazaar-backend-29o3.onrender.com";

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
        const uploadArea = document.getElementById('uploadArea');
        const registerUpload = document.getElementById('registerUpload');
        const uploadBtn = document.getElementById('uploadBtn');
        const selectFileBtn = document.getElementById('selectFileBtn');
        
        if (uploadArea && registerUpload) {
            if (uploadBtn) {
                uploadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    registerUpload.click();
                });
            }

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
        
        // Remove image button
        const removeImage = document.getElementById('removeImage');
        if (removeImage) {
            removeImage.addEventListener('click', () => this.resetUpload());
        }

        // Close preview button
        const closePreview = document.querySelector('.close-preview');
        if (closePreview) {
            closePreview.addEventListener('click', () => this.resetUpload());
        }
        
        // Analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.startAnalysis());
        }
        
        // Import data button
        const importBtn = document.getElementById('importDataBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importToDashboard());
        }
        
        // Download report button
        const downloadBtn = document.getElementById('downloadReportBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadReport());
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
        
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            this.showToast('Please upload JPG or PNG image', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('File size must be less than 10MB', 'error');
            return;
        }
        
        this.uploadedFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewUrl = e.target.result;
            this.showPreview();
        };
        reader.readAsDataURL(file);
        
        this.showToast(`File "${file.name}" selected`, 'success');
    }

    showPreview() {
        const uploadArea = document.getElementById('uploadArea');
        const uploadPreview = document.getElementById('uploadPreview');
        
        if (uploadArea) uploadArea.style.display = 'none';
        if (uploadPreview) uploadPreview.style.display = 'block';
        
        const previewImage = document.getElementById('previewImage');
        if (previewImage) {
            previewImage.innerHTML = `
                <img src="${this.previewUrl}" alt="Preview" 
                     style="width:100%;max-height:400px;object-fit:contain;border-radius:8px;">
                <p style="margin-top:10px;color:#666;font-size:14px;">
                    <i class="fas fa-file-image"></i> 
                    ${this.uploadedFile.name} (${(this.uploadedFile.size / 1024).toFixed(1)} KB)
                </p>
            `;
        }
    }

    resetUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const uploadPreview = document.getElementById('uploadPreview');
        const aiResults = document.getElementById('aiResults');
        const registerUpload = document.getElementById('registerUpload');

        if (uploadArea) uploadArea.style.display = 'block';
        if (uploadPreview) uploadPreview.style.display = 'none';
        if (aiResults) aiResults.style.display = 'none';

        // Try old IDs too
        const analysisProgress = document.getElementById('analysisProgress');
        const analysisResults = document.getElementById('analysisResults');
        if (analysisProgress) analysisProgress.style.display = 'none';
        if (analysisResults) analysisResults.style.display = 'none';

        if (registerUpload) registerUpload.value = '';
        this.uploadedFile = null;
        this.previewUrl = null;
        this.analysisResults = null;
    }

    async startAnalysis() {
        if (!this.uploadedFile) {
            this.showToast('Please select a file first', 'error');
            return;
        }

        const analyzeBtn = document.getElementById('analyzeBtn');
        const aiResults = document.getElementById('aiResults');

        // Show loading
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing with AI...';
        }

        if (aiResults) {
            aiResults.style.display = 'block';
            aiResults.innerHTML = `
                <div style="text-align:center;padding:40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#FF6B35;"></i>
                    <p style="margin-top:16px;color:#666;">🤖 AI is reading your register...</p>
                    <p style="color:#999;font-size:13px;margin-top:8px;">This may take 10-15 seconds</p>
                </div>
            `;
        }

        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('image', this.uploadedFile);

            const res = await fetch(`${SCAN_API}/api/scan/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                this.analysisResults = data;
                this.showGroqResults(data);
                this.showToast('Analysis complete!', 'success');
            } else {
                const err = await res.json();
                if (aiResults) {
                    aiResults.innerHTML = `
                        <div style="text-align:center;padding:40px;">
                            <i class="fas fa-exclamation-circle" style="font-size:2rem;color:#F44336;"></i>
                            <p style="margin-top:16px;color:#666;">${err.detail || 'Analysis failed'}</p>
                        </div>
                    `;
                }
            }
        } catch (err) {
            if (aiResults) {
                aiResults.innerHTML = `
                    <div style="text-align:center;padding:40px;">
                        <i class="fas fa-wifi" style="font-size:2rem;color:#F44336;"></i>
                        <p style="margin-top:16px;color:#666;">Cannot connect to server. Please try again.</p>
                    </div>
                `;
            }
        } finally {
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = '<i class="fas fa-brain"></i> Analyze with AI';
            }
        }
    }

    showGroqResults(data) {
        const aiResults = document.getElementById('aiResults');
        if (!aiResults) return;

        const items = data.parsed_items || [];

        const itemsHtml = items.length > 0 ? `
            <table style="width:100%;border-collapse:collapse;margin-top:16px;border-radius:8px;overflow:hidden;">
                <thead>
                    <tr style="background:#FF6B35;color:white;">
                        <th style="padding:12px;text-align:left;">Item</th>
                        <th style="padding:12px;text-align:center;">Qty</th>
                        <th style="padding:12px;text-align:center;">Unit</th>
                        <th style="padding:12px;text-align:right;">Price (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map((item, i) => `
                        <tr style="background:${i % 2 === 0 ? '#fff' : '#f9f9f9'};">
                            <td style="padding:10px;border-bottom:1px solid #eee;">${item.name}</td>
                            <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;">${item.quantity || '-'}</td>
                            <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;">${item.unit || '-'}</td>
                            <td style="padding:10px;text-align:right;border-bottom:1px solid #eee;">${item.price ? '₹' + item.price : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p style="color:#999;text-align:center;padding:20px;">No items detected. Try a clearer image.</p>';

        aiResults.style.display = 'block';
        aiResults.innerHTML = `
            <div style="padding:20px;">
                <h4 style="color:#FF6B35;margin-bottom:16px;">
                    <i class="fas fa-check-circle"></i> AI Analysis Complete!
                </h4>
                ${data.date ? `<p style="color:#666;margin-bottom:8px;"><strong>Date:</strong> ${data.date}</p>` : ''}
                ${data.total ? `<p style="color:#666;margin-bottom:16px;"><strong>Total:</strong> ₹${data.total}</p>` : ''}
                <h5 style="margin-bottom:8px;">Extracted Items (${items.length}):</h5>
                ${itemsHtml}
                <div style="margin-top:20px;background:#FFF9F0;border-radius:8px;padding:16px;border-left:4px solid #FF6B35;">
    <h5 style="color:#FF6B35;margin-bottom:12px;">
        <i class="fas fa-lightbulb"></i> AI Recommendations
    </h5>
    <ul style="list-style:none;padding:0;margin:0;">
        ${items.length > 0 ? `
            <li style="padding:6px 0;color:#444;">
                <i class="fas fa-check" style="color:#4CAF50;margin-right:8px;"></i>
                Found ${items.length} items in your register
            </li>
            <li style="padding:6px 0;color:#444;">
                <i class="fas fa-boxes" style="color:#FF6B35;margin-right:8px;"></i>
                Consider adding these items to your inventory if not already present
            </li>
            ${data.total ? `
            <li style="padding:6px 0;color:#444;">
                <i class="fas fa-rupee-sign" style="color:#2E86AB;margin-right:8px;"></i>
                Total transaction value: ₹${data.total} — record this in billing
            </li>` : ''}
            <li style="padding:6px 0;color:#444;">
                <i class="fas fa-chart-line" style="color:#9C27B0;margin-right:8px;"></i>
                Use Voice Entry to quickly record future sales instead of paper register
            </li>
        ` : `
            <li style="padding:6px 0;color:#444;">
                <i class="fas fa-camera" style="color:#FF6B35;margin-right:8px;"></i>
                Try uploading a clearer image for better results
            </li>
            <li style="padding:6px 0;color:#444;">
                <i class="fas fa-lightbulb" style="color:#FFB74D;margin-right:8px;"></i>
                Make sure text is clearly visible and not blurry
            </li>
        `}
    </ul>
</div>
                ${data.raw_text ? `
                    <details style="margin-top:16px;">
                        <summary style="cursor:pointer;color:#666;padding:8px;">View raw text extracted</summary>
                        <p style="margin-top:8px;color:#999;font-size:12px;white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px;">${data.raw_text}</p>
                    </details>
                ` : ''}
                <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
                    <button onclick="window.registerUpload.downloadReport()" 
                            style="background:#FF6B35;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-download"></i> Download Report
                    </button>
                    <button onclick="window.registerUpload.resetUpload()" 
                            style="background:#f5f5f5;color:#333;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-redo"></i> Upload Another
                    </button>
                </div>
            </div>
        `;
    }

    async importToDashboard() {
        if (!this.analysisResults) {
            this.showToast('No analysis results to import', 'error');
            return;
        }
        this.showToast('Feature coming soon!', 'info');
    }

    downloadReport() {
        if (!this.analysisResults) {
            this.showToast('No analysis results to download', 'error');
            return;
        }

        const data = this.analysisResults;
        const items = data.parsed_items || [];

        const report = `
AI BAZAAR - REGISTER ANALYSIS REPORT
=====================================
Date: ${new Date().toLocaleDateString()}
${data.date ? 'Register Date: ' + data.date : ''}
${data.total ? 'Total Amount: ₹' + data.total : ''}

EXTRACTED ITEMS (${items.length})
---------------------------------
${items.map(item => 
    `${item.name}: ${item.quantity || '-'} ${item.unit || ''} - ₹${item.price || '-'}`
).join('\n')}

RAW TEXT
--------
${data.raw_text || 'No raw text'}

Generated by AI Bazaar - Your Smart Shop Assistant
        `;

        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `register-analysis-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showToast('Report downloaded!', 'success');
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('register-upload')) {
        window.registerUpload = new RegisterUploadManager();
    }
});