// ============================================================================
// SUPER GAME - Суперигра
// ============================================================================

import { GameState } from '../core/fsm.js';
import { SOUNDS } from '../core/constants.js';
import { GameContext } from '../core/context.js';
import { DOM } from '../core/dom.js';
import { playSound, showWinModal } from '../utils/ui.js';
import { startTimer, stopTimer } from '../utils/timer.js';
import { calculateSuperGameSum, togglePlayer1Answers } from '../utils/settings.js';

class SuperGame_Player1_Waiting extends GameState {
    constructor() {
        super('SuperGame_Player1_Waiting');
    }

    enter(context) {
        super.enter(context);

        // Установить заголовок "Супер игра"
        DOM.questionText.textContent = 'Супер игра';

        // Скрыть bottom-area, показать super-game-grid
        DOM.bottomArea.style.display = 'none';
        DOM.superGameGrid.style.display = 'flex';

        // Изменить названия команд на игроков
        DOM.team0Name.textContent = 'Игрок 1';
        DOM.team1Name.textContent = 'Игрок 2';

        // Убрать подчёркивание (убрать класс active)
        DOM.team0Name.classList.remove('active');
        DOM.team1Name.classList.remove('active');

        // Показать обе колонки игроков
        DOM.player1Column.style.display = 'flex';
        context.temp.superGameData.player1Visible = true;

        // Все строки видимы (5 вопросов)
        for (let i = 1; i <= 5; i++) {
            const row1 = document.getElementById(`sg-row1-${i}`);
            const row2 = document.getElementById(`sg-row2-${i}`);
            if (row1) row1.style.display = 'flex';
            if (row2) row2.style.display = 'flex';
        }

        // Сброс данных Super Game
        context.temp.superGameData.player1Sum = 0;
        context.temp.superGameData.player2Sum = 0;
        DOM.currentPointsLcd.textContent = '0';  // Используем центральный LCD

        // Очистить все input поля
        for (let i = 1; i <= 5; i++) {
            const p1Answer = document.getElementById(`p1-q${i}-answer`);
            const p1Points = document.getElementById(`p1-q${i}-points`);
            const p2Answer = document.getElementById(`p2-q${i}-answer`);
            const p2Points = document.getElementById(`p2-q${i}-points`);

            if (p1Answer) p1Answer.value = '';
            if (p1Points) p1Points.value = '';
            if (p2Answer) p2Answer.value = '';
            if (p2Points) p2Points.value = '';
        }
    }

    handleKey(key, context) {
        // Q - запустить/остановить таймер для игрока 1 (15 сек)
        if (key === 'q' || key === 'Q') {
            if (context.temp.timer.active) {
                stopTimer();
            } else {
                startTimer(context.config.time1);
            }
            return null;
        }

        // W - запустить/остановить таймер для игрока 2 (20 сек)
        if (key === 'w' || key === 'W') {
            if (context.temp.timer.active) {
                stopTimer();
            } else {
                startTimer(context.config.time2);
            }
            return null;
        }

        // A - скрыть/показать колонку игрока 1
        if (key === 'a' || key === 'A') {
            togglePlayer1Answers();
            return null;
        }

        // V - показать экран победы вручную
        if (key === 'v' || key === 'V') {
            const total = context.temp.superGameData.player1Sum + context.temp.superGameData.player2Sum;
            playSound(SOUNDS.WIN);
            showWinModal(total);
            return null;  // Остаёмся в SuperGame_Player1_Waiting
        }

        return null;
    }

    getKeyboardHints() {
        return [
            { key: 'Q', action: `Таймер 1 (${GameContext.config.time1}с)` },
            { key: 'W', action: `Таймер 2 (${GameContext.config.time2}с)` },
            { key: 'A', action: 'Скрыть/показать игрока 1' },
            { key: 'V', action: 'Показать экран победы' }
        ];
    }
}

class SuperGame_Results extends GameState {
    constructor() {
        super('SuperGame_Results');
    }

    enter(context) {
        super.enter(context);

        // Пересчитать сумму
        calculateSuperGameSum();

        // Показать колонку игрока 1, если была скрыта
        if (!GameContext.temp.superGameData.player1Visible) {
            togglePlayer1Answers();
        }
    }

    handleKey(key, context) {
        // V - показать экран победы вручную
        if (key === 'v' || key === 'V') {
            const total = context.temp.superGameData.player1Sum + context.temp.superGameData.player2Sum;
            playSound(SOUNDS.WIN);
            showWinModal(total);
            return null;  // Остаёмся в SuperGame_Results
        }

        return null;
    }

    getKeyboardHints() {
        const total = GameContext.temp.superGameData.player1Sum + GameContext.temp.superGameData.player2Sum;
        const isWin = total >= GameContext.config.winpointSuper;

        return [
            { key: 'Сумма', action: `${total} очков ${isWin ? '🎉 ПОБЕДА!' : ''}` },
            { key: 'V', action: 'Показать экран победы' }
        ];
    }

    exit(context) {
        // Восстановить обычный layout
        DOM.bottomArea.style.display = 'flex';
        DOM.superGameGrid.style.display = 'none';

        // Восстановить названия команд
        DOM.team0Name.textContent = GameContext.config.command0name;
        DOM.team1Name.textContent = GameContext.config.command1name;

        // Восстановить класс active для первой команды
        DOM.team0Name.classList.add('active');
    }
}

export { SuperGame_Player1_Waiting, SuperGame_Results };
