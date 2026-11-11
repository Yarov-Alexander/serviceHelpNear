from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.modules.auth.router import router as auth_router

app = FastAPI(title="API")

# Разрешаем фронтенду (другой порт = другой origin) обращаться к API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Каждый модуль подключается одной строкой. Добавил модуль orders: добавил include_router.
app.include_router(auth_router)
