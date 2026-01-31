// ============================================================================
// SETTINGS - Управление настройками, импорт/экспорт, справка
// ============================================================================

import { GAME_X1, GAME_X2, GAME_X3, GAME_NAOBOROT, GAME_SUPER, MAX_ANSWERS } from '../core/constants.js';
import { GameContext } from '../core/context.js';
import { DOM } from '../core/dom.js';
import { showModal, hideModal, updateScoreDisplays } from './ui.js';
import { startTimer, stopTimer } from './timer.js';

// === SUPER GAME UTILITIES ===

function togglePlayer1Answers() {
    GameContext.temp.superGameData.player1Visible = !GameContext.temp.superGameData.player1Visible;
    DOM.player1Column.style.display = GameContext.temp.superGameData.player1Visible ? 'flex' : 'none';
}

function calculateSuperGameSum() {
    let p1Sum = 0;
    let p2Sum = 0;

    for (let i = 1; i <= 5; i++) {
        const p1Points = parseInt(document.getElementById(`p1-q${i}-points`).value) || 0;
        const p2Points = parseInt(document.getElementById(`p2-q${i}-points`).value) || 0;
        p1Sum += p1Points;
        p2Sum += p2Points;
    }

    GameContext.temp.superGameData.player1Sum = p1Sum;
    GameContext.temp.superGameData.player2Sum = p2Sum;

    const total = p1Sum + p2Sum;

    // Обновить центральный LCD (current-points-lcd)
    DOM.currentPointsLcd.textContent = total;

    // Подсветка красным при победе
    if (total >= GameContext.config.winpointSuper) {
        DOM.currentPointsLcd.style.color = 'red';
    } else {
        DOM.currentPointsLcd.style.color = '#0f0';  // Зелёный LCD
    }
}

// === СПРАВКА (HELP) ===

function toggleHelp() {
    if (GameContext.helpVisible) {
        hideModal(DOM.helpOverlay);
        GameContext.helpVisible = false;
    } else {
        showModal(DOM.helpOverlay);
        GameContext.helpVisible = true;
        updateHelpContent();
    }
}

function updateHelpContent() {
    const hints = window.stateManager?.currentState?.getKeyboardHints() || [];
    const helpHTML = hints.map(h => `<div><kbd>${h.key}</kbd> — ${h.action}</div>`).join('');
    DOM.helpContent.innerHTML = helpHTML || '<div>Нет доступных клавиш</div>';
}

// === НАСТРОЙКИ (SETTINGS) ===

function applySettings() {
    DOM.team0Name.textContent = GameContext.config.command0name;
    DOM.team1Name.textContent = GameContext.config.command1name;
}

function updateTabStyles() {
    const rounds = ['cfg-round1', 'cfg-round2', 'cfg-round3', 'cfg-roundobr', 'cfg-roundsuper'];

    document.querySelectorAll('.tab-btn[data-round]').forEach(btn => {
        const roundKey = btn.dataset.round;
        const checkboxId = rounds[roundKey];
        const checkbox = document.getElementById(checkboxId);

        if (checkbox && !checkbox.checked) {
            btn.classList.add('disabled');
        } else {
            btn.classList.remove('disabled');
        }
    });
}

function loadQuestionIntoForm(questionIndex) {
    const q = GameContext.questions[questionIndex];
    if (!q) return;

    const questionInput = document.getElementById(`q${questionIndex}-text`);
    questionInput.value = q.name || q.question || '';
    questionInput.placeholder = (q.name || q.question) === '' ? '<отсутствует>' : '';

    for (let j = 0; j < MAX_ANSWERS; j++) {
        const answer = q.answers[j];
        const textInput = document.getElementById(`q${questionIndex}-a${j}`);
        const numInput = document.getElementById(`q${questionIndex}-p${j}`);

        textInput.value = answer.text || '';
        textInput.placeholder = answer.text === '' ? '<отсутствует>' : '';
        numInput.value = answer.num || 0;
    }
}

function saveQuestionFromForm(questionIndex) {
    if (!GameContext.questions[questionIndex]) return;

    const questionValue = document.getElementById(`q${questionIndex}-text`).value;
    // Поддержка обоих форматов: name и question
    if (GameContext.questions[questionIndex].hasOwnProperty('name')) {
        GameContext.questions[questionIndex].name = questionValue;
    } else {
        GameContext.questions[questionIndex].question = questionValue;
    }

    for (let j = 0; j < MAX_ANSWERS; j++) {
        GameContext.questions[questionIndex].answers[j].text = document.getElementById(`q${questionIndex}-a${j}`).value;
        GameContext.questions[questionIndex].answers[j].num = parseInt(document.getElementById(`q${questionIndex}-p${j}`).value) || 0;
    }
}

function openSettingsDialog() {
    showModal(DOM.settingsModal);

    // Загрузить тему игры
    const gameThemeInput = document.getElementById('cfg-game-theme');
    if (gameThemeInput) {
        gameThemeInput.value = GameContext.config.gameTheme || "100 к 1";
    }

    // Заполнить форму настроек
    document.getElementById('cfg-team0').value = GameContext.config.command0name;
    document.getElementById('cfg-team1').value = GameContext.config.command1name;
    document.getElementById('cfg-time1').value = GameContext.config.time1;
    document.getElementById('cfg-time2').value = GameContext.config.time2;
    document.getElementById('cfg-time3').value = GameContext.config.timeRoundObr;
    document.getElementById('cfg-winpoint-super').value = GameContext.config.winpointSuper || 200;

    // Заполнить очки
    document.getElementById('cfg-point0').value = GameContext.persistent.point0;
    document.getElementById('cfg-point1').value = GameContext.persistent.point1;
    document.getElementById('cfg-current-points').value = GameContext.temp.points;

    // Заполнить чекбоксы раундов
    document.getElementById('cfg-round1').checked = GameContext.config.rounds[GAME_X1];
    document.getElementById('cfg-round2').checked = GameContext.config.rounds[GAME_X2];
    document.getElementById('cfg-round3').checked = GameContext.config.rounds[GAME_X3];
    document.getElementById('cfg-roundobr').checked = GameContext.config.rounds[GAME_NAOBOROT];
    document.getElementById('cfg-roundsuper').checked = GameContext.config.rounds[GAME_SUPER];

    // Загрузить вопросы в формы
    for (let i = 0; i < 4; i++) {
        loadQuestionIntoForm(i);
    }

    // Обновить стили табов
    updateTabStyles();
}

function saveSettings() {
    // Сохранить тему игры
    const gameThemeInput = document.getElementById('cfg-game-theme');
    if (gameThemeInput) {
        GameContext.config.gameTheme = gameThemeInput.value || "100 к 1";
    }

    // Прочитать настройки
    GameContext.config.command0name = document.getElementById('cfg-team0').value;
    GameContext.config.command1name = document.getElementById('cfg-team1').value;
    GameContext.config.time1 = parseInt(document.getElementById('cfg-time1').value);
    GameContext.config.time2 = parseInt(document.getElementById('cfg-time2').value);
    GameContext.config.timeRoundObr = parseInt(document.getElementById('cfg-time3').value);
    GameContext.config.winpointSuper = parseInt(document.getElementById('cfg-winpoint-super').value) || 200;

    // Сохранить очки
    GameContext.persistent.point0 = parseInt(document.getElementById('cfg-point0').value) || 0;
    GameContext.persistent.point1 = parseInt(document.getElementById('cfg-point1').value) || 0;
    GameContext.temp.points = parseInt(document.getElementById('cfg-current-points').value) || 0;

    // Сохранить чекбоксы раундов
    GameContext.config.rounds[GAME_X1] = document.getElementById('cfg-round1').checked;
    GameContext.config.rounds[GAME_X2] = document.getElementById('cfg-round2').checked;
    GameContext.config.rounds[GAME_X3] = document.getElementById('cfg-round3').checked;
    GameContext.config.rounds[GAME_NAOBOROT] = document.getElementById('cfg-roundobr').checked;
    GameContext.config.rounds[GAME_SUPER] = document.getElementById('cfg-roundsuper').checked;

    // Сохранить вопросы
    for (let i = 0; i < 4; i++) {
        saveQuestionFromForm(i);
    }

    // Применить настройки
    applySettings();
    updateScoreDisplays();

    hideModal(DOM.settingsModal);
}

// === ИМПОРТ/ЭКСПОРТ ===

function exportToJSON() {
    const data = {
        config: GameContext.config,
        rounds: GameContext.questions
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game_settings.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importFromJSON(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (data.config) {
                GameContext.config = data.config;
            }

            if (data.rounds && data.rounds.length > 0) {
                GameContext.questions = data.rounds;
            } else if (data.questions && data.questions.length > 0) {
                GameContext.questions = data.questions;
            }

            applySettings();

            GameContext.dataLoaded = true;
            console.log('[FSM] Settings imported from JSON');

            alert('Настройки успешно загружены!');
        } catch (err) {
            alert('Ошибка загрузки: ' + err.message);
            console.error('Import error:', err);
        }
    };
    reader.readAsText(file);
}

function startSuperGameTimer() {
    // Запустить таймер для Super Game
    // По умолчанию используем time1 (15 секунд)
    const duration = GameContext.config.time1;
    startTimer(duration);
}

function startSuperGameTimer2() {
    // Запустить или остановить таймер для второго игрока (20 секунд)
    if (GameContext.temp.timer.active) {
        stopTimer();
    } else {
        startTimer(GameContext.config.time2);
    }
}

export {
    applySettings, updateTabStyles, loadQuestionIntoForm, saveQuestionFromForm,
    openSettingsDialog, saveSettings, exportToJSON, importFromJSON,
    startSuperGameTimer, startSuperGameTimer2, calculateSuperGameSum,
    togglePlayer1Answers, toggleHelp, updateHelpContent
};
