from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

class AppSettings(BaseSettings):
    anthropic_api: str

    model_config = SettingsConfigDict(
        env_file=ENV_PATH
    )

# Make the BaseSettings into an instance
settings = AppSettings()  # type: ignore[call-arg]

# Access the variable via a quick test