// ============================================================================
// GAME CONTEXT - Централизованное хранилище состояния игры
// ============================================================================

const GameContext = {
    // Конфигурация
    config: {
        gameTheme: "100 к 1",
        command0name: "Команда 1",
        command1name: "Команда 2",
        time1: 15,
        time2: 20,
        timeRoundObr: 60,
        winpoint: 80,
        winpointSuper: 200,
        rounds: [true, true, true, true, true]
    },

    // Данные вопросов (загружаются из JSON)
    questions: [],

    // Постоянные данные игры (сохраняются между состояниями)
    persistent: {
        point0: 0,
        point1: 0,
        currentRoundIndex: 0
    },

    // Временные данные текущего состояния
    temp: {
        // NEW: Team selection tracking
        firstTeam: 0,           // Команда, выбранная для игры первой (0 или 1)
        secondTeam: 1,          // Другая команда (вычисляется как 1 - firstTeam)
        currentlyPlaying: 0,    // Какая команда играет сейчас (0 или 1)
        isFirstTurn: true,      // Это первая команда играет? (true/false)

        // EXISTING (для совместимости)
        activeCommand: 0,
        points: 0,
        openAnswers: 0,
        badAnswerCount: 0,
        superGameData: {
            player1Answers: ["", "", "", "", ""],
            player1Points: [0, 0, 0, 0, 0],
            player2Answers: ["", "", "", "", ""],
            player2Points: [0, 0, 0, 0, 0],
            player1Sum: 0,
            player2Sum: 0,
            player1Visible: true
        },
        timer: {
            active: false,
            remaining: 0,
            intervalId: null
        }
    },

    // State Manager
    currentState: null,
    stateHistory: [],
    helpVisible: false,
    dataLoaded: false
};

export { GameContext };
