// ================================
// LÓGICA DO TIMER POMODORO
// ================================

import state from './state.js';
import { playSound, showNotification } from './notifications.js';
import { updateTimerDisplay, updateStartPauseIcon } from './ui.js';
import { sendToESP32 } from './websocket.js';
import { saveHistory } from './storage.js';
import { renderHistory } from './statistics.js';

export function startTimer() {
    if (state.isRunning) return;
    
    state.isRunning = true;
    playSound('start');
    updateStartPauseIcon();
    
    // Enviar para ESP32
    sendToESP32({ type: 'timer_started', remaining: state.remainingTime });
    
    state.interval = setInterval(() => {
        state.remainingTime--;
        updateTimerDisplay();
        
        // Atualizar ESP32 a cada 10 segundos
        if (state.remainingTime % 10 === 0) {
            sendToESP32({ type: 'timer_update', remaining: state.remainingTime });
        }
        
        if (state.remainingTime <= 0) {
            finishTimer();
        }
    }, 1000);
}

export function pauseTimer() {
    state.isRunning = false;
    clearInterval(state.interval);
    playSound('pause');
    updateStartPauseIcon();
    
    // Enviar para ESP32
    sendToESP32({ type: 'timer_paused', remaining: state.remainingTime });
}

export function toggleTimer() {
    if (state.isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

export function resetTimer() {
    pauseTimer();
    state.remainingTime = state.totalTime;
    updateTimerDisplay();
    
    // Enviar para ESP32
    sendToESP32({ type: 'timer_reset', total: state.totalTime });
}

function finishTimer() {
    pauseTimer();
    playSound('end');
    
    // Mostrar notificação
    showNotification();
    
    const statusDisplay = document.getElementById('status');
    const cyclesEl = document.getElementById('cyclesCount');
    
    // Registrar conclusão
    state.cycles++;
    cyclesEl.innerText = state.cycles;
    
    state.history.push({
        activity: state.currentActivity?.name || 'Foco Padrão',
        type: statusDisplay.innerText !== 'PAUSA' ? 'focus' : 'break',
        duration: state.totalTime / 60,
        date: new Date().toISOString(),
        dateString: new Date().toLocaleString('pt-BR')
    });
    
    saveHistory();
    renderHistory();
    
    // Alternar entre foco e pausa
    if (state.currentActivity) {
        if (statusDisplay.innerText !== 'PAUSA') {
            state.totalTime = state.currentActivity.breakTime;
            state.remainingTime = state.currentActivity.breakTime;
            statusDisplay.innerText = 'PAUSA';
            
            if (state.settings.autoStartBreak) {
                setTimeout(() => startTimer(), 1000);
            }
        } else {
            state.totalTime = state.currentActivity.focusTime;
            state.remainingTime = state.currentActivity.focusTime;
            statusDisplay.innerText = state.currentActivity.name;
            
            if (state.settings.autoStartPomodoro) {
                setTimeout(() => startTimer(), 1000);
            }
        }
        
        updateTimerDisplay();
    } else {
        // Modo padrão sem atividade
        import('./config.js').then((module) => {
            state.totalTime = module.default.defaultTime;
            state.remainingTime = module.default.defaultTime;
            updateTimerDisplay();
        });
    }
    
    // Enviar atualização para ESP32
    sendToESP32({ type: 'timer_finished', cycles: state.cycles });
}
