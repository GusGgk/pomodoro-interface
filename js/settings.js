// ================================
// GERENCIAMENTO DE CONFIGURAÇÕES
// ================================

import state from './state.js';
import { saveSettings } from './storage.js';

export function applySettings() {
    // Aplicar tema
    document.body.className = state.settings.theme === 'light' ? 'light-theme' : '';
    updateSettingsUI();
}

export function updateSettingsUI() {
    // Atualizar checkboxes
    const notif = document.getElementById('setting-notifications');
    if (notif) notif.checked = state.settings.notifications;
    
    const sounds = document.getElementById('setting-sounds');
    if (sounds) sounds.checked = state.settings.sounds;
    
    const autoBreak = document.getElementById('setting-auto-break');
    if (autoBreak) autoBreak.checked = state.settings.autoStartBreak;
    
    const autoFocus = document.getElementById('setting-auto-focus');
    if (autoFocus) autoFocus.checked = state.settings.autoStartPomodoro;
    
    const volume = document.getElementById('volumeSlider');
    if (volume) {
        volume.value = state.settings.volume * 100;
        const volumeValue = document.getElementById('volumeValue');
        if (volumeValue) volumeValue.innerText = Math.floor(state.settings.volume * 100);
    }
    
    const esp32Url = document.getElementById('esp32Url');
    if (esp32Url) {
        const savedUrl = localStorage.getItem('esp32_url');
        if (savedUrl) esp32Url.value = savedUrl;
    }
}

export function setupSettingsListeners() {
    const settingNotifications = document.getElementById('setting-notifications');
    if (settingNotifications) {
        settingNotifications.addEventListener('change', (e) => {
            state.settings.notifications = e.target.checked;
            saveSettings();
            if (e.target.checked) {
                import('./notifications.js').then(module => {
                    module.requestNotificationPermission();
                });
            }
        });
    }
    
    const settingSounds = document.getElementById('setting-sounds');
    if (settingSounds) {
        settingSounds.addEventListener('change', (e) => {
            state.settings.sounds = e.target.checked;
            saveSettings();
        });
    }
    
    const settingAutoBreak = document.getElementById('setting-auto-break');
    if (settingAutoBreak) {
        settingAutoBreak.addEventListener('change', (e) => {
            state.settings.autoStartBreak = e.target.checked;
            saveSettings();
        });
    }
    
    const settingAutoFocus = document.getElementById('setting-auto-focus');
    if (settingAutoFocus) {
        settingAutoFocus.addEventListener('change', (e) => {
            state.settings.autoStartPomodoro = e.target.checked;
            saveSettings();
        });
    }
    
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            state.settings.volume = volume;
            document.getElementById('volumeValue').innerText = e.target.value;
            saveSettings();
        });
    }
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
            saveSettings();
            applySettings();
        });
    }
    
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            import('./storage.js').then(module => module.exportData());
        });
    }
    
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                import('./storage.js').then(module => {
                    module.importData(e.target.files[0]);
                });
            }
        });
    }
    
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
                localStorage.clear();
                location.reload();
            }
        });
    }
    
    const reconnectESP32Btn = document.getElementById('reconnectESP32');
    if (reconnectESP32Btn) {
        reconnectESP32Btn.addEventListener('click', () => {
            const url = document.getElementById('esp32Url').value;
            localStorage.setItem('esp32_url', url);
            if (state.ws) state.ws.close();
            import('./websocket.js').then(module => module.connectESP32());
        });
    }
}
