// ============================================================================
// FSM (FINITE STATE MACHINE) - Базовые классы для state machine pattern
// ============================================================================

import { displayKeyboardHints } from '../utils/ui.js';

// === БАЗОВЫЙ КЛАСС GAMESTATE ===
class GameState {
    constructor(name) {
        this.name = name;
        this.activeKeys = [];
    }

    enter(context) {
        console.log(`[FSM] Entering state: ${this.name}`);
        this.setupUI(context);
        this.updateHints(context);
    }

    exit(context) {
        console.log(`[FSM] Exiting state: ${this.name}`);
    }

    handleKey(key, context) {
        // Переопределяется в подклассах
        return null; // Возвращает следующее состояние или null
    }

    setupUI(context) {
        // Переопределяется в подклассах
    }

    updateHints(context) {
        const hints = this.getKeyboardHints();
        displayKeyboardHints(hints);
    }

    getKeyboardHints() {
        // Возвращает список активных клавиш и их описание
        return [];
    }
}

// === STATE MANAGER ===
class StateManager {
    constructor(context) {
        this.context = context;
        this.currentState = null;
        this.states = new Map();
    }

    registerState(state) {
        this.states.set(state.name, state);
    }

    changeState(stateName) {
        const newState = this.states.get(stateName);
        if (!newState) {
            console.error(`[FSM] State ${stateName} not found`);
            return;
        }

        // Exit текущего состояния
        if (this.currentState) {
            this.currentState.exit(this.context);
            this.context.stateHistory.push(this.currentState.name);
        }

        // Enter нового состояния
        this.currentState = newState;
        this.context.currentState = newState;
        this.currentState.enter(this.context);
    }

    goToPreviousState() {
        if (this.context.stateHistory.length === 0) {
            console.warn('[FSM] No previous state in history');
            return;
        }

        const previousStateName = this.context.stateHistory.pop();
        const previousState = this.states.get(previousStateName);

        if (!previousState) {
            console.error(`[FSM] Previous state ${previousStateName} not found`);
            return;
        }

        if (this.currentState) {
            this.currentState.exit(this.context);
        }

        this.currentState = previousState;
        this.context.currentState = previousState;
        this.currentState.enter(this.context);
    }

    handleKey(key) {
        if (!this.currentState) return;

        const nextState = this.currentState.handleKey(key, this.context);

        if (nextState) {
            if (typeof nextState === 'string') {
                this.changeState(nextState);
            } else {
                this.changeState(nextState.name);
            }
        }
    }

    getState(name) {
        return this.states.get(name);
    }
}

export { GameState, StateManager };
