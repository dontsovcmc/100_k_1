// ============================================================================
// REVERSE GAME - Обратная игра
// ============================================================================

import { GameState } from '../core/fsm.js';
import { GAME_NAOBOROT, GAME_SUPER, COMMAND_A, COMMAND_B, MAX_ANSWERS, SOUNDS } from '../core/constants.js';
import { DOM } from '../core/dom.js';
import { clearAnswers, clearBadAnswers, updateScoreDisplays, updateQuestionText, setActiveTeam, clearActiveTeam, playSound, getNextEnabledRound, updateCurrentPointsDisplay } from '../utils/ui.js';
import { startTimer, stopTimer } from '../utils/timer.js';

class RoundReverse_TitleShown extends GameState {
    constructor() {
        super('RoundReverse_TitleShown');
        this.roundIcon = 'bmp/game_4.bmp';
    }

    enter(context) {
        super.enter(context);

        DOM.regularLayout.style.display = 'flex';
        DOM.superGameLayout.style.display = 'none';

        // Очистить UI
        clearAnswers();
        clearBadAnswers();

        // Показать иконки раунда
        DOM.team0RoundIcon.src = this.roundIcon;
        DOM.team1RoundIcon.src = this.roundIcon;

        // Показать заголовок
        updateQuestionText('Обратная игра');

        context.temp.points = 0;
        context.temp.openAnswers = 0;
        updateScoreDisplays();
    }

    handleKey(key, context) {
        if (key === 'ArrowUp' || key === 'N' || key === 'n') {
            return 'RoundReverse_Playing';
        }
        return null;
    }

    getKeyboardHints() {
        return [
            { key: '↑', action: 'Начать раунд' }
        ];
    }
}

class RoundReverse_Playing extends GameState {
    constructor() {
        super('RoundReverse_Playing');
        this.roundIndex = GAME_NAOBOROT;
    }

    enter(context) {
        super.enter(context);

        // Показать вопрос
        const question = context.questions[this.roundIndex];
        if (question) {
            updateQuestionText(question.name || question.question || 'Вопрос не загружен');
            question.answers.forEach(a => a.opened = false);
        } else {
            updateQuestionText('Вопрос не загружен');
        }

        context.temp.openAnswers = 0;

        // Убрать подчеркивание команд
        clearActiveTeam();

        // Автоматически запустить таймер
        startTimer(context.config.timeRoundObr);
    }

    handleKey(key, context) {
        // Клавиши 1-6 для открытия ответов
        if (['1', '2', '3', '4', '5', '6'].includes(key)) {
            const index = parseInt(key) - 1;
            this.openAnswer(index, context);

            // Проверка: все ответы открыты?
            if (context.temp.openAnswers === MAX_ANSWERS) {
                stopTimer();
                return this.completeRound(context);
            }

            return null;
        }

        // Q - очки команде A
        if (key === 'q' || key === 'Q') {
            this.awardPointsToTeam(context, COMMAND_A);
            return null;
        }

        // W - очки команде B
        if (key === 'w' || key === 'W') {
            this.awardPointsToTeam(context, COMMAND_B);
            return null;
        }

        // T - переключить таймер
        if (key === 't' || key === 'T') {
            if (context.temp.timer.active) {
                stopTimer();
            } else {
                startTimer(context.config.timeRoundObr);
            }
            return null;
        }

        // ArrowUp - завершить раунд
        if (key === 'ArrowUp' || key === 'N' || key === 'n') {
            stopTimer();
            return this.completeRound(context);
        }

        return null;
    }

    completeRound(context) {
        // Автоматический переход к следующему раунду
        const nextRoundIndex = getNextEnabledRound(context.persistent.currentRoundIndex + 1);

        if (nextRoundIndex === -1) {
            // Игра окончена
            updateQuestionText('Игра завершена! Нажмите ↑ для начала новой игры');
            return 'WaitingToStart';
        }

        context.persistent.currentRoundIndex = nextRoundIndex;

        // Переход к следующему раунду
        if (nextRoundIndex === GAME_SUPER) {
            return 'SuperGame_Player1_Waiting';
        } else if (nextRoundIndex === GAME_NAOBOROT) {
            return 'RoundReverse_TitleShown';
        } else {
            return `RoundX${nextRoundIndex + 1}_QuestionShown`;
        }
    }

    openAnswer(index, context) {
        const question = context.questions[this.roundIndex];
        if (!question) return;

        const answer = question.answers[index];
        if (!answer || answer.opened) return;

        // Открыть ответ
        answer.opened = true;
        const answerSlot = document.getElementById(`answer${index + 1}`);
        if (answerSlot) {
            answerSlot.querySelector('.answer-text').textContent = answer.text;
            answerSlot.querySelector('.answer-points').textContent = answer.num;
            answerSlot.querySelector('.answer-text').classList.add('revealed');
        }

        // Заменить (не прибавить!) очки в центральном табло
        context.temp.points = answer.num;
        updateCurrentPointsDisplay();

        context.temp.openAnswers++;
        playSound(SOUNDS.OPEN);
    }

    awardPointsToTeam(context, teamIndex) {
        // Брать очки из центрального табло
        const pointsToAward = context.temp.points;

        // Если очков нет в центре, ничего не делать
        if (pointsToAward === 0) return;

        // Добавить очки команде
        if (teamIndex === COMMAND_A) {
            context.persistent.point0 += pointsToAward;
        } else {
            context.persistent.point1 += pointsToAward;
        }

        // Обнулить центральное табло
        context.temp.points = 0;

        updateScoreDisplays();

        // Проверка победы (звук отключен)
        const winnerScore = teamIndex === COMMAND_A ? context.persistent.point0 : context.persistent.point1;
        if (winnerScore >= context.config.winpoint) {
            // Win sound disabled for regular rounds
        }
    }

    getKeyboardHints() {
        return [
            { key: '1-6', action: 'Открыть ответ' },
            { key: 'Q', action: 'Очки команде 1' },
            { key: 'W', action: 'Очки команде 2' },
            { key: 'T', action: 'Таймер' },
            { key: '↑', action: 'Завершить раунд' }
        ];
    }

    exit(context) {
        stopTimer();
    }
}

export { RoundReverse_TitleShown, RoundReverse_Playing };
