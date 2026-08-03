## Database tables -- This is where the settings are read.
## Where Python applications initialzie and centralize DB connections and session factories.
## Uses the SQL Alchemy toolkit.
from sqlalchemy.ext.asyncio import create_async_engine
from app.config import settings

# The Engine - module level & created once.
engine = create_async_engine(settings.supabase_connetor, echo=True)  # remove echo when pushing to production.
# Session factory - template for making sessions.

# Dependency FastAPI injects