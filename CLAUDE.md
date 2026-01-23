# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "100 к 1" (100 to 1), a Russian game show implementation - the web version built with HTML5/JavaScript. The game replicates the TV show "Family Feud" with multiple rounds: Simple Game (×1), Double Game (×2), Triple Game (×3), Reverse Game, and Super Game.

The application is a browser-based game show host tool that displays questions, manages team scores, handles answer reveals with sound effects, and tracks game progression through different rounds.

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
        winpoint: 80,                 // Points needed to win
        rounds: {                     // Enable/disable rounds
            ROUND_1: true,
            ROUND_2: true,
            ROUND_3: true,
            ROUND_OBR: true,
            ROUND_SUPER: true
        }
    },

    // Questions for 4 rounds (index 0-3)
    questions: [
        {
            name: "Question text",
            answers: [
                {text: "Answer 1", num: 40},
                {text: "Answer 2", num: 30},
                // ... up to 6 answers
            ]
        }
    ],

    // Current game state
    level: -1,              // Current round (-1 = not started)
    activecommand: 0,       // Active team (0 or 1)
    points: 0,              // Current points for active answer
    point0: 0,              // Team 0 total score
    point1: 0,              // Team 1 total score
    badAnswer: [0, 0],      // Wrong answer count per team (max 3)
    openanswer: 0,          // Number of revealed answers

    // Game state flags
    zhreby: false,          // Drawing/team selection phase
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

    helpVisible: false
};
```

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
1. **Drawing phase** (`zhreby = true`): Select team with ←/→, press N to show question
2. **Game phase** (`game1 = true`): Open answers 1-6, accumulate points
3. **Team 2 phase** (if 3 wrong answers): Switch to other team (`game2 = true`)
4. **Winner** (`winner = true`): Press N to advance to next round

## Keyboard Controls

### System Keys
- `F1` - Toggle context-aware help overlay
- `F2` - Open settings modal
- `F11` - Toggle fullscreen mode
- `ESC` - Close dialogs (settings/help)

### Game Controls
- `1-6` - Open answers 1-6 (or toggle super game rows)
- `X` / `DELETE` - Add wrong answer mark (X)
- `Z` - Clear all X marks
- `Space` - Clear all answers (new question)
- `N` / `↑` - Advance to next stage/round
- `C` - Add accumulated points to active team
- `V` - Toggle active team
- `←` / `→` - Select team 0/1 (during drawing phase)

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
    winpoint: 80
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
- **Drawing phase**: Shows ←/→ (team select), N (show question)
- **Rounds 1-3**: Shows 1-6 (answers), X (error), C (points), Space (clear)
- **Reverse game**: Shows Q/W (team points), T (timer)
- **Super game**: Shows A (hide player 1), Q (timer), N (advance)

### Context-Aware Hints Panel

Bottom hints panel shows relevant shortcuts for current state:
```javascript
function updateContextualHints() {
    // Updates #hints-content with <kbd> styled shortcuts
    // Changes based on: level, zhreby, game1, obrat, supergame
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
- Max 3 wrong answers per team
- On 3rd wrong answer: switch to other team
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

## Development Notes

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
    "command0name": "Team 1",
    "command1name": "Team 2",
    "time1": 15,
    "time2": 20,
    "timeRoundObr": 60,
    "winpoint": 80,
    "rounds": {
      "ROUND_1": true,
      "ROUND_2": true,
      "ROUND_3": true,
      "ROUND_OBR": true,
      "ROUND_SUPER": true
    }
  },
  "questions": [
    {
      "name": "Question text",
      "answers": [
        {"text": "Answer 1", "num": 40},
        {"text": "Answer 2", "num": 30},
        {"text": "Answer 3", "num": 20},
        {"text": "Answer 4", "num": 15},
        {"text": "Answer 5", "num": 10},
        {"text": "Answer 6", "num": 5}
      ]
    }
    // ... 3 more questions for rounds 2-4
  ]
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
