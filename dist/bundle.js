(() => {
  // js/core/constants.js
  var GAME_X1 = 0;
  var GAME_X2 = 1;
  var GAME_X3 = 2;
  var GAME_NAOBOROT = 3;
  var GAME_SUPER = 4;
  var COMMAND_A = 0;
  var COMMAND_B = 1;
  var MAX_WRONG_ANSWERS = 3;
  var MAX_ANSWERS = 6;
  var IMAGES = {
    X_EMPTY: "bmp/x_0.bmp",
    X_FILLED: "bmp/x_1.bmp"
  };
  var SOUNDS = {
    START: "start",
    OPEN: "open",
    BAD: "bad",
    LEVEL: "level",
    WIN: "win"
  };
  var RU_TO_EN_KEYS = {
    "\u0439": "q",
    "\u0419": "Q",
    "\u0446": "w",
    "\u0426": "W",
    "\u0443": "e",
    "\u0423": "E",
    "\u043A": "r",
    "\u041A": "R",
    "\u0435": "t",
    "\u0415": "T",
    "\u043D": "y",
    "\u041D": "Y",
    "\u0433": "u",
    "\u0413": "U",
    "\u0448": "i",
    "\u0428": "I",
    "\u0449": "o",
    "\u0429": "O",
    "\u0437": "p",
    "\u0417": "P",
    "\u0444": "a",
    "\u0424": "A",
    "\u044B": "s",
    "\u042B": "S",
    "\u0432": "d",
    "\u0412": "D",
    "\u0430": "f",
    "\u0410": "F",
    "\u043F": "g",
    "\u041F": "G",
    "\u0440": "h",
    "\u0420": "H",
    "\u043E": "j",
    "\u041E": "J",
    "\u043B": "k",
    "\u041B": "K",
    "\u0434": "l",
    "\u0414": "L",
    "\u044F": "z",
    "\u042F": "Z",
    "\u0447": "x",
    "\u0427": "X",
    "\u0441": "c",
    "\u0421": "C",
    "\u043C": "v",
    "\u041C": "V",
    "\u0438": "b",
    "\u0418": "B",
    "\u0442": "n",
    "\u0422": "N",
    "\u044C": "m",
    "\u042C": "M"
  };
  function normalizeKey(key) {
    return RU_TO_EN_KEYS[key] || key;
  }

  // js/core/context.js
  var GameContext = {
    // Конфигурация
    config: {
      gameTheme: "100 \u043A 1",
      command0name: "\u041A\u043E\u043C\u0430\u043D\u0434\u0430 1",
      command1name: "\u041A\u043E\u043C\u0430\u043D\u0434\u0430 2",
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
      firstTeam: 0,
      // Команда, выбранная для игры первой (0 или 1)
      secondTeam: 1,
      // Другая команда (вычисляется как 1 - firstTeam)
      currentlyPlaying: 0,
      // Какая команда играет сейчас (0 или 1)
      isFirstTurn: true,
      // Это первая команда играет? (true/false)
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

  // js/core/dom.js
  var DOM = {};
  function initDOM() {
    DOM.settingsModal = document.getElementById("settings-modal");
    DOM.helpOverlay = document.getElementById("help-overlay");
    DOM.helpContent = document.getElementById("help-content");
    DOM.questionText = document.getElementById("question-text");
    DOM.currentPointsLcd = document.getElementById("current-points-lcd");
    DOM.team0Name = document.getElementById("team0-name");
    DOM.team1Name = document.getElementById("team1-name");
    DOM.team0ScoreLcd = document.getElementById("team0-score-lcd");
    DOM.team1ScoreLcd = document.getElementById("team1-score-lcd");
    DOM.team0RoundIcon = document.getElementById("team0-round-icon");
    DOM.team1RoundIcon = document.getElementById("team1-round-icon");
    DOM.regularLayout = document.getElementById("regular-game-layout");
    DOM.bottomArea = document.getElementById("bottom-area");
    DOM.superGameGrid = document.getElementById("super-game-grid");
    DOM.timerWidget = document.getElementById("timer-widget");
    DOM.timerSeconds = document.getElementById("timer-seconds");
    DOM.hintsContent = document.getElementById("hints-content");
    DOM.winModal = document.getElementById("win-modal");
    DOM.winMessage = document.getElementById("win-message");
    DOM.player1Column = document.getElementById("player1-column");
  }

  // js/utils/ui.js
  function showModal(modal) {
    modal.style.display = "flex";
  }
  function hideModal(modal) {
    modal.style.display = "none";
  }
  function playSound(name) {
    const audio = document.getElementById(`sound-${name}`);
    if (audio) {
      audio.loop = false;
      audio.currentTime = 0;
      audio.play().catch((err) => console.warn("Audio play failed:", err));
    }
  }
  function updateScoreDisplays() {
    DOM.currentPointsLcd.textContent = GameContext.temp.points;
    DOM.team0ScoreLcd.textContent = GameContext.persistent.point0;
    DOM.team1ScoreLcd.textContent = GameContext.persistent.point1;
  }
  function updateCurrentPointsDisplay() {
    DOM.currentPointsLcd.textContent = GameContext.temp.points;
  }
  function updateQuestionText(text) {
    DOM.questionText.textContent = text;
  }
  function clearAnswers() {
    document.querySelectorAll(".answer-text").forEach((text) => {
      text.textContent = "";
      text.classList.remove("revealed");
    });
    document.querySelectorAll(".answer-points").forEach((points) => {
      points.textContent = "";
    });
    GameContext.temp.openAnswers = 0;
    GameContext.temp.points = 0;
    updateCurrentPointsDisplay();
  }
  function clearBadAnswers() {
    document.querySelectorAll(".x-mark").forEach((mark) => {
      mark.src = IMAGES.X_EMPTY;
    });
  }
  function addXMark(teamIndex, count) {
    if (count > MAX_WRONG_ANSWERS) {
      console.warn("[FSM] Invalid X mark count:", count);
      return;
    }
    const elementId = `x${teamIndex + 1}-${count}`;
    const xImg = document.getElementById(elementId);
    if (!xImg) {
      console.error("[FSM] X mark element not found:", elementId);
      return;
    }
    console.log("[FSM] Setting X mark:", { elementId, src: IMAGES.X_FILLED });
    xImg.src = IMAGES.X_FILLED;
  }
  function setActiveTeam(teamIndex) {
    if (teamIndex === COMMAND_A) {
      DOM.team0Name.classList.add("active");
      DOM.team1Name.classList.remove("active");
    } else {
      DOM.team0Name.classList.remove("active");
      DOM.team1Name.classList.add("active");
    }
    GameContext.temp.activeCommand = teamIndex;
  }
  function clearActiveTeam() {
    DOM.team0Name.classList.remove("active");
    DOM.team1Name.classList.remove("active");
    GameContext.temp.activeCommand = -1;
  }
  function displayKeyboardHints(hints) {
    if (!DOM.hintsContent) return;
    if (hints.length === 0) {
      DOM.hintsContent.innerHTML = "";
      return;
    }
    const hintsHTML = hints.map(
      (h) => `<span class="hint-item"><kbd>${h.key}</kbd> ${h.action}</span>`
    ).join(" ");
    DOM.hintsContent.innerHTML = hintsHTML;
  }
  function getNextEnabledRound(startIndex) {
    for (let i = startIndex; i < GameContext.config.rounds.length; i++) {
      if (GameContext.config.rounds[i]) {
        return i;
      }
    }
    return -1;
  }
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen failed:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }
  function showWinModal(score) {
    if (DOM.winModal && DOM.winMessage) {
      DOM.winMessage.textContent = `\u041D\u0430\u0431\u0440\u0430\u043D\u043E ${score} \u043E\u0447\u043A\u043E\u0432!`;
      showModal(DOM.winModal);
    }
  }

  // js/core/fsm.js
  var GameState = class {
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
      return null;
    }
    setupUI(context) {
    }
    updateHints(context) {
      const hints = this.getKeyboardHints();
      displayKeyboardHints(hints);
    }
    getKeyboardHints() {
      return [];
    }
  };
  var StateManager = class {
    constructor(context) {
      this.context = context;
      this.currentState = null;
      this.states = /* @__PURE__ */ new Map();
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
      if (this.currentState) {
        this.currentState.exit(this.context);
        this.context.stateHistory.push(this.currentState.name);
      }
      this.currentState = newState;
      this.context.currentState = newState;
      this.currentState.enter(this.context);
    }
    goToPreviousState() {
      if (this.context.stateHistory.length === 0) {
        console.warn("[FSM] No previous state in history");
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
        if (typeof nextState === "string") {
          this.changeState(nextState);
        } else {
          this.changeState(nextState.name);
        }
      }
    }
    getState(name) {
      return this.states.get(name);
    }
  };

  // js/utils/timer.js
  function startTimer(seconds) {
    if (GameContext.temp.timer.active) {
      stopTimer();
    }
    GameContext.temp.timer.remaining = seconds;
    GameContext.temp.timer.active = true;
    DOM.timerWidget.style.display = "flex";
    DOM.timerSeconds.textContent = seconds;
    GameContext.temp.timer.intervalId = setInterval(() => {
      GameContext.temp.timer.remaining--;
      DOM.timerSeconds.textContent = GameContext.temp.timer.remaining;
      if (GameContext.temp.timer.remaining <= 0) {
        stopTimer();
      }
    }, 1e3);
  }
  function stopTimer() {
    if (GameContext.temp.timer.intervalId) {
      clearInterval(GameContext.temp.timer.intervalId);
      GameContext.temp.timer.intervalId = null;
    }
    GameContext.temp.timer.active = false;
    GameContext.temp.timer.remaining = 0;
    DOM.timerWidget.style.display = "none";
  }

  // js/utils/settings.js
  function togglePlayer1Answers() {
    GameContext.temp.superGameData.player1Visible = !GameContext.temp.superGameData.player1Visible;
    DOM.player1Column.style.display = GameContext.temp.superGameData.player1Visible ? "flex" : "none";
  }
  function calculateSuperGameSum() {
    let p1Sum = 0;
    let p2Sum = 0;
    for (let i = 1; i <= 5; i++) {
      const p1Points = parseInt(document.getElementById(`p1-q${i}-points`).value) || 0;
      const p2Points = parseInt(document.getElementById(`p2-q${i}-points`).value) || 0;
      p1Sum += p1Points;
      p2Sum += p2Points;
    }
    GameContext.temp.superGameData.player1Sum = p1Sum;
    GameContext.temp.superGameData.player2Sum = p2Sum;
    const total = p1Sum + p2Sum;
    DOM.currentPointsLcd.textContent = total;
    if (total >= GameContext.config.winpointSuper) {
      DOM.currentPointsLcd.style.color = "red";
    } else {
      DOM.currentPointsLcd.style.color = "#0f0";
    }
  }
  function toggleHelp() {
    if (GameContext.helpVisible) {
      hideModal(DOM.helpOverlay);
      GameContext.helpVisible = false;
    } else {
      showModal(DOM.helpOverlay);
      GameContext.helpVisible = true;
      updateHelpContent();
    }
  }
  function updateHelpContent() {
    const hints = window.stateManager?.currentState?.getKeyboardHints() || [];
    const helpHTML = hints.map((h) => `<div><kbd>${h.key}</kbd> \u2014 ${h.action}</div>`).join("");
    DOM.helpContent.innerHTML = helpHTML || "<div>\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u043A\u043B\u0430\u0432\u0438\u0448</div>";
  }
  function applySettings() {
    DOM.team0Name.textContent = GameContext.config.command0name;
    DOM.team1Name.textContent = GameContext.config.command1name;
  }
  function updateTabStyles() {
    const rounds = ["cfg-round1", "cfg-round2", "cfg-round3", "cfg-roundobr", "cfg-roundsuper"];
    document.querySelectorAll(".tab-btn[data-round]").forEach((btn) => {
      const roundKey = btn.dataset.round;
      const checkboxId = rounds[roundKey];
      const checkbox = document.getElementById(checkboxId);
      if (checkbox && !checkbox.checked) {
        btn.classList.add("disabled");
      } else {
        btn.classList.remove("disabled");
      }
    });
  }
  function loadQuestionIntoForm(questionIndex) {
    const q = GameContext.questions[questionIndex];
    if (!q) return;
    const questionInput = document.getElementById(`q${questionIndex}-text`);
    questionInput.value = q.name || q.question || "";
    questionInput.placeholder = (q.name || q.question) === "" ? "<\u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442>" : "";
    for (let j = 0; j < MAX_ANSWERS; j++) {
      const answer = q.answers[j];
      const textInput = document.getElementById(`q${questionIndex}-a${j}`);
      const numInput = document.getElementById(`q${questionIndex}-p${j}`);
      textInput.value = answer.text || "";
      textInput.placeholder = answer.text === "" ? "<\u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442>" : "";
      numInput.value = answer.num || 0;
    }
  }
  function saveQuestionFromForm(questionIndex) {
    if (!GameContext.questions[questionIndex]) return;
    const questionValue = document.getElementById(`q${questionIndex}-text`).value;
    if (GameContext.questions[questionIndex].hasOwnProperty("name")) {
      GameContext.questions[questionIndex].name = questionValue;
    } else {
      GameContext.questions[questionIndex].question = questionValue;
    }
    for (let j = 0; j < MAX_ANSWERS; j++) {
      GameContext.questions[questionIndex].answers[j].text = document.getElementById(`q${questionIndex}-a${j}`).value;
      GameContext.questions[questionIndex].answers[j].num = parseInt(document.getElementById(`q${questionIndex}-p${j}`).value) || 0;
    }
  }
  function openSettingsDialog() {
    showModal(DOM.settingsModal);
    const gameThemeInput = document.getElementById("cfg-game-theme");
    if (gameThemeInput) {
      gameThemeInput.value = GameContext.config.gameTheme || "100 \u043A 1";
    }
    document.getElementById("cfg-team0").value = GameContext.config.command0name;
    document.getElementById("cfg-team1").value = GameContext.config.command1name;
    document.getElementById("cfg-time1").value = GameContext.config.time1;
    document.getElementById("cfg-time2").value = GameContext.config.time2;
    document.getElementById("cfg-time3").value = GameContext.config.timeRoundObr;
    document.getElementById("cfg-winpoint-super").value = GameContext.config.winpointSuper || 200;
    document.getElementById("cfg-point0").value = GameContext.persistent.point0;
    document.getElementById("cfg-point1").value = GameContext.persistent.point1;
    document.getElementById("cfg-current-points").value = GameContext.temp.points;
    document.getElementById("cfg-round1").checked = GameContext.config.rounds[GAME_X1];
    document.getElementById("cfg-round2").checked = GameContext.config.rounds[GAME_X2];
    document.getElementById("cfg-round3").checked = GameContext.config.rounds[GAME_X3];
    document.getElementById("cfg-roundobr").checked = GameContext.config.rounds[GAME_NAOBOROT];
    document.getElementById("cfg-roundsuper").checked = GameContext.config.rounds[GAME_SUPER];
    for (let i = 0; i < 4; i++) {
      loadQuestionIntoForm(i);
    }
    updateTabStyles();
  }
  function saveSettings() {
    const gameThemeInput = document.getElementById("cfg-game-theme");
    if (gameThemeInput) {
      GameContext.config.gameTheme = gameThemeInput.value || "100 \u043A 1";
    }
    GameContext.config.command0name = document.getElementById("cfg-team0").value;
    GameContext.config.command1name = document.getElementById("cfg-team1").value;
    GameContext.config.time1 = parseInt(document.getElementById("cfg-time1").value);
    GameContext.config.time2 = parseInt(document.getElementById("cfg-time2").value);
    GameContext.config.timeRoundObr = parseInt(document.getElementById("cfg-time3").value);
    GameContext.config.winpointSuper = parseInt(document.getElementById("cfg-winpoint-super").value) || 200;
    GameContext.persistent.point0 = parseInt(document.getElementById("cfg-point0").value) || 0;
    GameContext.persistent.point1 = parseInt(document.getElementById("cfg-point1").value) || 0;
    GameContext.temp.points = parseInt(document.getElementById("cfg-current-points").value) || 0;
    GameContext.config.rounds[GAME_X1] = document.getElementById("cfg-round1").checked;
    GameContext.config.rounds[GAME_X2] = document.getElementById("cfg-round2").checked;
    GameContext.config.rounds[GAME_X3] = document.getElementById("cfg-round3").checked;
    GameContext.config.rounds[GAME_NAOBOROT] = document.getElementById("cfg-roundobr").checked;
    GameContext.config.rounds[GAME_SUPER] = document.getElementById("cfg-roundsuper").checked;
    for (let i = 0; i < 4; i++) {
      saveQuestionFromForm(i);
    }
    applySettings();
    updateScoreDisplays();
    hideModal(DOM.settingsModal);
  }
  function exportToJSON() {
    const data = {
      config: GameContext.config,
      rounds: GameContext.questions
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game_settings.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function importFromJSON(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data.config) {
          GameContext.config = data.config;
        }
        if (data.rounds && data.rounds.length > 0) {
          GameContext.questions = data.rounds;
        } else if (data.questions && data.questions.length > 0) {
          GameContext.questions = data.questions;
        }
        applySettings();
        GameContext.dataLoaded = true;
        console.log("[FSM] Settings imported from JSON");
        alert("\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B!");
      } catch (err) {
        alert("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438: " + err.message);
        console.error("Import error:", err);
      }
    };
    reader.readAsText(file);
  }
  function startSuperGameTimer() {
    const duration = GameContext.config.time1;
    startTimer(duration);
  }
  function startSuperGameTimer2() {
    if (GameContext.temp.timer.active) {
      stopTimer();
    } else {
      startTimer(GameContext.config.time2);
    }
  }

  // js/states/system.js
  var WaitingToStart = class extends GameState {
    constructor() {
      super("WaitingToStart");
    }
    enter(context) {
      super.enter(context);
      DOM.regularLayout.style.display = "flex";
      DOM.bottomArea.style.display = "flex";
      DOM.superGameGrid.style.display = "none";
      context.persistent.point0 = 0;
      context.persistent.point1 = 0;
      context.persistent.currentRoundIndex = 0;
      context.temp.points = 0;
      clearAnswers();
      clearBadAnswers();
      updateScoreDisplays();
      const firstRoundIndex = getNextEnabledRound(0);
      if (firstRoundIndex !== -1) {
        updateQuestionText("\u0418\u0433\u0440\u0430 100 \u043A 1");
      } else {
        updateQuestionText("\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0440\u0430\u0443\u043D\u0434\u043E\u0432. \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 (F2)");
      }
    }
    handleKey(key, context) {
      if (key === "ArrowUp" || key === "N" || key === "n") {
        const firstRoundIndex = getNextEnabledRound(0);
        if (firstRoundIndex === -1) {
          console.warn("[FSM] No enabled rounds found");
          return null;
        }
        return "MusicIntro";
      }
      if (key === "F2") {
        showModal(DOM.settingsModal);
        return null;
      }
      return null;
    }
    getKeyboardHints() {
      const hints = [
        { key: "\u2191", action: "\u041D\u0430\u0447\u0430\u0442\u044C \u0438\u0433\u0440\u0443" },
        { key: "F2", action: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" },
        { key: "F1", action: "\u0421\u043F\u0440\u0430\u0432\u043A\u0430" }
      ];
      if (!GameContext.dataLoaded) {
        hints.unshift({ key: "\u23F3", action: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432..." });
      }
      return hints;
    }
  };
  var MusicIntro = class extends GameState {
    constructor() {
      super("MusicIntro");
    }
    enter(context) {
      super.enter(context);
      console.log("[FSM] Entering MusicIntro");
      playSound(SOUNDS.START);
      const gameTheme = context.config.gameTheme || "100 \u043A 1";
      updateQuestionText(`\u{1F3B5} ${gameTheme} \u{1F3B5}`);
      clearAnswers();
      clearBadAnswers();
      if (context.persistent.currentRoundIndex === 0) {
        context.persistent.team0Score = 0;
        context.persistent.team1Score = 0;
        updateScoreDisplays();
      }
      DOM.regularLayout.style.display = "flex";
      DOM.bottomArea.style.display = "flex";
      DOM.superGameGrid.style.display = "none";
    }
    handleKey(key, context) {
      if (key === "ArrowUp" || key === "N" || key === "n") {
        const firstRoundIndex = getNextEnabledRound(0);
        context.persistent.currentRoundIndex = firstRoundIndex;
        if (firstRoundIndex === GAME_SUPER) {
          return "SuperGame_Player1_Waiting";
        } else if (firstRoundIndex === GAME_NAOBOROT) {
          return "RoundReverse_TitleShown";
        } else {
          return `RoundX${firstRoundIndex + 1}_QuestionShown`;
        }
      }
      return null;
    }
    exit(context) {
      super.exit(context);
      console.log("[FSM] Exiting MusicIntro");
    }
    getKeyboardHints() {
      return [
        { key: "\u2191", action: "\u041D\u0430\u0447\u0430\u0442\u044C \u043F\u0435\u0440\u0432\u044B\u0439 \u0440\u0430\u0443\u043D\u0434" }
      ];
    }
  };

  // js/states/round-base.js
  var RoundX1_QuestionShown = class extends GameState {
    constructor() {
      super("RoundX1_QuestionShown");
      this.roundIndex = GAME_X1;
      this.multiplier = 1;
      this.roundIcon = "bmp/game_1.bmp";
    }
    enter(context) {
      super.enter(context);
      DOM.regularLayout.style.display = "flex";
      DOM.bottomArea.style.display = "flex";
      DOM.superGameGrid.style.display = "none";
      const question = context.questions[this.roundIndex];
      if (question) {
        updateQuestionText(question.name || question.question || "\u0412\u043E\u043F\u0440\u043E\u0441 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D");
        question.answers.forEach((a) => a.opened = false);
      } else {
        updateQuestionText("\u0412\u043E\u043F\u0440\u043E\u0441 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D");
      }
      DOM.team0RoundIcon.src = this.roundIcon;
      DOM.team1RoundIcon.src = this.roundIcon;
      clearAnswers();
      clearBadAnswers();
      context.temp.firstTeam = 0;
      context.temp.secondTeam = 1;
      context.temp.currentlyPlaying = 0;
      context.temp.isFirstTurn = true;
      context.temp.points = 0;
      context.temp.openAnswers = 0;
      context.temp.badAnswerCount = 0;
      context.temp.activeCommand = COMMAND_A;
      setActiveTeam(COMMAND_A);
      updateScoreDisplays();
    }
    handleKey(key, context) {
      if (key === "ArrowLeft") {
        context.temp.firstTeam = 0;
        context.temp.secondTeam = 1;
        context.temp.currentlyPlaying = 0;
        setActiveTeam(COMMAND_A);
        context.temp.activeCommand = COMMAND_A;
        return null;
      }
      if (key === "ArrowRight") {
        context.temp.firstTeam = 1;
        context.temp.secondTeam = 0;
        context.temp.currentlyPlaying = 1;
        setActiveTeam(COMMAND_B);
        context.temp.activeCommand = COMMAND_B;
        return null;
      }
      if (key === "ArrowUp" || key === "N" || key === "n") {
        context.temp.isFirstTurn = true;
        context.temp.currentlyPlaying = context.temp.firstTeam;
        return "RoundX1_TeamA_Playing";
      }
      return null;
    }
    getKeyboardHints() {
      return [
        { key: "\u2190/\u2192", action: "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u043A\u043E\u043C\u0430\u043D\u0434\u0443" },
        { key: "\u2191", action: "\u041D\u0430\u0447\u0430\u0442\u044C \u0438\u0433\u0440\u0443" }
      ];
    }
  };
  var RoundX1_TeamA_Playing = class extends GameState {
    constructor() {
      super("RoundX1_TeamA_Playing");
      this.roundIndex = GAME_X1;
      this.multiplier = 1;
    }
    enter(context) {
      super.enter(context);
      context.temp.isFirstTurn = true;
      context.temp.currentlyPlaying = context.temp.firstTeam;
      context.temp.badAnswerCount = 0;
      context.temp.points = 0;
      context.temp.openAnswers = 0;
      setActiveTeam(context.temp.currentlyPlaying);
      clearBadAnswers();
      updateScoreDisplays();
    }
    handleKey(key, context) {
      if (["1", "2", "3", "4", "5", "6"].includes(key)) {
        const index = parseInt(key) - 1;
        this.openAnswer(index, context);
        if (context.temp.openAnswers === MAX_ANSWERS) {
          return this.completeRound(context, COMMAND_A);
        }
        return null;
      }
      if (key === "x" || key === "X" || key === "Delete") {
        context.temp.badAnswerCount++;
        const displayTeam = context.temp.currentlyPlaying === 0 ? COMMAND_A : COMMAND_B;
        addXMark(displayTeam, context.temp.badAnswerCount);
        playSound(SOUNDS.BAD);
        if (context.temp.badAnswerCount >= MAX_WRONG_ANSWERS) {
          return "RoundX1_TeamB_Playing";
        }
        return null;
      }
      return null;
    }
    openAnswer(index, context) {
      const question = context.questions[this.roundIndex];
      if (!question) {
        console.error("[FSM] No question for round:", this.roundIndex);
        return;
      }
      const answer = question.answers[index];
      if (!answer) {
        console.error("[FSM] No answer at index:", index);
        return;
      }
      if (answer.opened) {
        console.warn("[FSM] Answer already opened:", index);
        return;
      }
      answer.opened = true;
      const answerSlot = document.getElementById(`answer${index + 1}`);
      if (!answerSlot) {
        console.error("[FSM] Answer slot not found:", `answer${index + 1}`);
        return;
      }
      const textEl = answerSlot.querySelector(".answer-text");
      const pointsEl = answerSlot.querySelector(".answer-points");
      if (!textEl || !pointsEl) {
        console.error("[FSM] Missing text or points element in slot:", index + 1);
        return;
      }
      textEl.textContent = answer.text;
      pointsEl.textContent = answer.num;
      textEl.classList.add("revealed");
      console.log("[FSM] Answer revealed:", { index, text: answer.text, points: answer.num });
      context.temp.points += answer.num * this.multiplier;
      context.temp.openAnswers++;
      updateCurrentPointsDisplay();
      playSound(SOUNDS.OPEN);
    }
    completeRound(context) {
      if (context.temp.currentlyPlaying === 0) {
        context.persistent.point0 += context.temp.points;
      } else {
        context.persistent.point1 += context.temp.points;
      }
      updateScoreDisplays();
      return "RoundX1_Finished";
    }
    getKeyboardHints() {
      return [
        { key: "1-6", action: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043E\u0442\u0432\u0435\u0442" },
        { key: "X", action: "\u041E\u0448\u0438\u0431\u043A\u0430" }
      ];
    }
  };
  var RoundX1_TeamB_Playing = class extends GameState {
    constructor() {
      super("RoundX1_TeamB_Playing");
      this.roundIndex = GAME_X1;
      this.multiplier = 1;
    }
    enter(context) {
      super.enter(context);
      context.temp.isFirstTurn = false;
      context.temp.currentlyPlaying = context.temp.secondTeam;
      context.temp.badAnswerCount = 0;
      setActiveTeam(context.temp.currentlyPlaying);
    }
    handleKey(key, context) {
      if (["1", "2", "3", "4", "5", "6"].includes(key)) {
        const index = parseInt(key) - 1;
        this.openAnswer(index, context);
        return this.completeRound(context);
      }
      if (key === "x" || key === "X" || key === "Delete") {
        context.temp.badAnswerCount++;
        const displayTeam = context.temp.currentlyPlaying === 0 ? COMMAND_A : COMMAND_B;
        addXMark(displayTeam, context.temp.badAnswerCount);
        playSound(SOUNDS.BAD);
        context.temp.currentlyPlaying = context.temp.firstTeam;
        return this.completeRound(context);
      }
      return null;
    }
    openAnswer(index, context) {
      const question = context.questions[this.roundIndex];
      if (!question) {
        console.error("[FSM] No question for round:", this.roundIndex);
        return;
      }
      const answer = question.answers[index];
      if (!answer) {
        console.error("[FSM] No answer at index:", index);
        return;
      }
      if (answer.opened) {
        console.warn("[FSM] Answer already opened:", index);
        return;
      }
      answer.opened = true;
      const answerSlot = document.getElementById(`answer${index + 1}`);
      if (!answerSlot) {
        console.error("[FSM] Answer slot not found:", `answer${index + 1}`);
        return;
      }
      const textEl = answerSlot.querySelector(".answer-text");
      const pointsEl = answerSlot.querySelector(".answer-points");
      if (!textEl || !pointsEl) {
        console.error("[FSM] Missing text or points element in slot:", index + 1);
        return;
      }
      textEl.textContent = answer.text;
      pointsEl.textContent = answer.num;
      textEl.classList.add("revealed");
      console.log("[FSM] Answer revealed:", { index, text: answer.text, points: answer.num });
      context.temp.points += answer.num * this.multiplier;
      context.temp.openAnswers++;
      updateCurrentPointsDisplay();
      playSound(SOUNDS.OPEN);
    }
    completeRound(context) {
      if (context.temp.currentlyPlaying === 0) {
        context.persistent.point0 += context.temp.points;
      } else {
        context.persistent.point1 += context.temp.points;
      }
      updateScoreDisplays();
      return "RoundX1_Finished";
    }
    getKeyboardHints() {
      return [
        { key: "1-6", action: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043E\u0442\u0432\u0435\u0442" },
        { key: "X", action: "\u041E\u0448\u0438\u0431\u043A\u0430 (3 = \u043E\u0447\u043A\u0438 \u043F\u0435\u0440\u0432\u043E\u0439 \u043A\u043E\u043C\u0430\u043D\u0434\u0435!)" }
      ];
    }
  };

  // js/states/round-x2.js
  var RoundX2_QuestionShown = class extends RoundX1_QuestionShown {
    constructor() {
      super();
      this.name = "RoundX2_QuestionShown";
      this.roundIndex = GAME_X2;
      this.multiplier = 2;
      this.roundIcon = "bmp/game_2.bmp";
    }
    handleKey(key, context) {
      const result = super.handleKey(key, context);
      if (result === "RoundX1_TeamA_Playing") {
        return "RoundX2_TeamA_Playing";
      }
      if (result === "RoundX1_TeamB_Playing") {
        return "RoundX2_TeamB_Playing";
      }
      return result;
    }
  };
  var RoundX2_TeamA_Playing = class extends RoundX1_TeamA_Playing {
    constructor() {
      super();
      this.name = "RoundX2_TeamA_Playing";
      this.roundIndex = GAME_X2;
      this.multiplier = 2;
    }
    handleKey(key, context) {
      const result = super.handleKey(key, context);
      if (result === "RoundX1_TeamB_Playing") {
        return "RoundX2_TeamB_Playing";
      }
      if (result === "RoundX1_Finished") {
        return "RoundX2_Finished";
      }
      return result;
    }
  };
  var RoundX2_TeamB_Playing = class extends RoundX1_TeamB_Playing {
    constructor() {
      super();
      this.name = "RoundX2_TeamB_Playing";
      this.roundIndex = GAME_X2;
      this.multiplier = 2;
    }
    handleKey(key, context) {
      const result = super.handleKey(key, context);
      if (result === "RoundX1_Finished") {
        return "RoundX2_Finished";
      }
      return result;
    }
  };

  // js/states/round-x3.js
  var RoundX3_QuestionShown = class extends RoundX1_QuestionShown {
    constructor() {
      super();
      this.name = "RoundX3_QuestionShown";
      this.roundIndex = GAME_X3;
      this.multiplier = 3;
      this.roundIcon = "bmp/game_3.bmp";
    }
    handleKey(key, context) {
      const result = super.handleKey(key, context);
      if (result === "RoundX1_TeamA_Playing") {
        return "RoundX3_TeamA_Playing";
      }
      if (result === "RoundX1_TeamB_Playing") {
        return "RoundX3_TeamB_Playing";
      }
      return result;
    }
  };
  var RoundX3_TeamA_Playing = class extends RoundX1_TeamA_Playing {
    constructor() {
      super();
      this.name = "RoundX3_TeamA_Playing";
      this.roundIndex = GAME_X3;
      this.multiplier = 3;
    }
    handleKey(key, context) {
      const result = super.handleKey(key, context);
      if (result === "RoundX1_TeamB_Playing") {
        return "RoundX3_TeamB_Playing";
      }
      if (result === "RoundX1_Finished") {
        return "RoundX3_Finished";
      }
      return result;
    }
  };
  var RoundX3_TeamB_Playing = class extends RoundX1_TeamB_Playing {
    constructor() {
      super();
      this.name = "RoundX3_TeamB_Playing";
      this.roundIndex = GAME_X3;
      this.multiplier = 3;
    }
    handleKey(key, context) {
      const result = super.handleKey(key, context);
      if (result === "RoundX1_Finished") {
        return "RoundX3_Finished";
      }
      return result;
    }
  };

  // js/states/round-finished.js
  var RoundX1_Finished = class extends GameState {
    constructor() {
      super("RoundX1_Finished");
      this.roundIndex = GAME_X1;
    }
    enter(context) {
      super.enter(context);
      const question = context.questions[this.roundIndex];
      if (question) {
        updateQuestionText(question.name || question.question || "\u0420\u0430\u0443\u043D\u0434 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D");
      }
      context.temp.points = 0;
      updateScoreDisplays();
    }
    handleKey(key, context) {
      if (key === "ArrowUp" || key === "N" || key === "n") {
        return this.getNextRound(context);
      }
      return null;
    }
    getNextRound(context) {
      const nextRoundIndex = getNextEnabledRound(context.persistent.currentRoundIndex + 1);
      if (nextRoundIndex === -1) {
        updateQuestionText("\u0418\u0433\u0440\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430! \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u2191 \u0434\u043B\u044F \u043D\u0430\u0447\u0430\u043B\u0430 \u043D\u043E\u0432\u043E\u0439 \u0438\u0433\u0440\u044B");
        return "WaitingToStart";
      }
      context.persistent.currentRoundIndex = nextRoundIndex;
      if (nextRoundIndex === GAME_SUPER) {
        return "SuperGame_Player1_Waiting";
      } else if (nextRoundIndex === GAME_NAOBOROT) {
        return "RoundReverse_TitleShown";
      } else {
        return `RoundX${nextRoundIndex + 1}_QuestionShown`;
      }
    }
    getKeyboardHints() {
      return [
        { key: "\u2191", action: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0443\u043D\u0434" }
      ];
    }
  };
  var RoundX2_Finished = class extends RoundX1_Finished {
    constructor() {
      super();
      this.name = "RoundX2_Finished";
      this.roundIndex = GAME_X2;
    }
  };
  var RoundX3_Finished = class extends RoundX1_Finished {
    constructor() {
      super();
      this.name = "RoundX3_Finished";
      this.roundIndex = GAME_X3;
    }
  };

  // js/states/reverse.js
  var RoundReverse_TitleShown = class extends GameState {
    constructor() {
      super("RoundReverse_TitleShown");
      this.roundIcon = "bmp/game_4.bmp";
    }
    enter(context) {
      super.enter(context);
      DOM.regularLayout.style.display = "flex";
      DOM.bottomArea.style.display = "flex";
      DOM.superGameGrid.style.display = "none";
      clearAnswers();
      clearBadAnswers();
      DOM.team0RoundIcon.src = this.roundIcon;
      DOM.team1RoundIcon.src = this.roundIcon;
      updateQuestionText("\u041E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0438\u0433\u0440\u0430");
      context.temp.points = 0;
      context.temp.openAnswers = 0;
      updateScoreDisplays();
    }
    handleKey(key, context) {
      if (key === "ArrowUp" || key === "N" || key === "n") {
        return "RoundReverse_Playing";
      }
      return null;
    }
    getKeyboardHints() {
      return [
        { key: "\u2191", action: "\u041D\u0430\u0447\u0430\u0442\u044C \u0440\u0430\u0443\u043D\u0434" }
      ];
    }
  };
  var RoundReverse_Playing = class extends GameState {
    constructor() {
      super("RoundReverse_Playing");
      this.roundIndex = GAME_NAOBOROT;
    }
    enter(context) {
      super.enter(context);
      const question = context.questions[this.roundIndex];
      if (question) {
        updateQuestionText(question.name || question.question || "\u0412\u043E\u043F\u0440\u043E\u0441 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D");
        question.answers.forEach((a) => a.opened = false);
      } else {
        updateQuestionText("\u0412\u043E\u043F\u0440\u043E\u0441 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D");
      }
      context.temp.openAnswers = 0;
      clearActiveTeam();
      startTimer(context.config.timeRoundObr);
    }
    handleKey(key, context) {
      if (["1", "2", "3", "4", "5", "6"].includes(key)) {
        const index = parseInt(key) - 1;
        this.openAnswer(index, context);
        if (context.temp.openAnswers === MAX_ANSWERS) {
          stopTimer();
          return this.completeRound(context);
        }
        return null;
      }
      if (key === "q" || key === "Q") {
        this.awardPointsToTeam(context, COMMAND_A);
        return null;
      }
      if (key === "w" || key === "W") {
        this.awardPointsToTeam(context, COMMAND_B);
        return null;
      }
      if (key === "t" || key === "T") {
        if (context.temp.timer.active) {
          stopTimer();
        } else {
          startTimer(context.config.timeRoundObr);
        }
        return null;
      }
      if (key === "ArrowUp" || key === "N" || key === "n") {
        stopTimer();
        return this.completeRound(context);
      }
      return null;
    }
    completeRound(context) {
      const nextRoundIndex = getNextEnabledRound(context.persistent.currentRoundIndex + 1);
      if (nextRoundIndex === -1) {
        updateQuestionText("\u0418\u0433\u0440\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430! \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u2191 \u0434\u043B\u044F \u043D\u0430\u0447\u0430\u043B\u0430 \u043D\u043E\u0432\u043E\u0439 \u0438\u0433\u0440\u044B");
        return "WaitingToStart";
      }
      context.persistent.currentRoundIndex = nextRoundIndex;
      if (nextRoundIndex === GAME_SUPER) {
        return "SuperGame_Player1_Waiting";
      } else if (nextRoundIndex === GAME_NAOBOROT) {
        return "RoundReverse_TitleShown";
      } else {
        return `RoundX${nextRoundIndex + 1}_QuestionShown`;
      }
    }
    openAnswer(index, context) {
      const question = context.questions[this.roundIndex];
      if (!question) return;
      const answer = question.answers[index];
      if (!answer || answer.opened) return;
      answer.opened = true;
      const answerSlot = document.getElementById(`answer${index + 1}`);
      if (answerSlot) {
        answerSlot.querySelector(".answer-text").textContent = answer.text;
        answerSlot.querySelector(".answer-points").textContent = answer.num;
        answerSlot.querySelector(".answer-text").classList.add("revealed");
      }
      context.temp.points = answer.num;
      updateCurrentPointsDisplay();
      context.temp.openAnswers++;
      playSound(SOUNDS.OPEN);
    }
    awardPointsToTeam(context, teamIndex) {
      const pointsToAward = context.temp.points;
      if (pointsToAward === 0) return;
      if (teamIndex === COMMAND_A) {
        context.persistent.point0 += pointsToAward;
      } else {
        context.persistent.point1 += pointsToAward;
      }
      context.temp.points = 0;
      updateScoreDisplays();
      const winnerScore = teamIndex === COMMAND_A ? context.persistent.point0 : context.persistent.point1;
      if (winnerScore >= context.config.winpoint) {
      }
    }
    getKeyboardHints() {
      return [
        { key: "1-6", action: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043E\u0442\u0432\u0435\u0442" },
        { key: "Q", action: "\u041E\u0447\u043A\u0438 \u043A\u043E\u043C\u0430\u043D\u0434\u0435 1" },
        { key: "W", action: "\u041E\u0447\u043A\u0438 \u043A\u043E\u043C\u0430\u043D\u0434\u0435 2" },
        { key: "T", action: "\u0422\u0430\u0439\u043C\u0435\u0440" },
        { key: "\u2191", action: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0440\u0430\u0443\u043D\u0434" }
      ];
    }
    exit(context) {
      stopTimer();
    }
  };

  // js/states/super.js
  var SuperGame_Player1_Waiting = class extends GameState {
    constructor() {
      super("SuperGame_Player1_Waiting");
    }
    enter(context) {
      super.enter(context);
      DOM.questionText.textContent = "\u0421\u0443\u043F\u0435\u0440 \u0438\u0433\u0440\u0430";
      DOM.bottomArea.style.display = "none";
      DOM.superGameGrid.style.display = "flex";
      DOM.team0Name.textContent = "\u0418\u0433\u0440\u043E\u043A 1";
      DOM.team1Name.textContent = "\u0418\u0433\u0440\u043E\u043A 2";
      DOM.team0Name.classList.remove("active");
      DOM.team1Name.classList.remove("active");
      DOM.player1Column.style.display = "flex";
      context.temp.superGameData.player1Visible = true;
      for (let i = 1; i <= 5; i++) {
        const row1 = document.getElementById(`sg-row1-${i}`);
        const row2 = document.getElementById(`sg-row2-${i}`);
        if (row1) row1.style.display = "flex";
        if (row2) row2.style.display = "flex";
      }
      context.temp.superGameData.player1Sum = 0;
      context.temp.superGameData.player2Sum = 0;
      DOM.currentPointsLcd.textContent = "0";
      for (let i = 1; i <= 5; i++) {
        const p1Answer = document.getElementById(`p1-q${i}-answer`);
        const p1Points = document.getElementById(`p1-q${i}-points`);
        const p2Answer = document.getElementById(`p2-q${i}-answer`);
        const p2Points = document.getElementById(`p2-q${i}-points`);
        if (p1Answer) p1Answer.value = "";
        if (p1Points) p1Points.value = "";
        if (p2Answer) p2Answer.value = "";
        if (p2Points) p2Points.value = "";
      }
    }
    handleKey(key, context) {
      if (key === "q" || key === "Q") {
        if (context.temp.timer.active) {
          stopTimer();
        } else {
          startTimer(context.config.time1);
        }
        return null;
      }
      if (key === "w" || key === "W") {
        if (context.temp.timer.active) {
          stopTimer();
        } else {
          startTimer(context.config.time2);
        }
        return null;
      }
      if (key === "a" || key === "A") {
        togglePlayer1Answers();
        return null;
      }
      if (key === "v" || key === "V") {
        const total = context.temp.superGameData.player1Sum + context.temp.superGameData.player2Sum;
        playSound(SOUNDS.WIN);
        showWinModal(total);
        return null;
      }
      return null;
    }
    getKeyboardHints() {
      return [
        { key: "Q", action: `\u0422\u0430\u0439\u043C\u0435\u0440 1 (${GameContext.config.time1}\u0441)` },
        { key: "W", action: `\u0422\u0430\u0439\u043C\u0435\u0440 2 (${GameContext.config.time2}\u0441)` },
        { key: "A", action: "\u0421\u043A\u0440\u044B\u0442\u044C/\u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0438\u0433\u0440\u043E\u043A\u0430 1" },
        { key: "V", action: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u044D\u043A\u0440\u0430\u043D \u043F\u043E\u0431\u0435\u0434\u044B" }
      ];
    }
  };
  var SuperGame_Results = class extends GameState {
    constructor() {
      super("SuperGame_Results");
    }
    enter(context) {
      super.enter(context);
      calculateSuperGameSum();
      if (!GameContext.temp.superGameData.player1Visible) {
        togglePlayer1Answers();
      }
    }
    handleKey(key, context) {
      if (key === "v" || key === "V") {
        const total = context.temp.superGameData.player1Sum + context.temp.superGameData.player2Sum;
        playSound(SOUNDS.WIN);
        showWinModal(total);
        return null;
      }
      return null;
    }
    getKeyboardHints() {
      const total = GameContext.temp.superGameData.player1Sum + GameContext.temp.superGameData.player2Sum;
      const isWin = total >= GameContext.config.winpointSuper;
      return [
        { key: "\u0421\u0443\u043C\u043C\u0430", action: `${total} \u043E\u0447\u043A\u043E\u0432 ${isWin ? "\u{1F389} \u041F\u041E\u0411\u0415\u0414\u0410!" : ""}` },
        { key: "V", action: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u044D\u043A\u0440\u0430\u043D \u043F\u043E\u0431\u0435\u0434\u044B" }
      ];
    }
    exit(context) {
      DOM.bottomArea.style.display = "flex";
      DOM.superGameGrid.style.display = "none";
      DOM.team0Name.textContent = GameContext.config.command0name;
      DOM.team1Name.textContent = GameContext.config.command1name;
      DOM.team0Name.classList.add("active");
    }
  };

  // js/states/registry.js
  function registerAllStates() {
    const sm = window.stateManager;
    sm.registerState(new WaitingToStart());
    sm.registerState(new MusicIntro());
    sm.registerState(new RoundX1_QuestionShown());
    sm.registerState(new RoundX1_TeamA_Playing());
    sm.registerState(new RoundX1_TeamB_Playing());
    sm.registerState(new RoundX1_Finished());
    sm.registerState(new RoundX2_QuestionShown());
    sm.registerState(new RoundX2_TeamA_Playing());
    sm.registerState(new RoundX2_TeamB_Playing());
    sm.registerState(new RoundX2_Finished());
    sm.registerState(new RoundX3_QuestionShown());
    sm.registerState(new RoundX3_TeamA_Playing());
    sm.registerState(new RoundX3_TeamB_Playing());
    sm.registerState(new RoundX3_Finished());
    sm.registerState(new RoundReverse_TitleShown());
    sm.registerState(new RoundReverse_Playing());
    sm.registerState(new SuperGame_Player1_Waiting());
    sm.registerState(new SuperGame_Results());
    console.log("[FSM] Registered", sm.states.size, "states");
  }

  // js/app.js
  function setupEventListeners() {
    document.addEventListener("keydown", handleGlobalKeyPress);
    document.getElementById("settings-save")?.addEventListener("click", saveSettings);
    document.getElementById("settings-cancel")?.addEventListener("click", () => {
      hideModal(DOM.settingsModal);
    });
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(`tab-${tab}`).classList.add("active");
      });
    });
    document.querySelectorAll('[id^="cfg-round"]').forEach((checkbox) => {
      checkbox.addEventListener("change", updateTabStyles);
    });
    document.getElementById("btn-fullscreen")?.addEventListener("click", toggleFullscreen);
    document.getElementById("btn-help")?.addEventListener("click", toggleHelp);
    document.getElementById("btn-settings")?.addEventListener("click", openSettingsDialog);
    document.getElementById("btn-import")?.addEventListener("click", () => {
      document.getElementById("json-file-input").click();
    });
    document.getElementById("btn-export")?.addEventListener("click", exportToJSON);
    document.getElementById("json-file-input")?.addEventListener("change", (e) => {
      if (e.target.files[0]) {
        importFromJSON(e.target.files[0]);
      }
    });
    document.getElementById("timer1-btn")?.addEventListener("click", startSuperGameTimer);
    document.getElementById("timer2-btn")?.addEventListener("click", startSuperGameTimer2);
    document.querySelectorAll(".p1-points, .p2-points").forEach((input) => {
      input.addEventListener("input", calculateSuperGameSum);
    });
    document.getElementById("win-modal-ok")?.addEventListener("click", () => {
      hideModal(DOM.winModal);
    });
  }
  function handleGlobalKeyPress(e) {
    if (e.key === "Escape") {
      if (DOM.settingsModal?.style.display === "flex") {
        hideModal(DOM.settingsModal);
        return;
      }
      if (DOM.helpOverlay?.style.display === "flex") {
        hideModal(DOM.helpOverlay);
        GameContext.helpVisible = false;
        return;
      }
      return;
    }
    const target = e.target;
    const isInputField = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
    if (isInputField && !e.key.startsWith("F")) {
      return;
    }
    if (DOM.settingsModal?.style.display === "flex") {
      return;
    }
    if (e.key === "F11") {
      e.preventDefault();
      toggleFullscreen();
      return;
    }
    if (e.key === "F1") {
      e.preventDefault();
      toggleHelp();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      window.stateManager?.goToPreviousState();
      return;
    }
    window.stateManager?.handleKey(normalizeKey(e.key));
  }
  function loadDemoQuestions() {
    fetch("demo.json").then((response) => response.json()).then((data) => {
      if (data.config) {
        Object.assign(GameContext.config, data.config);
      }
      if (data.rounds) {
        GameContext.questions = data.rounds;
      }
      GameContext.dataLoaded = true;
      console.log("[FSM] Questions loaded from demo.json");
    }).catch((err) => {
      console.warn("Failed to load demo.json:", err);
      GameContext.questions = Array(4).fill(null).map(() => ({
        name: "",
        answers: Array(6).fill(null).map(() => ({ text: "", num: 0, opened: false }))
      }));
      GameContext.dataLoaded = true;
    });
  }
  function init() {
    console.log("[FSM] Initializing game...");
    initDOM();
    loadDemoQuestions();
    setupEventListeners();
    DOM.team0Name.textContent = GameContext.config.command0name;
    DOM.team1Name.textContent = GameContext.config.command1name;
    window.stateManager = new StateManager(GameContext);
    registerAllStates();
    window.stateManager.changeState("WaitingToStart");
    console.log("[FSM] Game initialized. Starting in WaitingToStart state.");
  }
  document.addEventListener("DOMContentLoaded", init);
})();
