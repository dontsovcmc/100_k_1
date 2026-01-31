// ============================================================================
// APP - Application Entry Point & Initialization
// ============================================================================

import { normalizeKey } from './core/constants.js';
import { GameContext } from './core/context.js';
import { StateManager } from './core/fsm.js';
import { DOM, initDOM } from './core/dom.js';
import { hideModal, toggleFullscreen } from './utils/ui.js';
import {
    openSettingsDialog, saveSettings, updateTabStyles, exportToJSON,
    importFromJSON, toggleHelp, calculateSuperGameSum,
    startSuperGameTimer, startSuperGameTimer2
} from './utils/settings.js';
import { registerAllStates } from './states/registry.js';

function setupEventListeners() {
    // Главный обработчик клавиш
    document.addEventListener('keydown', handleGlobalKeyPress);

    // Settings modal buttons
    document.getElementById('settings-save')?.addEventListener('click', saveSettings);
    document.getElementById('settings-cancel')?.addEventListener('click', () => {
        hideModal(DOM.settingsModal);
    });

    // Settings tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${tab}`).classList.add('active');
        });
    });

    // Round checkboxes - update tab styles
    document.querySelectorAll('[id^="cfg-round"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateTabStyles);
    });

    // Control panel buttons
    document.getElementById('btn-fullscreen')?.addEventListener('click', toggleFullscreen);
    document.getElementById('btn-help')?.addEventListener('click', toggleHelp);
    document.getElementById('btn-settings')?.addEventListener('click', openSettingsDialog);
    document.getElementById('btn-import')?.addEventListener('click', () => {
        document.getElementById('json-file-input').click();
    });
    document.getElementById('btn-export')?.addEventListener('click', exportToJSON);

    // File input handler
    document.getElementById('json-file-input')?.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            importFromJSON(e.target.files[0]);
        }
    });

    // Super game controls
    document.getElementById('timer1-btn')?.addEventListener('click', startSuperGameTimer);
    document.getElementById('timer2-btn')?.addEventListener('click', startSuperGameTimer2);

    // Автоматический пересчёт при вводе очков
    document.querySelectorAll('.p1-points, .p2-points').forEach(input => {
        input.addEventListener('input', calculateSuperGameSum);
    });

    // Win modal
    document.getElementById('win-modal-ok')?.addEventListener('click', () => {
        hideModal(DOM.winModal);
    });
}

function handleGlobalKeyPress(e) {
    // ESC для закрытия диалогов
    if (e.key === 'Escape') {
        if (DOM.settingsModal?.style.display === 'flex') {
            hideModal(DOM.settingsModal);
            return;
        }
        if (DOM.helpOverlay?.style.display === 'flex') {
            hideModal(DOM.helpOverlay);
            GameContext.helpVisible = false;
            return;
        }
        return;
    }

    // Игнорировать игровые клавиши если фокус на поле ввода (кроме функциональных клавиш)
    const target = e.target;
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    if (isInputField && !e.key.startsWith('F')) {
        return; // Пропустить обработку игровых клавиш
    }

    // Если открыты модалы, игнорировать игровые клавиши
    if (DOM.settingsModal?.style.display === 'flex') {
        return;
    }

    // Глобальные клавиши
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
    }

    if (e.key === 'F1') {
        e.preventDefault();
        toggleHelp();
        return;
    }

    // Откат назад (↓)
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        window.stateManager?.goToPreviousState();
        return;
    }

    // Передать обработку текущему состоянию
    window.stateManager?.handleKey(normalizeKey(e.key));
}

function loadDemoQuestions() {
    fetch('demo.json')
        .then(response => response.json())
        .then(data => {
            // Адаптация к новой структуре GameContext
            if (data.config) {
                Object.assign(GameContext.config, data.config);
            }
            if (data.rounds) {
                GameContext.questions = data.rounds;
            }
            GameContext.dataLoaded = true;
            console.log('[FSM] Questions loaded from demo.json');
        })
        .catch(err => {
            console.warn('Failed to load demo.json:', err);
            // Создать заглушки для вопросов
            GameContext.questions = Array(4).fill(null).map(() => ({
                name: '',
                answers: Array(6).fill(null).map(() => ({ text: '', num: 0, opened: false }))
            }));
            GameContext.dataLoaded = true;
        });
}

function init() {
    console.log('[FSM] Initializing game...');

    initDOM();
    loadDemoQuestions();
    setupEventListeners();

    // Применить настройки команд
    DOM.team0Name.textContent = GameContext.config.command0name;
    DOM.team1Name.textContent = GameContext.config.command1name;

    // Создать State Manager
    window.stateManager = new StateManager(GameContext);

    // Зарегистрировать все состояния
    registerAllStates();

    // Установить начальное состояние
    window.stateManager.changeState('WaitingToStart');

    console.log('[FSM] Game initialized. Starting in WaitingToStart state.');
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', init);
