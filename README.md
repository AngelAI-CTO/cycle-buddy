# Cycle Buddy

**Тактическая система для понимания женских циклов** — мобильное приложение, которое помогает мужчинам отслеживать и понимать менструальные циклы своих партнёрш, давая тактические советы с юмором.

## Стек технологий

| Слой | Технология |
|------|-----------|
| Мобильное приложение | React Native 0.76 + Expo 52 + TypeScript |
| Веб-приложение | HTML5 + CSS3 + Service Worker (PWA) |
| Бэкенд | FastAPI 0.115 + Uvicorn + Gunicorn |
| База данных | SQLAlchemy 2.0 + SQLite (dev) / PostgreSQL (prod) |
| Аутентификация | JWT (PyJWT) + BCrypt |
| Деплой | Railway / Render.com / Heroku |
| Сборка | Nixpacks (бэкенд), Expo EAS (мобильное) |

## Структура проекта

```
cycle-buddy/
├── backend/                  # FastAPI бэкенд
│   ├── app/
│   │   ├── main.py           # Точка входа приложения
│   │   ├── database.py       # Конфигурация БД (SQLite / PostgreSQL)
│   │   ├── schemas.py        # Pydantic-схемы валидации
│   │   ├── models/
│   │   │   └── models.py     # SQLAlchemy ORM модели
│   │   ├── routes/
│   │   │   ├── auth.py       # Эндпоинты авторизации
│   │   │   └── partners.py   # Управление партнёрами и циклами
│   │   └── services/
│   │       ├── auth_service.py   # Хеширование, JWT, аутентификация
│   │       └── cycle_service.py  # Расчёт фаз цикла
│   └── requirements.txt
│
├── frontend/                 # React Native (Expo) приложение
│   ├── App.tsx               # Навигация и корневой компонент
│   ├── app.json              # Конфигурация Expo
│   ├── eas.json              # Конфигурация EAS Build
│   ├── src/
│   │   ├── theme.ts          # Цветовая палитра и дизайн-система
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx    # Управление состоянием авторизации
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx         # Экран входа / регистрации
│   │   │   ├── HomeScreen.tsx          # Дашборд с карточками партнёрш
│   │   │   ├── AddPartnerScreen.tsx    # Форма добавления партнёрши
│   │   │   ├── PartnerDetailScreen.tsx # Детальная информация и прогноз
│   │   │   └── SettingsScreen.tsx      # Настройки и выход
│   │   └── services/
│   │       ├── api.ts              # HTTP клиент
│   │       └── notifications.ts    # Push-уведомления
│   └── assets/               # Иконки и сплеш-экраны
│
├── webapp/                   # PWA веб-приложение
│   ├── index.html
│   ├── manifest.json
│   └── sw.js
│
├── Procfile                  # Команда запуска (Heroku / Railway)
├── render.yaml               # Конфигурация Render.com
├── railway.json              # Конфигурация Railway.app
└── nixpacks.toml             # Сборка через Nixpacks
```

## Как работает приложение

### Пользовательский сценарий

1. **Регистрация / Вход** — по логину и паролю
2. **Добавление партнёрши** — имя, длина цикла, длина менструации, дата начала последних месячных
3. **Дашборд** — карточки всех партнёрш с текущей фазой, прогресс-баром цикла и настроением
4. **Детальный экран** — полная информация о фазе, советы, предупреждения и 14-дневный прогноз
5. **Коррекция дат** — если дата начала была указана неточно, можно поправить

### Фазы цикла

Приложение рассчитывает 5 фаз на основе дня цикла:

| Фаза | Дни (при цикле 28) | Эмодзи | Энергия | Описание |
|------|---------------------|--------|---------|----------|
| Менструация | 1–5 | 🔴 | low | Период. Неси шоколад и плед |
| Фолликулярная | 6–12 | 🌱 | rising | Хорошее настроение, энергия растёт |
| Овуляция | 13–16 | 🌸 | peak | Максимальная привлекательность и уверенность |
| Лютеиновая | 17–23 | 🍂 | declining | Энергия падает, нужен уют |
| ПМС | 24–28 | ⚡ | low | Ты виноват во всём. Просто прими это |

**Алгоритм расчёта** (`cycle_service.py`):
```
день_в_цикле = (сегодня - дата_начала_последних_месячных) % длина_цикла
овуляция = длина_цикла - 14
пмс = длина_цикла - 5
```

Каждая фаза содержит:
- Название и эмодзи
- Описание настроения (с юмором)
- Уровень энергии
- 5–7 тактических советов
- 4–6 предупреждений «чего избегать»

## База данных

### Модели

```
User
├── id (PK)
├── username (unique)
├── hashed_password (bcrypt)
└── created_at

Partner
├── id (PK)
├── name
├── cycle_length (21–35, default 28)
├── period_length (2–8, default 5)
└── user_id (FK → User)

Cycle
├── id (PK)
├── start_date (дата начала менструации)
├── partner_id (FK → Partner)
└── created_at

CycleCorrection
├── id (PK)
├── cycle_id (FK → Cycle)
├── old_start_date
├── new_start_date
├── reason
└── created_at
```

## API Reference

Базовый URL: `/api`

### Аутентификация

| Метод | Эндпоинт | Описание | Rate Limit |
|-------|----------|----------|------------|
| POST | `/api/auth/register` | Регистрация | 5/мин |
| POST | `/api/auth/login` | Вход | 10/мин |

**Запрос** (оба эндпоинта):
```json
{
  "username": "ivan",
  "password": "secret123"
}
```

**Ответ**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

Токен передаётся в заголовке: `Authorization: Bearer <token>`

### Партнёрши

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/partners/` | Список всех партнёрш |
| POST | `/api/partners/` | Добавить партнёршу |
| PATCH | `/api/partners/{id}` | Обновить данные |
| DELETE | `/api/partners/{id}` | Удалить партнёршу |

**POST /api/partners/**:
```json
{
  "name": "Катя",
  "cycle_length": 28,
  "period_length": 5
}
```

### Циклы

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| POST | `/api/partners/{id}/cycles` | Добавить начало цикла |
| GET | `/api/partners/{id}/cycles` | Список всех циклов |
| PATCH | `/api/partners/{id}/cycles/{cid}` | Скорректировать дату |
| GET | `/api/partners/{id}/corrections` | История коррекций |

**POST /api/partners/{id}/cycles**:
```json
{
  "start_date": "2026-03-10"
}
```

### Статус и прогноз

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/partners/{id}/status` | Текущая фаза и советы |
| GET | `/api/partners/{id}/forecast?days=14` | Прогноз на N дней |

**GET /api/partners/{id}/status** — ответ:
```json
{
  "partner_name": "Катя",
  "phase": "follicular",
  "phase_name": "Фолликулярная фаза",
  "emoji": "🌱",
  "day_in_cycle": 7,
  "cycle_length": 28,
  "days_left_in_phase": 5,
  "days_until_next_period": 21,
  "next_period_date": "2026-04-07",
  "mood": "Она как после перезагрузки — всё работает, баги пофикшены",
  "energy": "rising",
  "tips": ["..."],
  "avoid": ["..."]
}
```

### Здоровье сервиса

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/health` | Health check |

## Безопасность

- **Пароли** — хешируются bcrypt (с автомиграцией старых SHA256 при логине)
- **JWT токены** — HS256, срок жизни 30 дней, подписываются `SECRET_KEY`
- **Rate limiting** — slowapi, ограничение на эндпоинты авторизации
- **CORS** — настраивается через `CORS_ORIGINS` (по умолчанию `*`, в проде указать конкретный домен)

## Деплой

### Переменные окружения (production)

| Переменная | Описание | Обязательно |
|------------|----------|-------------|
| `SECRET_KEY` | Ключ подписи JWT (32+ символов) | Да |
| `DATABASE_URL` | URL PostgreSQL | Да (Railway/Render предоставляют) |
| `CORS_ORIGINS` | Разрешённые домены через запятую | Рекомендуется |
| `PORT` | Порт сервера | Нет (устанавливается платформой) |

### Railway.app

1. Создать проект на Railway
2. Добавить PostgreSQL из маркетплейса
3. Подключить GitHub репозиторий
4. Установить переменные: `SECRET_KEY`, `CORS_ORIGINS`
5. Деплой произойдёт автоматически (nixpacks.toml + railway.json)

### Render.com

1. Создать Web Service → подключить репозиторий
2. Runtime: Docker / Image
3. Добавить PostgreSQL из дашборда
4. Установить переменные окружения
5. Health check: `/api/health`

### Мобильное приложение (iOS/Android)

```bash
cd frontend
npm install
npx eas login
npx eas build --platform ios      # или android
npx eas submit --platform ios     # отправить в App Store
```

Перед сборкой:
- Заполнить `eas.json` → `submit.production.ios` (Apple ID, Team ID)
- Заменить placeholder-иконки в `assets/` на настоящие
- Обновить `app.json` → `extra.apiUrl` на реальный URL бэкенда

## Локальная разработка

### Бэкенд

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Фронтенд

```bash
cd frontend
npm install
npx expo start
```

Сканировать QR-код через Expo Go (Android) или камеру (iOS).

### API документация (автогенерация)

FastAPI автоматически генерирует интерактивную документацию:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Дизайн-система

Приложение использует тактический / sci-fi стиль:

| Элемент | Цвет | Hex |
|---------|------|-----|
| Фон | Глубокий космос | `#0a0e17` |
| Панели | Тёмный | `#111827` |
| Акцент | Кибер-голубой | `#00d4ff` |
| Текст | Холодный белый | `#e2e8f0` |
| Менструация | Красный | `#ef4444` |
| Фолликулярная | Зелёный | `#10b981` |
| Овуляция | Янтарный | `#f59e0b` |
| Лютеиновая | Фиолетовый | `#8b5cf6` |
| ПМС | Оранжевый | `#f97316` |

Шрифт: JetBrains Mono (моноширинный), letter-spacing для футуристичного эффекта.
