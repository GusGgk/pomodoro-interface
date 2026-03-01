// ================================
// GERENCIAMENTO DE ATIVIDADES
// ================================

import state from './state.js';
import { saveActivities } from './storage.js';
import { resetTimer } from './timer.js';
import { updateTimerDisplay } from './ui.js';
import { sendToESP32 } from './websocket.js';

export function addActivity(name, focus, pause) {
    const activity = {
        id: Date.now(),
        name: name,
        focusTime: focus * 60,
        breakTime: pause * 60
    };
    
    state.activities.push(activity);
    saveActivities();
    renderActivities();
}

export function selectActivity(id) {
    const activity = state.activities.find(a => a.id === id);
    const statusDisplay = document.getElementById('status');
    
    state.currentActivity = activity;
    state.totalTime = activity.focusTime;
    state.remainingTime = activity.focusTime;
    statusDisplay.innerText = activity.name;
    
    updateTimerDisplay();
    renderActivities();
    
    // Enviar configuração para ESP32
    sendToESP32({
        type: 'activity_selected',
        focusMinutes: Math.floor(activity.focusTime / 60),
        breakMinutes: Math.floor(activity.breakTime / 60)
    });
}

export function deleteActivity(id) {
    const statusDisplay = document.getElementById('status');
    
    if (state.currentActivity?.id === id) {
        resetTimer();
        state.currentActivity = null;
        statusDisplay.innerText = 'FOCO';
    }
    
    state.activities = state.activities.filter(a => a.id !== id);
    saveActivities();
    renderActivities();
}

export function renderActivities() {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';
    
    if (state.activities.length === 0) {
        activityList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 20px;">Nenhuma atividade criada ainda.<br>Crie sua primeira atividade abaixo!</p>';
        return;
    }
    
    state.activities.forEach(activity => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        
        div.innerHTML = `
            <span>${activity.name}</span>
            <div class="activity-actions">
                <button class="select-btn">Selecionar</button>
                <button class="delete-btn">✕</button>
            </div>
        `;
        
        div.querySelector('.select-btn')
            .addEventListener('click', () => {
                selectActivity(activity.id);
            });
        
        div.querySelector('.delete-btn')
            .addEventListener('click', () => {
                deleteActivity(activity.id);
            });
        
        activityList.appendChild(div);
    });
}

export function selectNextActivity() {
    if (state.activities.length === 0) return;
    
    const currentIndex = state.currentActivity
        ? state.activities.findIndex(a => a.id === state.currentActivity.id)
        : -1;
    
    const nextIndex = (currentIndex + 1) % state.activities.length;
    selectActivity(state.activities[nextIndex].id);
}
