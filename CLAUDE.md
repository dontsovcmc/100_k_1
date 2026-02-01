# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "100 к 1" (100 to 1), a Russian game show implementation - the web version built with HTML5/JavaScript. The game replicates the TV show "Family Feud" with multiple rounds: Simple Game (×1), Double Game (×2), Triple Game (×3), Reverse Game, and Super Game.

The application is a browser-based game show host tool that displays questions, manages team scores, handles answer reveals with sound effects, and tracks game progression through different rounds.

**Recent History**: Originally written in Qt (C++) in 2011, this was rewritten to web version with Claude's help in 2025 and recently refactored to eliminate bugs, use constants instead of magic numbers, implement DOM caching, and reduce code duplication.

## Running the Game

### Quick Start
```bash
# Open directly in browser
open index.html

# Or run a local server (recommended)
python3 -m http.server 8000
# Then navigate to http://localhost:8000
```

### Requirements
- Modern web browser with support for:
  - HTML5 audio
  - localStorage API
  - ES6 JavaScript (const/let, arrow functions)
  - CSS3

## Architecture

### File Structure

```
index-dev.html           # Development version (ES6 modules)
index-prod.html          # Production version (bundled)
js/                      # ES6 modules (13 files)
  ├── core/              # Core game engine
  ├── states/            # FSM state classes
  ├── utils/             # UI utilities
  └── main.js            # Entry point
dist/bundle.js           # Production bundle (esbuild)
styles.css               # All styling
demo.json                # Example questions/answers data
sounds/                  # Audio assets (start, open, bad, level, win)
bmp/                     # Image assets (round icons, answer backgrounds, X marks)
```

### Constants

The code uses constants for maintainability:

```javascript
// Game levels
const GAME_X1 = 0;         // Simple game (×1)
const GAME_X2 = 1;         // Double game (×2)
const GAME_X3 = 2;         // Triple game (×3)
const GAME_NAOBOROT = 3;   // Reverse game
const GAME_SUPER = 4;      // Super game

// Teams
const COMMAND_A = 0;
const COMMAND_B = 1;
const COMMAND_NOT_SELECTED = -1;

// Game constants
const MAX_WRONG_ANSWERS = 3;
const MAX_ANSWERS = 6;
const LEVEL_NOT_STARTED = -1;

// Resource paths
const IMAGES = {
    X_EMPTY: 'bmp/_x_0.bmp',
    X_FILLED: 'bmp/_x_1.bmp'
};

const SOUNDS = {
    START: 'start',
    OPEN: 'open',
    BAD: 'bad',
    LEVEL: 'level',
    WIN: 'win'
};
```

### DOM Cache

For performance, frequently-accessed DOM elements are cached in a `DOM` object initialized at startup:

```javascript
const DOM = {};

function initDOM() {
    DOM.settingsModal = document.getElementById('settings-modal');
    DOM.helpOverlay = document.getElementById('help-overlay');
    DOM.questionText = document.getElementById('question-text');
    // ... 15+ more elements
}
```

### GameState Object

The core game state is managed through a single JavaScript object:

```javascript
const GameState = {
    // Configuration
    config: {
        command0name: "Команда 1",    // Team 1 name
        command1name: "Команда 2",    // Team 2 name
        time1: 15,                    // Player 1 timer (seconds)
        time2: 20,                    // Player 2 timer (seconds)
        timeRoundObr: 60,             // Reverse game timer
        winpoint: 80,                 // Points needed to win regular rounds
        winpointSuper: 200,           // Points needed to win super game
        rounds: [true, true, true, true, true]  // Array: enable/disable each round (0-4)
    },

    // Questions for 4 rounds (index 0-3)
    questions: [],          // Loaded from JSON or settings modal

    // Current game state
    level: LEVEL_NOT_STARTED,    // Current round (-1 = not started, 0-4 = round index)
    activecommand: COMMAND_A,     // Active team (0 or 1)
    points: 0,                    // Current points for active answer
    point0: 0,                    // Team 0 total score
    point1: 0,                    // Team 1 total score
    badAnswer: [0, 0],            // Wrong answer count per team (max 3)
    openanswer: 0,                // Number of revealed answers

    // Game state flags
    game1: false,           // Main game active
    game2: false,           // Second team playing
    obrat: false,           // Reverse game active
    supergame: false,       // Super game active
    winner: false,          // Round winner determined

    // Super game data
    superGameData: {
        player1Answers: ["", "", "", "", ""],
        player1Points: [0, 0, 0, 0, 0],
        player2Answers: ["", "", "", "", ""],
        player2Points: [0, 0, 0, 0, 0],
        player1Sum: 0,
        player2Sum: 0,
        player1Visible: true
    },

    // Timer state
    timer: {
        active: false,
        remaining: 0,
        intervalId: null
    },

    helpVisible: false,
    dataLoaded: false       // Flag for whether questions have been loaded
};
```

### Team Tracking Variables

**Important Change**: The game now properly separates team identity from playing order.

**In GameContext.temp**:
```javascript
temp: {
    firstTeam: 0,           // Team selected to play first (0 or 1)
    secondTeam: 1,          // The other team (1 - firstTeam)
    currentlyPlaying: 0,    // Which team is currently playing (0 or 1)
    isFirstTurn: true,      // Is this the first team's turn?
    // ...
}
```

**Critical Understanding**:
- `TeamA_Playing` does NOT mean "Team 0" - it means "first playing team"
- `TeamB_Playing` does NOT mean "Team 1" - it means "second playing team"
- Points are awarded based on `currentlyPlaying`, not on playing order
- User selects with `←` (Team 0 plays first) or `→` (Team 1 plays first)

**Example**:
- User presses `→` (selects Team 1 to play first)
- `firstTeam = 1`, `secondTeam = 0`
- Game enters `RoundX1_TeamA_Playing` with `currentlyPlaying = 1`
- If all answers opened: points go to `point1` (not `point0`)
- If 3 X marks: switches to `RoundX1_TeamB_Playing` with `currentlyPlaying = 0`

### Key Functions

**Initialization**
- `init()` - Initialize game, load state from localStorage, set up event listeners
- `setupEventListeners()` - Bind keyboard and UI controls

**Game Flow**
- `newLevel(levelIndex)` - Transition to specified game round (0-4)
- `getNextLevel()` - Find next enabled round
- `handleAdvance()` - Progress to next stage within current round

**Answer Management**
- `openAnswer(index)` - Reveal answer with animation and sound
- `clearAnswers()` - Reset all answer slots

**Scoring**
- `addPoints(teamIndex)` - Add current points to team score
- `badAnswer()` - Add X mark for wrong answer (max 3)
- `clearBadAnswers()` - Reset all X marks
- `checkWin()` - Check if winning score reached (plays win.wav)

**Team Control**
- `setActiveCommand(teamIndex)` - Switch active team (0 or 1)

**UI Updates**
- `updateQuestionText(text)` - Display question
- `updateScoreDisplays()` - Refresh all score LCDs
- `updateCurrentPointsDisplay()` - Update center points display
- `updateRoundIcons(level)` - Show round type icons
- `updateContextualHints()` - Update bottom hints panel

**Super Game**
- `togglePlayer1Answers()` - Hide/show player 1 answers
- `toggleSuperGameRow(index)` - Toggle individual answer row visibility
- `calculateSuperGameSum()` - Auto-calculate player sums
- `startSuperGameTimer()` - Start timer (time1 or time2)

**Persistence**
- `saveState()` - Save to localStorage
- `loadState()` - Restore from localStorage

**Timer**
- `startTimer(seconds)` - Start countdown timer with visual display

**Settings**
- `openSettingsDialog()` - Show settings modal
- `saveSettings()` - Apply and save settings
- `exportToJSON()` - Export config + questions to JSON file
- `importFromJSON(file)` - Load settings from JSON

**Sound**
- `playSound(name)` - Play audio effect (start/open/bad/level/win)

**Utility Functions**
- `showModal(modal)` - Display modal with flex layout
- `hideModal(modal)` - Hide modal
- `loadQuestionIntoForm(questionIndex)` - Load question data into settings form
- `saveQuestionFromForm(questionIndex)` - Save form data back to GameState

### UI Components

**Main Game Layout** (`#regular-game-layout`)
- Question area (`#question-area`)
- Top bar with team names and center points LCD
- Bottom area with:
  - Team 0 column (round icon, score, X marks)
  - Answers column (7 answer slots, index 0-6)
  - Team 1 column (round icon, score, X marks)

**Super Game Layout** (`#super-game-layout`)
- Two player columns with 5 question rows each
- Answer inputs and point inputs
- Sum displays
- Control buttons (hide player 1, timer, calculate)

**Modals and Overlays**
- Settings Modal (`#settings-modal`) - 6 tabs for configuration
- Help Overlay (`#help-overlay`) - Context-aware keyboard shortcuts
- Timer Widget (`#timer-widget`) - Countdown display

**Bottom Panels**
- Hints Panel (`#hints-panel`) - Contextual keyboard hints
- Control Panel (`#control-panel`) - Organizer buttons (fullscreen, help, settings, import, export)

## Game Rounds

### Round Levels (0-4)

**ROUND_1** (index 0) - Simple Game
- Multiplier: ×1
- Standard 6-answer format
- Team drawing phase → question reveal → answer phase

**ROUND_2** (index 1) - Double Game
- Multiplier: ×2
- Points doubled for all answers

**ROUND_3** (index 2) - Triple Game
- Multiplier: ×3
- Points tripled for all answers

**ROUND_OBR** (index 3) - Reverse Game
- No multiplier (fixed points)
- 60-second timer
- Teams can answer Q/W to claim points immediately

**ROUND_SUPER** (index 4) - Super Game
- Two players answer 5 questions independently
- Player 1 answers first (15s timer)
- Player 2 answers while player 1 answers hidden (20s timer)
- Manual point entry by organizer
- Win if combined score ≥ winpoint

### Round Progression

Each round follows this flow:
1. **Team selection**: Use ←/→ to select which team goes first, press N to start
2. **First team plays**: Opens answers 1-6, accumulates points
   - If all 6 answers opened → First team gets all points, round ends
   - If 3 errors (X) → Switch to second team
3. **Second team plays** (if first team got 3 errors):
   - If opens ANY answer (1-6) → Second team gets all accumulated points, round ends
   - If makes ANY error (X) → First team gets all accumulated points, round ends
4. **Round finished**: Press ↑/N to advance to next round

## Keyboard Controls

### System Keys
- `F1` - Toggle context-aware help overlay
- `F2` - Open settings modal
- `F11` - Toggle fullscreen mode
- `ESC` - Close dialogs (settings/help)

### Game Controls
- `1-6` - Open answers 1-6 (or toggle super game rows)
- `X` / `DELETE` - Add wrong answer mark (X)
- `N` / `↑` - Advance to next stage/round
- `←` / `→` - Select team 0/1 (during team selection phase)

**Removed controls:**
- ~~`C` - Add accumulated points to active team~~ (removed - points awarded automatically)
- ~~`Space` - Clear all answers~~ (removed - answers persist until round ends)
- ~~`Z` - Clear all X marks~~ (not used in FSM version)
- ~~`V` - Toggle active team~~ (not needed - team selection via arrows)

### Reverse Game Specific
- `Q` - Award points to team 1
- `W` - Award points to team 2
- `T` - Start 60-second timer

### Super Game Specific
- `A` - Hide/show player 1 column
- `Q` - Start timer (15s for player 1, 20s for player 2)
- `1-5` - Toggle visibility of answer rows 1-5

## Settings & Configuration

### Storage
- **localStorage** (key: `'game_state'`)
  - Saves entire GameState after every action
  - Persists across page reloads
  - Cleared only manually

- **JSON Import/Export**
  - Export: saves config + questions to `game_settings.json`
  - Import: load settings from JSON file

### Settings Modal Tabs

1. **Игра (Game)**
   - Team names (command0name, command1name)
   - Round toggles (enable/disable each of 5 rounds)

2. **Настройки (Settings)**
   - Timer durations:
     - `time1`: Player 1 timer (default: 15s)
     - `time2`: Player 2 timer (default: 20s)
     - `timeRoundObr`: Reverse game timer (default: 60s)
   - `winpoint`: Points needed to win (default: 80)

3-6. **Question Tabs** (Простая/Двойная/Тройная/Обратная игра)
   - Question text
   - 6 answers with points (text + number)

### Default Values
```javascript
{
    command0name: "Команда 1",
    command1name: "Команда 2",
    time1: 15,
    time2: 20,
    timeRoundObr: 60,
    winpoint: 80,
    winpointSuper: 200
}
```

## Assets

### Sounds (`sounds/`)
All audio files in WAV format:
- `start.wav` - Game start
- `open.wav` - Answer reveal
- `bad.wav` - Wrong answer
- `level.wav` - Round transition
- `win.wav` - Victory (when winpoint reached)

Uses HTML5 `<audio>` elements with `playSound(name)` helper.

### Images (`bmp/`)

**Round Icons**
- `game_1.bmp` - Simple game icon
- `game_2.bmp` - Double game icon
- `game_3.bmp` - Triple game icon
- `game_4.bmp` - Reverse game icon
- `game_S.bmp` - Super game icon

**Answer Slots**
- `answ_1.bmp` through `answ_6.bmp` - Answer backgrounds
- `answ_7.bmp` - 7th answer slot (currently unused, slot 7 is transparent)

**X Marks**
- `_x_0.bmp` - Empty X mark
- `_x_1.bmp` - Filled X mark (wrong answer)

**Timer**
- `timer.bmp` - Timer icon

## Features

### Context-Aware Help System

The help overlay (`F1`) shows relevant keyboard shortcuts based on current game state:
- **Not started**: Shows N (start), F2 (settings)
- **Team selection**: Shows ←/→ (select team), N (show question)
- **Rounds 1-3 (Playing)**: Shows 1-6 (open answers), X (error)
- **Rounds 1-3 (Finished)**: Shows ↑ (next round)
- **Reverse game**: Shows Q/W (team points), T (timer), ↑ (finish round)
- **Super game**: Shows A (hide player 1), Q (timer), N (advance)

### Context-Aware Hints Panel

Bottom hints panel shows relevant shortcuts for current state:
```javascript
function updateContextualHints() {
    // Updates #hints-content with <kbd> styled shortcuts
    // Changes based on: level, game1, obrat, supergame
}
```

### Timer System

**Countdown Timer Display**
- Fixed position on right side
- Shows timer icon + seconds remaining
- Counts down at 1000ms intervals
- Auto-hides when reaches 0

**Timer Usage**
- Reverse game: 60 seconds (timeRoundObr)
- Super game player 1: 15 seconds (time1)
- Super game player 2: 20 seconds (time2)
- Manual trigger: T key (reverse game) or Q key (super game)

### Super Game Mechanics

**Two-Player Setup**
- Player 1 answers 5 questions first
- Player 2 answers same 5 questions (player 1 answers hidden)
- Organizer manually enters points for each answer

**Features**
- Hide/show player 1 column (`A` key or button)
- Toggle individual answer rows (`1-5` keys)
- Auto-sum calculation on point input
- Different timer durations (15s vs 20s)
- Combined score turns red if ≥ winpoint

**Answer Rows**
- Number, answer input, points input per row
- 5 rows per player
- Sum displayed at bottom

### Score System

**Regular Rounds (1-3)**
```javascript
points = answer.num × (level + 1)
// level 0: ×1, level 1: ×2, level 2: ×3
```

**Reverse Game**
```javascript
points = answer.num  // No multiplier
```

**Super Game**
- Manual entry by organizer
- Player 2 total = player 1 sum + player 2 sum
- Victory if total ≥ winpoint

**Wrong Answers**
- First team: Max 3 wrong answers before switching to second team
- Second team: First error immediately ends round (points go to first team)
- Visual feedback with X marks

## Code Structure

### File Organization
```
index.html          # Complete single-file application
├── <style>         # CSS for all UI components
├── <body>          # HTML structure
└── <script>        # Game logic (1800+ lines)

sounds/             # Audio assets
├── start.wav
├── open.wav
├── bad.wav
├── level.wav
└── win.wav

bmp/                # Image assets
├── game_*.bmp      # Round icons
├── answ_*.bmp      # Answer slots
├── _x_*.bmp        # X marks
└── timer.bmp       # Timer icon

answers/            # (Optional) Additional question data
```

### JavaScript Organization

**Global State**
- `GameState` object (single source of truth)

**Event Handling**
- `document.addEventListener('keydown', handleKeyPress)`
- Modal button listeners
- Settings tab switching
- Control panel buttons

**Game Logic Functions**
- Game flow: `init()`, `newLevel()`, `handleAdvance()`
- Answer management: `openAnswer()`, `clearAnswers()`
- Scoring: `addPoints()`, `badAnswer()`, `checkWin()`
- Team control: `setActiveCommand()`

**UI Update Functions**
- Score displays: `updateScoreDisplays()`, `updateCurrentPointsDisplay()`
- Visual elements: `updateQuestionText()`, `updateRoundIcons()`
- Context: `updateContextualHints()`, `getContextualHelp()`

**Persistence**
- Auto-save: `saveState()` called after every state change
- Auto-restore: `loadState()` called on init

**Utilities**
- `playSound(name)` - Audio playback
- `startTimer(seconds)` - Timer control
- `toggleFullscreen()` - Browser fullscreen API
- `showModal(modal)`, `hideModal(modal)` - Modal display utilities
- `loadQuestionIntoForm(questionIndex)`, `saveQuestionFromForm(questionIndex)` - Form utilities

**Constants**
- Game level constants: `GAME_X1`, `GAME_X2`, `GAME_X3`, `GAME_NAOBOROT`, `GAME_SUPER`
- Team constants: `COMMAND_A`, `COMMAND_B`, `COMMAND_NOT_SELECTED`
- Magic number replacements: `MAX_WRONG_ANSWERS`, `MAX_ANSWERS`, `LEVEL_NOT_STARTED`
- Resource path objects: `IMAGES`, `SOUNDS`

## FSM State Machine

### State Overview

The game uses a Finite State Machine (FSM) with 18 states organized into 5 categories:

**System States (2):**
1. WaitingToStart - Initial game state
2. MusicIntro - Music intro before first round

**Regular Round States (12):**
3. RoundX1_QuestionShown - Simple game (×1) question display
4. RoundX1_TeamA_Playing - Simple game first team playing
5. RoundX1_TeamB_Playing - Simple game second team playing
6. RoundX1_Finished - Simple game round completed (NEW)
7. RoundX2_QuestionShown - Double game (×2) question display
8. RoundX2_TeamA_Playing - Double game first team playing
9. RoundX2_TeamB_Playing - Double game second team playing
10. RoundX2_Finished - Double game round completed (NEW)
11. RoundX3_QuestionShown - Triple game (×3) question display
12. RoundX3_TeamA_Playing - Triple game first team playing
13. RoundX3_TeamB_Playing - Triple game second team playing
14. RoundX3_Finished - Triple game round completed (NEW)

**Reverse Game States (2):**
15. RoundReverse_TitleShown - Reverse game title screen
16. RoundReverse_Playing - Reverse game playing

**Super Game States (2):**
17. SuperGame_Player1_Waiting - Super game input phase
18. SuperGame_Results - Super game results

### State Transitions and Sounds

#### 1. WaitingToStart
**File**: script.js lines 624-690

**Entry Triggers:**
- Game initialization (default state)
- After completing all rounds

**Exit Triggers:**
- Press `↑` or `N` → MusicIntro

**Sounds Played:**
- None

**UI Display:**
- Message: "Нажмите ↑ для начала игры"
- Regular game layout shown
- All scores reset to 0

---

#### 2. MusicIntro
**File**: script.js lines 694-750

**Entry Triggers:**
- From WaitingToStart when pressing `↑` or `N`

**Exit Triggers:**
- Press `↑` or `N` → Transitions to first enabled round:
  - If Round 0 enabled → RoundX1_QuestionShown
  - If Round 1 enabled → RoundX2_QuestionShown
  - If Round 2 enabled → RoundX3_QuestionShown
  - If Round 3 enabled → RoundReverse_TitleShown
  - If Round 4 enabled → SuperGame_Player1_Waiting

**Sounds Played:**
- **start.wav** (SOUNDS.START) - plays on entry

**UI Display:**
- Message: "🎵 100 к 1 🎵"
- Scores cleared if first round

---

#### 3. RoundX1_QuestionShown (Simple Game ×1)
**File**: script.js lines 754-830

**Entry Triggers:**
- From MusicIntro (if Round 0 enabled)
- From previous round completion (if Round 0 is next)

**Exit Triggers:**
- Press `←` → Sets Team A as active (no state change)
- Press `→` → Sets Team B as active (no state change)
- Press `↑` or `N` →
  - If Team A selected → RoundX1_TeamA_Playing
  - If Team B selected → RoundX1_TeamB_Playing

**Sounds Played:**
- None

**UI Display:**
- Question text from questions[0]
- Round icon: game_1.bmp
- Team A active by default
- All answers hidden

**Properties:**
- Multiplier: 1×
- Round index: 0

---

#### 4. RoundX1_TeamA_Playing (Simple Game Team A)
**File**: script.js lines 832-988

**Entry Triggers:**
- From RoundX1_QuestionShown when Team A selected and `↑`/`N` pressed

**Exit Triggers:**
- Press `1-6` → Opens corresponding answer
  - If all 6 answers opened → Awards points to first team → RoundX1_Finished
- Press `X` or `Delete` → Adds X mark
  - If 3 X marks → RoundX1_TeamB_Playing

**Sounds Played:**
- **open.wav** (SOUNDS.OPEN) - when opening each answer (keys 1-6)
- **bad.wav** (SOUNDS.BAD) - when adding X mark (key X/Delete)

**UI Display:**
- First team shown as active (based on user selection: ←=Team 0, →=Team 1)
- Current accumulated points in center LCD
- Answers reveal with text + points
- X marks appear for wrong answers

**Score Mechanics:**
- Points per answer = answer.num × 1
- Points accumulate in center display
- Points automatically awarded when all answers opened or when switching to second team

---

#### 5. RoundX1_TeamB_Playing (Simple Game Team B)
**File**: js/states/round-base.js lines 227-346

**Entry Triggers:**
- From RoundX1_TeamA_Playing when first team gets 3 X marks

**Exit Triggers:**
- Press `1-6` → Opens corresponding answer → **Round ends immediately**, awards ALL accumulated points to second team → RoundX1_Finished
- Press `X` or `Delete` → Adds X mark → **Round ends immediately**, awards ALL accumulated points to first team → RoundX1_Finished

**Sounds Played:**
- **open.wav** (SOUNDS.OPEN) - when opening answers
- **bad.wav** (SOUNDS.BAD) - when adding X mark

**UI Display:**
- Second team shown as active
- Preserves accumulated points from first team's turn
- Second team's X marks

**Score Mechanics:**
- Inherits accumulated points from first team
- Points per answer = answer.num × 1
- **Critical**: Opening ANY answer or making ANY error immediately ends the round
  - If answer opened: Second team gets all points
  - If error made: First team gets all points

---

#### 5a. RoundX1_Finished
**File**: js/states/round-finished.js lines 9-83

**Entry Triggers:**
- From RoundX1_TeamA_Playing: all 6 answers opened
- From RoundX1_TeamB_Playing: ANY answer opened OR ANY error made

**Exit Triggers:**
- Press `↑` or `N` → Next enabled round (or WaitingToStart if no more rounds)

**Sounds Played:**
- None (win.wav plays only in Super Game)

**UI Display:**
- Question text remains visible on screen
- Hints panel shows: "Нажмите ↑ для следующего раунда"
- Scores updated with points awarded to winning team
- **Center points display (temp.points) cleared to 0**

**Score Mechanics:**
- Points already awarded in completeRound() before entering this state
- Center display cleared on entry (temp.points = 0)
- Just displays current totals and waits for user to continue

---

#### 6-11. RoundX2 and RoundX3 States
**Files**:
- RoundX2: lines 1147-1193
- RoundX3: lines 1197-1243

**Identical to RoundX1 except:**
- RoundX2_QuestionShown: Round icon = game_2.bmp, multiplier = 2×, uses questions[1]
- RoundX2_TeamA_Playing: Points = answer.num × 2
- RoundX2_TeamB_Playing: Points = answer.num × 2
- RoundX3_QuestionShown: Round icon = game_3.bmp, multiplier = 3×, uses questions[2]
- RoundX3_TeamA_Playing: Points = answer.num × 3
- RoundX3_TeamB_Playing: Points = answer.num × 3

**All sounds same as RoundX1:**
- open.wav when revealing answers
- bad.wav for wrong answers

---

#### 12. RoundReverse_TitleShown (Reverse Game Title)
**File**: script.js lines 1247-1288

**Entry Triggers:**
- From MusicIntro (if Round 3 enabled)
- From previous round completion

**Exit Triggers:**
- Press `↑` or `N` → RoundReverse_Playing

**Sounds Played:**
- **start.wav** (SOUNDS.START) - plays when pressing `↑`/`N` to start the round

**UI Display:**
- Message: "Обратная игра"
- Round icon: game_4.bmp
- All answers cleared

---

#### 13. RoundReverse_Playing (Reverse Game)
**File**: script.js lines 1290-1456

**Entry Triggers:**
- From RoundReverse_TitleShown when `↑`/`N` pressed

**Exit Triggers:**
- Press `1-6` → Opens corresponding answer
  - If all 6 answers opened → Stops timer, auto-transitions to next round
- Press `Q` → Awards last opened answer points to Team A (no state change)
- Press `W` → Awards last opened answer points to Team B (no state change)
- Press `T` → Toggles 60-second timer (no state change)
- Press `↑` or `N` → Stops timer, transitions to next round
- Press `Space` → Clears all answers (no state change)

**Sounds Played:**
- **open.wav** (SOUNDS.OPEN) - when opening answers (keys 1-6)
- **win.wav** (SOUNDS.WIN) - when team score ≥ winpoint after Q/W press

**UI Display:**
- Question from questions[3]
- 60-second countdown timer (auto-starts on entry)
- Answers reveal but NO accumulated points shown in center
- Teams can claim points multiple times with Q/W

**Score Mechanics:**
- Points per answer = answer.num (no multiplier)
- Points awarded immediately to team on Q/W press (not accumulated)

**Timer:**
- Auto-starts on entry: 60 seconds (config.timeRoundObr)
- Can be toggled with T key
- Stops automatically when round ends

---

#### 14. SuperGame_Player1_Waiting (Super Game)
**File**: script.js lines 1460-1540

**Entry Triggers:**
- From MusicIntro (if Round 4 enabled)
- From previous round completion

**Exit Triggers:**
- Press `Q` → Starts timer for Player 1 (15 seconds, no state change)
- Press `A` → Toggles Player 1 column visibility (no state change)
- Press `1-5` → Toggles individual answer row visibility (no state change)
- Press `↑` or `N` → SuperGame_Results

**Sounds Played:**
- None (timer beep sound plays when timer expires, but no music)

**UI Display:**
- Super game layout (2 player columns)
- 5 question rows per player
- Player 1 visible by default
- Manual input fields for answers and points

**Timer:**
- Player 1: 15 seconds (config.time1) - triggered by Q key
- Player 2: 20 seconds (config.time2) - not auto-triggered

---

#### 15. SuperGame_Results
**File**: script.js lines 1542-1593

**Entry Triggers:**
- From SuperGame_Player1_Waiting when `↑`/`N` pressed

**Exit Triggers:**
- Press `↑` or `N` → WaitingToStart (game ends)

**Sounds Played:**
- **win.wav** (SOUNDS.WIN) - if (player1Sum + player2Sum) ≥ winpointSuper (200)

**UI Display:**
- Both player columns visible
- Auto-calculates sums from point inputs
- Total = Player1Sum + Player2Sum
- Total turns red if ≥ 200
- Victory modal shows if threshold reached

**Score Mechanics:**
- Manual point entry by organizer
- Win condition: combined total ≥ 200 points

---

### State Transition Flow Summary

```
Game Start:
WaitingToStart → (N/↑) → MusicIntro → (N/↑) → First Enabled Round

Regular Rounds (X1/X2/X3):
QuestionShown → (←/→ to select team) → (N/↑) → TeamA_Playing → (all 6 answers OR 3 errors) →
  → [If all 6 answers: Finished] OR [If 3 errors: TeamB_Playing → (any answer OR any error) → Finished]

Reverse Game:
RoundReverse_TitleShown → (N/↑, plays START sound) → RoundReverse_Playing → (all answers or N/↑) → Next Round

Super Game:
SuperGame_Player1_Waiting → (N/↑) → SuperGame_Results → (N/↑) → WaitingToStart

All Rounds:
After completion → Next enabled round OR WaitingToStart if no more rounds
```

### Sound Summary by Event

**Game Start:**
- start.wav when entering MusicIntro

**During Gameplay:**
- open.wav when revealing any answer (keys 1-6)
- bad.wav when adding X mark (keys X/Delete)

**Round Transitions:**
- start.wav when starting Reverse Game (from RoundReverse_TitleShown)
- win.wav when team reaches winning score (≥80 or ≥200 for super game)

**Not Used:**
- level.wav is defined but never played in current implementation

### Auto-Transitions vs Manual Transitions

**Auto-Transitions** (happen without key press):
- When Team A opens all 6 answers → Team A gets points, enters Finished state
- When Team A gets 3 X marks → Team B starts playing
- When Team B opens ANY answer → Team B gets all points, enters Finished state
- When Team B makes ANY error → Team A gets all points, enters Finished state

**Manual Transitions** (require key press):
- N/↑ key: Advance to next state (from Finished, QuestionShown, etc.)
- Q/W keys (Reverse Game): Award points but stay in state

### Global Keys (Work in All States)

- `F1` → Toggle help overlay
- `F2` → Open settings modal
- `F11` → Toggle fullscreen
- `ESC` → Close dialogs
- `↓` → Go to previous state (back button)

## Development Notes

### ⚠️ CRITICAL: Build Workflow

**IMPORTANT**: After making ANY changes to JavaScript files in `js/` directory, you MUST:

1. **Rebuild the bundle**:
   ```bash
   npm run build
   ```
   This updates `dist/bundle.js` which is used by `index-prod.html`

2. **Commit BOTH changes**:
   ```bash
   git add js/ dist/bundle.js
   git commit -m "Your changes"
   ```

**Why this matters**:
- `index-prod.html` is the standalone version users download
- It depends on `dist/bundle.js` (NOT on `js/` modules)
- If you don't rebuild, `index-prod.html` will have outdated code
- `dist/bundle.js` is tracked in git for easy download-and-play

**Quick check**: If you modified any `.js` file, run `npm run build` before committing.

### Browser Compatibility

**Required Features**
- HTML5 `<audio>` element with WAV support
- localStorage API
- ES6 JavaScript:
  - `const` / `let`
  - Arrow functions
  - Template literals
  - Spread operator
- CSS3:
  - Flexbox
  - Grid
  - Animations
  - `rgba()` colors

**Tested Browsers**
- Chrome/Edge (Chromium): Full support
- Firefox: Full support
- Safari: Full support (may need user interaction for audio)

### State Persistence

**Auto-Save Behavior**
- Saves after: answer reveal, score change, team switch, settings update
- Saves entire GameState object as JSON string
- No debouncing (immediate save)

**Restoration**
- On page load: `loadState()` restores from localStorage
- Falls back to defaults if no saved state
- Preserves: scores, current round, revealed answers, settings

### Adding Questions

**Method 1: Settings UI**
1. Press `F2` to open settings
2. Navigate to question tabs (Простая/Двойная/Тройная/Обратная игра)
3. Edit question text and 6 answers with points
4. Click OK to save

**Method 2: JSON Import**
1. Click import button (📥) in control panel
2. Select JSON file with format:
```json
{
  "config": {
    "command0name": "Команда 1",
    "command1name": "Команда 2",
    "time1": 15,
    "time2": 20,
    "timeRoundObr": 60,
    "winpoint": 80,
    "rounds": [true, true, true, true, true]
  },
  "rounds": [
    {
      "title": "Простая игра",
      "question": "What do people usually do in the morning?",
      "icon": "game_1.bmp",
      "answers": [
        {"text": "Wash up", "num": 40},
        {"text": "Brush teeth", "num": 25},
        {"text": "Eat breakfast", "num": 18},
        {"text": "Get dressed", "num": 8},
        {"text": "Exercise", "num": 6},
        {"text": "Read news", "num": 3}
      ]
    }
    // ... 3 more rounds (Double, Triple, Reverse)
  ],
  "super_game": {
    "questions": [
      {
        "question": "Question for super game player",
        "answers": [
          {"text": "Answer 1", "num": 100},
          {"text": "Answer 2", "num": 80},
          {"text": "Answer 3", "num": 60},
          {"text": "Answer 4", "num": 40},
          {"text": "Answer 5", "num": 20}
        ]
      }
      // ... 4 more questions (5 total for super game)
    ]
  }
}
```

### Extending the Game

**Adding More Rounds**
1. Add round to `GameState.config.rounds`
2. Add question to `GameState.questions` array
3. Update `newLevel()` switch statement
4. Update `getNextLevel()` to include new round
5. Add keyboard shortcuts in `handleKeyPress()`

**Changing Answer Count**
Currently supports 6 answers per round. To support 7:
- Answer slot 7 already exists in HTML (index 6, transparent background)
- Update question editor in settings modal to include 7th answer
- Already functional for gameplay

**Custom Themes**
- All colors defined in `<style>` section
- Modify CSS variables or direct color values
- Background gradient: `linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)`

### Known Limitations

**Missing Features**
- No second screen support for organizer controls
- No network/multiplayer support
- No question randomization
- No statistics tracking
- Font customization not available (was in Qt version)

**Browser Constraints**
- Audio may require user interaction to play (browser policy)
- Fullscreen requires user gesture (F11 or button click)
- localStorage limited to ~5-10MB (sufficient for this app)
