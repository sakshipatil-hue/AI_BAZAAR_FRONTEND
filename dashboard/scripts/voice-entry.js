// AI Bazaar - Voice Entry
const VOICE_API = "https://ai-bazaar-backend-29o3.onrender.com";

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let selectedLang = 'hi';

const langMap = {
    hindi: 'hi', english: 'en',
    tamil: 'ta', gujarati: 'gu', telugu: 'te'
};

// Wait for everything to load
window.addEventListener('load', function () {
    setupVoiceEntry();
});

function setupVoiceEntry() {
    // Language buttons
    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.lang-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedLang = langMap[this.getAttribute('data-lang')] || 'hi';
        });
    });

    // Mic button
    const micBtn = document.getElementById('micButtonLarge');
    if (micBtn) {
        micBtn.addEventListener('click', toggleRecording);
        console.log('✅ Mic button initialized');
    } else {
        console.error('❌ Mic button not found!');
    }

    // Quick action buttons
    document.querySelectorAll('.action-btn[data-action]').forEach(btn => {
        btn.addEventListener('click', function () {
            handleQuickAction(this.getAttribute('data-action'));
        });
    });
}

async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            stream.getTracks().forEach(track => track.stop());
            await sendAudioToBackend(audioBlob);
        };

        mediaRecorder.start();
        isRecording = true;

        const micBtn = document.getElementById('micButtonLarge');
        if (micBtn) {
            micBtn.style.background = '#F44336';
            micBtn.innerHTML = '<i class="fas fa-stop"></i>';
        }

        addMessage('🎤 Listening... Speak now! Click again to stop.', 'ai');

    } catch (err) {
        console.error('Mic error:', err);
        addMessage('❌ ' + err.message, 'ai');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;

        const micBtn = document.getElementById('micButtonLarge');
        if (micBtn) {
            micBtn.style.background = '';
            micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }

        addMessage('⏳ Processing your voice...', 'ai');
    }
}

async function sendAudioToBackend(audioBlob) {
    try {
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('language', selectedLang);

        const res = await fetch(`${VOICE_API}/api/voice/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
    const data = await res.json();
    addMessage(`You said: "${data.transcript}"`, 'user');
    addMessage(data.reply_text, 'ai');

    // Show action result
    if (data.action_result) {
        const result = data.action_result;
        if (result.type === 'sale') {
            const sold = result.items.filter(i => i.status === 'sold');
            const notFound = result.items.filter(i => i.status !== 'sold');
            if (sold.length > 0) {
                addMessage(`✅ Sale recorded! Total: ₹${result.total.toFixed(2)}`, 'ai');
                // Refresh dashboard and charts
                if (window.loadDashboardData) loadDashboardData();
                if (window.dashboardCharts) dashboardCharts.initAllCharts();
            }
            if (notFound.length > 0) {
                addMessage(`⚠️ Not found in inventory: ${notFound.map(i => i.name).join(', ')}. Please add them first!`, 'ai');
            }
        } else if (result.type === 'stock_add') {
            const updated = result.items.filter(i => i.status === 'updated');
            const notFound = result.items.filter(i => i.status === 'not_found');
            if (updated.length > 0) {
                addMessage(`✅ Stock updated! ${updated.map(i => `${i.name}: ${i.new_stock} ${i.unit || ''}`).join(', ')}`, 'ai');
                // Refresh inventory
                if (window.loadInventory) loadInventory();
            }
            if (notFound.length > 0) {
                addMessage(`⚠️ Not found: ${notFound.map(i => i.name).join(', ')}. Please add them to inventory first!`, 'ai');
            }
        }
    }

            // Show action result
            if (data.action_result) {
                const result = data.action_result;
                if (result.type === 'sale') {
                    const sold = result.items.filter(i => i.status === 'sold');
                    const notFound = result.items.filter(i => i.status !== 'sold');
                    if (sold.length > 0) {
                        addMessage(`✅ Sale recorded! Total: ₹${result.total.toFixed(2)}`, 'ai');
                        // Refresh dashboard data
                        if (window.loadDashboardData) loadDashboardData();
                        if (window.dashboardCharts) dashboardCharts.initAllCharts();
                    }
                    if (notFound.length > 0) {
                        addMessage(`⚠️ Not found in inventory: ${notFound.map(i => i.name).join(', ')}`, 'ai');
                    }
                } else if (result.type === 'stock_add') {
                    const updated = result.items.filter(i => i.status === 'updated');
                    if (updated.length > 0) {
                        addMessage(`✅ Stock updated! ${updated.map(i => `${i.name}: ${i.new_stock} units`).join(', ')}`, 'ai');
                        if (window.loadInventory) loadInventory();
                    }
                }
            }
        } else {
            const err = await res.json();
            addMessage('❌ ' + (err.detail || 'Voice processing failed'), 'ai');
        }
    } catch (err) {
        addMessage('❌ Cannot connect to server: ' + err.message, 'ai');
    }
}

function handleQuickAction(action) {
    const messages = {
        sold: '🛒 What items did you sell? Click mic and speak!',
        purchased: '📦 What stock did you receive? Click mic and speak!',
        customer: '👤 New customer details? Click mic and speak!',
        expense: '💰 What was the expense? Click mic and speak!'
    };
    if (messages[action]) addMessage(messages[action], 'ai');
}

function addMessage(text, type) {
    const conversation = document.getElementById('voiceConversation');
    if (!conversation) return;

    const msg = document.createElement('div');
    msg.className = `message ${type}`;

    if (type === 'ai') {
        msg.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="bubble"><p>${text}</p></div>
        `;
    } else {
        msg.innerHTML = `
            <div class="bubble"><p>${text}</p></div>
            <div class="avatar"><i class="fas fa-user"></i></div>
        `;
    }

    conversation.appendChild(msg);
    conversation.scrollTop = conversation.scrollHeight;
}