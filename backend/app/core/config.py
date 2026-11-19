from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Все настройки приложения в одном месте.

    Значения берутся из переменных окружения или из файла .env.
    Если обязательной переменной нет (например SECRET_KEY),
    приложение упадёт при старте с понятной ошибкой, а не посреди работы.
    """

    database_url: str
    secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30
    redis_url: str = "redis://localhost:6379/0"
    refresh_cookie_secure: bool = False
    # Адреса фронтенда, которым разрешено ходить в API (Vite по умолчанию на 5173)
    cors_origins: list[str] = ["http://localhost:8443", "http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env")


# Создаём один раз, везде импортируем готовый объект
settings = Settings()
