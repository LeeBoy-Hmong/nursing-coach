## Database tables -- This is where the settings are read.
## Where Python applications initialzie and centralize DB connections and session factories.
## Uses the SQL Alchemy toolkit.
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from collections.abc import AsyncGenerator
from app.config import settings

# The Engine - module level & created once.
engine = create_async_engine(settings.supabase_connector, echo=settings.db_echo)  # remove echo when pushing to production.
''' Session factory - template for making sessions.
Use "async_sessionmaker" and run your engine as argument.
"expire_on_commit" will ensure to keept hte data inside my Python variables and not erase them.'''
async_sess = async_sessionmaker(engine, expire_on_commit=False)
# Dependency FastAPI injects - create an asynchronous 'get_session()' function
'''Instead of opening a connection and relying on the framework to remember to close it, write a Python generator function using yield.
This function handles the setup, hands over the session to your API route, and automatically runs cleanup code afterward.'''
async def get_session() -> AsyncGenerator[AsyncSession, None]:  # AsyncGenerator tells Pylance to use async and yield
    database = async_sess()
    async with database:
        yield database
