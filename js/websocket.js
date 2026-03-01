// ================================
// WEBSOCKET - COMUNICAÇÃO ESP32
// ================================

import state from './state.js';

export function connectESP32() {
    const wsUrl = localStorage.getItem('esp32_url') || 'ws://192.168.4.1:81';
    
    try {
        state.ws = new WebSocket(wsUrl);
        
        state.ws.onopen = () => {
            state.wsConnected = true;
            updateConnectionStatus('Conectado ao ESP32', true);
            console.log('✅ WebSocket conectado');
        };
        
        state.ws.onmessage = (event) => {
            handleESP32Message(event.data);
        };
        
        state.ws.onerror = (error) => {
            console.error('WebSocket erro:', error);
            updateConnectionStatus('Erro na conexão', false);
        };
        
        state.ws.onclose = () => {
            state.wsConnected = false;
            updateConnectionStatus('Desconectado', false);
            // Tentar reconectar após 5 segundos
            setTimeout(connectESP32, 5000);
        };
        
    } catch (error) {
        console.error('Erro ao conectar WebSocket:', error);
        updateConnectionStatus('Falha ao conectar', false);
    }
}

function handleESP32Message(data) {
    try {
        const message = JSON.parse(data);
        
        // Importar funções necessárias dinamicamente
        import('./timer.js').then(({ startTimer, pauseTimer, resetTimer }) => {
            import('./activities.js').then(({ selectNextActivity }) => {
                
                switch (message.action) {
                    case 'start':
                        startTimer();
                        break;
                    case 'pause':
                        pauseTimer();
                        break;
                    case 'reset':
                        resetTimer();
                        break;
                    case 'next_activity':
                        selectNextActivity();
                        break;
                }
                
            });
        });
        
    } catch (error) {
        console.error('Erro ao processar mensagem ESP32:', error);
    }
}

export function sendToESP32(data) {
    if (state.ws && state.wsConnected) {
        try {
            state.ws.send(JSON.stringify(data));
        } catch (error) {
            console.error('Erro ao enviar para ESP32:', error);
        }
    }
}

export function updateConnectionStatus(text, connected) {
    const statusEl = document.getElementById('connection');
    if (statusEl) {
        statusEl.innerText = text;
        statusEl.style.color = connected ? 'var(--accent-primary)' : 'var(--text-muted)';
    }
}
