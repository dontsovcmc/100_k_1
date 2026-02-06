# Для разработчиков

## Сборка bundle

⚠️ **ВАЖНО**: После любых изменений в файлах `js/` необходимо пересобрать bundle:

```bash
# Установить зависимости (один раз)
npm install

# Собрать bundle
npm run build

# Открыть файл напрямую
open index-prod.html
```

**Почему это важно:**
- `index-prod.html` — это standalone версия для пользователей
- Она использует `dist/bundle.js` (НЕ модули из `js/`)
- Если не пересобрать, `index-prod.html` будет работать со старым кодом
- `dist/bundle.js` отслеживается в git для удобства скачивания

**Быстрая проверка**: Если изменили любой `.js` файл, запустите `npm run build` перед коммитом.

## Режим разработки (модули)

Требует веб-сервер из-за CORS ограничений ES6 модулей.

```bash
# Запустить веб-сервер
python3 -m http.server 8000

# Открыть в браузере
open http://localhost:8000/index-dev.html
```

Для минифицированной production версии:
```bash
npm run prod  # Создает оптимизированный bundle + source map
```

## Команды сборки

- `npm run build` - Обычная сборка (unminified, 51KB)
- `npm run build:watch` - Автообновление при изменении файлов
- `npm run dev` - Alias для build:watch
- `npm run prod` - Минифицированная сборка с source map (30KB)

## Структура после сборки

```
.
├── index-dev.html       # Разработка (ES6 modules)
├── index-prod.html      # Production (bundle)
├── js/                  # Исходные модули
├── dist/
│   ├── bundle.js        # Собранный файл
│   └── bundle.js.map    # Source map
├── package.json
├── styles.css
├── demo.json
├── sounds/
└── bmp/
```

## Технологии

### Сборка
- **esbuild** - быстрый бандлер для JavaScript
- ES6 модули для разработки
- Один bundle файл для production

### Frontend
- Vanilla JavaScript (ES6+)
- HTML5 Canvas не используется
- CSS3 (Flexbox, Grid)
- LocalStorage для сохранения состояния

### Поддерживаемые браузеры
- Chrome/Edge (Chromium): полная поддержка
- Firefox: полная поддержка
- Safari: полная поддержка (может потребоваться взаимодействие для звука)

## Архитектура кода

Подробное описание архитектуры см. в [CLAUDE.md](CLAUDE.md):
- FSM (Finite State Machine) с 18 состояниями
- Разделение на модули (core, states, utils)
- DOM кэширование для производительности
- Константы вместо магических чисел
