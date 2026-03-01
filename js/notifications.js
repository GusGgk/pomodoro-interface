// ================================
// NOTIFICAÇÕES E SONS
// ================================

import CONFIG from './config.js';
import state from './state.js';

export function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

export function showNotification() {
    if (!state.settings.notifications) return;
    
    const statusDisplay = document.getElementById('status');
    
    if ('Notification' in window && Notification.permission === 'granted') {
        const isBreak = statusDisplay.innerText === "PAUSA";
        const title = isBreak ? '☕ Hora da Pausa!' : '🎯 Foco Concluído!';
        const body = isBreak
            ? 'Relaxe um pouco antes do próximo ciclo'
            : 'Parabéns! Você completou um ciclo de foco';
        
        new Notification(title, {
            body: body,
            icon: 'assets/icons/play.svg',
            badge: 'assets/icons/play.svg',
            vibrate: [200, 100, 200]
        });
    }
}

export function playSound(type) {
    if (!state.settings.sounds) return;
    
    const sound = CONFIG.sounds[type];
    if (!sound) return;
    
    sound.volume = state.settings.volume;
    sound.currentTime = 0;
    sound.play();
}
