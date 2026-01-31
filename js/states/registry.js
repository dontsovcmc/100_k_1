// ============================================================================
// STATE REGISTRY - Регистрация всех состояний FSM
// ============================================================================

import { WaitingToStart, MusicIntro } from './system.js';
import { RoundX1_QuestionShown, RoundX1_TeamA_Playing, RoundX1_TeamB_Playing } from './round-base.js';
import { RoundX2_QuestionShown, RoundX2_TeamA_Playing, RoundX2_TeamB_Playing } from './round-x2.js';
import { RoundX3_QuestionShown, RoundX3_TeamA_Playing, RoundX3_TeamB_Playing } from './round-x3.js';
import { RoundX1_Finished, RoundX2_Finished, RoundX3_Finished } from './round-finished.js';
import { RoundReverse_TitleShown, RoundReverse_Playing } from './reverse.js';
import { SuperGame_Player1_Waiting, SuperGame_Results } from './super.js';

function registerAllStates() {
    const sm = window.stateManager;

    // Системные состояния
    sm.registerState(new WaitingToStart());
    sm.registerState(new MusicIntro());

    // Раунд X1
    sm.registerState(new RoundX1_QuestionShown());
    sm.registerState(new RoundX1_TeamA_Playing());
    sm.registerState(new RoundX1_TeamB_Playing());
    sm.registerState(new RoundX1_Finished());

    // Раунд X2
    sm.registerState(new RoundX2_QuestionShown());
    sm.registerState(new RoundX2_TeamA_Playing());
    sm.registerState(new RoundX2_TeamB_Playing());
    sm.registerState(new RoundX2_Finished());

    // Раунд X3
    sm.registerState(new RoundX3_QuestionShown());
    sm.registerState(new RoundX3_TeamA_Playing());
    sm.registerState(new RoundX3_TeamB_Playing());
    sm.registerState(new RoundX3_Finished());

    // Обратная игра
    sm.registerState(new RoundReverse_TitleShown());
    sm.registerState(new RoundReverse_Playing());

    // Super Game
    sm.registerState(new SuperGame_Player1_Waiting());
    sm.registerState(new SuperGame_Results());

    console.log('[FSM] Registered', sm.states.size, 'states');
}

export { registerAllStates };
