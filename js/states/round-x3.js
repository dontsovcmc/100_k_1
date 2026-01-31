// ============================================================================
// ROUND X3 - Тройная игра (×3 multiplier)
// ============================================================================

import { RoundX1_QuestionShown, RoundX1_TeamA_Playing, RoundX1_TeamB_Playing } from './round-base.js';
import { GAME_X3 } from '../core/constants.js';

class RoundX3_QuestionShown extends RoundX1_QuestionShown {
    constructor() {
        super();
        this.name = 'RoundX3_QuestionShown';
        this.roundIndex = GAME_X3;
        this.multiplier = 3;
        this.roundIcon = 'bmp/game_3.bmp';
    }

    handleKey(key, context) {
        // Обработка клавиш с заменой состояний на X3
        const result = super.handleKey(key, context);
        if (result === 'RoundX1_TeamA_Playing') {
            return 'RoundX3_TeamA_Playing';
        }
        if (result === 'RoundX1_TeamB_Playing') {
            return 'RoundX3_TeamB_Playing';
        }
        return result;
    }
}

class RoundX3_TeamA_Playing extends RoundX1_TeamA_Playing {
    constructor() {
        super();
        this.name = 'RoundX3_TeamA_Playing';
        this.roundIndex = GAME_X3;
        this.multiplier = 3;
    }

    handleKey(key, context) {
        const result = super.handleKey(key, context);
        if (result === 'RoundX1_TeamB_Playing') {
            return 'RoundX3_TeamB_Playing';
        }
        if (result === 'RoundX1_Finished') {
            return 'RoundX3_Finished';
        }
        return result;
    }
}

class RoundX3_TeamB_Playing extends RoundX1_TeamB_Playing {
    constructor() {
        super();
        this.name = 'RoundX3_TeamB_Playing';
        this.roundIndex = GAME_X3;
        this.multiplier = 3;
    }

    handleKey(key, context) {
        const result = super.handleKey(key, context);
        if (result === 'RoundX1_Finished') {
            return 'RoundX3_Finished';
        }
        return result;
    }
}

export { RoundX3_QuestionShown, RoundX3_TeamA_Playing, RoundX3_TeamB_Playing };
