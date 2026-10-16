### Testing environment -- replicate conftest.py
# Import the needed modules to build out the fixture
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings
from app import models  # need to be here so the code knows where to look at.
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlmodel import SQLModel
from app.database import get_session

@pytest_asyncio.fixture # Create ensure to have the decorator 'pytest_asyncio.fixture'
async def client(session):# Create a function for the client -- pass the session as a parameter.
    transport = ASGITransport(app=app)# Create a transport variable with ASGITransport(), we are using our app.
    async with AsyncClient(transport=transport, base_url='http://tests') as ac  # Run with async with AsyncClient() Pass the transport as an argument for 'transport'. pass a test url for 'base_url='
        app.dependency_overrides[get_session] = lambda: session  # override the live when the test makes a request -- hint: use app with a dependency method that'll override.
        yield ac  # yield the AsyncClient
    app.dependency_overrides.clear()# Clear the app dependency with a clear() method.  

# Create another decorator. create the function session.
@pytest_asyncio.fixture
async def session():
    engine = create_async_engine(settings.test_db)# Create an engine asynchronously for the testing database.
    async with engine.begin() as connect:
        await connect.run_sync(SQLModel.metadata.create_all)  # async with engine.begin() give is a variable and run the sync (run_sync()) with 'SQL.metadata.create_all'
    async_session = async_sessionmaker(engine, expire_on_commit=False)  # create an asynchronous session with the engine you created above. expire_on_commit=False.
    async with async_session() as sess:
        yield sess  # async with the session I just created, attach it to a variable and then yield it.
    async with engine.begin() as disconnect:
        await disconnect.run_sync(SQLModel.metadata.drop_all)# Then async with engin.begin() but this time we're going to 'drop_all' instead of create_all
    await engine.dispose()# dispose

# Testing environment -- replicate test_health.py
import pytest
@pytest.mark.asyncio
async def health_checker(client):  # decorator pytest.mark.asyncio -- create a function as a health return passing 'client' as a parameter.
    response = await client.get("/health")# create the response and identify which enpoint we are grabbing -- in this case, the /health endpoint.
    assert response.status_code == 200  # assert the respone for a 'passing' status to see if it'll fail