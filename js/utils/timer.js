// ============================================================================
// TIMER - Управление таймером
// ============================================================================

import { GameContext } from '../core/context.js';
import { DOM } from '../core/dom.js';

function startTimer(seconds) {
    if (GameContext.temp.timer.active) {
        stopTimer();
    }

    GameContext.temp.timer.remaining = seconds;
    GameContext.temp.timer.active = true;
    DOM.timerWidget.style.display = 'flex';
    DOM.timerSeconds.textContent = seconds;

    GameContext.temp.timer.intervalId = setInterval(() => {
        GameContext.temp.timer.remaining--;
        DOM.timerSeconds.textContent = GameContext.temp.timer.remaining;

        if (GameContext.temp.timer.remaining <= 0) {
            stopTimer();
        }
    }, 1000);
}

function stopTimer() {
    if (GameContext.temp.timer.intervalId) {
        clearInterval(GameContext.temp.timer.intervalId);
        GameContext.temp.timer.intervalId = null;
    }
    GameContext.temp.timer.active = false;
    GameContext.temp.timer.remaining = 0;
    DOM.timerWidget.style.display = 'none';
}

export { startTimer, stopTimer };
