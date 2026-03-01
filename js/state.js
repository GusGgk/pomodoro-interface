// ================================
// ESTADO GLOBAL DA APLICAÇÃO
// ================================

import CONFIG from './config.js';

const state = {
    totalTime: CONFIG.defaultTime,
    remainingTime: CONFIG.defaultTime,
    
    isRunning: false,
    interval: null,
    
    currentActivity: null,
    
    activities: [],
    cycles: 0,
    history: [],
    
    // WebSocket ESP32
    ws: null,
    wsConnected: false,
    
    // Configurações
    settings: {
        autoStartBreak: false,
        autoStartPomodoro: false,
        notifications: true,
        theme: 'dark',
        longBreakInterval: 4,
        longBreakTime: 15 * 60,
        sounds: true,
        volume: 0.5
    }
};

export default state;
