from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import CORS_ORIGINS
from app.database import Base, SessionLocal, engine
from app.routers import assets, auth
from app.seed import seed_admin


def ensure_asset_metadata_columns() -> None:
    with engine.begin() as connection:
        columns = {
            row[1] for row in connection.execute(text("PRAGMA table_info(assets)"))
        }
        for column in ("category", "manufacturer", "model"):
            if column not in columns:
                connection.execute(
                    text(f"ALTER TABLE assets ADD COLUMN {column} VARCHAR NOT NULL DEFAULT ''")
                )


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_asset_metadata_columns()
    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="AssetFlow API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(assets.router)
app.include_router(assets.employee_router)


@app.get("/")
def root():
    return {"message": "AssetFlow API Running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
