// Voice Entry Module - Handles voice recording, language switching, and command processing

class VoiceEntryManager {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.currentLanguage = 'hi'; // Default Hindi
        this.conversation = [];
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        // Supported languages with their codes
        this.languages = {
            'hi': { name: 'हिंदी', code: 'hi-IN' },
            'en': { name: 'English', code: 'en-IN' },
            'ta': { name: 'தமிழ்', code: 'ta-IN' },
            'te': { name: 'తెలుగు', code: 'te-IN' },
            'bn': { name: 'বাংলা', code: 'bn-IN' },
            'gu': { name: 'ગુજરાતી', code: 'gu-IN' },
            'mr': { name: 'मराठी', code: 'mr-IN' }
        };
        
        this.init();
    }

    init() {
        this.setupVoiceRecognition();
        this.setupEventListeners();
        this.loadSampleCommands();
    }

    setupVoiceRecognition() {
        // Check if browser supports SpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
            
            this.recognition.onstart = () => this.onListeningStart();
            this.recognition.onend = () => this.onListeningEnd();
            this.recognition.onerror = (event) => this.onListeningError(event);
            this.recognition.onresult = (event) => this.onSpeechResult(event);
        } else {
            console.warn('Speech recognition not supported, using simulation mode');
            this.setupSimulationMode();
        }
    }

    setupSimulationMode() {
        // For browsers without speech recognition, use simulated responses
        const micButton = document.getElementById('micButton');
        if (micButton) {
            micButton.addEventListener('click', () => {
                if (!this.isListening) {
                    this.simulateListening();
                } else {
                    this.stopListening();
                }
            });
        }
    }

    setupEventListeners() {
        // Language selector
        const langSelect = document.getElementById('voiceLanguage');
        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                this.currentLanguage = e.target.value;
                if (this.recognition) {
                    this.recognition.lang = this.languages[this.currentLanguage].code;
                }
                this.showToast(`Language switched to ${this.languages[this.currentLanguage].name}`, 'info');
            });
        }

        // Command chips
        document.querySelectorAll('.command-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const command = chip.textContent.trim();
                this.processCommand(command);
            });
        });

        // Clear conversation button
        const clearBtn = document.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearConversation());
        }
    }

    onListeningStart() {
        this.isListening = true;
        const micButton = document.getElementById('micButton');
        const voiceWave = document.getElementById('voiceWaveContainer');
        
        if (micButton) micButton.classList.add('active');
        if (voiceWave) voiceWave.classList.add('active');
        
        this.showToast('Listening... Speak now', 'info');
    }

    onListeningEnd() {
        this.isListening = false;
        const micButton = document.getElementById('micButton');
        const voiceWave = document.getElementById('voiceWaveContainer');
        
        if (micButton) micButton.classList.remove('active');
        if (voiceWave) voiceWave.classList.remove('active');
    }

    onListeningError(event) {
        console.error('Speech recognition error:', event.error);
        this.onListeningEnd();
        
        let errorMessage = 'Could not understand. Please try again.';
        if (event.error === 'no-speech') {
            errorMessage = 'No speech detected. Please try again.';
        } else if (event.error === 'audio-capture') {
            errorMessage = 'No microphone found. Please check your microphone.';
        } else if (event.error === 'not-allowed') {
            errorMessage = 'Microphone access denied. Please allow microphone access.';
        }
        
        this.showToast(errorMessage, 'error');
    }

    onSpeechResult(event) {
        const transcript = event.results[0][0].transcript;
        this.processCommand(transcript);
    }

    async processCommand(command) {
        // Add user message to conversation
        this.addMessageToConversation(command, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Try to use real API if available
            let response;
            if (window.api) {
                response = await window.api.sendVoiceTextCommand(command, this.currentLanguage);
            } else {
                // Simulate API response
                response = await this.simulateAIResponse(command);
            }
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add AI response to conversation
            this.addMessageToConversation(response.message || response, 'ai');
            
            // Process any actions from the response
            if (response.action) {
                this.handleAction(response.action, response.data);
            }
            
        } catch (error) {
            console.error('Error processing command:', error);
            this.hideTypingIndicator();
            this.addMessageToConversation('Sorry, I encountered an error. Please try again.', 'ai');
        }
    }

    simulateListening() {
        this.isListening = true;
        const micButton = document.getElementById('micButton');
        const voiceWave = document.getElementById('voiceWaveContainer');
        
        micButton.classList.add('active');
        voiceWave.classList.add('active');
        
        this.showToast('Listening... (Simulation Mode)', 'info');
        
        // Simulate listening for 3 seconds
        setTimeout(() => {
            this.isListening = false;
            micButton.classList.remove('active');
            voiceWave.classList.remove('active');
            
            // Simulate random command
            const commands = [
                "आज 5 kg आटा बिका",
                "चीनी का स्टॉक कितना है?",
                "रमेश के लिए बिल बनाओ",
                "आज की बिक्री कितनी है?",
                "2 liter दूध और 1 kg चीनी बेची"
            ];
            const randomCommand = commands[Math.floor(Math.random() * commands.length)];
            this.processCommand(randomCommand);
        }, 3000);
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        } else {
            this.isListening = false;
            const micButton = document.getElementById('micButton');
            const voiceWave = document.getElementById('voiceWaveContainer');
            
            micButton.classList.remove('active');
            voiceWave.classList.remove('active');
        }
    }

    async simulateAIResponse(command) {
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const commandLower = command.toLowerCase();
        
        // Simple rule-based responses
        if (commandLower.includes('आटा') || commandLower.includes('atta')) {
            const match = commandLower.match(/(\d+)/);
            const quantity = match ? match[1] : '5';
            return {
                message: `✓ Added! ${quantity} kg atta recorded. Current stock: 15 kg remaining.`,
                action: 'update_inventory',
                data: { item: 'atta', quantity: quantity }
            };
        }
        else if (commandLower.includes('चीनी') || commandLower.includes('sugar')) {
            return {
                message: `You have 8 kg sugar in stock. Low stock alert at 5 kg.`,
                action: 'show_stock',
                data: { item: 'sugar', stock: 8 }
            };
        }
        else if (commandLower.includes('बिल') || commandLower.includes('invoice')) {
            return {
                message: `Creating invoice for Ramesh. Total: ₹450. Would you like to print?`,
                action: 'create_invoice',
                data: { customer: 'Ramesh', amount: 450 }
            };
        }
        else if (commandLower.includes('बिक्री') || commandLower.includes('sales')) {
            return {
                message: `Today's total sales: ₹5,250 from 24 transactions. Best seller: Atta (15 kg)`,
                action: 'show_sales',
                data: { total: 5250, transactions: 24 }
            };
        }
        else {
            return {
                message: `I understood your command. How else can I help you?`,
                action: null
            };
        }
    }

    addMessageToConversation(text, sender) {
        const conversation = document.querySelector('.conversation-messages');
        if (!conversation) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="bubble">${text}</div>
                <div class="avatar"><i class="fas fa-user"></i></div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="avatar"><i class="fas fa-robot"></i></div>
                <div class="bubble">${text}</div>
            `;
        }
        
        conversation.appendChild(messageDiv);
        conversation.scrollTop = conversation.scrollHeight;
        
        // Store in conversation history
        this.conversation.push({ sender, text, timestamp: new Date() });
    }

    showTypingIndicator() {
        const conversation = document.querySelector('.conversation-messages');
        if (!conversation) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'message ai typing-indicator';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="bubble">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        `;
        conversation.appendChild(indicator);
        conversation.scrollTop = conversation.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    clearConversation() {
        const conversation = document.querySelector('.conversation-messages');
        if (conversation) {
            conversation.innerHTML = `
                <div class="message ai">
                    <div class="avatar"><i class="fas fa-robot"></i></div>
                    <div class="bubble">
                        <p>Hello! I'm ready to help. Try saying something like "Add 2 kg sugar to sales"</p>
                    </div>
                </div>
            `;
        }
        this.conversation = [];
    }

    handleAction(action, data) {
        switch(action) {
            case 'update_inventory':
                // Trigger inventory refresh
                if (window.dashboard && window.dashboard.loadInventoryData) {
                    window.dashboard.loadInventoryData();
                }
                break;
            case 'create_invoice':
                // Switch to billing tab
                if (window.dashboard) {
                    window.dashboard.switchSection('billing');
                }
                break;
            case 'show_sales':
                // Update dashboard charts
                if (window.dashboard && window.dashboard.updateDashboardData) {
                    window.dashboard.updateDashboardData();
                }
                break;
        }
    }

    loadSampleCommands() {
        // Sample commands in different languages
        this.sampleCommands = {
            'hi': [
                "आज 5 kg आटा बिका",
                "चीनी का स्टॉक कितना है?",
                "रमेश के लिए बिल बनाओ",
                "आज की बिक्री कितनी है?"
            ],
            'en': [
                "Add 5 kg atta to sales",
                "What's the stock of sugar?",
                "Create invoice for Ramesh",
                "Show today's sales"
            ],
            'ta': [
                "இன்று 5 kg மாவு விற்பனை",
                "சர்க்கரை இருப்பு எவ்வளவு?",
                "ரமேஷ்க்கு இன்வாய்ஸ் உருவாக்கு",
                "இன்றைய விற்பனை எவ்வளவு?"
            ]
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

// Initialize voice entry when dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('voice-entry')) {
        window.voiceEntry = new VoiceEntryManager();
    }
});