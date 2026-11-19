# Помощь рядом

Веб-приложение для размещения и выполнения бытовых заявок. Заказчик создаёт заявку,
исполнитель просматривает доступные заявки и принимает одну из них, после чего участники
могут общаться в чате.

## Скриншоты

### Главная страница

![Главная страница](docs/screenshots/home-page.png)

### Личный кабинет

![Личный кабинет](docs/screenshots/account-page.png)

## Возможности

- Регистрация и вход пользователей.
- Два типа ролей: `customer` и `executor`.
- Создание заявок заказчиком с описанием работы, ценой и городом.
- Просмотр собственных заявок.
- Просмотр свободных заявок исполнителем.
- Пагинация свободных заявок и фильтр по городу.
- Принятие заявки исполнителем с защитой от повторного назначения.
- Переписки и WebSocket-чат только для заказчика и исполнителя заявки.
- История сообщений и отметка непрочитанных сообщений.
- Автоматическое восстановление и обновление авторизованной сессии.
- Миграции схемы базы данных через Alembic.

## Технологии

### Backend

- Python 3.13
- FastAPI
- SQLAlchemy 2 с асинхронными сессиями
- PostgreSQL
- Redis
- PyJWT
- pwdlib / Argon2
- WebSocket API
- Pydantic
- Alembic migrations

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- SCSS
- Fetch API
- WebSocket API
- Vitest и Testing Library

### Инфраструктура

- Docker и Docker Compose
- PostgreSQL 17
- Redis 7

## Архитектура проекта

```text
frontend/src/
├── app/              Маршрутизация и общая инициализация приложения
├── pages/            Страницы приложения
├── widgets/          Крупные независимые элементы интерфейса
├── features/         Функциональные сценарии: login, регистрация, заявки, чат
├── entities/         Пользователь, заявка и связанные API-методы
└── shared/           Общий API-клиент, хранилище токена и UI-компоненты

backend/app/
├── core/             Конфигурация, база данных, Redis и JWT-функции
└── modules/
    ├── auth/         Регистрация, вход, refresh/logout и проверка прав
    ├── users/        Модель и запросы пользователей
    ├── orders/       Создание, поиск и принятие заявок
    └── chat/         История переписки и WebSocket-сообщения
```

Backend построен по схеме Router -> Service -> SQLAlchemy model:

- router обрабатывает HTTP/WebSocket-запрос и авторизацию;
- service содержит бизнес-логику;
- SQLAlchemy-модели описывают таблицы PostgreSQL;
- зависимости FastAPI создают сессию базы и текущего пользователя на запрос.

## Авторизация

Используется сочетание JWT access token и refresh token:

```mermaid
sequenceDiagram
    participant Client as Клиент
    participant API as FastAPI
    participant Redis as Redis
    participant DB as PostgreSQL

    Client->>API: POST /auth/login
    API->>DB: Проверить email и пароль
    API->>Redis: Сохранить хеш refresh token → user_id
    API-->>Client: access_token в JSON
    API-->>Client: refresh_token в HttpOnly cookie

    Client->>API: Защищённый запрос + Bearer access_token
    API->>DB: Найти пользователя по user_id из JWT
    DB-->>API: Пользователь
    API-->>Client: Результат запроса

    Client->>API: POST /auth/refresh
    API->>Redis: Проверить refresh token
    API->>Redis: Удалить старый token и сохранить новый
    API-->>Client: Новый access_token и refresh cookie
```

### Access token

- Передаётся в заголовке `Authorization: Bearer <token>`.
- Содержит ID пользователя в поле `sub`.
- Имеет срок жизни 15 минут.
- Подписывается алгоритмом HS256.
- Хранится только в памяти фронтенда, в `localStorage` не сохраняется.

При ответе `401` API-клиент вызывает `/auth/refresh`, получает новый access token и
повторяет исходный запрос один раз.

### Refresh token

- Генерируется функцией `secrets.token_urlsafe(48)`.
- Отправляется браузеру как HttpOnly-cookie с именем `refresh_token`.
- Сам токен в Redis не сохраняется: используется SHA-256-хеш как ключ.
- Срок хранения составляет 30 дней.
- При обновлении используется ротация: старый ключ удаляется и создаётся новый.
- В течение 5 секунд параллельный запрос со старым refresh token получает access token,
  чтобы одновременное обновление сессии в нескольких вкладках не приводило к выходу.
- Cookie имеет `SameSite=Strict`, `HttpOnly` и ограничена путём `/auth`; флаг `Secure`
  задаётся `REFRESH_COOKIE_SECURE`.

Для защиты входа от перебора Redis ограничивает число неуспешных попыток с одного IP:
5 попыток за 15 минут.

### Роли и права

- `customer` может создавать заявки.
- `executor` может просматривать свободные заявки и принимать их.
- Заявки пользователя доступны через `/orders/mine`.
- `/auth/me` возвращает текущего пользователя.
- Роль `admin` хранится в модели пользователя; отдельные административные маршруты пока не реализованы.

## Основные API-маршруты

Все защищённые HTTP-маршруты требуют заголовок:

```http
Authorization: Bearer <access_token>
```

### Авторизация

| Метод | Маршрут | Назначение |
|---|---|---|
| `POST` | `/auth/register` | Регистрация пользователя |
| `POST` | `/auth/login` | Вход и выдача access/refresh токенов |
| `POST` | `/auth/refresh` | Обновление пары токенов |
| `POST` | `/auth/logout` | Отзыв refresh token |
| `GET` | `/auth/me` | Получение текущего пользователя |

Пример входа:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "strong-password"
}
```

Ответ:

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### Заявки

| Метод | Маршрут | Роль | Назначение |
|---|---|---|---|
| `POST` | `/orders` | Заказчик | Создать заявку |
| `GET` | `/orders/mine` | Любая авторизованная | Получить свои заявки |
| `GET` | `/orders/available?limit=20&offset=0&city=Томск` | Исполнитель | Получить страницу свободных заявок, при необходимости отфильтрованную по городу |
| `POST` | `/orders/{order_id}/accept` | Исполнитель | Принять заявку |

Пример создания заявки:

```json
{
  "task": "Собрать шкаф",
  "price": 3000,
  "city": "Москва"
}
```

Одна заявка одновременно может быть принята только одним исполнителем. В сервисе используется
блокирующий SQL-запрос `SELECT ... FOR UPDATE`, а повторное принятие возвращает
конфликт `409 Conflict`.

### Чат

| Метод | Маршрут | Назначение |
|---|---|---|
| `GET` | `/chat/conversations` | Список переписок пользователя |
| `GET` | `/chat/orders/{order_id}/messages?limit=50&before_id=123` | Страница истории сообщений; `before_id` загружает более старые сообщения |
| `POST` | `/chat/orders/{order_id}/read` | Отметить входящие сообщения прочитанными |
| `WS` | `/chat/orders/{order_id}/ws` | Переписка в реальном времени |

WebSocket-соединение сначала должно получить событие авторизации:

```json
{
  "type": "auth",
  "access_token": "<access_token>"
}
```

После успешного подключения сервер отвечает `{ "type": "ready" }`.
Новое сообщение отправляется так:

```json
{
  "type": "message",
  "text": "Готов приступить завтра"
}
```

Каждое новое сообщение сохраняется в PostgreSQL и публикуется в Redis Pub/Sub. Все API-воркеры
подписаны на каналы чатов и доставляют событие подключённым к ним WebSocket-клиентам.

Основные таблицы:

| Таблица | Назначение |
|---|---|
| `users` | Пользователи и роли |
| `orders` | Заявки заказчиков |
| `order_messages` | Сообщения чата |

Статус заявки хранится как PostgreSQL enum (`open`, `assigned`); для выборки свободных заказов
есть составной индекс по `status` и `executor_id`, а история чата использует индекс
`(order_id, created_at)`.

Схема базы версионируется миграциями Alembic в `backend/migrations`. При старте Docker API
выполняет `alembic upgrade head` до запуска приложения. В тестах SQLite-схема создаётся
непосредственно из SQLAlchemy metadata.

## Frontend-хранилища

Доступ к API реализован одним HTTP-клиентом в `frontend/src/shared/api/client.ts`.

- `tokenStorage` хранит только access token в памяти.
- Zustand-хранилище пользователя содержит данные текущего пользователя.
- Модуль заявок загружает собственные и доступные заявки.
- Модуль чата загружает историю через HTTP и затем устанавливает WebSocket-соединение.
- Защищённый route `/account` открывается только после восстановления сессии.

## Запуск через Docker

Требуется Docker Desktop с Docker Compose.

Из корня проекта:

```sh
cp .env.example .env
docker compose up --build
```

После запуска:

- Frontend: http://localhost:5173 (production build, Nginx)
- API: http://localhost:8000
- Swagger/OpenAPI: http://localhost:8000/docs
- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`

Остановить сервисы:

```sh
docker compose down
```

Запуск в фоне:

```sh
docker compose up --build -d
```

Полностью удалить контейнеры и данные volume:

```sh
docker compose down -v
```

PostgreSQL и Redis хранят данные в Docker volumes. Локальный пример переменных находится в
`.env.example`; не используйте его тестовый `SECRET_KEY` в production.

Для базы, созданной прежней версией приложения через `create_all`, стартовая миграция
автоматически распознаёт известную схему, записывает базовую ревизию и применяет последующие
изменения, не пересоздавая таблицы. Перед первым запуском новой версии рекомендуется сделать
резервную копию. Неизвестную или частичную схему миграция не отмечает автоматически и завершится
с ошибкой.

## Переменные окружения API

Основные значения задаются в `docker-compose.yml`:

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | Async URL PostgreSQL |
| `SECRET_KEY` | Секрет подписи JWT |
| `REDIS_URL` | Подключение к Redis |
| `REFRESH_COOKIE_SECURE` | Отправлять cookie только через HTTPS |
| `CORS_ORIGINS` | Разрешённые адреса frontend |

Если `SECRET_KEY` не задан, Docker-среда создаёт локальный ключ в volume.
В production ключ должен быть постоянным и сохранён вне репозитория.

## Локальный запуск без Docker

Backend:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Для backend нужны работающие PostgreSQL и Redis и обязательные переменные
`DATABASE_URL` и `SECRET_KEY`.

В bash:

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql+asyncpg://servicehelp:servicehelp@localhost:5433/servicehelp
export REDIS_URL=redis://localhost:6379/0
export SECRET_KEY=replace-with-a-local-secret
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd frontend
pnpm install
pnpm dev
```

В bash используйте те же команды:

```sh
cd frontend
pnpm install
pnpm dev
```

По умолчанию frontend обращается к API по адресу `http://localhost:8000`.
Адрес можно переопределить переменной `VITE_API_URL`.
Для Docker это build-argument, поэтому его нужно задать до сборки образа.

## Тестирование

Backend-тесты:

```powershell
cd backend
python -m unittest discover -s tests -v
```

Они проверяют refresh-ротацию токенов и grace-окно, лимит входа, cookie/logout, создание и
принятие заявок, разграничение доступа к чату, Redis Pub/Sub между воркерами, непрочитанные
сообщения, фильтр города и страницы заказов/истории сообщений.

Frontend-тесты:

```powershell
cd frontend
pnpm test
```

Frontend-сборка:

```powershell
cd frontend
pnpm build
```

GitHub Actions запускает backend-тесты, frontend-тесты и production-сборку при push и pull request.
