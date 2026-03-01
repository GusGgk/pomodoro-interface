// ================================
// ESTATÍSTICAS E GRÁFICOS
// ================================

import state from './state.js';

export function getStatistics() {
    const today = new Date().toLocaleDateString('pt-BR');
    const thisWeek = getWeekNumber(new Date());
    
    const todayHistory = state.history.filter(h =>
        new Date(h.date).toLocaleDateString('pt-BR') === today
    );
    
    const weekHistory = state.history.filter(h =>
        getWeekNumber(new Date(h.date)) === thisWeek
    );
    
    return {
        todayFocus: todayHistory.filter(h => h.type === 'focus').length,
        todayMinutes: Math.floor(todayHistory.reduce((acc, h) => acc + (h.duration || 0), 0)),
        weekFocus: weekHistory.filter(h => h.type === 'focus').length,
        weekMinutes: Math.floor(weekHistory.reduce((acc, h) => acc + (h.duration || 0), 0)),
        totalSessions: state.history.length,
        totalMinutes: Math.floor(state.history.reduce((acc, h) => acc + (h.duration || 0), 0))
    };
}

function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function updateStatsDisplay() {
    const stats = getStatistics();
    
    const elements = {
        'stat-today-sessions': stats.todayFocus,
        'stat-today-minutes': stats.todayMinutes,
        'stat-week-sessions': stats.weekFocus,
        'stat-week-minutes': stats.weekMinutes,
        'stat-total-sessions': stats.totalSessions,
        'stat-total-minutes': stats.totalMinutes,
        'todayFocus': stats.todayMinutes,
        'stat-best-streak': calculateBestStreak()
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    }
}

function calculateBestStreak() {
    if (state.history.length === 0) return 0;
    
    const dates = [...new Set(state.history.map(h =>
        new Date(h.date).toLocaleDateString('pt-BR')
    ))].sort();
    
    let currentStreak = 1;
    let bestStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1].split('/').reverse().join('-'));
        const currDate = new Date(dates[i].split('/').reverse().join('-'));
        const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }
    
    return bestStreak;
}

export function renderWeekChart() {
    const canvas = document.getElementById('weekChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Limpar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Dados últimos 7 dias
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push({
            date: date.toLocaleDateString('pt-BR'),
            label: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()],
            minutes: 0
        });
    }
    
    // Calcular minutos por dia
    state.history.forEach(h => {
        const dateStr = new Date(h.date).toLocaleDateString('pt-BR');
        const day = last7Days.find(d => d.date === dateStr);
        if (day && h.type === 'focus') {
            day.minutes += h.duration || 0;
        }
    });
    
    // Desenhar gráfico
    const maxMinutes = Math.max(...last7Days.map(d => d.minutes), 60);
    const barWidth = width / 7 - 20;
    const maxBarHeight = height - 60;
    
    last7Days.forEach((day, index) => {
        const barHeight = (day.minutes / maxMinutes) * maxBarHeight;
        const x = index * (width / 7) + 15;
        const y = height - barHeight - 40;
        
        // Desenhar barra
        const gradient = ctx.createLinearGradient(0, y, 0, height - 40);
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#2e7d32');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Label do dia
        ctx.fillStyle = '#9aa0a6';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(day.label, x + barWidth / 2, height - 20);
        
        // Minutos
        if (day.minutes > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px Inter';
            ctx.fillText(Math.floor(day.minutes) + 'm', x + barWidth / 2, y - 5);
        }
    });
}

export function renderHistory() {
    const container = document.getElementById('historyList');
    if (!container) return;
    
    container.innerHTML = '';
    
    const recentHistory = state.history.slice(-10).reverse();
    
    if (recentHistory.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Nenhuma sessão ainda</p>';
        return;
    }
    
    recentHistory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        const icon = item.type === 'focus' ? '🎯' : '☕';
        const duration = Math.floor(item.duration);
        
        div.innerHTML = `
            <span class="history-icon">${icon}</span>
            <div class="history-info">
                <strong>${item.activity}</strong>
                <small>${item.dateString} • ${duration} min</small>
            </div>
        `;
        
        container.appendChild(div);
    });
}
