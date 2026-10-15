import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app import models  # noqa: F401
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlmodel import SQLModel
from app.database import get_session


@pytest_asyncio.fixture
# funtion define client
async def client(session):
    transport = ASGITransport(app=app)# create transport variable with ASGITransport(app=...)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:  # Run AsyncClient as ac
        app.dependency_overrides[get_session] = lambda: session  # set it so that the override is live when the test makes requests.
        yield ac  # yield the ac.
    app.dependency_overrides.clear()  # clear it so that it doesn't leak inot the next test

@pytest_asyncio.fixture
async def session():
    # 1. create_async_engine on TEST_DB_URL
    engine = create_async_engine(settings.test_db)
    # 2. async with engine.begin() -> run_sync(SQLModel.metadata.create_all)
    async with engine.begin() as connect:
        await connect.run_sync(SQLModel.metadata.create_all)
    # 3. async_sessionmaker(engine, expire_on_commit=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    # 4. async with maker() as s: yield s
    async with async_session() as s:
        yield s
    # 5. async with engine.begin() -> run_sync(SQLModel.metadata.drop_all)
    async with engine.begin() as disconnect:
        await disconnect.run_sync(SQLModel.metadata.drop_all)
    # 6. await engine.dispose()
    await engine.dispose()