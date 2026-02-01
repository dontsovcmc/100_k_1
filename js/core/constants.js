// ============================================================================
// КОНСТАНТЫ ИГРЫ
// ============================================================================

const GAME_X1 = 0;
const GAME_X2 = 1;
const GAME_X3 = 2;
const GAME_NAOBOROT = 3;
const GAME_SUPER = 4;

const COMMAND_A = 0;
const COMMAND_B = 1;

const MAX_WRONG_ANSWERS = 3;
const MAX_ANSWERS = 6;

const IMAGES = {
    X_EMPTY: 'bmp/x_0.bmp',
    X_FILLED: 'bmp/x_1.bmp'
};

const SOUNDS = {
    START: 'start',
    OPEN: 'open',
    BAD: 'bad',
    LEVEL: 'level',
    WIN: 'win'
};

// Маппинг русской раскладки на английскую
const RU_TO_EN_KEYS = {
    'й': 'q', 'Й': 'Q',
    'ц': 'w', 'Ц': 'W',
    'у': 'e', 'У': 'E',
    'к': 'r', 'К': 'R',
    'е': 't', 'Е': 'T',
    'н': 'y', 'Н': 'Y',
    'г': 'u', 'Г': 'U',
    'ш': 'i', 'Ш': 'I',
    'щ': 'o', 'Щ': 'O',
    'з': 'p', 'З': 'P',
    'ф': 'a', 'Ф': 'A',
    'ы': 's', 'Ы': 'S',
    'в': 'd', 'В': 'D',
    'а': 'f', 'А': 'F',
    'п': 'g', 'П': 'G',
    'р': 'h', 'Р': 'H',
    'о': 'j', 'О': 'J',
    'л': 'k', 'Л': 'K',
    'д': 'l', 'Д': 'L',
    'я': 'z', 'Я': 'Z',
    'ч': 'x', 'Ч': 'X',
    'с': 'c', 'С': 'C',
    'м': 'v', 'М': 'V',
    'и': 'b', 'И': 'B',
    'т': 'n', 'Т': 'N',
    'ь': 'm', 'Ь': 'M'
};

function normalizeKey(key) {
    return RU_TO_EN_KEYS[key] || key;
}

export {
    GAME_X1, GAME_X2, GAME_X3, GAME_NAOBOROT, GAME_SUPER,
    COMMAND_A, COMMAND_B,
    MAX_WRONG_ANSWERS, MAX_ANSWERS,
    IMAGES, SOUNDS,
    normalizeKey
};
