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
    access_token_expire_minutes: int = 30
    # Адреса фронтенда, которым разрешено ходить в API (Vite по умолчанию на 5173)
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env")


# Создаём один раз, везде импортируем готовый объект
settings = Settings()
