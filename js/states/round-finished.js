// ============================================================================
// ROUND FINISHED - Состояния завершения раундов
// ============================================================================

import { GameState } from '../core/fsm.js';
import { GAME_X1, GAME_X2, GAME_X3, GAME_SUPER, GAME_NAOBOROT } from '../core/constants.js';
import { updateQuestionText, updateScoreDisplays, getNextEnabledRound } from '../utils/ui.js';

class RoundX1_Finished extends GameState {
    constructor() {
        super('RoundX1_Finished');
        this.roundIndex = GAME_X1;
    }

    enter(context) {
        super.enter(context);

        // Вопрос остается на экране
        const question = context.questions[this.roundIndex];
        if (question) {
            updateQuestionText(question.name || question.question || 'Раунд завершен');
        }

        // Очистить центральное поле после присуждения очков
        context.temp.points = 0;

        // Очки УЖЕ начислены в completeRound()
        // Просто обновляем дисплей
        updateScoreDisplays();
    }

    handleKey(key, context) {
        if (key === 'ArrowUp' || key === 'N' || key === 'n') {
            return this.getNextRound(context);
        }
        return null;
    }

    getNextRound(context) {
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

    getKeyboardHints() {
        return [
            { key: '↑', action: 'Следующий раунд' }
        ];
    }
}

class RoundX2_Finished extends RoundX1_Finished {
    constructor() {
        super();
        this.name = 'RoundX2_Finished';
        this.roundIndex = GAME_X2;
    }
}

class RoundX3_Finished extends RoundX1_Finished {
    constructor() {
        super();
        this.name = 'RoundX3_Finished';
        this.roundIndex = GAME_X3;
    }
}

export { RoundX1_Finished, RoundX2_Finished, RoundX3_Finished };
