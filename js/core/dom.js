// ============================================================================
// DOM CACHE - Кэширование часто используемых DOM элементов
// ============================================================================

const DOM = {};

function initDOM() {
    DOM.settingsModal = document.getElementById('settings-modal');
    DOM.helpOverlay = document.getElementById('help-overlay');
    DOM.helpContent = document.getElementById('help-content');
    DOM.questionText = document.getElementById('question-text');
    DOM.currentPointsLcd = document.getElementById('current-points-lcd');
    DOM.team0Name = document.getElementById('team0-name');
    DOM.team1Name = document.getElementById('team1-name');
    DOM.team0ScoreLcd = document.getElementById('team0-score-lcd');
    DOM.team1ScoreLcd = document.getElementById('team1-score-lcd');
    DOM.team0RoundIcon = document.getElementById('team0-round-icon');
    DOM.team1RoundIcon = document.getElementById('team1-round-icon');
    DOM.regularLayout = document.getElementById('regular-game-layout');
    DOM.bottomArea = document.getElementById('bottom-area');
    DOM.superGameGrid = document.getElementById('super-game-grid');
    DOM.timerWidget = document.getElementById('timer-widget');
    DOM.timerSeconds = document.getElementById('timer-seconds');
    DOM.hintsContent = document.getElementById('hints-content');
    DOM.winModal = document.getElementById('win-modal');
    DOM.winMessage = document.getElementById('win-message');
    DOM.player1Column = document.getElementById('player1-column');
}

export { DOM, initDOM };
