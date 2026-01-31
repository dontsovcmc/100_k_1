// ============================================================================
// ROUND BASE - Базовые классы для раундов X1 (Simple Game ×1)
// ============================================================================

import { GameState } from '../core/fsm.js';
import { GAME_X1, COMMAND_A, COMMAND_B, MAX_ANSWERS, MAX_WRONG_ANSWERS, SOUNDS } from '../core/constants.js';
import { DOM } from '../core/dom.js';
import { clearAnswers, clearBadAnswers, updateScoreDisplays, setActiveTeam, updateQuestionText, updateCurrentPointsDisplay, addXMark, playSound } from '../utils/ui.js';

class RoundX1_QuestionShown extends GameState {
    constructor() {
        super('RoundX1_QuestionShown');
        this.roundIndex = GAME_X1;
        this.multiplier = 1;
        this.roundIcon = 'bmp/game_1.bmp';
    }

    enter(context) {
        super.enter(context);

        DOM.regularLayout.style.display = 'flex';
        DOM.bottomArea.style.display = 'flex';
        DOM.superGameGrid.style.display = 'none';

        // Показать вопрос
        const question = context.questions[this.roundIndex];
        if (question) {
            updateQuestionText(question.name || question.question || 'Вопрос не загружен');

            // Сбросить флаг opened для всех ответов
            question.answers.forEach(a => a.opened = false);
        } else {
            updateQuestionText('Вопрос не загружен');
        }

        // Показать иконки раунда
        DOM.team0RoundIcon.src = this.roundIcon;
        DOM.team1RoundIcon.src = this.roundIcon;

        // Очистить UI
        clearAnswers();
        clearBadAnswers();

        // Инициализация выбора команды
        context.temp.firstTeam = 0;      // По умолчанию команда 0
        context.temp.secondTeam = 1;
        context.temp.currentlyPlaying = 0;
        context.temp.isFirstTurn = true;

        // Сбросить счетчики
        context.temp.points = 0;
        context.temp.openAnswers = 0;
        context.temp.badAnswerCount = 0;
        context.temp.activeCommand = COMMAND_A; // Для совместимости

        // Показать команду A активной по умолчанию
        setActiveTeam(COMMAND_A);
        updateScoreDisplays();
    }

    handleKey(key, context) {
        // Выбор команды ←
        if (key === 'ArrowLeft') {
            context.temp.firstTeam = 0;
            context.temp.secondTeam = 1;
            context.temp.currentlyPlaying = 0;
            setActiveTeam(COMMAND_A);  // Визуально показать команду 0
            context.temp.activeCommand = COMMAND_A; // Для совместимости
            return null;
        }

        // Выбор команды →
        if (key === 'ArrowRight') {
            context.temp.firstTeam = 1;
            context.temp.secondTeam = 0;
            context.temp.currentlyPlaying = 1;
            setActiveTeam(COMMAND_B);  // Визуально показать команду 1
            context.temp.activeCommand = COMMAND_B; // Для совместимости
            return null;
        }

        // Переход к игре выбранной команды
        if (key === 'ArrowUp' || key === 'N' || key === 'n') {
            context.temp.isFirstTurn = true;
            context.temp.currentlyPlaying = context.temp.firstTeam;
            return 'RoundX1_TeamA_Playing';  // TeamA = первая играющая команда
        }

        return null;
    }

    getKeyboardHints() {
        return [
            { key: '←/→', action: 'Выбрать команду' },
            { key: '↑', action: 'Начать игру' }
        ];
    }
}

class RoundX1_TeamA_Playing extends GameState {
    constructor() {
        super('RoundX1_TeamA_Playing');
        this.roundIndex = GAME_X1;
        this.multiplier = 1;
    }

    enter(context) {
        super.enter(context);

        // TeamA = первая играющая команда (может быть 0 или 1!)
        context.temp.isFirstTurn = true;
        context.temp.currentlyPlaying = context.temp.firstTeam;
        context.temp.badAnswerCount = 0;
        context.temp.points = 0;
        context.temp.openAnswers = 0;

        // Показать ПРАВИЛЬНУЮ команду активной
        setActiveTeam(context.temp.currentlyPlaying);
        clearBadAnswers();
        updateScoreDisplays();
    }

    handleKey(key, context) {
        // Клавиши 1-6 для открытия ответов
        if (['1', '2', '3', '4', '5', '6'].includes(key)) {
            const index = parseInt(key) - 1;
            this.openAnswer(index, context);

            // Проверка: все ответы открыты?
            if (context.temp.openAnswers === MAX_ANSWERS) {
                return this.completeRound(context, COMMAND_A);
            }

            return null;
        }

        // X или Delete - ошибка
        if (key === 'x' || key === 'X' || key === 'Delete') {
            context.temp.badAnswerCount++;

            // Добавить X mark команде, которая РЕАЛЬНО играет
            const displayTeam = (context.temp.currentlyPlaying === 0) ? COMMAND_A : COMMAND_B;
            addXMark(displayTeam, context.temp.badAnswerCount);
            playSound(SOUNDS.BAD);

            // 3 ошибки? → переход к второй команде
            if (context.temp.badAnswerCount >= MAX_WRONG_ANSWERS) {
                return 'RoundX1_TeamB_Playing';
            }

            return null;
        }

        return null;
    }

    openAnswer(index, context) {
        const question = context.questions[this.roundIndex];
        if (!question) {
            console.error('[FSM] No question for round:', this.roundIndex);
            return;
        }

        const answer = question.answers[index];
        if (!answer) {
            console.error('[FSM] No answer at index:', index);
            return;
        }

        if (answer.opened) {
            console.warn('[FSM] Answer already opened:', index);
            return;
        }

        // Открыть ответ
        answer.opened = true;
        const answerSlot = document.getElementById(`answer${index + 1}`);

        if (!answerSlot) {
            console.error('[FSM] Answer slot not found:', `answer${index + 1}`);
            return;
        }

        const textEl = answerSlot.querySelector('.answer-text');
        const pointsEl = answerSlot.querySelector('.answer-points');

        if (!textEl || !pointsEl) {
            console.error('[FSM] Missing text or points element in slot:', index + 1);
            return;
        }

        textEl.textContent = answer.text;
        pointsEl.textContent = answer.num;
        textEl.classList.add('revealed');

        console.log('[FSM] Answer revealed:', { index, text: answer.text, points: answer.num });

        // Подсчет очков (×1 для простой игры)
        context.temp.points += answer.num * this.multiplier;
        context.temp.openAnswers++;

        updateCurrentPointsDisplay();
        playSound(SOUNDS.OPEN);
    }

    completeRound(context) {
        // Начислить очки команде, которая РЕАЛЬНО играет
        if (context.temp.currentlyPlaying === 0) {
            context.persistent.point0 += context.temp.points;
        } else {
            context.persistent.point1 += context.temp.points;
        }

        updateScoreDisplays();

        // Переход к Finished состоянию
        return 'RoundX1_Finished';
    }

    getKeyboardHints() {
        return [
            { key: '1-6', action: 'Открыть ответ' },
            { key: 'X', action: 'Ошибка' }
        ];
    }
}

class RoundX1_TeamB_Playing extends GameState {
    constructor() {
        super('RoundX1_TeamB_Playing');
        this.roundIndex = GAME_X1;
        this.multiplier = 1;
    }

    enter(context) {
        super.enter(context);

        // TeamB = вторая играющая команда
        context.temp.isFirstTurn = false;
        context.temp.currentlyPlaying = context.temp.secondTeam;
        context.temp.badAnswerCount = 0;
        // context.temp.points СОХРАНЯЮТСЯ от первой команды!

        // Показать ПРАВИЛЬНУЮ команду активной
        setActiveTeam(context.temp.currentlyPlaying);
        // НЕ очищаем очки! Они накапливаются.
    }

    handleKey(key, context) {
        // Клавиши 1-6 для открытия ответов
        if (['1', '2', '3', '4', '5', '6'].includes(key)) {
            const index = parseInt(key) - 1;
            this.openAnswer(index, context);

            // При открытии ЛЮБОГО ответа второй командой раунд завершается
            // Очки присуждаются второй команде (currentlyPlaying)
            return this.completeRound(context);
        }

        // X или Delete - ошибка
        if (key === 'x' || key === 'X' || key === 'Delete') {
            context.temp.badAnswerCount++;

            // Добавить X mark команде, которая РЕАЛЬНО играет
            const displayTeam = (context.temp.currentlyPlaying === 0) ? COMMAND_A : COMMAND_B;
            addXMark(displayTeam, context.temp.badAnswerCount);
            playSound(SOUNDS.BAD);

            // При ПЕРВОЙ ошибке второй команды очки сразу идут первой команде
            context.temp.currentlyPlaying = context.temp.firstTeam;
            return this.completeRound(context);
        }

        return null;
    }

    openAnswer(index, context) {
        const question = context.questions[this.roundIndex];
        if (!question) {
            console.error('[FSM] No question for round:', this.roundIndex);
            return;
        }

        const answer = question.answers[index];
        if (!answer) {
            console.error('[FSM] No answer at index:', index);
            return;
        }

        if (answer.opened) {
            console.warn('[FSM] Answer already opened:', index);
            return;
        }

        // Открыть ответ
        answer.opened = true;
        const answerSlot = document.getElementById(`answer${index + 1}`);

        if (!answerSlot) {
            console.error('[FSM] Answer slot not found:', `answer${index + 1}`);
            return;
        }

        const textEl = answerSlot.querySelector('.answer-text');
        const pointsEl = answerSlot.querySelector('.answer-points');

        if (!textEl || !pointsEl) {
            console.error('[FSM] Missing text or points element in slot:', index + 1);
            return;
        }

        textEl.textContent = answer.text;
        pointsEl.textContent = answer.num;
        textEl.classList.add('revealed');

        console.log('[FSM] Answer revealed:', { index, text: answer.text, points: answer.num });

        // Подсчет очков
        context.temp.points += answer.num * this.multiplier;
        context.temp.openAnswers++;

        updateCurrentPointsDisplay();
        playSound(SOUNDS.OPEN);
    }

    completeRound(context) {
        // Начислить очки команде, которая РЕАЛЬНО играет
        // (может быть firstTeam, если вторая команда получила 3X)
        if (context.temp.currentlyPlaying === 0) {
            context.persistent.point0 += context.temp.points;
        } else {
            context.persistent.point1 += context.temp.points;
        }

        updateScoreDisplays();

        // Переход к Finished состоянию
        return 'RoundX1_Finished';
    }

    getKeyboardHints() {
        return [
            { key: '1-6', action: 'Открыть ответ' },
            { key: 'X', action: 'Ошибка (3 = очки первой команде!)' }
        ];
    }
}

export { RoundX1_QuestionShown, RoundX1_TeamA_Playing, RoundX1_TeamB_Playing };
