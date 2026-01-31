// ============================================================================
// ROUND X2 - Двойная игра (×2 multiplier)
// ============================================================================

import { RoundX1_QuestionShown, RoundX1_TeamA_Playing, RoundX1_TeamB_Playing } from './round-base.js';
import { GAME_X2 } from '../core/constants.js';

class RoundX2_QuestionShown extends RoundX1_QuestionShown {
    constructor() {
        super();
        this.name = 'RoundX2_QuestionShown';
        this.roundIndex = GAME_X2;
        this.multiplier = 2;
        this.roundIcon = 'bmp/game_2.bmp';
    }

    handleKey(key, context) {
        // Обработка клавиш с заменой состояний на X2
        const result = super.handleKey(key, context);
        if (result === 'RoundX1_TeamA_Playing') {
            return 'RoundX2_TeamA_Playing';
        }
        if (result === 'RoundX1_TeamB_Playing') {
            return 'RoundX2_TeamB_Playing';
        }
        return result;
    }
}

class RoundX2_TeamA_Playing extends RoundX1_TeamA_Playing {
    constructor() {
        super();
        this.name = 'RoundX2_TeamA_Playing';
        this.roundIndex = GAME_X2;
        this.multiplier = 2;
    }

    handleKey(key, context) {
        const result = super.handleKey(key, context);
        if (result === 'RoundX1_TeamB_Playing') {
            return 'RoundX2_TeamB_Playing';
        }
        if (result === 'RoundX1_Finished') {
            return 'RoundX2_Finished';
        }
        return result;
    }
}

class RoundX2_TeamB_Playing extends RoundX1_TeamB_Playing {
    constructor() {
        super();
        this.name = 'RoundX2_TeamB_Playing';
        this.roundIndex = GAME_X2;
        this.multiplier = 2;
    }

    handleKey(key, context) {
        const result = super.handleKey(key, context);
        if (result === 'RoundX1_Finished') {
            return 'RoundX2_Finished';
        }
        return result;
    }
}

export { RoundX2_QuestionShown, RoundX2_TeamA_Playing, RoundX2_TeamB_Playing };
