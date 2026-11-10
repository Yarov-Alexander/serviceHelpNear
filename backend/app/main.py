from fastapi import FastAPI

app = FastAPI(
    title="My Service API",
    description="Backend API for my service",
    version="1.0.0",
)


@app.get("/")
async def root():
    return {"message": "Hello from backend!"}