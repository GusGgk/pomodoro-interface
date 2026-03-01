// ================================
// INTERFACE DO USUÁRIO
// ================================

import state from './state.js';
import { updateStatsDisplay, renderWeekChart } from './statistics.js';

export function format(value) {
    return value.toString().padStart(2, '0');
}

export function updateTimerDisplay() {
    const timeDisplay = document.getElementById('time');
    
    const minutes = Math.floor(state.remainingTime / 60);
    const seconds = state.remainingTime % 60;
    
    timeDisplay.innerText = format(minutes) + ':' + format(seconds);
    
    // Atualizar progresso circular
    updateProgress();
    
    // Atualizar título da página
    document.title = `${format(minutes)}:${format(seconds)} - Pomodoro Pro`;
}

export function updateStartPauseIcon() {
    const startPauseBtn = document.getElementById('startPause');
    const icon = startPauseBtn.querySelector('img');
    
    if (state.isRunning) {
        icon.src = 'assets/icons/pause.svg';
    } else {
        icon.src = 'assets/icons/play.svg';
    }
}

export function updateProgress() {
    const circle = document.getElementById('progressCircle');
    if (!circle) return;
    
    const radius = 130;
    const circumference = 2 * Math.PI * radius;
    
    const progress = state.remainingTime / state.totalTime;
    const offset = circumference * (1 - progress);
    
    circle.style.strokeDashoffset = offset;
    
    const statusDisplay = document.getElementById('status');
    
    // Mudar cor baseado no status
    if (statusDisplay.innerText === 'PAUSA') {
        circle.style.stroke = 'var(--accent-secondary)';
    } else {
        circle.style.stroke = 'var(--accent-primary)';
    }
}

export function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Atualizar botões
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Atualizar conteúdo
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`tab-${tabName}`).classList.add('active');
            
            // Atualizar estatísticas se for a aba de stats
            if (tabName === 'stats') {
                updateStatsDisplay();
                renderWeekChart();
            }
        });
    });
}
