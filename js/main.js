// ================================
// POMODORO PRO - MAIN
// Inicialização da aplicação
// ================================

import { updateTimerDisplay, setupTabs } from './ui.js';
import { loadSettings, saveSettings } from './storage.js';
import { loadActivities } from './storage.js';
import { loadHistory } from './storage.js';
import { renderActivities } from './activities.js';
import { renderHistory, updateStatsDisplay, renderWeekChart } from './statistics.js';
import { applySettings, setupSettingsListeners } from './settings.js';
import { requestNotificationPermission } from './notifications.js';
import { setupKeyboardShortcuts } from './keyboard.js';
import { connectESP32 } from './websocket.js';
import { setupEventListeners } from './events.js';
import state from './state.js';

function init() {
    console.log('🍅 Iniciando Pomodoro Pro...');
    
    // Carregar dados salvos
    loadSettings();
    loadActivities();
    loadHistory();
    
    // Aplicar configurações
    applySettings();
    
    // Renderizar UI inicial
    updateTimerDisplay();
    renderActivities();
    renderHistory();
    updateStatsDisplay();
    
    // Configurar listeners
    setupEventListeners();
    setupSettingsListeners();
    setupTabs();
    setupKeyboardShortcuts();
    
    // Solicitar permissão para notificações
    requestNotificationPermission();
    
    // Conectar ao ESP32 (opcional)
    connectESP32();
    
    // Atualizar estatísticas
    const cyclesEl = document.getElementById('cyclesCount');
    if (cyclesEl) cyclesEl.innerText = state.cycles;
    
    // Renderizar gráfico
    renderWeekChart();
    
    console.log('✅ Pomodoro Pro inicializado com sucesso!');
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
