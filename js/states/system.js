// ============================================================================
// SYSTEM STATES - Системные состояния игры
// ============================================================================

import { GameState } from '../core/fsm.js';
import { GAME_SUPER, GAME_NAOBOROT, SOUNDS } from '../core/constants.js';
import { GameContext } from '../core/context.js';
import { DOM } from '../core/dom.js';
import { clearAnswers, clearBadAnswers, updateScoreDisplays, updateQuestionText, getNextEnabledRound, playSound, showModal } from '../utils/ui.js';

class WaitingToStart extends GameState {
    constructor() {
        super('WaitingToStart');
    }

    enter(context) {
        super.enter(context);

        // Показать основной layout
        DOM.regularLayout.style.display = 'flex';
        DOM.bottomArea.style.display = 'flex';
        DOM.superGameGrid.style.display = 'none';

        // Сброс данных
        context.persistent.point0 = 0;
        context.persistent.point1 = 0;
        context.persistent.currentRoundIndex = 0;
        context.temp.points = 0;

        // Очистить UI
        clearAnswers();
        clearBadAnswers();
        updateScoreDisplays();

        // Показать приветственное сообщение
        const firstRoundIndex = getNextEnabledRound(0);
        if (firstRoundIndex !== -1) {
            updateQuestionText('Игра 100 к 1');
        } else {
            updateQuestionText('Нет активных раундов. Откройте настройки (F2)');
        }
    }

    handleKey(key, context) {
        if (key === 'ArrowUp' || key === 'N' || key === 'n') {
            const firstRoundIndex = getNextEnabledRound(0);
            if (firstRoundIndex === -1) {
                console.warn('[FSM] No enabled rounds found');
                return null;
            }

            // Переход к музыкальной заставке
            return 'MusicIntro';
        }

        if (key === 'F2') {
            // Открыть настройки - временно просто показываем модал
            showModal(DOM.settingsModal);
            return null;
        }

        return null;
    }

    getKeyboardHints() {
        const hints = [
            { key: '↑', action: 'Начать игру' },
            { key: 'F2', action: 'Настройки' },
            { key: 'F1', action: 'Справка' }
        ];

        if (!GameContext.dataLoaded) {
            hints.unshift({ key: '⏳', action: 'Загрузка вопросов...' });
        }

        return hints;
    }
}

class MusicIntro extends GameState {
    constructor() {
        super('MusicIntro');
    }

    enter(context) {
        super.enter(context);
        console.log('[FSM] Entering MusicIntro');

        // Проиграть музыку
        playSound(SOUNDS.START);

        // Показать визуальное сообщение с темой игры
        const gameTheme = context.config.gameTheme || "100 к 1";
        updateQuestionText(`🎵 ${gameTheme} 🎵`);
        clearAnswers();
        clearBadAnswers();

        // Обнулить счет если это самый первый раунд
        if (context.persistent.currentRoundIndex === 0) {
            context.persistent.team0Score = 0;
            context.persistent.team1Score = 0;
            updateScoreDisplays();
        }

        DOM.regularLayout.style.display = 'flex';
        DOM.bottomArea.style.display = 'flex';
        DOM.superGameGrid.style.display = 'none';
    }

    handleKey(key, context) {
        // Перейти к первому раунду при нажатии N/↑
        if (key === 'ArrowUp' || key === 'N' || key === 'n') {
            const firstRoundIndex = getNextEnabledRound(0);
            context.persistent.currentRoundIndex = firstRoundIndex;

            if (firstRoundIndex === GAME_SUPER) {
                return 'SuperGame_Player1_Waiting';
            } else if (firstRoundIndex === GAME_NAOBOROT) {
                return 'RoundReverse_TitleShown';
            } else {
                return `RoundX${firstRoundIndex + 1}_QuestionShown`;
            }
        }

        return null;
    }

    exit(context) {
        super.exit(context);
        console.log('[FSM] Exiting MusicIntro');
    }

    getKeyboardHints() {
        return [
            { key: '↑', action: 'Начать первый раунд' }
        ];
    }
}

export { WaitingToStart, MusicIntro };
