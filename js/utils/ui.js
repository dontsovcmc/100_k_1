// ============================================================================
// UI UTILITIES - Утилиты для работы с интерфейсом
// ============================================================================

import { IMAGES, SOUNDS, MAX_WRONG_ANSWERS, MAX_ANSWERS, COMMAND_A, COMMAND_B } from '../core/constants.js';
import { GameContext } from '../core/context.js';
import { DOM } from '../core/dom.js';

// === МОДАЛЬНЫЕ ОКНА ===

function showModal(modal) {
    modal.style.display = 'flex';
}

function hideModal(modal) {
    modal.style.display = 'none';
}

// === ЗВУК ===

function playSound(name) {
    const audio = document.getElementById(`sound-${name}`);
    if (audio) {
        audio.loop = false;
        audio.currentTime = 0;
        audio.play().catch(err => console.warn('Audio play failed:', err));
    }
}

// === ОБНОВЛЕНИЕ СЧЕТА ===

function updateScoreDisplays() {
    DOM.currentPointsLcd.textContent = GameContext.temp.points;
    DOM.team0ScoreLcd.textContent = GameContext.persistent.point0;
    DOM.team1ScoreLcd.textContent = GameContext.persistent.point1;
}

function updateCurrentPointsDisplay() {
    DOM.currentPointsLcd.textContent = GameContext.temp.points;
}

// === ВОПРОСЫ ===

function updateQuestionText(text) {
    DOM.questionText.textContent = text;
}

// === ОТВЕТЫ ===

function clearAnswers() {
    document.querySelectorAll('.answer-text').forEach(text => {
        text.textContent = '';
        text.classList.remove('revealed');
    });
    document.querySelectorAll('.answer-points').forEach(points => {
        points.textContent = '';
    });
    GameContext.temp.openAnswers = 0;
    GameContext.temp.points = 0;
    updateCurrentPointsDisplay();
}

// === ОШИБКИ (X MARKS) ===

function clearBadAnswers() {
    document.querySelectorAll('.x-mark').forEach(mark => {
        mark.src = IMAGES.X_EMPTY;
    });
}

function addXMark(teamIndex, count) {
    if (count > MAX_WRONG_ANSWERS) {
        console.warn('[FSM] Invalid X mark count:', count);
        return;
    }

    const elementId = `x${teamIndex + 1}-${count}`;
    const xImg = document.getElementById(elementId);

    if (!xImg) {
        console.error('[FSM] X mark element not found:', elementId);
        return;
    }

    console.log('[FSM] Setting X mark:', { elementId, src: IMAGES.X_FILLED });
    xImg.src = IMAGES.X_FILLED;
}

// === КОМАНДЫ ===

function setActiveTeam(teamIndex) {
    if (teamIndex === COMMAND_A) {
        DOM.team0Name.classList.add('active');
        DOM.team1Name.classList.remove('active');
    } else {
        DOM.team0Name.classList.remove('active');
        DOM.team1Name.classList.add('active');
    }
    GameContext.temp.activeCommand = teamIndex;
}

function clearActiveTeam() {
    DOM.team0Name.classList.remove('active');
    DOM.team1Name.classList.remove('active');
    GameContext.temp.activeCommand = -1;
}

// === ПОДСКАЗКИ КЛАВИАТУРЫ ===

function displayKeyboardHints(hints) {
    if (!DOM.hintsContent) return;

    if (hints.length === 0) {
        DOM.hintsContent.innerHTML = '';
        return;
    }

    const hintsHTML = hints.map(h =>
        `<span class="hint-item"><kbd>${h.key}</kbd> ${h.action}</span>`
    ).join(' ');

    DOM.hintsContent.innerHTML = hintsHTML;
}

// === РАУНДЫ ===

function getNextEnabledRound(startIndex) {
    for (let i = startIndex; i < GameContext.config.rounds.length; i++) {
        if (GameContext.config.rounds[i]) {
            return i;
        }
    }
    return -1;
}

// === FULLSCREEN ===

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn('Fullscreen failed:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// === WIN MODAL ===

function showWinModal(score) {
    if (DOM.winModal && DOM.winMessage) {
        DOM.winMessage.textContent = `Набрано ${score} очков!`;
        showModal(DOM.winModal);
    }
}

export {
    showModal, hideModal, playSound,
    updateScoreDisplays, updateCurrentPointsDisplay, updateQuestionText,
    clearAnswers, clearBadAnswers, addXMark, setActiveTeam, clearActiveTeam,
    displayKeyboardHints, getNextEnabledRound, toggleFullscreen,
    showWinModal
};
