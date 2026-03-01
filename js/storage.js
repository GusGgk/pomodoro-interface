// ================================
// GERENCIAMENTO DE LOCALSTORAGE
// ================================

import state from './state.js';

export function saveActivities() {
    localStorage.setItem(
        'pomodoro_activities',
        JSON.stringify(state.activities)
    );
}

export function loadActivities() {
    const saved = localStorage.getItem('pomodoro_activities');
    if (saved) {
        state.activities = JSON.parse(saved);
    }
}

export function saveHistory() {
    localStorage.setItem('pomodoro_history', JSON.stringify(state.history));
    localStorage.setItem('pomodoro_cycles', state.cycles.toString());
}

export function loadHistory() {
    const saved = localStorage.getItem('pomodoro_history');
    if (saved) {
        state.history = JSON.parse(saved);
    }
    
    const cycles = localStorage.getItem('pomodoro_cycles');
    if (cycles) {
        state.cycles = parseInt(cycles);
    }
}

export function saveSettings() {
    localStorage.setItem('pomodoro_settings', JSON.stringify(state.settings));
}

export function loadSettings() {
    const saved = localStorage.getItem('pomodoro_settings');
    if (saved) {
        state.settings = { ...state.settings, ...JSON.parse(saved) };
    }
}

export function exportData() {
    const data = {
        activities: state.activities,
        history: state.history,
        cycles: state.cycles,
        settings: state.settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomodoro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.activities) state.activities = data.activities;
            if (data.history) state.history = data.history;
            if (data.cycles) state.cycles = data.cycles;
            if (data.settings) state.settings = { ...state.settings, ...data.settings };
            
            saveActivities();
            saveHistory();
            saveSettings();
            
            alert('Dados importados com sucesso!');
            location.reload();
            
        } catch (error) {
            console.error('Erro ao importar:', error);
            alert('Erro ao importar dados. Verifique o arquivo.');
        }
    };
    reader.readAsText(file);
}
