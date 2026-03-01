// ================================
// ATALHOS DE TECLADO
// ================================

import { toggleTimer, resetTimer } from './timer.js';
import { selectNextActivity } from './activities.js';

export function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignorar se estiver digitando em input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        switch (e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                toggleTimer();
                break;
            case 'r':
                e.preventDefault();
                resetTimer();
                break;
            case 't':
                e.preventDefault();
                selectNextActivity();
                break;
        }
    });
}
