// ================================
// EVENT LISTENERS
// ================================

import { toggleTimer, resetTimer } from './timer.js';
import { addActivity, renderActivities } from './activities.js';

export function setupEventListeners() {
    // Botões do timer
    const startPauseBtn = document.getElementById('startPause');
    if (startPauseBtn) {
        startPauseBtn.addEventListener('click', toggleTimer);
    }
    
    const resetBtn = document.getElementById('reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetTimer);
    }
    
    // Salvar atividade
    const saveActivityBtn = document.getElementById('saveActivity');
    const activityNameInput = document.getElementById('activityName');
    const focusTimeInput = document.getElementById('focusTime');
    const breakTimeInput = document.getElementById('breakTime');
    
    if (saveActivityBtn) {
        saveActivityBtn.addEventListener('click', () => {
            const name = activityNameInput.value;
            const focus = parseInt(focusTimeInput.value);
            const pause = parseInt(breakTimeInput.value);
            
            if (!name || !focus || !pause) {
                alert('Preencha todos os campos!');
                return;
            }
            
            addActivity(name, focus, pause);
            
            // Limpar inputs
            activityNameInput.value = '';
            focusTimeInput.value = '25';
            breakTimeInput.value = '5';
        });
    }
}
