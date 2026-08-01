from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Use Pathlib module with the Path method to mark the .env as the absolute path.
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
# create a class for BaseSettings - this will allow the calling of anthropic key cleanly.
class AppSettings(BaseSettings):
    anthropic_api: str
    supabase_connetor: str

    model_config = SettingsConfigDict(
        env_file=ENV_PATH
    )
# Make the BaseSettings into an instance
settings = AppSettings()  # type: ignore[call-arg]

